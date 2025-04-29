import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Basic email cleanup for personal use",
    features: [
      "Unsubscribe from up to 10 senders",
      "Basic email analytics",
      "Email categorization",
      "Manual unsubscribe process"
    ],
    buttonText: "Get Started",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: "$7.99",
    period: "per month",
    description: "Advanced features for power users",
    features: [
      "Unlimited unsubscriptions",
      "Advanced email analytics",
      "Priority support",
      "Automated monthly cleanup",
      "Scheduled email digests"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default",
    popular: true
  },
  {
    name: "Team",
    price: "$19.99",
    period: "per month",
    description: "For teams and businesses",
    features: [
      "All Pro features",
      "Up to 5 team members",
      "Team analytics dashboard",
      "API access",
      "Custom integrations",
      "Dedicated support"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 px-6 md:px-12 bg-gradient-to-b from-white to-emailgray-light">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-emailgray-dark max-w-2xl mx-auto">
            Choose the plan that's right for you. All plans include a 14-day free trial.
          </p>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-8 flex flex-col h-full ${
                plan.popular
                  ? "bg-purple-800 text-white shadow-lg border-2 border-purple-800"
                  : "border border-gray-400"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-purple-800 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-2 text-sm opacity-80">/{plan.period}</span>
                </div>
                <p className={`mt-3 ${plan.popular ? "text-white/80" : "text-emailgray-dark"}`}>
                  {plan.description}
                </p>
              </div>
             
              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <div className={`flex-shrink-0 ${plan.popular ? "text-white" : "text-emailpurple"}`}>
                      <Check className="h-5 w-5" />
                    </div>
                    <span className="ml-3">{feature}</span>
                  </li>
                ))}
              </ul>
             
              <button
                className={`mt-auto w-full ${
                  plan.popular
                    ? "text-purple-800"
                    : plan.buttonVariant === "outline"
                      ? "border-emailpurple text-emailpurple hover:bg-emailpurple-light"
                      : "bg-emailpurple hover:bg-emailpurple-dark"
                }`}
                variant={plan.buttonVariant === "default" ? "default" : "outline"}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
