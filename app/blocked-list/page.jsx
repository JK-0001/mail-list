"use client"
import { useEffect, useState } from "react"
import { EyeOff, XCircle } from "lucide-react"

export default function BlockedPage() {
  const [blockedSenders, setBlockedSenders] = useState([])

  useEffect(() => {
    const fetchBlocked = async () => {
      const res = await fetch("/api/blocked-senders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
      const data = await res.json()
      setBlockedSenders(data)
    }

    fetchBlocked()
  }, [])

  blockedSenders.map((s,i)=>{
    console.log(s)
  })

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Blocked / Unsubscribed Senders</h1>

      {blockedSenders.length === 0 ? (
        <p className="text-muted-foreground">No blocked or unsubscribed senders yet.</p>
      ) : (
        <div className="space-y-4">
          {blockedSenders.map((s, i) => (
            <div key={i} className="border rounded-xl p-4 flex justify-between items-center">
              <div>
                <div className="font-semibold">{s.name || s.email}</div>
                <div className="text-sm text-muted-foreground">{s.email}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">Status: {s.status}</div>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                {s.status === "unsubscribed" ? <XCircle className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
