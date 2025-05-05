import { serve } from "inngest/next";
import { inngest } from "../../inngest/client";
import { gmailSync } from "../../inngest/functions";

// Create an API that serves functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    gmailSync, // <-- This is where you'll always add all your functions
    // showProgress,
  ],
});
