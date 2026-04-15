import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const CARD_GRADIENT = 'linear-gradient(135deg, #0f0839 0%, #2D1B8E 100%)';

export default function ServicesGrid({ cards }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '0px 0px -80px 0px' });

  return (
    <section ref={sectionRef} className="relative py-24 px-6 bg-brand-bg">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <div className="mb-14">
          <p className="section-label">What We Do</p>
          <h2 className="font-inter font-bold text-2xl md:text-3xl text-brand-text leading-tight">
            AI systems built by people who've actually run project-based businesses. We know what breaks, why it breaks, and exactly how to fix it.
          </h2>
        </div>

        {/* 3×3 grid — equal cards, centred */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{ scale: 1.04, y: -6, transition: { duration: 0.18, ease: 'easeOut' } }}
              transition={{ delay: i * 0.07, duration: 0.4, ease: 'easeOut' }}
              style={{ background: CARD_GRADIENT, cursor: 'default' }}
              className="rounded-2xl p-7 flex flex-col"
            >
              <h3 className="font-poppins font-semibold text-base text-white leading-snug mb-2">
                {card.title}
              </h3>
              <p
                className="font-inter text-sm leading-relaxed mb-4 flex-1"
                style={{ color: 'rgba(255,255,255,0.68)' }}
              >
                {card.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {card.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs font-inter font-medium rounded-full px-2.5 py-0.5"
                    style={{
                      color: 'rgba(255,255,255,0.78)',
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Section transition gradient */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #E8E4DF)' }}
      />
    </section>
  );
}
