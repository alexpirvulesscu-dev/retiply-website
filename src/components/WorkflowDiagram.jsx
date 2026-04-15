import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

// ─── Canvas dimensions ────────────────────────────────────────────────────────
// ViewBox: 1380 × 480  (node labels extend ~72px below each box)
// Node box: 90 × 90, rx=11, centred on (cx, cy)
// Connection handles: r=5 circles at (cx±45, cy)

const NB = 45; // half node-box side (90/2)

// ─── Nodes ────────────────────────────────────────────────────────────────────
// Trunk:   Trigger (left-centre)
// Top:     Fetch → Filter → Enrich → AI  (row ~cy=85)
// Bottom:  RunLogic → Format             (row ~cy=380)
// Merge:   Merge Results                 (centre-right, cy=232)
// Deliver: Deliver to Destination        (right, cy=235)
// Branches: Confirm (success) / Alert (error)
//
// Nodes are staggered ±10-15px off their row baseline for an organic feel.
const NODES = [
  { id: 0,  label: 'Webhook Trigger',      sub: 'webhook entry point',    icon: '⚡', color: '#EA6A1F', cx: 80,   cy: 232 },
  { id: 1,  label: 'Fetch Records',        sub: 'database query',         icon: '⬇', color: '#0D9488', cx: 268,  cy: 80  },
  { id: 2,  label: 'Filter & Limit',       sub: 'filter & deduplicate',   icon: '⚗', color: '#4F46E5', cx: 454,  cy: 93  },
  { id: 3,  label: 'Enrich Data',          sub: 'add context & metadata', icon: '✦', color: '#4338CA', cx: 640,  cy: 78  },
  { id: 4,  label: 'AI Summarise',         sub: 'smart processing',       icon: '◈', color: '#7C3AED', cx: 826,  cy: 90  },
  { id: 5,  label: 'Run Logic Check',      sub: 'conditional rules',      icon: '◇', color: '#4F46E5', cx: 268,  cy: 382 },
  { id: 6,  label: 'Format Output',        sub: 'structure & clean',      icon: '≡', color: '#64748B', cx: 454,  cy: 370 },
  { id: 7,  label: 'Merge Results',        sub: 'combine branches',       icon: '⇒', color: '#334155', cx: 978,  cy: 232 },
  { id: 8,  label: 'Deliver to Dest.',     sub: 'push to output',         icon: '→', color: '#334155', cx: 1155, cy: 235 },
  { id: 9,  label: 'Confirm & Log',        sub: 'record success',         icon: '✓', color: '#059669', cx: 1308, cy: 84  },
  { id: 10, label: 'Alert Team',           sub: 'notify & escalate',      icon: '!', color: '#DC2626', cx: 1308, cy: 382 },
];

// ─── Paths — ALL cubic bezier C, zero L/line/polyline ────────────────────────
// Right handle of source: cx+NB
// Left handle of target:  cx-NB
// Same-row (slight stagger): C midX startY, midX endY end
// Sigmoid branch: C endX startY, startX endY end
const PATHS = [
  // Trunk fanning out from Trigger
  'M 125 232 C 223 232, 123 80,  223 80',    // 0  Trigger → Fetch
  'M 125 232 C 223 232, 123 382, 223 382',   // 1  Trigger → RunLogic
  // Top path  (same row, gentle stagger curves)
  'M 313 80  C 361 80,  361 93,  409 93',    // 2  Fetch → Filter
  'M 499 93  C 547 93,  547 78,  595 78',    // 3  Filter → Enrich
  'M 685 78  C 733 78,  733 90,  781 90',    // 4  Enrich → AI
  // Convergence into Merge
  'M 871 90  C 933 90,  871 232, 933 232',   // 5  AI → Merge  (sigmoid down)
  // Bottom path
  'M 313 382 C 361 382, 361 370, 409 370',   // 6  RunLogic → Format
  'M 499 370 C 716 370, 716 232, 933 232',   // 7  Format → Merge  (long arc up)
  // Trunk continues
  'M 1023 232 C 1066 232, 1066 235, 1110 235', // 8  Merge → Deliver
  // Deliver branches
  'M 1200 235 C 1263 235, 1200 84,  1263 84',  // 9  Deliver → Confirm  (sigmoid up)
  'M 1200 235 C 1263 235, 1200 382, 1263 382', // 10 Deliver → Alert    (sigmoid down)
];

// ─── Item count labels ────────────────────────────────────────────────────────
// Bezier midpoint at t=0.5: B = 1/8·P0 + 3/8·P1 + 3/8·P2 + 1/8·P3
// Slightly offset from the line for readability.
const PATH_LABELS = [
  { i: 0,  text: '12 items', x: 146, y: 148 },  // above-left of P0 midpt
  { i: 1,  text: '8 items',  x: 146, y: 314 },  // below-left of P1 midpt
  { i: 2,  text: '12 items', x: 361, y: 70  },  // above P2
  { i: 3,  text: '12 items', x: 547, y: 70  },  // above P3
  { i: 4,  text: '12 items', x: 733, y: 68  },  // above P4
  { i: 5,  text: '12 items', x: 908, y: 158 },  // right of P5 midpt
  { i: 6,  text: '8 items',  x: 361, y: 395 },  // below P6
  { i: 7,  text: '8 items',  x: 716, y: 288 },  // above P7 midpt
  { i: 8,  text: '20 items', x: 1066, y: 222 }, // above P8
  { i: 9,  text: '20 items', x: 1242, y: 152 }, // right of P9 midpt
  { i: 10, text: '20 items', x: 1242, y: 316 }, // right of P10 midpt
];

// ─── Animation delays (ms) ───────────────────────────────────────────────────
// Total animation ~5 seconds. Nodes stagger column by column.
// Lines appear ~100ms after the later of their two endpoint nodes.
const NODE_DELAYS = [0, 500, 1000, 1600, 2200, 500, 1000, 2900, 3600, 4400, 4400];
const LINE_DELAYS = [
  600,  // P0  after Trigger+Fetch
  600,  // P1  after Trigger+RunLogic
  1100, // P2  after Filter
  1700, // P3  after Enrich
  2300, // P4  after AI
  3000, // P5  after Merge
  1100, // P6  after Format
  3000, // P7  after Merge
  3700, // P8  after Deliver
  4500, // P9  after Confirm  (line finishes ~5 050 ms)
  4500, // P10 after Alert
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkflowDiagram() {
  const ref = useRef(null);
  // once: true — animates in when section enters view, stays forever
  const isInView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });

  return (
    <div ref={ref}>
      {/* ── Desktop SVG ── */}
      <div className="hidden md:block w-full overflow-x-auto">
        <svg
          viewBox="0 0 1380 480"
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          style={{ minWidth: '860px', maxHeight: '450px' }}
          aria-label="Animated automation workflow"
        >
          <defs>
            {/* Arrowhead — small, brand accent, tip at path endpoint */}
            <marker id="arr" markerWidth="7" markerHeight="5.5" refX="6.5" refY="2.75" orient="auto">
              <path d="M 0 0.5 L 6.5 2.75 L 0 5 z" fill="rgba(45,27,142,0.42)" />
            </marker>
          </defs>

          {/* ── Connection lines ── */}
          {PATHS.map((d, i) => (
            <motion.path
              key={`p${i}`}
              d={d}
              stroke="rgba(45,27,142,0.28)"
              strokeWidth="1.6"
              fill="none"
              markerEnd="url(#arr)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{
                pathLength: { delay: LINE_DELAYS[i] / 1000, duration: 0.55, ease: 'easeOut' },
                opacity:    { delay: LINE_DELAYS[i] / 1000, duration: 0.20 },
              }}
            />
          ))}

          {/* ── Item count pills ── */}
          {PATH_LABELS.map(({ i, text, x, y }) => {
            const charW = text.length * 5.2 + 10;
            return (
              <motion.g
                key={`lbl${i}`}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: LINE_DELAYS[i] / 1000 + 0.18, duration: 0.25 }}
              >
                <rect
                  x={x - charW / 2} y={y - 8}
                  width={charW} height={14}
                  rx={7}
                  fill="rgba(255,255,255,0.80)"
                  stroke="rgba(45,27,142,0.16)"
                  strokeWidth="0.8"
                />
                <text
                  x={x} y={y + 1.5}
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="Inter, sans-serif" fontSize="9"
                  fontWeight="500" fill="rgba(45,27,142,0.55)"
                >
                  {text}
                </text>
              </motion.g>
            );
          })}

          {/* ── Nodes ── */}
          {NODES.map((node) => {
            const { id, label, sub, icon, color, cx, cy } = node;
            return (
              <motion.g
                key={`n${id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{
                  delay: NODE_DELAYS[id] / 1000,
                  duration: 0.40,
                  ease: 'easeOut',
                }}
              >
                {/* ── Node box ── */}
                <rect
                  x={cx - NB} y={cy - NB}
                  width={90} height={90}
                  rx={11}
                  fill={color}
                />
                {/* Subtle inner top-highlight for glassy depth */}
                <rect
                  x={cx - NB + 1} y={cy - NB + 1}
                  width={88} height={43}
                  rx={10}
                  fill="rgba(255,255,255,0.10)"
                />

                {/* Icon — centred in box */}
                <text
                  x={cx} y={cy + 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Inter', monospace, sans-serif"
                  fontSize="26"
                  fontWeight="400"
                  fill="rgba(255,255,255,0.92)"
                >
                  {icon}
                </text>

                {/* Connection handles — left & right edges */}
                <circle cx={cx - NB} cy={cy} r="5" fill="rgba(255,255,255,0.72)" />
                <circle cx={cx + NB} cy={cy} r="5" fill="rgba(255,255,255,0.72)" />

                {/* Node name label — below box */}
                <text
                  x={cx} y={cy + NB + 14}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="12"
                  fontWeight="500"
                  fill="rgba(10,10,9,0.78)"
                >
                  {label}
                </text>

                {/* Sub-label — muted, below name */}
                <text
                  x={cx} y={cy + NB + 29}
                  textAnchor="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="10"
                  fontWeight="400"
                  fill="rgba(10,10,9,0.40)"
                >
                  {sub}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* ── Mobile fallback — vertical stack ── */}
      <div className="md:hidden space-y-2 max-w-xs mx-auto">
        {NODES.map(({ id, label, sub, color }) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(255,255,255,0.88)', borderLeft: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
          >
            <div>
              <div className="font-inter text-sm font-medium" style={{ color: 'rgba(10,10,9,0.78)' }}>{label}</div>
              <div className="font-inter text-xs" style={{ color: 'rgba(10,10,9,0.42)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
