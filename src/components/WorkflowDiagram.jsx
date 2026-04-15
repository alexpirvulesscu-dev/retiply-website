import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'motion/react';

// ─── Dimensions ───────────────────────────────────────────────────────────────
const NW = 175; // node width
const NH = 64;  // node height (taller to fit sub-label)

// ─── Layout ───────────────────────────────────────────────────────────────────
// Column left-edge x (220px left-to-left spacing):
//   col0=20  col1=240  col2=460  col3=680  col4=900  col5=1120
//
// Row centre y (140px row spacing, trunk on row1):
//   row0(success) cy=70    node.y=38
//   row1(trunk)   cy=210   node.y=178
//   row2(error)   cy=350   node.y=318
//
// ViewBox: 1320 × 410
const NODES = [
  // Trunk
  { id: 0, label: 'Trigger',             sub: 'Starts the run',        type: 'trigger', x: 20,   y: 178 },
  { id: 1, label: 'Parse Input',         sub: 'Reads & structures',    type: 'logic',   x: 240,  y: 178 },
  { id: 2, label: 'Process & Transform', sub: 'Maps & transforms',     type: 'logic',   x: 460,  y: 178 },
  { id: 3, label: 'Check Result',        sub: 'Validates output',      type: 'branch',  x: 680,  y: 178 },
  // Branch A — SUCCESS
  { id: 4, label: 'Deliver Output',      sub: 'Sends to destination',  type: 'success', x: 900,  y: 38  },
  { id: 5, label: 'Confirm & Log',       sub: 'Records audit trail',   type: 'success', x: 1120, y: 38  },
  // Branch B — ERROR
  { id: 6, label: 'Log Failure',         sub: 'Captures the error',    type: 'error',   x: 900,  y: 318 },
  { id: 7, label: 'Alert & Escalate',    sub: 'Notifies the team',     type: 'error',   x: 1120, y: 318 },
];

// ─── Paths — ALL cubic bezier C, no L/line/polyline ──────────────────────────
// Node right edges:  col0=195  col1=415  col2=635  col3=855  col4=1075  col5=1295
// Row centres:       row0=70   row1=210  row2=350
//
// Trunk (same row, gap=45px): symmetric 22px handles — gentle barely-there curve
// Branches (sigmoid): C (end_x, start_y), (start_x, end_y) end_x end_y
//   — exits horizontally from source, arrives horizontally at target
const PATHS = [
  // Trunk
  'M 195 210 C 217 210, 217 210, 240 210',            // 0  Trigger → Parse Input
  'M 415 210 C 437 210, 437 210, 460 210',            // 1  Parse → Process & Transform
  'M 635 210 C 657 210, 657 210, 680 210',            // 2  Process → Check Result
  // Branching connectors — sigmoid S-curves
  'M 855 206 C 900 206, 855 70,  900 70',             // 3  Check → Deliver Output (up)
  'M 855 214 C 900 214, 855 350, 900 350',            // 4  Check → Log Failure (down)
  // Within SUCCESS branch
  'M 1075 70  C 1097 70,  1097 70,  1120 70',         // 5  Deliver → Confirm & Log
  // Within ERROR branch
  'M 1075 350 C 1097 350, 1097 350, 1120 350',        // 6  Log Failure → Alert & Escalate
];

// ─── Branch labels ────────────────────────────────────────────────────────────
// Bezier midpoint at t=0.5 for sigmoid M 855 206 C 900 206 855 70 900 70:
//   B(0.5).x ≈ (1/8·855 + 3/8·900 + 3/8·855 + 1/8·900) = 871
//   B(0.5).y ≈ (1/8·206 + 3/8·206 + 3/8·70  + 1/8·70)  ≈ 138
// SUCCESS label above curve → y ≈ 121
// ERROR midpt y ≈ 282, label below curve → y ≈ 299
const BRANCH_LABELS = [
  { pathIdx: 3, x: 871, y: 121, text: 'SUCCESS', color: '#059669' },
  { pathIdx: 4, x: 871, y: 303, text: 'ERROR',   color: '#DC2626' },
];

// ─── Styling per node type ────────────────────────────────────────────────────
const STYLE = {
  trigger: { bar: '#6366F1', badge: '#6366F1' },
  logic:   { bar: '#6366F1', badge: '#6366F1' },
  branch:  { bar: '#8B5CF6', badge: '#8B5CF6' },
  success: { bar: '#10B981', badge: '#10B981' },
  error:   { bar: '#EF4444', badge: '#EF4444' },
};

// ─── Animation steps ──────────────────────────────────────────────────────────
// Branches are SEQUENTIAL: trunk fully done → SUCCESS → ERROR
const STEPS = [
  // Trunk
  { n:[0],          l:[],         c:[]           },  // 0  Trigger appears
  { n:[0],          l:[0],        c:[]           },  // 1  draw Trigger→Parse
  { n:[0,1],        l:[0],        c:[0]          },  // 2  Parse in, Trigger ✓
  { n:[0,1],        l:[0,1],      c:[0]          },  // 3  draw Parse→Process
  { n:[0,1,2],      l:[0,1],      c:[0,1]        },  // 4  Process in, Parse ✓
  { n:[0,1,2],      l:[0,1,2],    c:[0,1]        },  // 5  draw Process→Check
  { n:[0,1,2,3],    l:[0,1,2],    c:[0,1,2]      },  // 6  Check in, Process ✓
  { n:[0,1,2,3],    l:[0,1,2],    c:[0,1,2,3]    },  // 7  Check ✓ — pause before branch
  // SUCCESS branch
  { n:[0,1,2,3],    l:[0,1,2,3],      c:[0,1,2,3]      },  // 8  draw →Deliver
  { n:[0,1,2,3,4],  l:[0,1,2,3],      c:[0,1,2,3]      },  // 9  Deliver in
  { n:[0,1,2,3,4],  l:[0,1,2,3,5],    c:[0,1,2,3,4]    },  // 10 draw →Confirm, Deliver ✓
  { n:[0,1,2,3,4,5],l:[0,1,2,3,5],    c:[0,1,2,3,4]    },  // 11 Confirm in
  { n:[0,1,2,3,4,5],l:[0,1,2,3,5],    c:[0,1,2,3,4,5]  },  // 12 Confirm ✓
  // ERROR branch
  { n:[0,1,2,3,4,5],    l:[0,1,2,3,4,5],    c:[0,1,2,3,4,5]    },  // 13 draw →Log
  { n:[0,1,2,3,4,5,6],  l:[0,1,2,3,4,5],    c:[0,1,2,3,4,5]    },  // 14 Log in
  { n:[0,1,2,3,4,5,6],  l:[0,1,2,3,4,5,6],  c:[0,1,2,3,4,5,6]  },  // 15 draw →Alert, Log ✓
  { n:[0,1,2,3,4,5,6,7],l:[0,1,2,3,4,5,6],  c:[0,1,2,3,4,5,6]  },  // 16 Alert in
  { n:[0,1,2,3,4,5,6,7],l:[0,1,2,3,4,5,6],  c:[0,1,2,3,4,5,6,7]},  // 17 all ✓ hold
];

// Duration (ms) per step before advancing
const DUR = [
  110, 420, 130, 420, 130, 420, 130, 320,  // trunk     (steps 0–7)  ≈ 2.1 s
  440, 135, 440, 135, 340,                  // SUCCESS   (steps 8–12) ≈ 1.5 s
  440, 135, 440, 135, 2000,                 // ERROR     (steps 13–17)≈ 3.2 s
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Component ────────────────────────────────────────────────────────────────
export default function WorkflowDiagram() {
  const [step, setStep] = useState(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '0px 0px -80px 0px' });

  useEffect(() => {
    if (!isInView) { setStep(null); return; }
    let cancelled = false;
    const run = async () => {
      while (!cancelled) {
        for (let i = 0; i < STEPS.length; i++) {
          if (cancelled) return;
          setStep(i);
          await sleep(DUR[i]);
        }
        await sleep(700);
        if (!cancelled) setStep(null);
        await sleep(400);
      }
    };
    run();
    return () => { cancelled = true; setStep(null); };
  }, [isInView]);

  const s = step !== null ? STEPS[step] : { n: [], l: [], c: [] };

  return (
    <div ref={ref}>
      {/* ── Desktop SVG ── */}
      <div className="hidden md:block w-full overflow-x-auto">
        <svg
          viewBox="0 0 1320 410"
          preserveAspectRatio="xMidYMid meet"
          className="w-full"
          style={{ minWidth: '820px', maxHeight: '390px' }}
          aria-label="Animated automation workflow diagram"
        >
          <defs>
            {/* Default card shadow */}
            <filter id="cs" x="-14%" y="-22%" width="128%" height="156%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.08)" />
            </filter>
            {/* Checked card — warmer glow */}
            <filter id="ca" x="-14%" y="-22%" width="128%" height="156%">
              <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="rgba(45,27,142,0.12)" />
            </filter>
            {/* Arrowhead: tip aligned exactly to path endpoint (refX = tip x) */}
            <marker id="arr" markerWidth="8" markerHeight="6" refX="7.5" refY="3" orient="auto">
              <path d="M 0 0.5 L 7.5 3 L 0 5.5 z" fill="rgba(45,27,142,0.48)" />
            </marker>
          </defs>

          {/* ── Connection lines — all cubic bezier ── */}
          {PATHS.map((d, i) => (
            <motion.path
              key={`p${i}`}
              d={d}
              stroke="rgba(45,27,142,0.36)"
              strokeWidth="1.7"
              fill="none"
              markerEnd="url(#arr)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: s.l.includes(i) ? 1 : 0,
                opacity:    s.l.includes(i) ? 1 : 0,
              }}
              transition={{ duration: 0.50, ease: 'easeInOut' }}
            />
          ))}

          {/* ── Branch labels ── */}
          {BRANCH_LABELS.map((bl) => (
            <motion.g key={bl.text}>
              {/* Pill background */}
              <motion.rect
                x={bl.x - 32} y={bl.y - 11} width={64} height={18} rx={9}
                fill={bl.color} fillOpacity={0.11}
                initial={{ opacity: 0 }}
                animate={{ opacity: s.l.includes(bl.pathIdx) ? 1 : 0 }}
                transition={{ duration: 0.30 }}
              />
              <motion.text
                x={bl.x} y={bl.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily="Inter, sans-serif" fontSize="9" fontWeight="700"
                letterSpacing="0.08em" fill={bl.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: s.l.includes(bl.pathIdx) ? 0.92 : 0 }}
                transition={{ duration: 0.30 }}
              >
                {bl.text}
              </motion.text>
            </motion.g>
          ))}

          {/* ── Nodes ── */}
          {NODES.map((node) => {
            const visible = s.n.includes(node.id);
            const checked = s.c.includes(node.id);
            const st = STYLE[node.type];
            const cy = node.y + NH / 2; // vertical centre

            return (
              <motion.g
                key={`n${node.id}`}
                initial={{ opacity: 0, y: 9 }}
                animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 9 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
              >
                {/* ── Card body ── */}
                <rect
                  x={node.x} y={node.y}
                  width={NW} height={NH}
                  rx={14}
                  fill="rgba(255,255,255,0.91)"
                  stroke={checked ? 'rgba(45,27,142,0.18)' : 'rgba(0,0,0,0.05)'}
                  strokeWidth={checked ? 1.2 : 0.8}
                  filter={checked ? 'url(#ca)' : 'url(#cs)'}
                />

                {/* Left accent bar */}
                <rect
                  x={node.x + 1} y={node.y + 9}
                  width={4} height={NH - 18}
                  rx={2}
                  fill={st.bar}
                  opacity={0.88}
                />

                {/* Main label — bold */}
                <text
                  x={node.x + 20} y={cy - 9}
                  dominantBaseline="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="13.5" fontWeight="640"
                  fill="rgba(10,10,9,0.82)"
                >
                  {node.label}
                </text>

                {/* Sub-label — muted */}
                <text
                  x={node.x + 20} y={cy + 10}
                  dominantBaseline="middle"
                  fontFamily="Inter, sans-serif"
                  fontSize="10.5" fontWeight="400"
                  fill="rgba(10,10,9,0.40)"
                >
                  {node.sub}
                </text>

                {/* ── Status badge — top-right corner ── */}
                <g transform={`translate(${node.x + NW - 14}, ${node.y + 14})`}>
                  {/* Badge circle — appears with node */}
                  <circle
                    r={10}
                    fill={`${st.badge}1A`}
                    stroke={st.badge}
                    strokeWidth="1.1"
                    opacity={visible ? 0.90 : 0}
                  />
                  {/* Tick — draws in when checked */}
                  <motion.path
                    d="M -4.5 0.5 L -1.5 4 L 5 -3.5"
                    stroke={st.badge}
                    strokeWidth="1.8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: checked ? 1 : 0,
                      opacity:    checked ? 1 : 0,
                    }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  />
                </g>
              </motion.g>
            );
          })}
        </svg>
      </div>

      {/* ── Mobile fallback ── */}
      <div className="md:hidden space-y-2 max-w-xs mx-auto">
        {NODES.map((node) => {
          const st = STYLE[node.type];
          return (
            <div
              key={node.id}
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgba(255,255,255,0.90)',
                borderLeft: `4px solid ${st.bar}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div
                className="font-inter text-sm font-semibold"
                style={{ color: 'rgba(10,10,9,0.80)' }}
              >
                {node.label}
              </div>
              <div
                className="font-inter text-xs mt-0.5"
                style={{ color: 'rgba(10,10,9,0.44)' }}
              >
                {node.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
