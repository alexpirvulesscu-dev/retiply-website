'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimate } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Shared constants                                                   */
/* ------------------------------------------------------------------ */

const LOOP_MS = 8000;

const pillStyle = (active: boolean): React.CSSProperties => ({
  position: 'relative',
  padding: '10px 28px',
  borderRadius: '9999px',
  border: active ? 'none' : '1px solid #D0CCC6',
  background: 'transparent',
  color: active ? '#ffffff' : '#6B6B6B',
  fontFamily: active ? "'DM Sans', sans-serif" : "'Inter', sans-serif",
  fontWeight: active ? 600 : 400,
  fontSize: '0.875rem',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  flexShrink: 0,
  zIndex: 1,
});

const headerBefore: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#B91C1C',
  margin: '0 0 16px',
};

const headerAfter: React.CSSProperties = {
  ...headerBefore,
  color: '#5B1FE6',
};

const badgeBase: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 12,
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: 700,
  fontSize: '0.875rem',
  color: '#ffffff',
  borderRadius: '9999px',
  padding: '4px 14px',
  lineHeight: 1.3,
};

/* ------------------------------------------------------------------ */
/*  Utility: useCycleAnimation — runs an async sequence in a loop      */
/* ------------------------------------------------------------------ */

function useCycleAnimation(
  runSequence: (
    animate: ReturnType<typeof useAnimate>[1],
    signal: AbortSignal,
  ) => Promise<void>,
) {
  const [scope, animate] = useAnimate();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    let running = true;
    (async () => {
      while (running && !controller.signal.aborted) {
        try {
          await runSequence(animate, controller.signal);
        } catch {
          // aborted or animation cancelled
          break;
        }
      }
    })();

    return () => {
      running = false;
      controller.abort();
    };
  }, [animate, runSequence]);

  return scope;
}

/* helper: wait that respects abort */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error('aborted'));
    const id = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(id);
      reject(new Error('aborted'));
    });
  });
}

/* ------------------------------------------------------------------ */
/*  SVG icons                                                          */
/* ------------------------------------------------------------------ */

const EnvelopeIcon = ({ color = '#6B6B6B', size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 4 12 13 2 4" />
  </svg>
);

const PersonIcon = ({ size = 16, color = '#6B6B6B' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
  </svg>
);

const ClockIcon = ({ size = 14, color = '#6B6B6B' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  SVG: Gmail-style envelope icon                                     */
/* ------------------------------------------------------------------ */

const GmailIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke="#EA4335" strokeWidth="1.5" />
    <path d="M22 4 12 13 2 4" stroke="#EA4335" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  SVG: Excel-style grid icon                                         */
/* ------------------------------------------------------------------ */

const ExcelGridIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="1" stroke="#fff" strokeWidth="1.2" />
    <line x1="1" y1="5.5" x2="15" y2="5.5" stroke="#fff" strokeWidth="0.8" />
    <line x1="1" y1="10.5" x2="15" y2="10.5" stroke="#fff" strokeWidth="0.8" />
    <line x1="6" y1="1" x2="6" y2="15" stroke="#fff" strokeWidth="0.8" />
    <line x1="11" y1="1" x2="11" y2="15" stroke="#fff" strokeWidth="0.8" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Shared email data for Invoices scenes                              */
/* ------------------------------------------------------------------ */

const invoiceEmails = [
  { dot: '#EA4335', sender: 'Supplier Invoice', subject: 'INV-4821 \u2013 \u00A31,240.00', time: '09:14', cls: 'bi-email-1' },
  { dot: '#F97316', sender: 'Materials Receipt', subject: 'REC-0093 \u2013 \u00A3876.50', time: '10:02', cls: 'bi-email-2' },
  { dot: '#6B6B6B', sender: 'Team Expense', subject: 'Expense claim \u2013 Site visit', time: '11:30', cls: 'bi-email-3' },
  { dot: '#EA4335', sender: 'Supplier Invoice', subject: 'INV-4822 \u2013 \u00A3540.00', time: '13:45', cls: 'bi-email-4' },
];

const emailRowStyle: React.CSSProperties = {
  height: 32,
  width: '100%',
  background: '#ffffff',
  border: '1px solid #E0DDD8',
  borderRadius: 2,
  display: 'grid',
  gridTemplateColumns: '8px auto 1fr auto',
  alignItems: 'center',
  gap: 6,
  padding: '0 12px',
};

/* ------------------------------------------------------------------ */
/*  Spreadsheet cell data                                              */
/* ------------------------------------------------------------------ */

const sheetHeaders = ['Supplier', 'Invoice No.', 'Amount', 'Status'];
const sheetRows = [
  ['Supplier Invoice', 'INV-4821', '\u00A31,240.00', ''],
  ['Materials Receipt', 'REC-0093', '\u00A3876.50', ''],
  ['Team Expense', 'EXP-031', '\u00A354.20', ''],
];

/* ------------------------------------------------------------------ */
/*  SCENE: Before Invoices                                             */
/* ------------------------------------------------------------------ */

const BeforeInvoices = React.memo(function BeforeInvoices() {
  const [typedCells, setTypedCells] = useState<Record<string, string>>({});
  const [timerVal, setTimerVal] = useState('0:00');
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerStart = useRef(0);

  // Timer effect
  useEffect(() => {
    if (timerRunning) {
      timerStart.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStart.current) / 1000);
        const mins = Math.floor(elapsed / 60);
        const secs = elapsed % 60;
        setTimerVal(`${mins}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]);

  const runSequence = useCallback(
    async (animate: ReturnType<typeof useAnimate>[1], signal: AbortSignal) => {
      // Reset
      animate('.bi-email-row', { opacity: 0, x: 16 }, { duration: 0 });
      animate('.bi-cursor', { opacity: 0 }, { duration: 0 });
      animate('.bi-badge', { opacity: 0, scale: 0.8 }, { duration: 0 });
      animate('.bi-handoff', { opacity: 0 }, { duration: 0 });
      animate('.bi-excel', { opacity: 0 }, { duration: 0 });
      animate('.bi-summary-bar', { opacity: 0, y: 20 }, { duration: 0 });
      animate('.bi-scene', { opacity: 1 }, { duration: 0 });
      setTypedCells({});
      setTimerRunning(false);
      setTimerVal('0:00');

      await wait(200, signal);

      // Emails slide in staggered 600ms
      for (const email of invoiceEmails) {
        await animate(`.${email.cls}`, { opacity: 1, x: 0 }, { type: 'spring', stiffness: 200, damping: 20 });
        await wait(400, signal);
      }

      // Show handoff band and spreadsheet together
      setTimerRunning(true);
      animate('.bi-handoff', { opacity: 1 }, { duration: 0.3, ease: 'easeOut' });
      await animate('.bi-excel', { opacity: 1 }, { duration: 0.3, ease: 'easeOut' });

      await wait(200, signal);

      // Cursor blinks then type row 1 cells left-to-right
      const row1Cells = ['0-0', '0-1', '0-2'];
      for (const cellKey of row1Cells) {
        for (let b = 0; b < 2; b++) {
          await animate(`.bi-cursor-${cellKey}`, { opacity: 1 }, { duration: 0.15 });
          await wait(200, signal);
          await animate(`.bi-cursor-${cellKey}`, { opacity: 0 }, { duration: 0.15 });
          await wait(200, signal);
        }
        const [r, c] = cellKey.split('-').map(Number);
        setTypedCells((prev) => ({ ...prev, [cellKey]: sheetRows[r][c] }));
        await wait(300, signal);
      }

      // Type row 2
      const row2Cells = ['1-0', '1-1', '1-2'];
      for (const cellKey of row2Cells) {
        for (let b = 0; b < 2; b++) {
          await animate(`.bi-cursor-${cellKey}`, { opacity: 1 }, { duration: 0.15 });
          await wait(200, signal);
          await animate(`.bi-cursor-${cellKey}`, { opacity: 0 }, { duration: 0.15 });
          await wait(200, signal);
        }
        const [r, c] = cellKey.split('-').map(Number);
        setTypedCells((prev) => ({ ...prev, [cellKey]: sheetRows[r][c] }));
        await wait(300, signal);
      }

      // Row 3 stays empty

      await wait(200, signal);

      // Badge
      await animate('.bi-badge', { opacity: 1, scale: 1 }, { type: 'spring', stiffness: 300, damping: 20 });

      await wait(300, signal);

      // Summary bar slides up
      await animate('.bi-summary-bar', { opacity: 1, y: 0 }, { type: 'spring', stiffness: 200, damping: 22 });

      await wait(1200, signal);

      // Stop timer, fade out
      setTimerRunning(false);
      await animate('.bi-scene', { opacity: 0 }, { duration: 0.8, ease: 'easeOut' });

      await wait(1200, signal);
    },
    [],
  );

  const scope = useCycleAnimation(runSequence);

  return (
    <div ref={scope} style={{ position: 'relative', height: '100%', padding: '16px 16px 0', display: 'flex', flexDirection: 'column' }}>
      <p style={headerBefore}>Before</p>
      <div className="bi-scene" style={{ display: 'grid', gap: 6, flex: 1 }}>
        {/* Gmail inbox header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <GmailIcon size={16} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: '#0A0A0A' }}>Gmail</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.7rem', color: '#fff', background: '#EA4335', borderRadius: 9999, padding: '2px 8px', marginLeft: 4 }}>99+ unread</span>
        </div>

        {/* Email rows */}
        {invoiceEmails.map((e) => (
          <div key={e.cls} className={`bi-email-row ${e.cls}`} style={{ ...emailRowStyle, opacity: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.75rem', color: '#0A0A0A', whiteSpace: 'nowrap' }}>{e.sender}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.75rem', color: '#6B6B6B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.7rem', color: '#6B6B6B', whiteSpace: 'nowrap' }}>{e.time}</span>
          </div>
        ))}

        {/* Manual effort handoff band */}
        <div className="bi-handoff" style={{ width: '100%', height: 36, background: 'rgba(185,28,28,0.06)', borderTop: '1px solid rgba(185,28,28,0.12)', borderBottom: '1px solid rgba(185,28,28,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, opacity: 0 }}>
          <PersonIcon size={14} color="#B91C1C" />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.72rem', color: '#B91C1C' }}>Someone on your team is now doing this manually</span>
          <ClockIcon size={14} color="#B91C1C" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.75rem', color: '#B91C1C', minWidth: 32 }}>{timerVal}</span>
        </div>

        {/* Excel spreadsheet */}
        <div className="bi-excel" style={{ marginTop: 4, opacity: 0 }}>
          <div style={{ background: '#217346', height: 22, display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px' }}>
            <ExcelGridIcon size={12} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.7rem', color: '#fff' }}>invoices_oct.xlsx</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', border: '1px solid #D0CCC6', borderTop: 'none' }}>
            {sheetHeaders.map((h, ci) => (
              <div key={h} style={{ height: 24, background: '#F0F0F0', borderBottom: '1px solid #D0CCC6', borderRight: ci < 3 ? '1px solid #D0CCC6' : 'none', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.65rem', color: '#6B6B6B' }}>{h}</span>
              </div>
            ))}
            {sheetRows.map((row, ri) =>
              row.map((_, ci) => {
                const key = `${ri}-${ci}`;
                const text = typedCells[key] || '';
                const isLastRow = ri === sheetRows.length - 1;
                const isStatusCol = ci === 3;
                return (
                  <div key={key} style={{ height: 24, background: '#fff', borderBottom: !isLastRow ? '1px solid #D0CCC6' : 'none', borderRight: ci < 3 ? '1px solid #D0CCC6' : 'none', display: 'flex', alignItems: 'center', padding: '0 6px', position: 'relative', overflow: 'hidden' }}>
                    {!isStatusCol && (
                      <>
                        <div className={`bi-cursor bi-cursor-${key}`} style={{ position: 'absolute', left: 4, width: 1, height: 14, background: '#0A0A0A', opacity: 0 }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.65rem', color: '#0A0A0A', whiteSpace: 'nowrap', overflow: 'hidden' }}>{text}</span>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Badge */}
        <div className="bi-badge" style={{ ...badgeBase, background: '#B91C1C', fontSize: '0.8rem', opacity: 0 }}>
          Still 2 behind
        </div>
      </div>

      {/* Summary bar — pinned to bottom */}
      <div className="bi-summary-bar" style={{ width: 'calc(100% + 32px)', marginLeft: -16, background: '#B91C1C', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', opacity: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockIcon size={14} color="#ffffff" />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>2-4 hours per day</span>
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>spent on manual data entry</span>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  SVG: Gear icon (for automation spinner)                            */
/* ------------------------------------------------------------------ */

const GearIcon = ({ size = 14, color = '#5B1FE6' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  SVG: Animated checkbox (empty square -> checked)                   */
/* ------------------------------------------------------------------ */

const AnimatedCheckbox = ({ checked, size = 14 }: { checked: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="1" y="1" width="18" height="18" rx="3" stroke={checked ? '#16A34A' : '#D0CCC6'} strokeWidth="1.5" fill={checked ? 'rgba(22,163,74,0.1)' : 'none'} />
    {checked && (
      <motion.path
        d="M5 10l3.5 3.5L15 7"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    )}
  </svg>
);

/* ------------------------------------------------------------------ */
/*  SCENE: After Invoices                                              */
/* ------------------------------------------------------------------ */

const afterChecklistItems = [
  'INV-4821 captured \u2014 \u00A31,240.00',
  'REC-0093 captured \u2014 \u00A3876.50',
  'EXP-031 logged \u2014 \u00A354.20',
  'P&L updated automatically',
];

const CheckIconWhite = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12l5 5L20 7" />
  </svg>
);

const AfterInvoices = React.memo(function AfterInvoices() {
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  const runSequence = useCallback(
    async (animate: ReturnType<typeof useAnimate>[1], signal: AbortSignal) => {
      // Reset
      animate('.ai-scene', { opacity: 1 }, { duration: 0 });
      animate('.ai-check-row', { opacity: 0, x: -8 }, { duration: 0 });
      animate('.ai-summary', { opacity: 0, x: -8 }, { duration: 0 });
      animate('.ai-badge', { opacity: 0, scale: 0.8 }, { duration: 0 });
      animate('.ai-summary-bar', { opacity: 0, y: 20 }, { duration: 0 });
      setCheckedItems([]);
      setShowSummary(false);

      await wait(1000, signal);

      // Checklist rows appear one by one, staggered 500ms
      for (let i = 0; i < 4; i++) {
        setCheckedItems((prev) => [...prev, i]);
        await animate(`.ai-check-${i}`, { opacity: 1, x: 0 }, { type: 'spring', stiffness: 200, damping: 20 });
        await wait(500, signal);
      }

      await wait(500, signal);

      // Summary row
      setShowSummary(true);
      await animate('.ai-summary', { opacity: 1, x: 0 }, { type: 'spring', stiffness: 200, damping: 20 });

      await wait(500, signal);

      // Green badge with overshoot
      await animate('.ai-badge', { opacity: 1, scale: [0.8, 1.08, 1.0] }, { duration: 0.5, ease: 'easeOut' });

      await wait(500, signal);

      // Summary bar slides up
      await animate('.ai-summary-bar', { opacity: 1, y: 0 }, { type: 'spring', stiffness: 200, damping: 22 });

      await wait(1500, signal);

      // Fade out
      await animate('.ai-scene', { opacity: 0 }, { duration: 0.8, ease: 'easeOut' });

      await wait(1200, signal);
    },
    [],
  );

  const scope = useCycleAnimation(runSequence);

  return (
    <div ref={scope} style={{ position: 'relative', height: '100%', padding: '16px 16px 0', display: 'flex', flexDirection: 'column' }}>
      <p style={headerAfter}>After</p>
      <div className="ai-scene" style={{ display: 'grid', gap: 6, flex: 1 }}>
        {/* Gmail inbox header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <GmailIcon size={16} />
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: '#0A0A0A' }}>Gmail</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.7rem', color: '#fff', background: '#EA4335', borderRadius: 9999, padding: '2px 8px', marginLeft: 4 }}>47 invoices received today</span>
        </div>

        {/* All four emails visible instantly */}
        {invoiceEmails.map((e) => (
          <div key={e.cls} style={{ ...emailRowStyle, opacity: 1 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: e.dot, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.75rem', color: '#0A0A0A', whiteSpace: 'nowrap' }}>{e.sender}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.75rem', color: '#6B6B6B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.7rem', color: '#6B6B6B', whiteSpace: 'nowrap' }}>{e.time}</span>
          </div>
        ))}

        {/* Automation status panel */}
        <div style={{ marginTop: 8, background: 'rgba(91,31,230,0.06)', border: '1px solid rgba(91,31,230,0.15)', borderRadius: 8, padding: '12px 16px' }}>
          {/* Panel header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <GearIcon size={14} color="#5B1FE6" />
              </motion.div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.75rem', color: '#5B1FE6' }}>Automation running</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A' }}
            />
          </div>

          {/* Checklist rows */}
          {afterChecklistItems.map((text, i) => (
            <div
              key={i}
              className={`ai-check-row ai-check-${i}`}
              style={{ display: 'grid', gridTemplateColumns: '14px 1fr', alignItems: 'center', gap: 8, opacity: 0, marginBottom: 6 }}
            >
              <AnimatedCheckbox checked={checkedItems.includes(i)} size={14} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.8rem', color: '#1C1C1E' }}>{text}</span>
            </div>
          ))}

          {/* Summary row */}
          <div className="ai-summary" style={{ display: 'grid', gridTemplateColumns: '14px 1fr', alignItems: 'center', gap: 8, opacity: 0, marginTop: 4 }}>
            <div style={{ width: 14 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: '0.8rem', color: '#5B1FE6' }}>Finance report ready. No one touched it.</span>
          </div>
        </div>

        {/* Badge */}
        <div className="ai-badge" style={{ ...badgeBase, background: '#16A34A', fontSize: '0.8rem', opacity: 0 }}>
          0 mins manual
        </div>
      </div>

      {/* Summary bar — pinned to bottom */}
      <div className="ai-summary-bar" style={{ width: 'calc(100% + 32px)', marginLeft: -16, background: '#16A34A', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', opacity: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckIconWhite size={14} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>Zero hours</span>
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)' }}>your team never touches it</span>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  SCENE: Before Follow-ups                                           */
/* ------------------------------------------------------------------ */

const timestampStages = ['Just now', '2 hours ago', '1 day ago', '3 days ago'];

const BeforeFollowups = React.memo(function BeforeFollowups() {
  const [tsIndex, setTsIndex] = useState(0);

  const runSequence = useCallback(
    async (animate: ReturnType<typeof useAnimate>[1], signal: AbortSignal) => {
      // Reset
      animate('.lead-card-b', { opacity: 0, borderColor: '#E0DDD8' }, { duration: 0 });
      animate('.fu-row', { opacity: 0 }, { duration: 0 });
      animate('.badge-lost-fu', { opacity: 0, scale: 0.8 }, { duration: 0 });
      animate('.scene-wrap-bfu', { opacity: 1 }, { duration: 0 });
      setTsIndex(0);

      // Lead card fades in
      await animate('.lead-card-b', { opacity: 1 }, { duration: 0.4, ease: 'easeOut' });

      await wait(600, signal);

      // Timestamp progression
      for (let i = 1; i < 4; i++) {
        setTsIndex(i);
        if (i === 3) {
          animate('.lead-card-b', { borderColor: '#B91C1C' }, { duration: 1.2, ease: 'easeOut' });
        }
        await wait(1000, signal);
      }

      // Follow-up rows fade in staggered
      await animate('.fu-1', { opacity: 0.5 }, { duration: 0.3 });
      await wait(300, signal);
      await animate('.fu-2', { opacity: 0.35 }, { duration: 0.3 });
      await wait(300, signal);
      await animate('.fu-3', { opacity: 0.2 }, { duration: 0.3 });

      await wait(500, signal);

      // Badge
      await animate('.badge-lost-fu', { opacity: 1, scale: 1 }, { type: 'spring', stiffness: 300, damping: 20 });

      await wait(1500, signal);

      // Fade out
      await animate('.scene-wrap-bfu', { opacity: 0 }, { duration: 0.8, ease: 'easeOut' });

      await wait(1500, signal);
    },
    [],
  );

  const scope = useCycleAnimation(runSequence);

  const fuRowStyle = (opacity: number): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: '14px 1fr',
    alignItems: 'center',
    gap: 6,
    opacity: 0,
  });

  return (
    <div ref={scope} style={{ position: 'relative', height: '100%', padding: '16px 20px', overflow: 'hidden' }}>
      <p style={headerBefore}>Before</p>
      <div className="scene-wrap-bfu" style={{ display: 'grid', gap: 12 }}>
        {/* Lead card */}
        <div className="lead-card-b" style={{ background: '#fff', border: '2px solid #E0DDD8', borderRadius: 8, padding: 12, width: '85%', margin: '0 auto', opacity: 0, transition: 'border-color 1s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PersonIcon size={16} color="#6B6B6B" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.75rem', color: '#0A0A0A' }}>New enquiry</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.7rem', color: '#6B6B6B', marginTop: 4, height: 16, position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={tsIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ position: 'absolute' }}
              >
                {timestampStages[tsIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        {/* Follow-up rows */}
        {[1, 2, 3].map((n) => (
          <div key={n} className={`fu-row fu-${n}`} style={fuRowStyle(0)}>
            <ClockIcon size={14} color="#B0B0B0" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.75rem', color: '#6B6B6B' }}>
              Follow-up {n}
            </span>
          </div>
        ))}

        {/* Badge */}
        <div className="badge-lost-fu" style={{ ...badgeBase, background: '#B91C1C', opacity: 0 }}>
          Lost
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  SCENE: After Follow-ups                                            */
/* ------------------------------------------------------------------ */

const AfterFollowups = React.memo(function AfterFollowups() {
  const runSequence = useCallback(
    async (animate: ReturnType<typeof useAnimate>[1], signal: AbortSignal) => {
      // Reset
      animate('.lead-card-a', { opacity: 0 }, { duration: 0 });
      animate('.typing-dots', { opacity: 0 }, { duration: 0 });
      animate('.chat-bubble', { opacity: 0, y: 8 }, { duration: 0 });
      animate('.afu-row', { opacity: 0 }, { duration: 0 });
      animate('.badge-booked', { opacity: 0, scale: 0.8 }, { duration: 0 });
      animate('.scene-wrap-afu', { opacity: 1 }, { duration: 0 });

      // Lead card
      await animate('.lead-card-a', { opacity: 1 }, { duration: 0.4, ease: 'easeOut' });

      await wait(500, signal);

      // Typing indicator
      await animate('.typing-dots', { opacity: 1 }, { duration: 0.2 });
      await wait(800, signal);
      await animate('.typing-dots', { opacity: 0 }, { duration: 0.2 });

      // Chat bubble
      await animate('.chat-bubble', { opacity: 1, y: 0 }, { type: 'spring', stiffness: 260, damping: 20 });

      await wait(500, signal);

      // Follow-up rows
      await animate('.afu-1', { opacity: 1 }, { duration: 0.3 });
      await wait(300, signal);
      await animate('.afu-2', { opacity: 1 }, { duration: 0.3 });

      await wait(600, signal);

      // Badge with overshoot
      await animate('.badge-booked', { opacity: 1, scale: [0.8, 1.08, 1.0] }, { duration: 0.5, ease: 'easeOut' });

      await wait(1700, signal);

      // Fade out
      await animate('.scene-wrap-afu', { opacity: 0 }, { duration: 0.8, ease: 'easeOut' });

      await wait(1500, signal);
    },
    [],
  );

  const scope = useCycleAnimation(runSequence);

  return (
    <div ref={scope} style={{ position: 'relative', height: '100%', padding: '16px 20px', overflow: 'hidden' }}>
      <p style={headerAfter}>After</p>
      <div className="scene-wrap-afu" style={{ display: 'grid', gap: 12 }}>
        {/* Lead card */}
        <div className="lead-card-a" style={{ background: '#fff', border: '1px solid #E0DDD8', borderRadius: 8, padding: 12, width: '85%', margin: '0 auto', opacity: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <PersonIcon size={16} color="#5B1FE6" />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: '0.75rem', color: '#0A0A0A' }}>New enquiry</span>
          </div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.7rem', color: '#6B6B6B', marginTop: 4 }}>
            Just now
          </div>
        </div>

        {/* Typing indicator */}
        <div className="typing-dots" style={{ display: 'flex', gap: 4, padding: '6px 14px', opacity: 0, width: 'fit-content', background: 'rgba(91,31,230,0.08)', borderRadius: 8 }}>
          {[0, 1, 2].map((d) => (
            <motion.div
              key={d}
              style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B1FE6' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </div>

        {/* Chat bubble */}
        <div className="chat-bubble" style={{ background: 'rgba(91,31,230,0.08)', borderRadius: 8, padding: '10px 14px', opacity: 0, maxWidth: '92%' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.75rem', color: '#1C1C1E', lineHeight: 1.5 }}>
            Hi — thanks for reaching out. Here's how we can help...
          </span>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.65rem', color: '#6B6B6B', marginTop: 4 }}>
            Sent automatically &middot; 4s
          </div>
        </div>

        {/* Follow-up rows */}
        {[
          { cls: 'afu-1', text: 'Follow-up 1 \u00b7 Sent' },
          { cls: 'afu-2', text: 'Follow-up 2 \u00b7 Scheduled' },
        ].map(({ cls, text }) => (
          <div key={cls} className={`afu-row ${cls}`} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', alignItems: 'center', gap: 6, opacity: 0 }}>
            <CheckIcon size={14} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.75rem', color: '#16A34A' }}>
              {text}
            </span>
          </div>
        ))}

        {/* Badge */}
        <div className="badge-booked" style={{ ...badgeBase, background: '#16A34A', opacity: 0 }}>
          Booked
        </div>
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

const tabs = ['Invoices', 'Follow-ups'] as const;

export default function TransformInteractive() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Scroll-in fade
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      {/* Label */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6B6B6B', margin: 0, textAlign: 'center' }}>
        What changes
      </p>

      {/* Heading */}
      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: '#0A0A0A', margin: '16px 0 0', textAlign: 'center', lineHeight: 1.15 }}>
        Watch what we fix.
      </h2>

      {/* Subheading */}
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '1rem', color: '#6B6B6B', margin: '12px 0 0', textAlign: 'center' }}>
        Pick the one that sounds like you.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 48, overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {tabs.map((label, i) => (
          <button key={label} onClick={() => setActive(i)} style={pillStyle(i === active)}>
            {i === active && (
              <motion.span
                layoutId="activePill"
                style={{ position: 'absolute', inset: 0, borderRadius: '9999px', background: '#5B1FE6', zIndex: -1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Scene panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="tf-scene-panel"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', alignItems: 'stretch', marginTop: 40 }}
        >
          {/* Before */}
          <div style={{ background: 'rgba(185,28,28,0.03)', minHeight: 520 }}>
            {active === 0 ? <BeforeInvoices /> : <BeforeFollowups />}
          </div>

          {/* Divider */}
          <div className="tf-divider-v" style={{ background: '#D0CCC6' }} />

          {/* After */}
          <div style={{ background: 'rgba(91,31,230,0.03)', minHeight: 520 }}>
            {active === 0 ? <AfterInvoices /> : <AfterFollowups />}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
