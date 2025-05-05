// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'

// export async function createClient() {
//   const cookieStore = await cookies()

//   return createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.SUPABASE_SECRET_ROLE,
//     {
//       cookies: {
//         get(name) {
//           return cookieStore.get(name)?.value
//         },
//         set(name, value, options) {
//           try {
//             cookieStore.set({ name, value, ...options })
//           } catch (error) {
//             // The `set` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//         remove(name, options) {
//           try {
//             cookieStore.set({ name, value: '', ...options })
//           } catch (error) {
//             // The `delete` method was called from a Server Component.
//             // This can be ignored if you have middleware refreshing
//             // user sessions.
//           }
//         },
//       },
//     }
//   )
// }
import { createClient } from '@supabase/supabase-js';

export function createClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_ROLE
  );
}
