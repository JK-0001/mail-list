import Link from "next/link";
import Image from 'next/image'
import { AlignJustify } from "lucide-react";


const Header = () => {

  return (
    <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Image src="/logo_final.png" alt="" width={40} height={30} />
        <div className="font-bold md:text-xl">MailEscape</div>
      </div>
      <nav className="hidden md:flex space-x-6">
        <Link href="#features" className="hover:text-purple-400 transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
        <Link href="#faq" className="hover:text-purple-400 transition-colors">FAQ</Link>
      </nav>
      <div className="flex space-x-3">
        {/* <Link href="/login" variant="outline" className="btn btn-soft hidden md:inline-flex">Log In</Link>
        <Link href="#pricing" className="btn btn-secondary hidden md:inline-flex">Get Started</Link> */}
      </div>
      <div className="dropdown dropdown-end md:hidden">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        <AlignJustify />
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-60 p-2 shadow">
        <nav className="flex flex-col">
          <Link href="#features" className="text-center py-2 transition duration-300 ease-in-out">Features</Link>
          <Link href="#pricing" className="text-center py-2 transition duration-300 ease-in-out">Pricing</Link>
          <Link href="#faq" className="text-center py-2 transition duration-300 ease-in-out">FAQ</Link>
        </nav>
        {/* <div className="flex flex-col">
          <Link href="/login" variant="outline" className="btn btn-secondary my-2 md:inline-flex">Log In</Link>
          <Link href="#pricing" className="btn btn-soft my-2">Get Started</Link>
        </div> */}
      </ul>
    </div>
    </header>
  );
};

export default Header;