// import { inngest } from "./client";
// import { createAdminClient } from '@/utils/supabase/secretServer';
// import syncGmail from '@/lib/gmail/syncGmail';

// export const gmailSync = inngest.createFunction(
//   { 
//     id: 'gmail-sync',
//     concurrency: {
//       limit: 1,
//       key: "event.data.user_id", // lock based on user ID
//     }
//    },
//   { event: 'app/gmail.sync' },
//   async ({ event }) => {
//     const { user_id, access_token, type } = event.data;
//     const supabase = createAdminClient();

//     try {
//       // Run the sync
//       await syncGmail(user_id, access_token, supabase, type);
//       return { success: true };
//     } catch (error) {
//       if (error.message === 'force_reauth') {
//         await supabase.from('preferences').update({
//           error: 'force_reauth',
//           loading: false,
//         }).eq('user_id', user_id);
//         return { error: 'Token invalid, user must re-auth' };
//       }
    
//       // Optional: log unknown error
//       console.error(error);
//       return { error: 'Unknown error during sync' };
//     }
//   }
// );

import { inngest } from "./client";
import { createAdminClient } from '@/utils/supabase/secretServer';
import syncGmail from '@/lib/gmail/syncGmail';

export const gmailSync = inngest.createFunction(
  { 
    id: 'gmail-sync',
    // Set a 10-minute function-level timeout (adjust as needed)
    timeout: "10m", // Key fix: Allows long-running syncs
    concurrency: {
      limit: 1,
      key: "event.data.user_id",
    }
  },
  { event: 'app/gmail.sync' },
  async ({ event, step }) => {  // Note: Added `step` here
    const { user_id, access_token, type } = event.data;
    const supabase = createAdminClient();

    // Wrap sync in a step with explicit timeout
    const result = await step.run(
      "sync-gmail",
      {
        timeout: "8m", // Less than function timeout
        retries: 2,    // Optional: Auto-retry on failure
      },
      async () => {
        await syncGmail(user_id, access_token, supabase, type);
        return { success: true };
      }
    );

    return result;
  }
);
