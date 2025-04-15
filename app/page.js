'use client';

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { logout } from "./logout/actions";
import { Search, Mail, Users, UserX, RotateCw  } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from 'sonner';

const navigation = [
  { name: 'Senders', icon: Users, href: "/" },
  { name: 'Unsubscribed', icon: UserX, href: "/unsubscribed"},
];

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null)
  const [sendersList, setSendersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSender, setSelectedSender] = useState(null)
  const [confirmType, setConfirmType] = useState(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  
  const router = useRouter();

  // ✅ 1. Get user only ONCE
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push('/login'); // ✅ client-side redirect
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []); // ✅ only runs once

   // ✅ 2. Fetch sender data AFTER user is available
   useEffect(() => {

    const fetchSenders = async () => {
      if (!user) return;

      const supabase = await createClient();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      console.log(session)

      const providerToken = session.provider_token;
      console.log(providerToken)

      const { data: prefData, error: prefError } = await supabase
        .from('preferences')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'last_synced')
        .maybeSingle()

      console.log(prefData)
      console.log(prefError)
      const endpoint = prefData ? '/api/senders' : '/api/initial-sync';

      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${providerToken}` },
      });

      const data = await res.json();
      setSendersList(data.senders || []);
      setLoading(false);
    };

    fetchSenders();
  }, [user]); // ✅ only runs when user is available


  const fetchSendersList = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return alert("Please sign in first!");
  
      const providerToken = session.provider_token;
  
      const res = await fetch("/api/senders", {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      });
  
      const data = await res.json();
      
      setSendersList(data.senders || []);
      toast.success("Senders list refreshed!");
    } catch (err) {
      console.error("Manual refresh failed:", err);
      toast.error("Failed to refresh senders list");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (senderEmail) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const providerToken = session.provider_token;
  
      const res = await fetch('/api/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${providerToken}`,
        },
        body: JSON.stringify({ email: senderEmail }),
      });
  
      if (!res.ok) throw new Error("Failed to mark as read");
  
      toast.success("Marked all emails as read");
  
      // Update UI locally
      setSendersList((prev) =>
        prev.map((s) =>
          s.email === senderEmail ? { ...s, unread_count: 0 } : s
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    }
  };

  // Handle unsubscribe/block
  const handleUnsubscribeOrBlock = async (type) => {
    if (!selectedSender) return

    await markAsRead(selectedSender.email)

    // Open the unsubscribe link
    window.open(selectedSender.unsubscribe_link, '_blank');

    const res = await fetch(`/api/block-sender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedSender.email, type: type })
    })
    if (res.ok) {
      toast.success(`${type === "unsubscribe" ? "Unsubscribed" : "Blocked"} successfully`)
      setSendersList(prev => prev.filter(s => s.email !== selectedSender.email))
    } else {
      toast.error(`Failed to ${type}`)
    }
    setIsConfirmOpen(false)
    setSelectedSender(null)
    setConfirmType(null)
  }

  const openConfirmModal = (sender, type) => {
    setSelectedSender(sender)
    setConfirmType(type)
    setIsConfirmOpen(true)
  }
    
  let filteredSenders = sendersList
    .filter(sender => 
      sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sender.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((sender) => {
      if (filter === "unsubscribe") return !!sender.unsubscribe_link;
      if (filter === "unread") return sender.unread_count > 0;
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "unread_desc":
          return b.unread_count - a.unread_count;
        case "date_asc":
          return new Date(a.last_received || 0) - new Date(b.last_received || 0);
        case "date_desc":
        default:
          return new Date(b.last_received || 0) - new Date(a.last_received || 0);
      }
    });

  

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-gray-400/50">
          <div className="h-16 flex items-center px-4 border-b border-gray-400/50">
            <Mail className="w-6 h-6 text-gray-900" />
            <span className="ml-2 font-semibold text-gray-900">Mail List</span>
          </div>
          <nav className="p-4 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-900 ${
                  item.current
                    ? 'bg-[#c5c5c5]'
                    : 'text-muted-foreground hover:bg-[#f7f8f9]'
                }`}
              >
                <item.icon className="w-5 h-5 mr-2 text-gray-900" />
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-gray-400/50 flex items-center justify-between px-6">
            <div className="flex items-center flex-1">
              <div className="w-96">
                <div className="relative text-gray-400 bg-[#f7f8f9] rounded-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search senders..."
                    className="w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <form action={logout}>
                <button type="submit" className="text-gray-900 cursor-pointer">
                  Logout
                </button>
              </form>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900">Senders</h1>
                <button className="pl-5 pr-1" onClick={fetchSendersList} disabled={loading}>
                  <RotateCw 
                    className={`w-4 h-4 cursor-pointer transition-transform duration-300 ${loading ? "animate-spin text-blue-500" : "text-gray-400 hover:text-gray-800"}`} 
                    />
                </button>
              </div>
              <div className="flex items-center gap-4 mb-4">
                {/* Filter Dropdown */}
                <DropdownMenu className="cursor-pointer">
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Filter: {filter === "all" ? "All" : filter === "unsubscribe" ? "Unsubscribe" : "Unread"}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter("all")}>All Senders</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("unsubscribe")}>Unsubscribe Only</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter("unread")}>Unread Only</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Sort: {
                        {
                          date_desc: "Newest",
                          date_asc: "Oldest",
                          name_asc: "A-Z",
                          name_desc: "Z-A",
                          unread_desc: "Unread Count"
                        }[sortOption]
                      }
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortOption("date_desc")}>Newest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("date_asc")}>Oldest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name_asc")}>Name A-Z</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("name_desc")}>Name Z-A</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption("unread_desc")}>Unread Count</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-gray-400/50">
              <div className="grid grid-cols-16 p-4 border-b border-gray-400/50 text-sm font-medium text-muted-foreground text-gray-900">
                <div>Sr</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2 text-center">Last Received</div>
                <div className="col-span-2 text-center">Unread Messages</div>
              </div>
              <div className="text-gray-900">
              {filteredSenders.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No senders found.</div>
              ) : ( 
                filteredSenders.map((sender, i) => (
                <div
                  key={i}
                  className="grid grid-cols-16 gap-1 p-4 items-center hover:bg-[#f7f8f9] transition-colors"
                >
                  <div className="col-span-1 font-medium">{i+1}</div>
                  <div className="col-span-3 font-medium">{sender.name}</div>
                  <div className="col-span-4 text-muted-foreground">{sender.email}</div>
                  <div className="col-span-2 text-center text-muted-foreground">
                    {new Date(sender.last_received).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 text-center text-muted-foreground">{sender.unread_count}</div>
                  {sender.unsubscribe_link ? (
                    <button 
                      target="_blank"
                      onClick={() => openConfirmModal(sender, "unsubscribe")}
                      className="col-start-15 col-span-1 text-xs btn btn-primary border-2"
                    >
                      Unsubscribe
                    </button>
                  ) : (
                    <p></p>
                  )}
                  {sender.unread_count > 0 && ( <button onClick={() => markAsRead(sender.email)} className="col-start-16 col-span-1 text-xs btn btn-accent border-2">Mark as Read</button>)}
                </div>
                  ))
              )}
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to {confirmType}{" "}
              <span className="text-red-500">{selectedSender?.email}</span>?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleUnsubscribeOrBlock(confirmType)}
            >
              {confirmType === "unsubscribe" ? "Unsubscribe" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
