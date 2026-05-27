import React, { useState, useEffect, memo } from "react";
import {
  PhoneLeft, PhoneCenter, PhoneRight,
  IllustrationOne, IllustrationTwo, IllustrationThree,
  AirtaskerLogo, AirtableLogo, PostmanLogo, GitHubLogo,
  CheckIcon, CheckCircleIcon, ChevronDoubleRight, ChevronDown, ArrowRight,
  TwitterIcon, LinkedInIcon, FacebookIcon, InstagramIcon,
} from "./svgicons";

const faqs = [
  {
    id: "faq-0",
    q: "Why switch to a digital menu? It's contactless, editable, and always up-to-date",
    a: "Our digital menu is contactless, always accessible, and easy to update, unlike paper menus that need to be reprinted and can't be edited quickly.",
  },
  {
    id: "faq-1",
    q: "How do I create a QR code for my menu?",
    a: "Simply sign up, add your menu items, and we generate a unique QR code for your restaurant instantly.",
  },
  {
    id: "faq-2",
    q: "How is it different from a PDF menu?",
    a: "Unlike a PDF, our digital menu is interactive, real-time updated, and lets customers filter by preference.",
  },
  {
    id: "faq-3",
    q: "Can I add images to my menu?",
    a: "Yes! Upload high-quality images for every item to make your dishes more appealing.",
  },
  {
    id: "faq-4",
    q: "Can I edit the menu myself?",
    a: "Absolutely. You have full control to add, remove, or update items anytime from your dashboard.",
  },
  {
    id: "faq-5",
    q: "Is it compatible with all devices?",
    a: "Yes — any smartphone, tablet, or desktop. No app download required.",
  },
  {
    id: "faq-6",
    q: "Is there a free trial?",
    a: "Yes, 14-day free trial with full access. No credit card required.",
  },
  {
    id: "faq-7",
    q: "Do I need special hardware?",
    a: "No special hardware needed. Just print your QR code and place it on your tables.",
  },
];

const pricingFeatures = [
  "Unlimited menu Updates",
  "Sync across Devices",
  "3 Team Members",
  "1GB Storage",
];

// Stable plan data with unique IDs — avoids index-as-key anti-pattern
const plans = [
  { id: "plan-annual",    badge: "Annually",  price: "0.00", period: "Annually",       highlighted: false },
  { id: "plan-biannual",  badge: "6 months",  price: "0.00", period: "every 6 months", highlighted: true  },
  { id: "plan-annual-2",  badge: "Annually",  price: "0.00", period: "Annually",       highlighted: false },
];

// ── Memoized Navbar ────────────────────────────────────────────────────────────
// Extracted so only this subtree re-renders when `scrolled` toggles — the rest
// of the page stays frozen.
const Navbar = memo(function Navbar({ scrolled, onSignIn, onGetStarted }) {
  return (
    <nav
      aria-label="Main navigation"
      className={`hp__nav${scrolled ? " hp__nav--scrolled" : ""}`}
    >
      {/* Logo is a link — conventionally navigates to the page root */}
      <a href="/" className="hp__logo">MenuQRScanner</a>
      <div className="hp__nav-actions">
        <button className="hp__signin" onClick={onSignIn}>Sign In</button>
        <button className="hp__getstarted" onClick={onGetStarted}>Get started</button>
      </div>
    </nav>
  );
});

// ── Memoized phone mockups ─────────────────────────────────────────────────────
// Decorative UI — never changes, and is the heaviest inline-style subtree.
// aria-hidden removes it entirely from the accessibility tree.
const PhoneMockups = memo(function PhoneMockups() {
  return (
    <div className="hp__phones" aria-hidden="true">
      <div className="hp__phone hp__phone--left">
        <div className="hp__phone-screen"><PhoneLeft /></div>
      </div>
      <div className="hp__phone hp__phone--center">
        <div className="hp__phone-screen"><PhoneCenter /></div>
      </div>
      <div className="hp__phone hp__phone--right">
        <div className="hp__phone-screen"><PhoneRight /></div>
      </div>
    </div>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomePage({ onSignIn, onGetStarted }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll helper used by "Explore features" and "View examples"
  const scrollToFeatures = () =>
    document.querySelector(".hp__features")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="hp">
      {/* ── Skip-to-content link (visible on focus for keyboard users) ── */}
      <a href="#main-content" className="hp__skip-link">
        Skip to main content
      </a>

      {/* ── Header / Navbar ────────────────────────────────────────────────
           Kept outside <main> so it's correctly identified as a banner
           landmark. Only Navbar re-renders on scroll; <main> stays stable. */}
      <header>
        <Navbar scrolled={scrolled} onSignIn={onSignIn} onGetStarted={onGetStarted} />
      </header>

      {/* ── Primary content ──────────────────────────────────────────────── */}
      <main id="main-content">

        {/* ── Hero ── */}
        <div className="hp__homepage">
          <section className="hp__hero" aria-label="Hero">
            <div className="hp__hero-badges">
              <span className="hp__hero-badge-text">What's new?</span>
              {/* Changed <span> → <button>: looks interactive, must be interactive */}
              <button
                className="hp__hero-badge-pill"
                onClick={scrollToFeatures}
              >
                Explore features <ArrowRight />
              </button>
            </div>

            <h1 className="hp__hero-heading">
              Embrace the future of dining with seamless QR-code menus
            </h1>

            <p className="hp__hero-sub">
              Dive into a world where convenience meets innovation, simplifying
              restaurant operations and elevating customer experiences to new
              heights.
            </p>

            <div className="hp__hero-ctas">
              <button className="hp__cta-primary" onClick={onGetStarted}>
                Create QR free <ArrowRight />
              </button>
              {/* "View examples" now scrolls to Features instead of doing nothing */}
              <button className="hp__cta-ghost" onClick={scrollToFeatures}>
                View examples
              </button>
            </div>

            <PhoneMockups />
          </section>
        </div>

        {/* ── Stats ── */}
        <section className="hp__stats" aria-labelledby="stats-heading">
          <div className="hp__stats-left">
            <h2 id="stats-heading" className="hp__stats-heading">
              We empower restaurants to embrace innovation and redefine the dining
              experience. Our mission is to provide a seamless, intuitive, and
              digital platform.
            </h2>
          </div>
          <div className="hp__stats-grid">
            {[
              { num: "10M+", label: "Menus digitized" },
              { num: "50+",  label: "Countries supported" },
              { num: "5K+",  label: "Restaurants active" },
              { num: "20M+", label: "Orders placed" },
            ].map((s) => (
              <div className="hp__stat-card" key={s.num}>
                <p className="hp__stat-card-number">{s.num}</p>
                <p className="hp__stat-card-label">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Brand logos (marquee) ──────────────────────────────────────────
             Reduced from 4 → 2 copies (animation updated to translateX(-50%)).
             Only the first copy is accessible; the duplicate is aria-hidden. */}
        <div className="hp__brands-wrap" aria-label="Partner brands">
          <div className="hp__brands-track">
            {[false, true].map((isHidden, i) => (
              <div
                className="hp__brands"
                key={i}
                aria-hidden={isHidden || undefined}
              >
                <a href="#" className="hp__brand"><AirtaskerLogo /> QuickZaika</a>
                <a href="#" className="hp__brand"><AirtableLogo /> QuickZaika</a>
                <a href="#" className="hp__brand"><PostmanLogo /> QuickZaika</a>
                <a href="#" className="hp__brand"><GitHubLogo /> QuickZaika</a>
              </div>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section className="hp__features" aria-labelledby="features-heading">
          <div className="hp__features-header">
            <div className="hp__section-badge hp__section-badge--dark">
              Features
            </div>
            <h2
              id="features-heading"
              className="hp__section-heading hp__section-heading--center hp__section-heading--white"
            >
              Transforming Dining with Digital QR Code Menu Advantages
            </h2>
            <p
              className="hp__section-sub hp__section-sub--center hp__section-sub--light"
              style={{ maxWidth: 480, margin: "0 auto" }}
            >
              Discover smarter, faster, and more interactive menu solutions to
              elevate customer satisfaction and simplify operations.
            </p>
          </div>

          <div className="hp__features-grid">
            {[
              {
                id: "feature-experience",
                title: "Enhancing Customer Experience",
                desc: "Working with digital menu is easier. Loading of the menu is faster. There is more useful information.",
                Illustration: IllustrationOne,
              },
              {
                id: "feature-attract",
                title: "Attracting new customers",
                desc: "Guests are able to leave food reviews directly from the QR code menu. Contactless menu — language switch, many guests are foreigners.",
                Illustration: IllustrationTwo,
              },
              {
                id: "feature-sales",
                title: "QR code menu increases sales",
                desc: "Digital QR code menu with more Photos increases the appetite, the appetite increases the average check.",
                Illustration: IllustrationThree,
              },
            ].map((f) => (
              <div className="hp__feature-card" key={f.id}>
                {/* aria-hidden: illustration is decorative; the card heading describes it */}
                <div className="hp__feature-card-img" aria-hidden="true">
                  <f.Illustration />
                </div>
                <div className="hp__feature-card-body">
                  <h3 className="hp__feature-card-title">{f.title}</h3>
                  <p className="hp__feature-card-desc">{f.desc}</p>
                  {/* Changed <a> with no href → <button> (non-link interactive element) */}
                  <button className="hp__feature-card-link">
                    Read more <ArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="hp__pricing" aria-labelledby="pricing-heading">
          <div className="hp__pricing-header">
            <div className="hp__section-badge hp__section-badge--orange">
              Pricing
            </div>
            <h2
              id="pricing-heading"
              className="hp__section-heading hp__section-heading--center hp__section-heading--dark"
            >
              Flexible Pricing Plans for QR Code Menu Services
            </h2>
            <p
              className="hp__section-sub hp__section-sub--center hp__section-sub--muted"
              style={{ maxWidth: 460, margin: "8px auto 0" }}
            >
              Choose a plan that fits your needs and budget. Enjoy great features
              with no hidden fees, designed to grow with your business.
            </p>
          </div>

          <div className="hp__pricing-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`hp__price-card${plan.highlighted ? " hp__price-card--highlighted" : ""}`}
              >
                <span
                  className={`hp__price-card-badge${plan.highlighted ? " hp__price-card-badge--orange" : ""}`}
                >
                  {plan.badge}
                </span>
                <p className="hp__price-card-price">{plan.price}</p>
                <p className="hp__price-card-period">{plan.period}</p>
                <ul className="hp__price-card-features">
                  {pricingFeatures.map((feat) => (
                    <li key={feat} className="hp__price-card-feature">
                      {/* aria-hidden: checkmark is decorative; text conveys the feature */}
                      <span className="hp__price-card-feature-check" aria-hidden="true">
                        <CheckIcon />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  className={`hp__price-card-btn${plan.highlighted ? " hp__price-card-btn--orange" : ""}`}
                  onClick={onGetStarted}
                >
                  Enjoy all menu
                  {/* sr-only text disambiguates identical button labels for screen readers */}
                  <span className="sr-only"> — {plan.period} plan</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="hp__faq" aria-labelledby="faq-heading">
          <div className="hp__faq-inner">

            {/* Left column */}
            <div className="hp__faq-left">
              <span className="hp__faq-badge">FAQ'S</span>
              <h2 id="faq-heading" className="hp__faq-heading">
                Key Information About Switching to a Digital QR Code Menu
              </h2>
              <p className="hp__faq-desc">
                Find out how our easy-to-use digital QR code menus can improve
                your restaurant's efficiency, enhance customer experience, and
                simplify updates.
              </p>
              <hr className="hp__faq-hr" />
              <div className="hp__faq-checks">
                <span className="hp__faq-check">
                  <CheckCircleIcon /> Top quality service
                </span>
                <span className="hp__faq-check">
                  <CheckCircleIcon /> Seamless digital experience
                </span>
              </div>
            </div>

            {/* Right column – accordion ────────────────────────────────────────
                 Each item is a single <button> (not div + nested button).
                 aria-expanded / aria-controls wire the button to its panel. */}
            <div className="hp__faq-right">
              {faqs.map((faq, i) => (
                <div key={faq.id} className="hp__faq-item">
                  <button
                    id={`faq-btn-${i}`}
                    aria-expanded={openFaq === i}
                    aria-controls={`faq-ans-${i}`}
                    className={`hp__faq-question${openFaq === i ? " hp__faq-question--active" : ""}`}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    <span>{faq.q}</span>
                    {/* aria-hidden: icon is decorative; state is conveyed by aria-expanded */}
                    <span aria-hidden="true" className="hp__faq-toggle">
                      {openFaq === i ? <ChevronDown /> : <ChevronDoubleRight />}
                    </span>
                  </button>
                  {openFaq === i && faq.a && (
                    <div
                      id={`faq-ans-${i}`}
                      role="region"
                      aria-labelledby={`faq-btn-${i}`}
                      className="hp__faq-answer"
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>{/* /main */}

      {/* ── Footer ── */}
      <footer className="hp__footer">
        <div className="hp__footer-main">
          <div className="hp__footer-brand">
            <span className="hp__footer-brand-logo">MenuQRScanner</span>
            <p className="hp__footer-brand-tagline">
              Simplifying restaurant operations with seamless digital QR code
              menus.
            </p>
          </div>

          <div className="hp__footer-subscribe">
            <p id="subscribe-label" className="hp__footer-subscribe-label">
              Stay updated
            </p>
            <div className="hp__footer-subscribe-input">
              {/* Explicit <label> + id pair satisfies WCAG 1.3.1 */}
              <label htmlFor="footer-email" className="sr-only">
                Email address
              </label>
              <input
                id="footer-email"
                type="email"
                placeholder="Enter your email address..."
                aria-labelledby="subscribe-label"
              />
              <button type="button" aria-label="Subscribe to newsletter">
                Subscribe
              </button>
            </div>
            <p className="hp__footer-subscribe-hint">
              No spam. Unsubscribe anytime.
            </p>
          </div>

          <div className="hp__footer-social-col">
            <p className="hp__footer-social-label">Follow us</p>
            <div className="hp__footer-social">
              <a href="#" aria-label="Twitter"><TwitterIcon /></a>
              <a href="#" aria-label="LinkedIn"><LinkedInIcon /></a>
              <a href="#" aria-label="Facebook"><FacebookIcon /></a>
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            </div>
          </div>
        </div>

        <div className="hp__footer-bottom">
          <p>© OddMenu. All rights reserved.</p>
          {/* aria-label distinguishes this nav from the main navigation */}
          <nav aria-label="Footer navigation">
            {["Home", "Services", "Blog", "Help Center", "Contact"].map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
