import { inngest } from "./client";
import { createAdminClient } from '@/utils/supabase/secretServer';
import syncGmail from '@/lib/gmail/syncGmail';

export const gmailSync = inngest.createFunction(
  { 
    id: 'gmail-sync',
    concurrency: {
      limit: 1,
      key: "event.data.user_id", // lock based on user ID
    }
   },
  { event: 'app/gmail.sync' },
  async ({ event }) => {
    const { user_id, access_token, type } = event.data;
    const supabase = createAdminClient();

    try {
      // Run the sync
      await syncGmail(user_id, access_token, supabase, type);
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
