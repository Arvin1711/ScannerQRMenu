import React, { useState, useEffect, memo } from "react";
import {
  PhoneLeft,
  PhoneCenter,
  PhoneRight,
  IllustrationOne,
  IllustrationTwo,
  IllustrationThree,
  AirtaskerLogo,
  AirtableLogo,
  PostmanLogo,
  GitHubLogo,
  CheckIcon,
  CheckCircleIcon,
  ChevronDoubleRight,
  ChevronDown,
  ArrowRight,
  TwitterIcon,
  LinkedInIcon,
  FacebookIcon,
  InstagramIcon,
} from "./svgicons";

const faqs = [
  {
    id: "faq-0",
    q: "How quickly can I get my menu live?",
    a: "Most restaurants are up and running in under 10 minutes. Add your items, upload photos, and your unique QR code is ready to print and place on every table.",
  },
  {
    id: "faq-1",
    q: "Do my guests need to download an app?",
    a: "No app, no friction. Guests simply scan the QR code with their phone's camera and the menu opens instantly in their browser.",
  },
  {
    id: "faq-2",
    q: "Can I update the menu in real time?",
    a: "Absolutely. Edit prices, mark items as sold-out, or add today's specials from your dashboard — changes go live the moment you save.",
  },
  {
    id: "faq-3",
    q: "How is this better than a PDF or printed menu?",
    a: "Unlike a PDF, your digital menu is always current, fully searchable, and works across any device. No reprinting costs and no outdated information ever reaching a guest.",
  },
  {
    id: "faq-4",
    q: "Can I add photos and descriptions to each dish?",
    a: "Yes — upload high-quality images and rich descriptions for every item. Visual menus are proven to increase average order value.",
  },
  {
    id: "faq-5",
    q: "Does it support multiple languages?",
    a: "Yes. Your menu can be offered in multiple languages so every guest — local or tourist — enjoys a comfortable experience.",
  },
  {
    id: "faq-6",
    q: "Is there a free plan?",
    a: "Yes, our Starter plan is free forever with core features included. Upgrade anytime to unlock advanced tools as your restaurant grows.",
  },
  {
    id: "faq-7",
    q: "What if I need help setting things up?",
    a: "Our support team is available via live chat and email. We also offer onboarding guides and video walkthroughs so you can get started confidently.",
  },
];

const pricingFeatures = [
  "Unlimited menu items & updates",
  "Real-time sync across devices",
  "Up to 5 staff accounts",
  "2 GB media storage",
];

// Stable plan data with unique IDs — avoids index-as-key anti-pattern
const plans = [
  {
    id: "plan-starter",
    badge: "Starter",
    price: "0.00",
    period: "Free forever",
    highlighted: false,
  },
  {
    id: "plan-growth",
    badge: "Growth",
    price: "9.99",
    period: "per month",
    highlighted: true,
  },
  {
    id: "plan-pro",
    badge: "Pro",
    price: "24.99",
    period: "per month",
    highlighted: false,
  },
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
      {/* <a href="/" className="hp__logo">QR Menu</a> */}
      <div class="auth-brand">
        <div class="auth-brand__icon">🍽️</div>
        <h1 class="auth-brand__name">QR Menu</h1>
      </div>
      <div className="hp__nav-actions">
        <button className="hp__signin" onClick={onSignIn}>
          Sign In
        </button>
        <button className="hp__getstarted" onClick={onGetStarted}>
          Get started
        </button>
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
        <div className="hp__phone-screen">
          <PhoneLeft />
        </div>
      </div>
      <div className="hp__phone hp__phone--center">
        <div className="hp__phone-screen">
          <PhoneCenter />
        </div>
      </div>
      <div className="hp__phone hp__phone--right">
        <div className="hp__phone-screen">
          <PhoneRight />
        </div>
      </div>
    </div>
  );
});

// ── Main component ─────────────────────────────────────────────────────────────
export default function HomePage({ onSignIn, onGetStarted }) {
  const [openFaq, setOpenFaq] = useState(1);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll helper used by "Explore features" and "View examples"
  const scrollToFeatures = () =>
    document
      .querySelector(".hp__features")
      ?.scrollIntoView({ behavior: "smooth" });

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
        <Navbar
          scrolled={scrolled}
          onSignIn={onSignIn}
          onGetStarted={onGetStarted}
        />
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
                See new features <ArrowRight />
              </button>
            </div>

            <h1 className="hp__hero-heading">
              One QR Code. Endless dining possibilities.
            </h1>

            <p className="hp__hero-sub">
              Instantly serve your guests a smart, interactive menu — just scan
              the QR code, browse, and order. No app, no paper, no friction.
              Update your menu in real time, showcase stunning food photos, and
              let your dishes do the talking.
            </p>

            <div className="hp__hero-ctas">
              <button className="hp__cta-primary" onClick={onGetStarted}>
                Start for free <ArrowRight />
              </button>
              {/* "See it live" scrolls to Features instead of doing nothing */}
              <button className="hp__cta-ghost" onClick={scrollToFeatures}>
                See it live
              </button>
            </div>

            <PhoneMockups />
          </section>
        </div>

        {/* ── Stats ── */}
        <section className="hp__stats" aria-labelledby="stats-heading">
          <div className="hp__stats-left">
            <h2 id="stats-heading" className="hp__stats-heading">
              Thousands of restaurants have already made the switch — faster
              ordering, happier guests, and zero reprinting costs. Here's what
              that looks like in numbers.
            </h2>
          </div>
          <div className="hp__stats-grid">
            {[
              { num: "12K+", label: "Restaurants onboard" },
              { num: "50+", label: "Countries served" },
              { num: "98%", label: "Guest satisfaction" },
              { num: "3 min", label: "Avg. menu setup time" },
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
                <a href="#" className="hp__brand">
                  <AirtaskerLogo /> QuickZaika
                </a>
                <a href="#" className="hp__brand">
                  <AirtableLogo /> QuickZaika
                </a>
                <a href="#" className="hp__brand">
                  <PostmanLogo /> QuickZaika
                </a>
                <a href="#" className="hp__brand">
                  <GitHubLogo /> QuickZaika
                </a>
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
              Everything your restaurant needs — all in one QR code
            </h2>
            <p
              className="hp__section-sub hp__section-sub--center hp__section-sub--light"
              style={{ maxWidth: 480, margin: "0 auto" }}
            >
              From live menu updates to table booking, manage your entire dining
              experience from a single, intuitive dashboard.
            </p>
          </div>

          <div className="hp__features-grid">
            {[
              {
                id: "feature-experience",
                title: "Instant menu updates, zero hassle",
                desc: "Edit prices, add today's specials, or mark items sold-out in seconds. Changes go live instantly — no reprints, no stickers, no delays.",
                Illustration: IllustrationOne,
              },
              {
                id: "feature-attract",
                title: "Built for every guest, every table",
                desc: "Multilingual support and an accessibility-first design mean every diner — local or tourist — gets a smooth, frustration-free experience.",
                Illustration: IllustrationTwo,
              },
              {
                id: "feature-sales",
                title: "Grow your average order value",
                desc: "Beautiful food photography and smart upsell prompts naturally encourage guests to explore more dishes and spend more per visit.",
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
              Simple, honest pricing — grow at your own pace
            </h2>
            <p
              className="hp__section-sub hp__section-sub--center hp__section-sub--muted"
              style={{ maxWidth: 460, margin: "8px auto 0" }}
            >
              No setup fees, no hidden charges. Pick a plan and start serving
              smarter menus today.
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
                      <span
                        className="hp__price-card-feature-check"
                        aria-hidden="true"
                      >
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
                  Get started
                  {/* sr-only text disambiguates identical button labels for screen readers */}
                  <span className="sr-only"> — {plan.badge} plan</span>
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
                Your questions about going digital, answered
              </h2>
              <p className="hp__faq-desc">
                Everything you need to know about setting up, managing, and
                growing your restaurant with a digital QR code menu.
              </p>
              <hr className="hp__faq-hr" />
              <div className="hp__faq-checks">
                <span className="hp__faq-check">
                  <CheckCircleIcon /> Live in under 10 minutes
                </span>
                <span className="hp__faq-check">
                  <CheckCircleIcon /> No app download required
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
      </main>
      {/* /main */}

      {/* ── Footer ── */}
      <footer className="hp__footer">
        <div className="hp__footer-main">
          <div className="hp__footer-brand">
            <div class="auth-brand" style={{ marginBottom: 12 }}>
              <div class="auth-brand__icon">🍽️</div>
              <h1 class="auth-brand__name" style={{ color: "white" }}>
                QR Menu
              </h1>
            </div>
            {/* <span className="hp__footer-brand-logo">QR Menu</span> */}
            <p className="hp__footer-brand-tagline">
              Helping restaurants go digital — one scan at a time.
            </p>
          </div>

          <div className="hp__footer-subscribe">
            <p id="subscribe-label" className="hp__footer-subscribe-label">
              Get product updates
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
              No spam. Unsubscribe whenever you like.
            </p>
          </div>

          <div className="hp__footer-social-col">
            <p className="hp__footer-social-label">Follow us</p>
            <div className="hp__footer-social">
              <a href="#" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href="#" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="Instagram">
                <InstagramIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="hp__footer-bottom">
          <p>© 2026 MenuQRScanner. All rights reserved.</p>
          {/* aria-label distinguishes this nav from the main navigation */}
          <nav aria-label="Footer navigation">
            {["Home", "Services", "Blog", "Help Center", "Contact"].map((l) => (
              <a key={l} href="#">
                {l}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
