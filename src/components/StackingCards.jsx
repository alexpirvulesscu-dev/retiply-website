import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const NAV_TOP = 64;   // px from top where cards start stacking
const STACK_GAP = 12; // px offset per card when stacked

function CardItem({ card, index }) {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <div
      ref={ref}
      style={{ position: 'sticky', top: `${NAV_TOP + index * STACK_GAP}px` }}
      className="mb-4 last:mb-0"
    >
      <motion.div
        style={{
          scale,
          background: card.gradient,
        }}
        className="rounded-2xl p-8 min-h-[220px] flex flex-col justify-between overflow-hidden"
      >
        <div>
          <h3 className="font-poppins font-semibold text-xl text-white leading-snug mb-2">
            {card.title}
          </h3>
          {card.description && (
            <p className="font-inter text-sm text-white/70 leading-relaxed">
              {card.description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-inter font-medium text-white/80 bg-white/10 border border-white/15 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function StackingCards({ cards, heading, subheading }) {
  const CALENDLY_URL = '#contact';

  return (
    <section className="py-24 px-6 bg-brand-bg">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="mb-14">
          <p className="section-label">What we do</p>
          <h2 className="font-poppins font-bold text-3xl md:text-5xl text-brand-text max-w-xl leading-tight">
            {heading ?? 'We take the manual work out of running your business.'}
          </h2>
          {subheading && (
            <p className="font-inter text-brand-muted text-base mt-4 max-w-lg">
              {subheading}
            </p>
          )}
        </div>

        {/* Two-column layout: sticky left / stacking right */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 mb-16">

          {/* Left column — sticky on desktop */}
          <div className="lg:w-2/5 lg:sticky lg:top-24 lg:self-start">
            <p className="font-poppins font-semibold text-xl text-brand-text mb-4">
              Whether it's your finances, your pipeline, or your team's day-to-day — we cut the manual work so your people can focus on what actually grows the business.
            </p>
            <p className="font-inter text-brand-muted text-sm leading-relaxed mb-8">
              Every system we build is custom to how you already work. No big changes. No new software to learn overnight. Just clean automation that sticks.
            </p>
            <a
              href={CALENDLY_URL}
              className="inline-flex items-center gap-3 bg-brand-accent text-white rounded-full pl-6 pr-1.5 py-1.5 font-inter font-medium text-sm hover:bg-brand-accent-light transition-colors duration-200"
            >
              Let's Talk
              <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M2.5 7h9M7.5 3.5 11 7l-3.5 3.5" stroke="#2D1B8E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </a>
          </div>

          {/* Right column — stacking cards */}
          <div className="lg:w-3/5">
            {cards.map((card, index) => (
              <CardItem key={card.title} card={card} index={index} />
            ))}
          </div>

        </div>

        {/* Bottom note */}
        <p className="font-inter text-brand-muted text-sm text-center">
          Not sure which one you need? We'll figure it out together on the call.
        </p>

      </div>
    </section>
  );
}
