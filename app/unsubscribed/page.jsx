'use client';

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { logout } from "../logout/actions";
import { Search, Mail, Users } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from 'sonner';

const navigation = [
  { name: 'Senders', icon: Users, href: "/" },
  { name: 'Blocked Senders', icon: Users, href: "/blocked-list"},
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

      const supabase = createClient();

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const providerToken = session.provider_token;
        const res = await fetch("/api/blocked-senders", {
          headers: { Authorization: `Bearer ${providerToken}` },
        });

        const data = await res.json();
        setSendersList(data['data']);
        setLoading(false);
    };

    fetchSenders();
  }, [user]); // ✅ only runs when user is available

  // Handle unsubscribe/block
  const handleUnsubscribeOrBlock = async () => {
    if (!selectedSender) return

    // Open the unsubscribe link
    window.open(selectedSender.unsubscribe_link, '_blank');

    const res = await fetch(`/api/restore-sender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedSender.email })
    })
    if (res.ok) {
      toast.success(`Restored successfully`)
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
                <h1 className="text-2xl font-semibold text-gray-900">Unsubscribed Senders</h1>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm border border-gray-400/50">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-400/50 text-sm font-medium text-muted-foreground text-gray-900">
                <div>Sr</div>
                <div>Name</div>
                <div>Email</div>
                <div>Last Received</div>
              </div>
              <div className="text-gray-900">
                {sendersList.map((sender, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-4 gap-4 p-4 hover:bg-[#f7f8f9] transition-colors"
                  >
                    <div className="font-medium">{i+1}</div>
                    <div className="font-medium">{sender.name}</div>
                    <div className="text-muted-foreground">{sender.email}</div>
                    <div className="text-muted-foreground">
                      {new Date(sender.last_received).toLocaleDateString()}
                    </div>
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