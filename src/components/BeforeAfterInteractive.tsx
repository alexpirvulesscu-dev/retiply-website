'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Scenario {
  label: string;
  before: string;
  after: string;
  beforeMetric: string;
  afterMetric: string;
}

const scenarios: Scenario[] = [
  {
    label: 'Invoices',
    before:
      'Someone on your team manually enters every invoice into a spreadsheet. It takes 3 hours a week. Mistakes get missed. Cash flow is always a guess.',
    after:
      'Every invoice is captured, categorised, and logged automatically the moment it arrives. Your books are always current. No one touches it.',
    beforeMetric: '3 hrs/week lost',
    afterMetric: '0 mins manual work',
  },
  {
    label: 'Follow-ups',
    before:
      'Leads go cold because no one has time to chase them. Your team follows up when they remember. Half the pipeline is stale.',
    after:
      'Every enquiry gets an instant response. Follow-ups go out automatically at the right time. No lead is ever forgotten.',
    beforeMetric: '40% of leads go cold',
    afterMetric: '100% followed up',
  },
  {
    label: 'Reporting',
    before:
      'A report takes half a day to pull together. By the time it is ready, the numbers are already out of date. Decisions get made on gut feel.',
    after:
      'Live dashboard. Numbers update in real time. Your team makes decisions on facts, not guesses, without lifting a finger.',
    beforeMetric: '4 hrs to build one report',
    afterMetric: 'Live, always current',
  },
  {
    label: 'Onboarding',
    before:
      'Every new hire gets a different experience. Documents get emailed manually. Training is inconsistent. Someone always falls through the cracks.',
    after:
      'The moment a contract is signed, everything triggers automatically. Documents sent, systems set up, schedule assigned. Every hire gets the same perfect start.',
    beforeMetric: '2 days of manual admin',
    afterMetric: 'Fully automated in minutes',
  },
  {
    label: 'Job Tracking',
    before:
      'Updates live in someone\'s head or a WhatsApp group. Clients chase you for progress. Your team spends time on calls explaining where things are.',
    after:
      'Every job, every milestone, every person — visible in one place, updated automatically. Clients get updates without anyone sending them.',
    beforeMetric: 'Constant chasing',
    afterMetric: 'Zero status calls',
  },
];

const contentVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15, ease: 'easeIn' } },
};

export default function BeforeAfterInteractive() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for scroll-in fade
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const current = scenarios[active];

  return (
    <div
      ref={sectionRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {/* Label */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6B6B6B',
          margin: 0,
          textAlign: 'center',
        }}
      >
        See the difference
      </p>

      {/* Heading */}
      <h2
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          color: '#0A0A0A',
          margin: '16px 0 0',
          textAlign: 'center',
          lineHeight: 1.15,
        }}
      >
        Your business. Before and after.
      </h2>

      {/* Tab row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginTop: '40px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingBottom: '4px',
        }}
      >
        {scenarios.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            style={{
              position: 'relative',
              padding: '8px 20px',
              borderRadius: '9999px',
              border: i === active ? 'none' : '1px solid #D0CCC6',
              background: 'transparent',
              color: i === active ? '#ffffff' : '#6B6B6B',
              fontFamily: i === active ? "'DM Sans', sans-serif" : "'Inter', sans-serif",
              fontWeight: i === active ? 600 : 400,
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              zIndex: 1,
              transition: 'color 0.2s ease',
            }}
          >
            {/* Animated pill background */}
            {i === active && (
              <motion.span
                layoutId="activeTab"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  background: '#5B1FE6',
                  zIndex: -1,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {s.label}
          </button>
        ))}
      </div>

      {/* Content panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1px 1fr',
            marginTop: '40px',
          }}
          className="ba-panel"
        >
          {/* Before column */}
          <div
            style={{
              padding: '32px',
              background: 'rgba(185, 28, 28, 0.03)',
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#B91C1C',
                margin: '0 0 16px',
              }}
            >
              Before
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: 1.7,
                color: '#1C1C1E',
                margin: 0,
                maxWidth: '38ch',
              }}
            >
              {current.before}
            </p>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#B91C1C',
                marginTop: '24px',
                marginBottom: 0,
              }}
            >
              {current.beforeMetric}
            </p>
          </div>

          {/* Vertical divider */}
          <div style={{ background: '#D0CCC6' }} className="ba-divider" />

          {/* After column */}
          <motion.div
            style={{
              padding: '32px',
              background: 'rgba(91, 31, 230, 0.03)',
            }}
            whileHover="hover"
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#5B1FE6',
                margin: '0 0 16px',
              }}
            >
              After
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '1rem',
                lineHeight: 1.7,
                color: '#1C1C1E',
                margin: 0,
                maxWidth: '38ch',
              }}
            >
              {current.after}
            </p>
            <motion.p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: '1.5rem',
                color: '#5B1FE6',
                marginTop: '24px',
                marginBottom: 0,
              }}
              variants={{
                hover: {
                  scale: [1, 1.04, 1],
                  transition: { duration: 0.4, ease: 'easeInOut' },
                },
              }}
              className="ba-after-metric"
            >
              {current.afterMetric}
            </motion.p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
