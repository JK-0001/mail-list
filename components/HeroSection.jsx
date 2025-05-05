import { Mail, MailX } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="py-20 px-6 md:px-12 flex flex-col lg:flex-row items-center">
      <div className="flex-1 pb-12 lg:pb-0">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Say <span>Goodbye</span> to Unwanted Emails Forever
        </h1>
        <p className="text-lg md:text-xl text-gray mb-8">
          Take back control of your inbox in just a few clicks. Easily unsubscribe from countless emails without the hassle.
        </p>
        <div className="flex flex-col items-center sm:flex-row gap-4">
          <button className="btn btn-primary bg-emailpurple hover:bg-emailpurple-dark text-lg py-6 px-8">
            Start Cleaning Your Inbox
          </button>
          <button variant="outline" className="text-lg py-6 px-8">
            Watch How It Works
          </button>
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-6 -left-6 bg-emailpurple/10 rounded-full p-8 animate-pulse">
            <MailX size={48} className="text-emailpurple" />
          </div>
          <div className="rounded-xl shadow-xl p-8 border border-emailgray-light">
            <div className="flex justify-between items-center mb-6">
              <div className="font-bold">Your Inbox</div>
              <div className="text-emailpurple font-medium">95% Cleaner</div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-3 border border-emailgray-light rounded-lg flex justify-between items-center">
                  <div className="flex items-center">
                    <Mail size={16} className="mr-2 text-emailgray" />
                    <span className="text-sm">Newsletter #{item}</span>
                  </div>
                  <div className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Unsubscribed</div>
                </div>
              ))}
              <div className="p-3 border border-emailgray-light rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <Mail size={16} className="mr-2 text-emailgray" />
                  <span className="text-sm">Daily Promotion</span>
                </div>
                <div className="text-xs px-2 py-1 bg-purple-light text-purple-dark cursor-pointer rounded-full">Unsubscribe</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

