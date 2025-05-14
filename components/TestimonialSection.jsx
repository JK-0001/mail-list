const testimonials = [
    {
        name: "Ritika Jain",
        profession: "UX Designer",
        thoughts: "My inbox was a mess. MailEscape helped me unsubscribe from over 200 useless emails in minutes. It’s like I got my sanity back.",
        ratings: "4"
    },
    // {
    //     name: "Anirudh M.",
    //     profession: "Software Engineer",
    //     thoughts: "I love how clean and intuitive it is. One login, sync Gmail, boom — the clutter's gone. A must-have for anyone drowning in promo emails.",
    //     ratings: "4.5"
    // },
    // {
    //     name: "Pooja Sinha",
    //     profession: "Yoga Coach",
    //     thoughts: "I didn’t realize how much mental energy those unread newsletters were taking. MailEscape gave me a clean slate. Instant inbox peace.",
    //     ratings: "5"
    // },
    // {
    //     name: "Sanya D.",
    //     profession: "Content Creater",
    //     thoughts: "Why did I never unsubscribe before? This feels like inbox self-care. Super fast, no BS.",
    //     ratings: "3.5"
    // },
    // {
    //     name: "Kunal Verma",
    //     profession: "Project Manager",
    //     thoughts: "I used to spend 15+ minutes a week just deleting garbage. Now I don’t have to. Clean interface, works flawlessly.",
    //     ratings: "5"
    // },
  ];
 
  const TestimonialSection = () => {
    return (
      <section id="testimonial" className="py-20 px-6 md:px-12">
        {testimonials.map((testimonial, index) => (
        <div key={index} className="max-w-4xl mx-auto text-neutral-content w-126">
          <div className="card-body items-center text-center">
            <div className="rating py-4">
              <input type="radio" name="rating-4" className="mask mask-star-2 bg-[#eab308]" aria-label="1 star" />
              <input type="radio" name="rating-4" className="mask mask-star-2 bg-[#eab308]" aria-label="2 star" />
              <input type="radio" name="rating-4" className="mask mask-star-2 bg-[#eab308]" aria-label="3 star" />
              <input type="radio" name="rating-4" className="mask mask-star-2 bg-[#eab308]" aria-label="4 star" />
              <input type="radio" name="rating-4" className="mask mask-star-2 bg-[#eab308]" aria-label="5 star" defaultChecked />
            </div>
            <p className="leading-7">{testimonial.thoughts}<br />— {testimonial.name}, {testimonial.profession}</p>
          </div>
        </div>
        ))}
      </section>
    );
  };
 
  export default TestimonialSection;
