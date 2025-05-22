"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { logout } from "../logout/actions";
import Image from 'next/image'
import { encrypt } from "@/lib/crypto";
import { Search, RotateCw, LogOut, ListFilter, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Dashboard() {
  const [filter, setFilter] = useState("all");
  const [sortOption, setSortOption] = useState("date_desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [sendersList, setSendersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markLoading, setMarkLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSender, setSelectedSender] = useState(null);
  const [linkOpened, setLinkOpened] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const router = useRouter();

  // ✅ 1. Get user only ONCE
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        router.push("/login"); // ✅ client-side redirect
      } else {
        setUser(data.user);
      }
    };

    fetchUser();
  }, []); // ✅ only runs once

  // ✅ 2. Fetch sender data AFTER user is available
  useEffect(() => {
    const triggerInngestSync = async () => {
      if (!user) return;

      setSyncing(true); // 🔁 syncing starts

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const providerToken = session.provider_token;
      console.log(session)


      // Fetch preferences to check if last_synced exists
      const { data: prefData } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (prefData) {
        const { data } = await supabase
          .from("senders_list")
          .select("*")
          .eq("user_id", user.id);

        setSendersList(data);
        setProgress(prefData.progress);
        setLastSynced(prefData.last_synced)
        setSyncing(false)
      }

      if (!prefData) {
        // 🔁 Trigger Inngest gmailSync function
        const res = await fetch("/api/gmail-sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id, type: "full" }),
        });
        const data = await res.json();
        console.log(data);
      } else if (prefData.loading === false) {
        // 🔁 Trigger Inngest gmailSync function
        const res = await fetch("/api/gmail-sync", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${providerToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user.id, type: "partial" }),
        });
        const data = await res.json();
        console.log(data);
      }
    };

    triggerInngestSync();
  }, [user]); // ✅ only runs when user is available

  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();

    // Realtime listener for preferences table -> progress
    const progressChannel = supabase
      .channel("public:preferences")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "preferences",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const { progress, last_synced, error } = payload.new;
          if (error === "force_reauth") {
            toast.error("Session expired. Please sign in again.");

            // 1. Clear error in DB before redirecting
            const clearError = async () => {
              await supabase
                .from("preferences")
                .update({ error: null })
                .eq("user_id", user.id);
              await supabase.auth.signOut(); // logout after clearing
              router.push("/login"); // redirect to login
            };

            clearError();
          }
          if (progress !== 0) setProgress(Number(progress));
          if (last_synced) {
            setLastSynced(last_synced);
            setSyncing(false); // ✅ sync complete
          }
        }
      )
      .subscribe();

    // Realtime listener for senders_list table
    const sendersChannel = supabase
      .channel("public:senders_list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "senders_list",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // You can fine-tune how you update the UI here
          setSendersList((prev) => {
            const existingIndex = prev.findIndex(
              (s) => s.email === payload.new.email
            );
            if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = payload.new;
              return updated;
            }
            return [payload.new, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
      supabase.removeChannel(sendersChannel);
    };
  }, [user]);

  const fetchSendersList = async () => {
    if (!user) return;

    setSyncing(true); // 🔁 syncing starts

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const providerToken = session.provider_token;
    console.log(session)

    // Fetch preferences to check if last_synced exists
    const { data: prefData } = await supabase
      .from("preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (prefData) {
      const { data } = await supabase
        .from("senders_list")
        .select("*")
        .eq("user_id", user.id);

      setSendersList(data);
      setSyncing(false)
    }

    // 🔁 Trigger Inngest gmailSync function
    const res = await fetch("/api/gmail-sync", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user.id,
        type: prefData ? "partial" : "full",
      }),
    });
    const data = await res.json();
    console.log(data);
  };

  const markAsRead = async (senderEmail) => {
    setMarkLoading(true)
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const providerToken = session.provider_token;

      const res = await fetch("/api/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    setMarkLoading(false)
  };

  // Handle unsubscribe/block
  const handleUnsubscribe = async () => {
    if (!selectedSender) return;
    setLoading(true);

    // Open the unsubscribe link
    window.open(selectedSender.unsubscribe_link, "_blank");

    setLinkOpened(true)
    setLoading(false);
  };

  const markUnsubscribe = async () => {
    if (!selectedSender) return;
    setLoading(true);

    const res = await fetch(`/api/mark-unsubscribed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: selectedSender.email}),
    });
    if (res.ok) {
      toast.success("Unsubscribed successfully");
    } else {
      toast.error(`Failed to unsubscribe`);
    }
    setIsConfirmOpen(false);
    setSelectedSender(null);
    setLinkOpened(false)
    setLoading(false);
  }

  const openConfirmModal = (sender) => {
    setSelectedSender(sender);
    setIsConfirmOpen(true);
  };

  let filteredSenders = sendersList
    .filter(
      (sender) =>
        sender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sender.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((sender) => {
      if (filter === "unsubscribed") return !!sender.unsubscribed;
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
          return (
            new Date(a.last_received || 0) - new Date(b.last_received || 0)
          );
        case "date_desc":
        default:
          return (
            new Date(b.last_received || 0) - new Date(a.last_received || 0)
          );
      }
    });

  return (
    <div className="min-h-screen">
      <div className="flex flex-col overflow-hidden">
        <header className="md:w-[95%] md:m-auto border-b border-gray-400/50 h-16 flex items-center justify-between px-2 md:px-6">
          <div className="flex items-center">
            <Image src="/logo_final.png" alt="" width={40} height={30} />
            <div className="hidden md:block pl-2 font-bold text-xl">MailEscape</div>
          </div>
          <div className="flex items-center">
            <div className="relative rounded-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
              <input
                type="text"
                placeholder="Search senders..."
                className="w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <form action={logout}>
              <button type="submit" className="cursor-pointer">
                <LogOut />
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="md:w-[95%] md:m-auto overflow-auto p-2 md:p-6">
          <div className="md:mb-6 py-4 flex flex-col md:flex-row md:justify-between">
            <div className="flex items-center pb-3">
              <h1 className="text-xl md:text-2xl font-semibold">Senders</h1>
              <div className="flex items-center gap-2">
                {syncing ? (
                  <div className="text-sm px-2 text-muted-foreground animate-pulse">
                    Syncing... ({progress}%)
                    <progress
                      className="progress progress-accent w-48 md:w-56"
                      value={progress}
                      max="100"
                    ></progress>
                  </div>
                ) : lastSynced ? (
                  <button
                    onClick={fetchSendersList}
                    disabled={syncing}
                    className="text-sm px-2 text-muted-foreground hover:text-black transition"
                  >
                    <RotateCw className="w-4 h-4 cursor-pointer transition-transform duration-300 inline-block mr-1" />
                  </button>
                ) : null}
              </div>
              <div className="text-xs">
                {lastSynced && !syncing && (
                  <span>
                    Last synced: <br className="md:hidden" /> {new Date(lastSynced).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex md:gap-4 justify-between">
              {/* Filter Dropdown */}
              <DropdownMenu className="cursor-pointer">
                <DropdownMenuTrigger asChild>
                  <Button className="text-xs w-[48%] md:text-sm md:w-auto" variant="outline">
                    <ListFilter />:{" "}
                    {filter === "all"
                      ? "All"
                      : filter === "unsubscribe"
                      ? "Unsubscribe"
                      : filter === "unsubscribed"
                      ? "Unsubscribed"
                      : "Unread"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-base-100">
                  <DropdownMenuItem onClick={() => setFilter("all")}>
                    All Senders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("unsubscribed")}>
                    Unsubscribed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("unsubscribe")}>
                    Unsubscribe Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilter("unread")}>
                    Unread Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="text-xs w-[48%] md:text-sm md:w-auto" variant="outline">
                    Sort:{" "}
                    {
                      {
                        date_desc: "Newest",
                        date_asc: "Oldest",
                        name_asc: "A-Z",
                        name_desc: "Z-A",
                        unread_desc: "Unread Count",
                      }[sortOption]
                    }
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-base-100">
                  <DropdownMenuItem onClick={() => setSortOption("date_desc")}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("date_asc")}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("name_asc")}>
                    Name A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOption("name_desc")}>
                    Name Z-A
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setSortOption("unread_desc")}
                  >
                    Unread Count
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-gray-400/50">
            <div className="grid grid-cols-11 md:grid-cols-16 p-2 md:py-4 border-b border-gray-400/50 text-xs md:text-sm font-medium">
              <div className="col-span-1 md:text-center">Sr</div>
              <div className="col-span-6">Name</div>
              <div className="col-span-2 text-center">Last Received</div>
              <div className="col-span-2 text-center">Unread Count</div>
            </div>
            <div>
              {filteredSenders.length === 0 ? (
                // <div className="p-4 text-center">No senders found.</div>
                <span className="loading loading-spinner"></span>
              ) : (
                filteredSenders.map((sender, i) => (
                  <div
                    key={i}
                    className="grid max-sm:grid-flow-row-dense grid-cols-11 max-sm:grid-rows-2 md:grid-cols-16 p-2 text-xs md:text-sm lg:text-lg items-center"
                  >
                    <div className="col-span-1 md:text-center">{i + 1}</div>
                    <div className="col-span-6 md:font-medium">{sender.name}<br/>{sender.email}</div>
                    <div className="col-span-2 text-center">{new Date(sender.last_received).toLocaleDateString()}</div>
                    <div className="col-span-2 text-center">{sender.unread_count}</div>
                    {!sender.unsubscribed && sender.unsubscribe_link ? (
                      <button
                        target="_blank"
                        onClick={() => openConfirmModal(sender, "unsubscribe")}
                        className="col-span-4 md:col-span-2 text-xs w-[90%] md:w-[100%] lg:w-[80%] lg:py-4 m-auto cursor-pointer badge badge-secondary"
                      >
                        Unsubscribe
                      </button>
                    ) : (
                      <div className="col-span-4 md:col-span-2 text-xs w-[90%] md:w-[100%] lg:w-[80%] lg:py-4 m-auto badge badge-soft badge-secondary">Unsubscribed</div>
                    )}
                    {sender.unread_count > 0 && (
                      <button
                        variant="destructive"
                        className="col-span-4 md:col-span-2 text-xs w-[90%] lg:w-[80%] lg:py-4 m-auto cursor-pointer badge badge-soft"
                        disabled={markLoading}
                        onClick={() => markAsRead(sender.email)}
                      >
                        Mark Read
                      </button>
                    )}
                    {/* <Trash2 className="col-start-16 cursor-pointer hover:text-red-400" /> */}
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Confirmation Modal */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} className="pointer-events-auto bg-base-100">
          <DialogHeader>
            {!linkOpened ? (
              <DialogTitle>
                Are you sure you want to Unsubcribe?<br />
                <span className="text-white">{selectedSender?.email}</span>
              </DialogTitle>
            ) : (
              <DialogTitle>
                Did it work?
              </DialogTitle>
            )}
          </DialogHeader>
          <DialogFooter className="mt-4">
          {!linkOpened ? (
            <button
            variant="outline"
            className="btn btn-soft cursor-pointer"
            disabled={loading}
            onClick={() => setIsConfirmOpen(false)}
          >
            Cancel
          </button>
          ):(
            <Button
              variant="outline"
              className="btn btn-soft cursor-pointer"
              disabled={loading}
              onClick={() => setIsConfirmOpen(false)}
            >
              No
            </Button>
          )}
            {!linkOpened ? (
              <button
              variant="destructive"
              className="btn btn-secondary cursor-pointer"
              disabled={loading}
              onClick={() => handleUnsubscribe()}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <span>Unsubscribe</span>
              )}
            </button>
            ) : (
              <button
              variant="destructive"
              className="btn btn-secondary cursor-pointer"
              disabled={loading}
              onClick={() => markUnsubscribe()}
            >
              {linkOpened && !loading ? (
                <span>Yes</span>
              ) : (
                <span className="loading loading-spinner"></span>
              )}
            </button>
            )
            }
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
