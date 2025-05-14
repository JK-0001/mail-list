
const Footer = () => {
    return (
      <footer className="text-white my-12 m-auto py-10 px-6 md:px-12">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-xl mb-4">MailEscape</h3>
              <p className="text-white/70 mb-4">
                Take back control of your inbox.<br />
                Copyright © {new Date().getFullYear()}. All rights reserved.
              </p>
            </div>
           
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#features" className="hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-purple-400 transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-purple-400 transition-colors">Pricing</a></li>
                <li><a href="#testimonial" className="hover:text-purple-400 transition-colors">Testimonials</a></li>
              </ul>
            </div>
           
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-white/70">
                <li><a href="#faq" className="hover:text-purple-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  };
 
  export default Footer;
