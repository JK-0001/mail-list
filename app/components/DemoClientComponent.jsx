'use client'

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function DemoClientComponent(){
    const [user, setUser] = useState(null)
    const [newsletters, setNewsletters] = useState([]);
    const [uniqueSenders, setUniqueSenders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getUser(){
            const supabase = createClient()
            const { data, error } = await supabase.auth.getUser()
            if (error || !data?.user) {
                console.log('no user')
            } else {
                setUser(data.user)
            }
        }
        async function fetchNewsletters() {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return alert("Please sign in first!");
            } 
            
            const providerToken = session.provider_token; // Get Google access token from Supabase session
            
            const res = await fetch("/api/newsletters", {
                headers: {
                    Authorization: `Bearer ${providerToken}`
                }
            });
            
            const data = await res.json();
            setNewsletters(data.newsletters);
            setLoading(false);
        }

        async function fetchEmailsList() {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                return alert("Please sign in first!");
            } 
            
            const providerToken = session.provider_token; // Get Google access token from Supabase session
            
            const res = await fetch("/api/email-list", {
                headers: {
                    Authorization: `Bearer ${providerToken}`
                }
            });
            
            const data = await res.json();
            setUniqueSenders(data.unique_senders);
            setLoading(false);
        }
        
        getUser();
        // fetchNewsletters();
        fetchEmailsList();
    }, [])

    console.log({user})

    return(
        <div>
            {/* <h1>Newsletters</h1>
            {loading ? <p>Loading...</p> : (
                <ul>
                    {newsletters.map((email) => (
                        <li key={email.id}>
                            <strong>{email.subject}</strong> - {email.from}
                            <p>{email.snippet}</p>
                        </li>
                    ))}
                </ul>
            )} */}

            {loading ? <p>Loading...</p> : (
                <ul>
                    {uniqueSenders.map((email, id) => (
                        <li key={id}>
                            <p>{email}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )

}
