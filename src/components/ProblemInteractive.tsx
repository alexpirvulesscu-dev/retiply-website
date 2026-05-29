'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Item {
  statement: string;
  hours: number;
  revenue: number;
}

const items: Item[] = [
  {
    statement: 'My team manually copies data between systems \u2014 and I still don\u2019t have a clear picture of profitability.',
    hours: 5,
    revenue: 8,
  },
  {
    statement: 'We\u2019re losing sales because leads go cold before anyone follows up.',
    hours: 3,
    revenue: 12,
  },
  {
    statement: 'I make pricing and hiring decisions without knowing our real costs.',
    hours: 2,
    revenue: 7,
  },
  {
    statement: 'Clients chase us for updates \u2014 and it\u2019s damaging our reputation.',
    hours: 3,
    revenue: 6,
  },
  {
    statement: 'New people take too long to become productive after joining.',
    hours: 2,
    revenue: 4,
  },
  {
    statement: 'The business can\u2019t scale because everything still runs through me.',
    hours: 0,
    revenue: 10,
  },
];

/* Insight priority: box index (0-based) → message */
const insightPriority: { index: number; message: string }[] = [
  { index: 1, message: 'Slow follow-up is your biggest sales leak.' },
  { index: 2, message: 'You\u2019re pricing blind. Margin leaks quietly.' },
  { index: 3, message: 'Unhappy clients don\u2019t refer. Growth stalls.' },
  { index: 0, message: 'Manual work hides what\u2019s actually profitable.' },
  { index: 4, message: 'Slow starts mean weeks of lost productivity.' },
  { index: 5, message: 'You\u2019re the bottleneck. The business knows it.' },
];

function getInsight(checked: boolean[]): string {
  const allChecked = checked.every(Boolean);
  if (allChecked) return 'You\u2019re leaving serious growth on the table every month.';
  for (const rule of insightPriority) {
    if (checked[rule.index]) return rule.message;
  }
  return '';
}

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */

function useAnimatedCounter(target: number, duration = 600): number {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = target;
    prevRef.current = to;
    if (from === to) return;

    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

/* ------------------------------------------------------------------ */
/*  Checkbox SVG                                                       */
/* ------------------------------------------------------------------ */

const Checkbox = ({ checked, onToggle }: { checked: boolean; onToggle: () => void }) => (
  <button
    onClick={onToggle}
    aria-checked={checked}
    role="checkbox"
    style={{
      width: 18,
      height: 18,
      borderRadius: 4,
      border: checked ? 'none' : '1.5px solid #D0CCC6',
      background: checked ? '#5B1FE6' : '#ffffff',
      cursor: 'pointer',
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: 'background 0.15s ease, border 0.15s ease',
    }}
  >
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <motion.path
        d="M3 8l3.5 3.5L13 5"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{
          pathLength: checked ? 1 : 0,
          opacity: checked ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </svg>
  </button>
);

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ProblemInteractive() {
  const [checked, setChecked] = useState<boolean[]>([false, false, false, false, false, false]);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const totalRevenue = useMemo(
    () => items.reduce((sum, item, i) => (checked[i] ? sum + item.revenue : sum), 0),
    [checked],
  );

  const anyChecked = checked.some(Boolean);
  const insight = useMemo(() => getInsight(checked), [checked]);
  const animatedRevenue = useAnimatedCounter(totalRevenue);

  return (
    <div>
      {/* Label */}
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontWeight: 400,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: '#6B6B6B',
          margin: 0,
        }}
      >
        Sound familiar?
      </p>

      {/* Heading */}
      <h2
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(2rem, 4vw, 2.75rem)',
          color: '#0A0A0A',
          margin: '16px 0 0',
          lineHeight: 1.2,
          maxWidth: 640,
        }}
      >
        Your business is busy.
        <br />
        But busy is not the same as growing.
      </h2>

      {/* Two-column layout */}
      <div className="problem-grid" style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 32, marginTop: 40 }}>
        {/* Left: checkbox list */}
        <div>
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => toggle(i)}
              style={{
                minHeight: 56,
                borderBottom: '1px solid #E0DDD8',
                padding: '16px 0',
                display: 'grid',
                gridTemplateColumns: '18px 1fr',
                gap: 12,
                alignItems: 'start',
                cursor: 'pointer',
                background: checked[i] ? 'rgba(91,31,230,0.04)' : 'transparent',
                transition: 'background 0.15s ease',
              }}
            >
              <Checkbox checked={checked[i]} onToggle={() => toggle(i)} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: checked[i] ? 500 : 400,
                  fontSize: '1rem',
                  color: checked[i] ? '#0A0A0A' : '#1C1C1E',
                  lineHeight: 1.4,
                  transition: 'font-weight 0.15s ease, color 0.15s ease',
                }}
              >
                {item.statement}
              </span>
            </div>
          ))}
        </div>

        {/* Right: impact panel */}
        <div
          className="problem-panel"
          style={{
            position: 'sticky',
            top: 96,
            alignSelf: 'start',
            background: '#ffffff',
            border: '1px solid #E0DDD8',
            borderRadius: 12,
            padding: 32,
          }}
        >
          <AnimatePresence mode="wait">
            {!anyChecked ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 200,
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    color: '#6B6B6B',
                    textAlign: 'center',
                    margin: 0,
                  }}
                >
                  Tick the ones that sound like your business.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Revenue at risk */}
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6B6B6B',
                    margin: '0 0 8px',
                  }}
                >
                  Revenue being affected
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '4rem',
                      color: '#0A0A0A',
                      lineHeight: 1,
                    }}
                  >
                    {animatedRevenue}
                  </span>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: '2rem',
                      color: '#0A0A0A',
                      lineHeight: 1,
                    }}
                  >
                    %
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.875rem',
                    color: '#6B6B6B',
                    margin: '4px 0 0',
                  }}
                >
                  of your growth potential
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: '#E0DDD8', margin: '24px 0' }} />

                {/* Insight */}
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 400,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: '#6B6B6B',
                    margin: '0 0 8px',
                  }}
                >
                  What this means
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={insight}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      fontSize: '1rem',
                      color: '#1C1C1E',
                      maxWidth: 240,
                      margin: 0,
                      lineHeight: 1.4,
                    }}
                  >
                    {insight}
                  </motion.p>
                </AnimatePresence>

                {/* CTA link */}
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#contact, [id*="cta"]')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    display: 'inline-block',
                    marginTop: 24,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    color: '#5B1FE6',
                    textDecoration: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Let's talk &rarr;
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Closing line */}
      <p
        className="problem-closing"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: '1.5rem',
          color: '#0A0A0A',
          marginTop: 64,
          maxWidth: 720,
          lineHeight: 1.3,
        }}
      >
        These are not operations problems. They are revenue problems.{' '}
        <span style={{ color: '#5B1FE6' }}>We fix them.</span>
      </p>
    </div>
  );
}
