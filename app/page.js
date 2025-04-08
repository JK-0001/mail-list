// import DemoClientComponent from "./components/DemoClientComponent";

// export default async function Home() {
  //   const supabase = await createClient()

//   const { data, error } = await supabase.auth.getUser()
//   if (error || !data?.user) {
  //     redirect('/login')
//   }

//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <form action={logout}>
//           <button type="submit">
//             Logout
//           </button>
//       </form>
//     </main>
//   );
// }

import { logout } from "./logout/actions";
import { Search, Mail, Users, Settings, Moon, Sun } from 'lucide-react';
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

const navigation = [
  { name: 'Inbox', icon: Mail, href: "/"},
  { name: 'Senders', icon: Users, href: "/senders-list"},
  { name: 'Blocked Senders', icon: Users, href: "/blocked-list"},
  { name: 'Settings', icon: Settings, href: "/settings"},
];

export default async function Dashboard() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
      redirect('/login')
  }

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
                    className="w-full pl-10 pr-4 py-2 rounded-md text-sm focus:outline-none" />
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
              <h1 className="text-2xl font-semi bold text-gray-900">Inbox</h1>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}