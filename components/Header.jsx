import Link from "next/link";
import Image from 'next/image'

const Header = () => {
  return (
    <header className="w-full py-4 px-6 md:px-12 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Image src="/logo.png" alt="" width={60} height={40} />
        <div className="font-bold text-xl">MailEscape</div>
      </div>
      <nav className="hidden md:flex space-x-6">
        <Link href="#features" className="hover:text-purple-400 transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</Link>
        <Link href="#faq" className="hover:text-purple-400 transition-colors">FAQ</Link>
      </nav>
      <div className="flex space-x-3">
        <Link href="/login" variant="outline" className="btn btn-soft hidden md:inline-flex">Log In</Link>
        <Link href="/connect" className="btn btn-secondary">Get Started</Link>
      </div>
    </header>
  );
};

export default Header;

