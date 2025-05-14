import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "₹800",
    period: "year",
    description: "Basic plan for personal use",
    features: [
      "1 email account",
      "Email categorization",
      "Manual unsubscribe process"
    ],
    buttonText: "Get Started",
  },
  {
    name: "Pro",
    price: "₹2000",
    period: "year",
    description: "For professional & business",
    features: [,
      "Up to 5 email accounts",
      "Email categorization",
      "Manual unsubscribe process"
    ],
    buttonText: "Get Started",
  }
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 px-6 md:px-12 bg-gradient-to-b to-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg max-w-2xl mx-auto">
            Choose the plan that's right for you.
          </p>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-xl p-8 flex flex-col h-full border border-gray-400`}
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
                <p className="mt-3">
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
             
              <button className="btn btn-soft btn-secondary">
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
