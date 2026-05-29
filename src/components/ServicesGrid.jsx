'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Icons — inline SVG, 20x20, stroke #5B1FE6, stroke-width 1.5      */
/* ------------------------------------------------------------------ */

const icons = {
  finance: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="8" />
      <line x1="10" y1="4" x2="10" y2="16" />
    </svg>
  ),
  reporting: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="3.5" height="6" rx="0.5" />
      <rect x="8.25" y="7" width="3.5" height="10" rx="0.5" />
      <rect x="13.5" y="3" width="3.5" height="14" rx="0.5" />
    </svg>
  ),
  leadgen: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h14l-3.5 6 3.5 6H3l3.5-6L3 3z" />
    </svg>
  ),
  marketing: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3L6 7H3v6h3l10 4V3z" />
      <line x1="6" y1="7" x2="6" y2="13" />
    </svg>
  ),
  ai: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2v4M10 14v4M4.93 4.93l2.83 2.83M12.24 12.24l2.83 2.83M2 10h4M14 10h4M4.93 15.07l2.83-2.83M12.24 7.76l2.83-2.83" />
      <circle cx="10" cy="10" r="2" />
    </svg>
  ),
  frontend: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="13" rx="2" />
      <line x1="2" y1="7" x2="18" y2="7" />
      <path d="M11 11l2 1.5L11 14" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const gridVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ServicesGrid({ cards }) {
  const gridRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="relative py-24 px-6 bg-brand-bg">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="mb-14">
          <h2 className="font-inter font-bold text-brand-text" style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', lineHeight: 1.1, margin: 0 }}>
            What We Do
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '1rem', color: '#6B6B6B', marginTop: 12 }}>AI systems built by people who've actually run project-based businesses. We know what breaks, why it breaks, and exactly how to fix it.</p>
        </div>

        {/* Card grid */}
        <motion.div
          ref={gridRef}
          variants={gridVariants}
          initial="hidden"
          animate={visible ? 'visible' : 'hidden'}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
          className="services-grid"
        >
          {cards.map((card) => (
            <motion.div
              key={card.title}
              variants={cardVariants}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: '0 16px 40px rgba(91,31,230,0.12)',
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
              }}
              className="service-card"
              style={{
                background: '#FFFFFF',
                border: '1px solid #E0DDD8',
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'border-color 150ms ease',
              }}
            >
              <div>
                {/* Icon */}
                <div
                  className="service-card-icon"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'rgba(91,31,230,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    transition: 'background 150ms ease',
                  }}
                >
                  {icons[card.icon]}
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: '#0A0A0A',
                    marginBottom: 12,
                    marginTop: 0,
                    lineHeight: 1.3,
                  }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    color: '#6B6B6B',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {card.description}
                </p>
              </div>

              {/* Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      fontSize: '0.75rem',
                      color: '#5B1FE6',
                      background: 'rgba(91,31,230,0.04)',
                      border: '1px solid rgba(91,31,230,0.25)',
                      borderRadius: 999,
                      padding: '4px 12px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '1rem', color: '#6B6B6B', marginBottom: 24, marginTop: 0 }}>
            Not sure where to start? We will figure it out together.
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window !== 'undefined' && window.Calendly) {
                window.Calendly.initPopupWidget({ url: 'https://calendly.com/retiply/30min', color: '#5B1FE6', textColor: '#ffffff' });
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: '#5B1FE6',
              color: '#ffffff',
              borderRadius: 999,
              padding: '14px 14px 14px 28px',
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Let's Talk
            <span style={{
              width: 40,
              height: 40,
              background: '#ffffff',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M8.5 4 12 8l-3.5 4" stroke="#5B1FE6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>
        </div>

      </div>

      {/* Section transition gradient */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #E8E4DF)' }}
      />
    </section>
  );
}
