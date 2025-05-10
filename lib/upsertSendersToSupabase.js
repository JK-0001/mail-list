// lib/gmail/upsertSendersToSupabase.js
const limitedMap = async (items, limit, asyncFn) => {
  const results = [];
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const currentIndex = index++;
      try {
        results[currentIndex] = await asyncFn(items[currentIndex]);
      } catch (err) {
        results[currentIndex] = null;
      }
    }
  }

  const workers = Array.from({ length: limit }, () => worker());
  await Promise.all(workers);
  return results;
};

export async function upsertSendersToSupabase(updatedSenders, supabase) {
  
    // Insert the batch into Supabase
    const {error} = await supabase.from("senders_list").upsert(updatedSenders, { onConflict: ["user_id", "email"] });
    console.log(error)
    if (error) throw new Error("Failed to upsert senders");

    return { upsert: true }
  }
  