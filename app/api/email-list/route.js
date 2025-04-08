import { fetchEmailsLists } from "@/app/components/apiComp/fetchEmailsList";
import { NextResponse } from "next/server";

// 🔹 **GET Method** → Fetch newsletters
export async function GET(req) {
    try {
        // Extract Authorization header
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });

        // Extract the token (Bearer format)
        const providerToken = authHeader.split("Bearer ")[1];
        if (!providerToken) return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });

        const emails = await fetchEmailsLists(providerToken);
        console.log('Emails List:', emails);          

        return NextResponse.json({ unique_senders: Array.from(emails) });
    } catch (error) {
        console.error("Error fetching emails list:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// 🔹 **POST Method** → Future use (e.g., saving newsletters, marking read)
export async function POST(req) {
    return NextResponse.json({ message: "POST method not implemented" }, { status: 501 });
}
