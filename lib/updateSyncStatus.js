// lib/gmail/updateSyncStatus.js
export async function updateSyncStatus(user_id, supabase, type) {
    // 🌟 Get last_synced for partial sync
    let afterQuery = "";
    if (type === "partial") {
        const { data, error } = await supabase
        .from("preferences")
        .select("last_synced")
        .eq("user_id", user_id)
        .single();

        if (error) {
            console.error("Error fetching last_synced:", error);
        } else if (data?.last_synced) {
            const unixTime = Math.floor(new Date(data.last_synced).getTime() / 1000);
            afterQuery = `after:${unixTime}`;
        }
    }

    // Step 4: Update last_synced in preferences
    if (type == "full") { 
        const { error } = await supabase.from('preferences').upsert({
        user_id,
        loading: true,
        progress: 0,
        }, { onConflict: ['user_id'] });
        console.log(error)
    }
    return afterQuery;
}
  