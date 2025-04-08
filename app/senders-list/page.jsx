'use client';

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { Search, Mail, Users, Settings, Moon, Sun, RotateCw, EyeOff, MailCheck, XCircle  } from 'lucide-react';
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
  { name: 'Inbox', icon: Mail, href: "/" },
  { name: 'Senders', icon: Users, href: "/senders-list" },
  { name: 'Blocked Senders', icon: Users, href: "/blocked-list"},
  { name: 'Settings', icon: Settings, href: "/settings" },
];

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null)
  const [sendersList, setSendersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState('');
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

      const supabase = createClient();

      const { data: prefData } = await supabase
        .from('preferences')
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'last_synced')
        .single();

      if (prefData) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const providerToken = session.provider_token;
        const res = await fetch("/api/senders", {
          headers: { Authorization: `Bearer ${providerToken}` },
        });

        const data = await res.json();
        setSendersList(data.senders || []);
        setLastSynced(prefData.value);
        setLoading(false);
      }
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
      const { data: prefData, error: prefError } = await supabase
      .from('preferences')
      .select('value')
      .eq('user_id', user.id)
      .eq('key', 'last_synced')
      .single();
      
      setSendersList(data.senders || []);
      setLastSynced(prefData)
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
          return new Date(a.last_received) - new Date(b.last_received);
        case "date_desc":
        default:
          return new Date(b.last_received) - new Date(a.last_received);
      }
    });

  

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-gray-400/50">
          <div className="h-16 flex items-center px-4 border-b border-gray-400/50">
            <Mail className="w-6 h-6 text-gray-900" />
            <span className="ml-2 font-semibold text-gray-900">Mail Analytics</span>
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
                <p className="text-gray-400 text-[10px] text-muted-foreground ml-2">
                  Last synced: {new Date(lastSynced['value']).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-4 mb-4">
                {/* Filter Dropdown */}
                <DropdownMenu>
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
              <div className="grid grid-cols-7 gap-4 p-4 border-b border-gray-400/50 text-sm font-medium text-muted-foreground text-gray-900">
                <div>Sr</div>
                <div>Name</div>
                <div>Email</div>
                <div>Last Received</div>
                <div>Unread Messages</div>
              </div>
              <div className="text-gray-900">
                {filteredSenders.map((sender, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-7 gap-4 p-4 hover:bg-[#f7f8f9] transition-colors"
                  >
                    <div className="font-medium">{i+1}</div>
                    <div className="font-medium">{sender.name}</div>
                    <div className="text-muted-foreground">{sender.email}</div>
                    <div className="text-muted-foreground">
                      {new Date(sender.last_received).toLocaleDateString()}
                    </div>
                    <div className="text-muted-foreground">{sender.unread_count}</div>
                    {/* {sender.unsubscribe_link ? (
                      <a
                        href={sender.unsubscribe_link}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <button className="text-muted-foreground hover:underline">
                          Unsubscribe
                        </button>
                      </a>
                    ) : <p></p>} */}
                    {sender.unsubscribe_link ? (
                      <button 
                        target="_blank"
                        onClick={() => openConfirmModal(sender, "unsubscribe")}
                        className="text-muted-foreground"
                      >
                        Unsubscribe
                      </button>
                    ) : (
                      <button
                        onClick={() => openConfirmModal(sender, "block")}
                        className="text-muted-foreground"
                      >
                        Block
                      </button>
                    )}
                    {sender.unread_count > 0 && ( <button onClick={() => markAsRead(sender.email)} className="text-green-600 hover:underline">Mark as Read</button>)}
                  </div>
                ))}
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