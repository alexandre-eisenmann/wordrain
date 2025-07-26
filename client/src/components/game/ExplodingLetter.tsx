import { motion } from "framer-motion";
import { ExplodingLetter as ExplodingLetterType } from "../../lib/stores/useWordRain";

interface ExplodingLetterProps {
  letter: ExplodingLetterType;
}

export default function ExplodingLetter({ letter }: ExplodingLetterProps) {
  const { char, x, y, vx, vy, fontSize, fontFamily, rotation, duration } = letter;
  
  // Calculate size factor for proportional visual effects
  const sizeFactor = Math.max(0.2, Math.min(2.5, fontSize / 40));

  return (
    <motion.div
      className="absolute pointer-events-none select-none text-white"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        textShadow: `${2 * sizeFactor}px ${2 * sizeFactor}px ${4 * sizeFactor}px rgba(0,0,0,0.5)`,
      }}
      initial={{ 
        opacity: 1, 
        scale: 1,
        rotate: 0,
        x: x,
        y: y
      }}
      animate={{ 
        opacity: 0, 
        scale: 0.3 * sizeFactor, // Proportional scale animation
        rotate: rotation,
        x: x + vx,
        y: y + vy
      }}
      transition={{ 
        duration: duration,
        ease: "easeOut",
        rotate: {
          duration: duration,
          ease: "easeOut",
        }
      }}
    >
      {char}
    </motion.div>
  );
}
