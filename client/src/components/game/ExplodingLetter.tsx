import { motion } from "framer-motion";
import { ExplodingLetter as ExplodingLetterType } from "../../lib/stores/useWordRain";

interface ExplodingLetterProps {
  letter: ExplodingLetterType;
}

export default function ExplodingLetter({ letter }: ExplodingLetterProps) {
  const { char, x, y, vx, vy, fontSize, fontFamily, rotation, duration } = letter;
  

  return (
    <motion.div
      className="absolute pointer-events-none select-none text-white"
      style={{
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
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
        scale: 0.3,
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
