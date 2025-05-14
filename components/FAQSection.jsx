   const faqs = [
    {
      question: "How does MailEscape work?",
      answer: "MailEscape connects to your email account, scans for senders with unsubscribe links, and provides you with an easy interface to unsubscribe from them. We handle the entire process, including following unsubscribe links and confirming your removal from mailing lists."
    },
    {
      question: "Is my email data safe?",
      answer: "Absolutely. We take privacy extremely seriously. We only access the headers of your emails to identify subscription sources, never the content. Your data is encrypted, and we never store your email password. We're also compliant with GDPR and other privacy regulations."
    },
    {
      question: "Which email providers do you support?",
      answer: "We currently support Gmail, other major providers coming soon."
    },
    {
      question: "Can I choose which emails to unsubscribe from?",
      answer: "Yes! We provide you with a complete list of your subscription emails, and you decide which ones you want to keep and which ones you want to unsubscribe from."
    },
    {
      question: "What if I accidentally unsubscribe from something important?",
      answer: "Don't worry! We keep a record of all unsubscriptions, and in most cases, you can re-subscribe by visiting the sender's website or contacting them directly. We also provide a confirmation step before unsubscribing to prevent accidental removals."
    },
    {
      question: "Is there a limit to how many emails I can unsubscribe from?",
      answer: "Our plans offer unlimited unsubscriptions, so you can clean your inbox completely."
    }
  ];
 
  const FAQSection = () => {
    return (
      <section id="faq" className="py-20 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg max-w-2xl mx-auto">
              Get answers to common questions about MailEscape.
            </p>
          </div>

          {faqs.map((faq, index) => (
          <div key={index} className="collapse collapse-arrow border">
            <input type="radio" name="my-accordion-2" />
            <div className="collapse-title font-semibold">{faq.question}</div>
            <div className="collapse-content text-sm">{faq.answer}</div>
          </div>
          ))}
        </div>
      </section>
    );
  };
 
  export default FAQSection;
