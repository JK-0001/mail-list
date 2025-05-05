
const CTASection = () => {
  return (
    <section className="py-16 px-6 md:px-12 bg-purple-800 text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Clean Up Your Inbox?</h2>
        <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
          Join thousands of users who have reclaimed their time and decluttered their inboxes with MailEscape.
        </p>
        <button
          className="btn btn-primary text-purple-800 text-lg py-6 px-8"
        >
          Start Your Free Trial Today
        </button>
        <p className="mt-4 text-sm text-white/60">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  );
};

export default CTASection;
