import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

const FAQ = () => {
  const faqCategories = [
    {
      title: "Purity & Certification",
      questions: [
        {
          q: "Are all your gold jewellery items hallmarked?",
          a: "Yes, absolutely! Every single gold article at Shrii Navrang Jewellers carries the official 3-stamp BIS Hallmark, including: (1) BIS Logo, (2) Purity Mark (e.g., 916 for 22K, 750 for 18K), and (3) a unique 6-digit HUID (Hallmarked Unique ID). You can verify your ornaments using the official Bureau of Indian Standards BIS CARE App."
        },
        {
          q: "How are your diamonds certified?",
          a: "All our diamond creations are accompanied by individual certificates of authenticity and grading issued by world-renowned, independent gemological laboratories such as IGI (International Gemological Institute) or GIA (Gemological Institute of America). The certificates outline the precise Carat weight, Color grade, Clarity, and Cut quality."
        },
        {
          q: "What is your policy on gold buybacks and exchanges?",
          a: "We offer a Lifetime Exchange & Buyback guarantee on all Shrii Navrang Jewellers pieces. If you wish to exchange, we will credit 100% of the current market gold value based on the exact gold weight of the item. For buybacks, a nominal deduction of 3% to 5% is made. Making charges and taxes are not eligible for buyback or exchange value."
        }
      ]
    },
    {
      title: "Shipping & Deliveries",
      questions: [
        {
          q: "Is it safe to buy premium jewellery online? How do you ship?",
          a: "Online jewellery shopping with us is 100% safe. Every shipment is fully insured against theft, damage, or loss in transit. The package is sealed in high-security, tamper-proof bubble envelopes and dispatched through specialized premium cargo partners like Blue Dart Security or Sequel Logistics. The courier will deliver only after verifying a secure OTP sent to your registered phone."
        },
        {
          q: "Do you offer international shipping?",
          a: "Yes, we ship to over 50 countries, including the USA, UK, UAE, Canada, and Australia. International shipments are subject to custom duties and local import taxes of the destination country, which are the buyer's responsibility. Shipping rates are calculated dynamically at checkout."
        },
        {
          q: "How long does shipping take?",
          a: "In-stock items are shipped within 24-48 business hours and typically arrive within 3-5 business days for domestic orders. Custom modifications, hand-engravings, or custom ring sizing add an additional 5-7 working days. You can track your shipment step-by-step using our Order Tracking page."
        }
      ]
    },
    {
      title: "Making Charges & Customization",
      questions: [
        {
          q: "What are 'Making Charges' on gold jewellery?",
          a: "Making charges are the costs associated with melting, refining, design sculpting, and assembling raw gold into a gorgeous piece of jewellery. At Shrii Navrang, we pride ourselves on honest pricing. Our making charges start as low as 8% for basic designs, and go up to 18% for extremely detailed antique temple carvings or bridal sets, which is significantly lower than typical high-street brands."
        },
        {
          q: "Can I customize a design I see on the website?",
          a: "Yes, we offer complete customization services. You can customize the gold purity (14K, 18K, 22K), diamond color/clarity (e.g., GH-VVS, EF-VVS), ring sizes, or chain lengths. Please contact our concierge via general support or write to us on WhatsApp to discuss your bespoke requests."
        }
      ]
    }
  ];

  const [openIndex, setOpenIndex] = useState('0-0'); // CategoryIndex-QuestionIndex

  const toggleAccordion = (catIdx, qIdx) => {
    const targetKey = `${catIdx}-${qIdx}`;
    setOpenIndex(openIndex === targetKey ? null : targetKey);
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', backgroundColor: 'var(--white)', color: 'var(--charcoal)', overflowX: 'hidden' }}>
      
      {/* 1. Header */}
      <div style={{
        backgroundImage: `linear-gradient(to bottom, rgba(17, 17, 17, 0.85), rgba(17, 17, 17, 0.95)), url("https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 20px',
        textAlign: 'center',
        borderBottom: '2px solid var(--gold)'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-title)', color: '#ffffff', fontSize: '3.5rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Frequently Asked Questions
          </h1>
          <p style={{ color: 'var(--gold)', fontFamily: 'var(--font-title)', fontStyle: 'italic', fontSize: '1.4rem', letterSpacing: '1px', maxWidth: '700px', margin: '0 auto' }}>
            "Everything you need to know about purchasing, gold purity, and shipping."
          </p>
        </div>
      </div>

      {/* 2. FAQ accordions */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          
          {faqCategories.map((category, catIdx) => (
            <div key={catIdx} style={{ marginBottom: '50px' }}>
              <h3 style={{
                fontFamily: 'var(--font-title)',
                fontSize: '1.6rem',
                color: 'var(--gold-dark)',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
                paddingBottom: '12px',
                marginBottom: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {category.title}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {category.questions.map((item, qIdx) => {
                  const itemKey = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === itemKey;
                  
                  return (
                    <div 
                      key={qIdx}
                      style={{
                        border: '1px solid rgba(212,175,55,0.15)',
                        borderRadius: '6px',
                        backgroundColor: isOpen ? 'var(--alabaster)' : 'var(--white)',
                        overflow: 'hidden',
                        transition: 'var(--transition)'
                      }}
                    >
                      <button
                        onClick={() => toggleAccordion(catIdx, qIdx)}
                        style={{
                          width: '100%',
                          padding: '20px 24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-body)',
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          color: 'var(--black)'
                        }}
                      >
                        <span style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <HelpCircle size={18} color="var(--gold)" style={{ flexShrink: 0 }} />
                          {item.q}
                        </span>
                        {isOpen ? <ChevronUp size={18} color="var(--gold)" /> : <ChevronDown size={18} color="var(--gold)" />}
                      </button>
                      
                      {isOpen && (
                        <div style={{
                          padding: '0 24px 24px 52px',
                          fontSize: '0.95rem',
                          lineHeight: '1.7',
                          color: 'var(--charcoal-light)',
                          fontWeight: 300
                        }}>
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Trust Banner */}
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', gap: '20px', alignItems: 'center', marginTop: '60px' }}>
            <ShieldCheck size={48} color="var(--gold)" style={{ flexShrink: 0 }} />
            <div>
              <h4 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', marginBottom: '8px', color: 'var(--black)' }}>
                Still have questions?
              </h4>
              <p style={{ fontSize: '0.9rem', fontWeight: 300, lineHeight: '1.5' }}>
                Our personal shopper support team is happy to assist you. Drop us a note at <strong>concierge@shriinavrang.com</strong> or call us directly at <strong>+91 11 4987 6543</strong>.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default FAQ;
