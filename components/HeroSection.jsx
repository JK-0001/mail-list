import { Mail, MailX } from "lucide-react";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="py-20 px-6 md:px-12 flex flex-col lg:flex-row items-center">
      <div className="flex-1 pb-12 lg:pb-0">
        <h1 className="text-4xl text-center md:text-left md:text-5xl font-bold mb-6 leading-tight">
          Say <span>Goodbye</span> to Unwanted Emails Forever
        </h1>
        <p className="text-center md:text-left md:text-xl mb-8">
          Take back control of your inbox in just a few clicks. Easily unsubscribe from countless emails without the hassle.
        </p>
        <div className="flex flex-col md:max-xl:justify-around items-center md:flex-row gap-4">
          <button className="btn btn-secondary text-lg py-6 px-8">
            Start Cleaning Your Inbox
          </button>
          <Link href="#how-it-works" className="btn text-lg py-6 px-8">How It Works</Link>
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <div className="relative w-full max-w-md">
          <div className="rounded-xl shadow-xl p-8 border">
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold"></div>
              <div className="absolute -top-5 -left-1 rounded-full p-8 animate-pulse">
            <Mail size={48} />
          </div>
              <div className="text-emailpurple font-medium">95% Cleaner</div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-3 border rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <MailX size={16} className="mr-2" />
                    <span className="text-xs">Newsletter #{item}</span>
                  </div>
                  <div className="badge badge-soft badge-secondary text-xs">Unsubscribed</div>
                </div>
              ))}
              <div className="p-3 border border-emailgray-light rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2" />
                  <span className="text-xs">Daily Promotion</span>
                </div>
                <div className="text-xs pr-2 py-1 cursor-pointer rounded-full">Unsubscribe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

