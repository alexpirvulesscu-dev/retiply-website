import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Node dimensions
const NODE_W = 120;
const NODE_H = 40;
const NHalf  = NODE_H / 2; // 20

// ─── Nodes ───────────────────────────────────────────────────────────────────
// Positioned inside a 640 × 260 viewBox.
// x/y = top-left corner of the node rect.
//   Top row:    Webhook → Filter Data → Transform → Send Email
//   Bottom row:             └──────→ Update CRM → Notify Slack
const NODES = [
  { label: 'Webhook',      x: 10,  y: 65  },  // 0
  { label: 'Filter Data',  x: 170, y: 65  },  // 1
  { label: 'Transform',    x: 330, y: 65  },  // 2
  { label: 'Send Email',   x: 500, y: 65  },  // 3
  { label: 'Update CRM',   x: 330, y: 170 },  // 4
  { label: 'Notify Slack', x: 500, y: 170 },  // 5
];

// ─── Paths ───────────────────────────────────────────────────────────────────
// Right edge of source = x + NODE_W.  Left edge of target = x.
// Centre Y of source/target = y + NHalf.
const PATHS = [
  // 0→1  horizontal  (130,85) → (170,85)
  'M 130 85 C 150 85, 150 85, 170 85',
  // 1→2  horizontal  (290,85) → (330,85)
  'M 290 85 C 310 85, 310 85, 330 85',
  // 2→3  horizontal  (450,85) → (500,85)
  'M 450 85 C 475 85, 475 85, 500 85',
  // 1→4  branch down  (290,85) → (330,190)
  'M 290 85 C 330 85, 290 190, 330 190',
  // 4→5  horizontal  (450,190) → (500,190)
  'M 450 190 C 475 190, 475 190, 500 190',
];

// ─── Animation steps ─────────────────────────────────────────────────────────
// Each step declares which node indices are visible, which lines are drawn,
// and which nodes show a completed (green check) state.
const STEPS = [
  { nodes: [0],                lines: [],             checked: []          },
  { nodes: [0],                lines: [0],            checked: []          },
  { nodes: [0, 1],             lines: [0],            checked: [0]         },
  { nodes: [0, 1],             lines: [0, 1, 3],      checked: [0]         },
  { nodes: [0, 1, 2, 4],       lines: [0, 1, 3],      checked: [0, 1]      },
  { nodes: [0, 1, 2, 4],       lines: [0, 1, 2, 3, 4], checked: [0, 1]    },
  { nodes: [0, 1, 2, 3, 4, 5], lines: [0, 1, 2, 3, 4], checked: [0, 1, 2, 4]        },
  { nodes: [0, 1, 2, 3, 4, 5], lines: [0, 1, 2, 3, 4], checked: [0, 1, 2, 3, 4, 5] },
];

// How long to hold each step (ms) before advancing
const STEP_DURATIONS = [300, 600, 500, 600, 500, 600, 900, 2000];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function WorkflowBackground() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  // Attach mouseenter / mouseleave to the hero section
  useEffect(() => {
    const hero = document.getElementById('hero-section');
    if (!hero) return;

    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);

    hero.addEventListener('mouseenter', onEnter);
    hero.addEventListener('mouseleave', onLeave);

    return () => {
      hero.removeEventListener('mouseenter', onEnter);
      hero.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Run animation loop while hovered; reset on leave
  useEffect(() => {
    if (!isHovered) {
      setActiveStep(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        for (let i = 0; i < STEPS.length; i++) {
          if (cancelled) return;
          setActiveStep(i);
          await sleep(STEP_DURATIONS[i]);
        }
        // Pause then reset before replaying
        await sleep(800);
        if (!cancelled) setActiveStep(null);
        await sleep(400);
      }
    };

    run();

    return () => {
      cancelled = true;
      setActiveStep(null);
    };
  }, [isHovered]);

  const step = activeStep !== null
    ? STEPS[activeStep]
    : { nodes: [], lines: [], checked: [] };

  return (
    <div
      className="absolute inset-0 pointer-events-none hidden md:block"
      style={{
        zIndex: 3,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.45s ease',
      }}
    >
      {/*
        SVG sits in the lower-right quadrant of the hero so it never
        obscures the headline text (which is centred in the top half).
      */}
      <svg
        viewBox="0 0 640 260"
        preserveAspectRatio="xMidYMid meet"
        className="absolute"
        style={{
          bottom: '5%',
          right: '2%',
          width: '52%',
          maxWidth: '640px',
          height: 'auto',
          opacity: 0.52,
        }}
        aria-hidden="true"
      >
        <defs>
          <marker
            id="wf-arrow"
            markerWidth="7"
            markerHeight="5.5"
            refX="6.5"
            refY="2.75"
            orient="auto"
          >
            <path d="M 0 0.5 L 6.5 2.75 L 0 5 z" fill="rgba(45,27,142,0.35)" />
          </marker>
        </defs>

        {/* ── Connection lines ── */}
        {PATHS.map((d, i) => (
          <motion.path
            key={`line-${i}`}
            d={d}
            stroke="rgba(45,27,142,0.28)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#wf-arrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: step.lines.includes(i) ? 1 : 0,
              opacity:    step.lines.includes(i) ? 1 : 0,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        ))}

        {/* ── Nodes ── */}
        {NODES.map((node, i) => {
          const visible = step.nodes.includes(i);
          const checked = step.checked.includes(i);
          const cy = node.y + NHalf; // vertical centre of the node

          return (
            <motion.g
              key={`node-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Card body */}
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx="8"
                fill="rgba(255,255,255,0.07)"
                stroke={checked ? 'rgba(45,27,142,0.45)' : 'rgba(45,27,142,0.18)'}
                strokeWidth="1"
              />

              {/* Type-indicator dot */}
              <circle
                cx={node.x + 16}
                cy={cy}
                r="4.5"
                fill={checked ? 'rgba(45,27,142,0.35)' : 'rgba(45,27,142,0.15)'}
              />

              {/* Label */}
              <text
                x={node.x + 28}
                y={cy + 4}
                fontFamily="Inter, sans-serif"
                fontSize="11"
                fontWeight="500"
                fill="rgba(45,27,142,0.45)"
              >
                {node.label}
              </text>

              {/* Checkmark badge */}
              <g transform={`translate(${node.x + NODE_W - 13}, ${cy})`}>
                <motion.circle
                  r="7.5"
                  fill="rgba(34,197,94,0.12)"
                  stroke="rgba(34,197,94,0.60)"
                  strokeWidth="0.9"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: checked ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.path
                  d="M -3 0.5 L -0.5 3 L 4.5 -2.5"
                  stroke="rgba(34,197,94,0.92)"
                  strokeWidth="1.4"
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
  );
}
