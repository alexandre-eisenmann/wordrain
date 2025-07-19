import { motion } from "framer-motion";
import { ExplodingLetter as ExplodingLetterType } from "../../lib/stores/useWordRain";

interface ExplodingLetterProps {
  letter: ExplodingLetterType;
}

export default function ExplodingLetter({ letter }: ExplodingLetterProps) {
  const { char, x, y, vx, vy, fontSize, fontFamily, rotation } = letter;

  return (
    <motion.div
      className="absolute pointer-events-none select-none text-white"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      }}
      initial={{ 
        opacity: 1, 
        scale: 1,
        rotate: 0
      }}
      animate={{ 
        opacity: 0, 
        scale: 0.5,
        rotate: rotation,
        x: vx * 100,
        y: vy * 100,
      }}
      transition={{ 
        duration: 2,
        ease: "easeOut"
      }}
    >
      {char}
    </motion.div>
  );
}
