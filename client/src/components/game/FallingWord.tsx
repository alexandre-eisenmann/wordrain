import { motion } from "framer-motion";
import { Word, useWordRain } from "../../lib/stores/useWordRain";

interface FallingWordProps {
  word: Word;
}

export default function FallingWord({ word }: FallingWordProps) {
  const { text, x, y, fontSize, fontFamily, cursorPosition, completed, rotation, rotationDirection, rotationCenterX, rotationCenterY } = word;
  
  // Calculate rotation speed based on difficulty (wordsTyped)
  // Get the current game state to determine difficulty
  const { wordsTyped } = useWordRain.getState();
  const difficulty = Math.floor(wordsTyped / 10);
  const rotationSpeed = Math.max(12 - (difficulty * 1), 3); // Start at 12 seconds per rotation, decrease by 1 second every 10 words, minimum 3 seconds

  if (completed) return null;

  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        fontSize: `${fontSize}px`,
        fontFamily: fontFamily,
        transformOrigin: `${rotationCenterX}px ${rotationCenterY}px`,
      }}
      initial={{ opacity: 0, scale: 0.8, rotate: rotation }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        rotate: rotationDirection !== 0 ? [rotation, rotation + (360 * rotationDirection)] : rotation
      }}
      transition={{ 
        duration: 0.3,
        rotate: rotationDirection !== 0 ? {
          duration: rotationSpeed,
          repeat: Infinity,
          ease: "linear"
        } : { duration: 0.3 }
      }}
    >
      <div className="relative whitespace-pre">
        {text.split("").map((letter, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-200 relative ${
              index < cursorPosition
                ? "text-green-400 scale-110"
                : index === cursorPosition
                ? "text-yellow-300"
                : "text-gray-300"
            }`}
            style={{
              textShadow: index < cursorPosition 
                ? "0 0 8px rgba(34, 197, 94, 0.6)" 
                : index === cursorPosition 
                ? "0 0 8px rgba(253, 224, 71, 0.8)" 
                : "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
            {index === cursorPosition && (
              <span 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 animate-pulse"
                style={{
                  boxShadow: "0 0 4px rgba(253, 224, 71, 0.8)"
                }}
              />
            )}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
