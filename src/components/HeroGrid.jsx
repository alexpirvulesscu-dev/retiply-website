import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

// Lines connecting grid intersection points (28px grid, ViewBox 1200x700)
// Positioned in corners/edges to avoid overlapping the centred headline
const LINES = [
  { x1: 84,  y1: 112, x2: 280, y2: 224 },
  { x1: 280, y1: 224, x2: 420, y2: 140 },
  { x1: 420, y1: 140, x2: 532, y2: 252 },
  { x1: 56,  y1: 392, x2: 196, y2: 476 },
  { x1: 196, y1: 476, x2: 420, y2: 504 },
  { x1: 840, y1: 84,  x2: 1008, y2: 196 },
  { x1: 1008, y1: 196, x2: 1092, y2: 364 },
  { x1: 1092, y1: 364, x2: 1148, y2: 504 },
  { x1: 700, y1: 560, x2: 896, y2: 532 },
  { x1: 896, y1: 532, x2: 1064, y2: 588 },
];

// Glowing dots at all connection endpoints
const DOTS = [
  { x: 84,   y: 112 }, { x: 280,  y: 224 }, { x: 420,  y: 140 },
  { x: 532,  y: 252 }, { x: 56,   y: 392 }, { x: 196,  y: 476 },
  { x: 420,  y: 504 }, { x: 840,  y: 84  }, { x: 1008, y: 196 },
  { x: 1092, y: 364 }, { x: 1148, y: 504 }, { x: 700,  y: 560 },
  { x: 896,  y: 532 }, { x: 1064, y: 588 },
];

export default function HeroGrid() {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }}>

      {/* Fine dot grid — always visible at low opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Hover lines + glowing dots — desktop only */}
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full hidden md:block"
        aria-hidden="true"
      >
        {/* Connection lines draw in with a stagger */}
        {LINES.map((ln, i) => (
          <motion.path
            key={`ln-${i}`}
            d={`M ${ln.x1} ${ln.y1} L ${ln.x2} ${ln.y2}`}
            stroke="rgba(45,27,142,0.40)"
            strokeWidth="1.2"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: isHovered ? 1 : 0,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{
              pathLength: { duration: 0.5, delay: isHovered ? i * 0.07 : 0, ease: 'easeOut' },
              opacity:     { duration: 0.3, delay: isHovered ? i * 0.07 : 0 },
            }}
          />
        ))}

        {/* Glowing dots at intersection points */}
        {DOTS.map((dot, i) => (
          <motion.circle
            key={`dot-${i}`}
            cx={dot.x}
            cy={dot.y}
            r="3.5"
            fill="rgba(45,27,142,0.65)"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25, delay: isHovered ? i * 0.05 : 0 }}
          />
        ))}
      </svg>
    </div>
  );
}
