// hooks/useSyncStatus.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; // your supabase client

export default function useSyncStatus(userId) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitial = async () => {
      const { data } = await supabase
        .from("preferences")
        .select("loading, progress, last_synced")
        .eq("user_id", userId)
        .single();

      if (data) {
        setLoading(data.loading);
        setProgress(data.progress);
        setLastSynced(data.last_synced);
      }
    };

    fetchInitial();

    const channel = supabase
      .channel("sync-status")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "preferences", filter: `user_id=eq.${userId}` },
        (payload) => {
          const newData = payload.new;
          setLoading(newData.loading);
          setProgress(newData.progress);
          setLastSynced(newData.last_synced);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { loading, progress, lastSynced };
}
