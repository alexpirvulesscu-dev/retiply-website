import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export interface ServiceCard {
  name: string;
  outcome: string;
  pills: string[];
}

interface Props {
  cards: ServiceCard[];
}

function Card({ card, index, total }: { card: ServiceCard; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });

  // Each card scales very slightly as it enters, creating the stacking illusion
  const scale = useTransform(scrollYProgress, [0, 1], [0.97, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [40, 0]);

  // Cards stack with a top offset so previous ones peek out
  const stackOffset = index * 12;

  return (
    <div
      ref={ref}
      style={{ paddingTop: index === 0 ? 0 : `${stackOffset}px`, position: "relative" }}
    >
      <motion.div
        style={{ scale, y }}
        className="sticky"
        // Each card's sticky top increases so they stack sequentially
        css-top={`${64 + index * 12}px`}
        sx-sticky-top={`${64 + index * 12}px`}
      >
        <div
          style={{
            background: "#ffffff",
            border: "1.5px solid #e0ddf5",
            borderLeft: "4px solid #3d2fb5",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "0",
          }}
        >
          <div style={{ display: "flex", minHeight: "140px" }}>
            {/* Left panel — 36% */}
            <div
              style={{
                width: "36%",
                flexShrink: 0,
                borderRight: "1.5px solid #e0ddf5",
                padding: "28px 24px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#3d2fb5",
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                {card.name}
              </p>
            </div>

            {/* Right panel — 64% */}
            <div
              style={{
                width: "64%",
                padding: "28px 28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <p
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "#1a1a2e",
                  lineHeight: 1.45,
                  margin: 0,
                }}
              >
                {card.outcome}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {card.pills.map((pill) => (
                  <span
                    key={pill}
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      color: "#3d2fb5",
                      background: "#f4f2ff",
                      border: "1px solid #c4bef0",
                      borderRadius: "999px",
                      padding: "4px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function StackingCards({ cards }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {cards.map((card, i) => (
        <Card key={card.name} card={card} index={i} total={cards.length} />
      ))}
    </div>
  );
}
