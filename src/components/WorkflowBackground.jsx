import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Node box dimensions
const NODE_W = 130;
const NODE_H = 40;

// Workflow nodes — positioned inside a 1080×580 viewBox
const NODES = [
  { label: 'Webhook',      x: 60,  y: 270 },
  { label: 'Filter Data',  x: 290, y: 270 },
  { label: 'Transform',    x: 530, y: 195 },
  { label: 'Send Email',   x: 780, y: 195 },
  { label: 'Update CRM',   x: 530, y: 345 },
  { label: 'Notify Slack', x: 780, y: 345 },
];

// SVG path strings: right edge of source → left edge of target
// Node right edge = x + NODE_W, center Y = y + NODE_H/2
const PATHS = [
  // 0→1 horizontal: (190,290) → (290,290)
  'M 190 290 L 290 290',
  // 1→2 upward curve: (420,284) → (530,215)
  'M 420 284 C 480 284 474 215 530 215',
  // 2→3 horizontal: (660,215) → (780,215)
  'M 660 215 L 780 215',
  // 1→4 downward curve: (420,296) → (530,365)
  'M 420 296 C 480 296 474 365 530 365',
  // 4→5 horizontal: (660,365) → (780,365)
  'M 660 365 L 780 365',
];

// Animation steps: each step defines visible nodes, visible lines, and checked nodes
const STEPS = [
  { nodes: [0],             lines: [],          checked: []             },
  { nodes: [0],             lines: [0],         checked: []             },
  { nodes: [0, 1],          lines: [0],         checked: [0]            },
  { nodes: [0, 1],          lines: [0, 1, 3],   checked: [0]            },
  { nodes: [0, 1, 2, 4],    lines: [0, 1, 3],   checked: [0, 1]         },
  { nodes: [0, 1, 2, 4],    lines: [0, 1, 2, 3, 4], checked: [0, 1]    },
  { nodes: [0, 1, 2, 3, 4, 5], lines: [0, 1, 2, 3, 4], checked: [0, 1, 2, 4]         },
  { nodes: [0, 1, 2, 3, 4, 5], lines: [0, 1, 2, 3, 4], checked: [0, 1, 2, 3, 4, 5]  },
];

// How long to stay on each step before advancing (ms)
const STEP_DURATIONS = [300, 600, 500, 600, 500, 600, 900, 1800];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function WorkflowBackground() {
  const [isHovered, setIsHovered] = useState(false);
  const [activeStep, setActiveStep] = useState(null);

  // Attach mouseenter / mouseleave to the hero section by ID
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

  // Run the animation loop while hovered; reset immediately on leave
  useEffect(() => {
    if (!isHovered) {
      setActiveStep(null);
      return;
    }

    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        // Step through each animation frame
        for (let i = 0; i < STEPS.length; i++) {
          if (cancelled) return;
          setActiveStep(i);
          await sleep(STEP_DURATIONS[i]);
        }

        // Brief pause at end before looping
        await sleep(1000);
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
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: 2,
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    >
      {/* Fine dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.10) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Workflow SVG — hidden on touch devices (no hover there) */}
      <svg
        viewBox="0 0 1080 580"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full hidden md:block"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="wf-arrow"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <path d="M 0 0 L 7 3 L 0 6 z" fill="rgba(45,27,142,0.4)" />
          </marker>
        </defs>

        {/* Connection lines */}
        {PATHS.map((d, i) => (
          <motion.path
            key={`line-${i}`}
            d={d}
            stroke="rgba(45,27,142,0.35)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#wf-arrow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: step.lines.includes(i) ? 1 : 0,
              opacity: step.lines.includes(i) ? 1 : 0,
            }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
          />
        ))}

        {/* Nodes */}
        {NODES.map((node, i) => {
          const visible = step.nodes.includes(i);
          const checked = step.checked.includes(i);
          const cy = node.y + NODE_H / 2;

          return (
            <motion.g
              key={`node-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: visible ? 1 : 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Node card */}
              <rect
                x={node.x}
                y={node.y}
                width={NODE_W}
                height={NODE_H}
                rx="8"
                fill="rgba(255,255,255,0.08)"
                stroke={
                  checked
                    ? 'rgba(45,27,142,0.55)'
                    : 'rgba(45,27,142,0.22)'
                }
                strokeWidth="1"
              />

              {/* Coloured dot (node type indicator) */}
              <circle
                cx={node.x + 18}
                cy={cy}
                r="5"
                fill={
                  checked
                    ? 'rgba(45,27,142,0.35)'
                    : 'rgba(45,27,142,0.15)'
                }
              />

              {/* Label */}
              <text
                x={node.x + 32}
                y={cy + 4}
                fontFamily="Inter, sans-serif"
                fontSize="11"
                fontWeight="500"
                fill="rgba(10,10,9,0.5)"
              >
                {node.label}
              </text>

              {/* Checkmark badge — draws in using pathLength */}
              <g
                transform={`translate(${node.x + NODE_W - 14}, ${cy})`}
              >
                <motion.circle
                  r="8"
                  fill="rgba(34,197,94,0.12)"
                  stroke="rgba(34,197,94,0.65)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: checked ? 1 : 0 }}
                  transition={{ duration: 0.25 }}
                />
                <motion.path
                  d="M -3.5 0.5 L -1 3 L 4.5 -2.5"
                  stroke="rgba(34,197,94,0.95)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: checked ? 1 : 0,
                    opacity: checked ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </g>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
