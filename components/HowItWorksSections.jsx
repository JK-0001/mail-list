
const steps = [
  {
    number: "01",
    title: "Connect Your Email",
    description: "Securely connect your email account. We currently support Gmail, other major providers coming soon."
  },
  {
    number: "02",
    title: "Scan Your Inbox",
    description: "Our intelligent system scans your inbox to identify and organize unique senders info."
  },
  {
    number: "03",
    title: "Select & Unsubscribe",
    description: "Choose which subscriptions to keep and which to remove with a simple click."
  },
  {
    number: "04",
    title: "Enjoy a Clean Inbox",
    description: "Sit back and watch as your inbox becomes cleaner and more manageable."
  }
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How MailEscape Works</h2>
          <p className="text-lg text-emailgray-dark max-w-2xl mx-auto">
            A simple 4-step process to regain control of your inbox in minutes.
          </p>
        </div>
       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative p-6 rounded-xl border border-emailgray-light hover:border-emailpurple transition-colors"
            >
              <div className="text-5xl font-bold text-emailpurple/10 absolute -top-4 -left-2">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-3 mt-6">{step.title}</h3>
              <p className="text-emailgray-dark">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
