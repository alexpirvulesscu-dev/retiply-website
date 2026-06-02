'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const problems = [
  {
    bold: 'Leads go cold before anyone follows up',
    rest: 'and you lose the sale.',
    stat: '50%',
    qualifier: 'of sales go to first responder',
  },
  {
    bold: 'Your team spends hours processing invoices by hand.',
    rest: "You still don't know if the business is profitable.",
    stat: '82%',
    qualifier: 'of SMEs fail from cash flow',
  },
  {
    bold: 'You price jobs and hire people',
    rest: 'without knowing your real costs.',
    stat: '15\u201330%',
    qualifier: 'underestimated job costs',
  },
  {
    bold: 'Clients chase you for updates',
    rest: "and it's costing your reputation.",
    stat: '68%',
    qualifier: 'of clients leave feeling ignored',
  },
  {
    bold: 'New hires take months',
    rest: 'to become useful.',
    stat: '8 mo',
    qualifier: 'until new hires are productive',
  },
  {
    bold: "The business can't scale",
    rest: 'because everything still runs through you.',
    stat: '2x',
    qualifier: "slower growth when you're the bottleneck",
  },
];

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 },
  },
};

const cellVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProblemRowsInteractive() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        background: '#E8E4DF',
        padding: '80px 24px',
        boxSizing: 'border-box',
      }}
      className="pr-section"
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h2
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(1.75rem, 4vw, 3rem)',
              color: '#0A0A0A',
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            Your business is busy.
            <br />
            But busy isn't the same as growing.
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              fontSize: '1rem',
              color: '#6B6B6B',
              margin: '12px 0 0',
            }}
          >
            Recognise any of these?
          </p>
        </div>

        {/* Problem grid — fills remaining space */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={visible ? 'visible' : 'hidden'}
          className="pr-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: 48,
            rowGap: 0,
          }}
        >
          {problems.map((p, i) => (
            <motion.div
              key={i}
              variants={cellVariants}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                padding: '24px 0',
                borderTop: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              {/* Problem text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 15,
                    lineHeight: 1.4,
                    margin: 0,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{p.bold}</span>
                  {' '}
                  <span style={{ fontWeight: 400, color: '#6B6B6B' }}>{p.rest}</span>
                </p>
              </div>

              {/* Stat block */}
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.875rem',
                    color: '#5B1FE6',
                    lineHeight: 1,
                    display: 'block',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.stat}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 300,
                    fontSize: '0.75rem',
                    color: '#6B6B6B',
                    lineHeight: 1.3,
                    display: 'block',
                    marginTop: 4,
                  }}
                >
                  {p.qualifier}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing line */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 6 * 0.07 + 0.15 }}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
            color: '#0A0A0A',
            margin: '32px 0 0',
            lineHeight: 1.3,
          }}
        >
          Every one of these is fixable.{' '}
          <span style={{ color: '#5B1FE6' }}>Most take under 10 days.</span>
        </motion.p>

      </div>
    </div>
  );
}
