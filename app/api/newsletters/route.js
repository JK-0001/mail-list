import { fetchNewsletters } from "@/app/components/apiComp/fetchNewslettersEmails";
import { google } from "googleapis";
import { NextResponse } from "next/server";

// Query to fetch only newsletters
const QUERY = '(category:promotions OR label:newsletters OR "unsubscribe" OR "manage your preferences" OR list:(*) OR list-id:(*) OR "view this email in your browser") -from:(@gmail.com OR @yahoo.com OR @outlook.com) -to:me';

// 🔹 **GET Method** → Fetch newsletters
export async function GET(req) {
    try {
        // Extract Authorization header
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });

        // Extract the token (Bearer format)
        const providerToken = authHeader.split("Bearer ")[1];
        if (!providerToken) return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });

        // Set up Gmail API client
        // const oauth2Client = new google.auth.OAuth2(
        //     process.env.GOOGLE_CLIENT_ID,
        //     process.env.GOOGLE_CLIENT_SECRET,
        //     process.env.REDIRECT_URL,
        //   );
        // const oauth2Client = new google.auth.OAuth2()
        // oauth2Client.setCredentials({ access_token:  providerToken});
        // const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        const emails = await fetchNewsletters(providerToken);
        console.log('Newsletters:', emails);          

        // Fetch newsletter emails
        // const response = await gmail.users.messages.list({
        //     userId: "me",
        //     q: "label:newsletters",
        //     maxResults: 10, // Fetch latest 10 newsletters
        // });

        // if (!response.data.messages) return NextResponse.json({ newsletters: [] });

        // // Fetch details of each email
        // const emails = await Promise.all(
        //     response.data.messages.map(async (msg) => {
        //         const email = await gmail.users.messages.get({
        //             userId: "me",
        //             id: msg.id,
        //             format: "metadata",
        //         });

        //         // Extract metadata
        //         const headers = email.data.payload.headers;
        //         const subject = headers.find(h => h.name === "Subject")?.value || "No Subject";
        //         const from = headers.find(h => h.name === "From")?.value || "Unknown Sender";
        //         const snippet = email.data.snippet; // Short preview

        //         return { id: msg.id, subject, from, snippet };
        //     })
        // );

        return NextResponse.json({ newsletters: emails });
    } catch (error) {
        console.error("Error fetching newsletters:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 🔹 **POST Method** → Future use (e.g., saving newsletters, marking read)
export async function POST(req) {
    return NextResponse.json({ message: "POST method not implemented" }, { status: 501 });
}
