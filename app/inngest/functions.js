import { inngest } from "./client";
import { createAdminClient } from '@/utils/supabase/secretServer';

import { getTokensAndRefreshIfNeeded } from "@/lib/getTokensAndRefreshIfNeeded";
import { updateSyncStatus } from "@/lib/updateSyncStatus";
import { getMessages } from "@/lib/getMessages";
import { extractSenderDetails } from "@/lib/extractSenderDetails";
import { upsertSendersToSupabase } from "@/lib/upsertSendersToSupabase";

export const gmailSync = inngest.createFunction(
  { 
    id: 'gmail-sync',
    concurrency: {
      limit: 1,
      key: "event.data.user_id", // lock based on user ID
    }
   },
  { event: 'app/gmail.sync' },
  async ({ event, step }) => {
    const { user_id, access_token, type } = event.data;
    const supabase = createAdminClient();

    try { 
      const new_access_token = await step.run("Get Refreshed Access Token", () => getTokensAndRefreshIfNeeded(user_id, access_token, supabase));
      console.log(new_access_token)
      const afterQuery = await step.run("Get after query and update preferences table", () => updateSyncStatus(user_id, supabase, type));
      const messages = await step.run("Get messages", () => getMessages(new_access_token, afterQuery));
      for (let i = 0; i < messages.length; i+=10) {
        let messagePart = messages.slice(i, i + 10)
        const updatedSenders = await step.run("Extract Senders Details", () => extractSenderDetails(user_id, new_access_token, messagePart));

        const upsertToSupabase = await step.run("Upsert Sender details to Supabase", () => upsertSendersToSupabase(updatedSenders, supabase));
        console.log(upsertToSupabase)

        const EmitProgress = await step.run("Emit Progress to Supabase", async () => {
          if (type == "full") { 
            const { error: progressError } = await supabase.from("preferences").update({
              progress: Math.min(Math.round((i / messages.length) * 100), 100),
            }).eq("user_id", user_id);
            
            if (progressError) console.log("Progress update error:", progressError);
          }
          return { emitProgress: true };
        });
        console.log(EmitProgress)
      }

      const updatePreferences = await step.run("Update preferences table", async () => {
        let currentISO = new Date().toISOString()
        const { error } = await supabase
        .from('preferences')
        .update({ 
          loading: false,
          progress: 100,
          last_synced: String(currentISO)
        })
        .eq('user_id', user_id)
        
        if (error) {
          console.log("Error storing last_synced in preferences table " + error)
        }
      }); 

      return { success: true };

    } catch (error) {
      if (error.message === 'force_reauth') {
        await supabase.from('preferences').update({
          error: 'force_reauth',
          loading: false,
        }).eq('user_id', user_id);
        return { error: 'Token invalid, user must re-auth' };
      }
    
      // Optional: log unknown error
      console.error(error);
      return { error: 'Unknown error during sync' };
    }
  }
);