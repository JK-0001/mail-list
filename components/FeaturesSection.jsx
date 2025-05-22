
import { Mail, Timer, EyeOff } from "lucide-react";

const features = [
  {
    title: "Smart Detection",
    description: "Automatically detects subscription emails and categorizes them for easy management.",
    icon: Mail
  },
  {
    title: "Time Saver",
    description: "Save hours of manually going through emails and clicking unsubscribe links.",
    icon: Timer
  },
  {
    title: "Privacy Focused",
    description: "We never read or store the content of your emails. Your privacy is our top priority.",
    icon: EyeOff
  }
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose MailEscape?</h2>
          <p className="text-lg text-emailgray-dark max-w-2xl mx-auto">
            Our powerful tools make managing your email subscriptions effortless and efficient.
          </p>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* <div className="flex md:grid-cols-2 gap-8"> */}
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-xl shadow-sm border border-emailgray-light hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center p-3 bg-emailpurple-light rounded-lg mb-5">
                <feature.icon className="h-6 w-6 text-emailpurple-dark" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-emailgray-dark">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

