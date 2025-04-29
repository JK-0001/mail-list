import { inngest } from "./client";
import { createClient } from '@/utils/supabase/secretServer';
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
    const supabase = await createClient();

    try {
      // Run the sync
      await syncGmail(user_id, access_token, supabase, type);
      return { success: true };
    } catch (error) {
      console.error('Error syncing Gmail:', error);
      if (err.message === 'force_reauth') {
        // Clear session or flag frontend to logout
        return { success: false, force_reauth: true };
      }
      return { success: false, error: error.message };
    }
  }
);
