import { motion } from "framer-motion";
import { Word, useWordRain } from "../../lib/stores/useWordRain";

interface FallingWordProps {
  word: Word;
}

// Utility function to wrap text at word boundaries
const wrapText = (text: string, maxWidth: number, fontSize: number, fontFamily: string): string[] => {
  // Create a temporary canvas to measure text accurately
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback: simple word-based wrapping
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length * fontSize * 0.6 > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    return lines;
  }
  
  // Set font and measure text
  ctx.font = `${fontSize}px ${fontFamily}`;
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
};

export default function FallingWord({ word }: FallingWordProps) {
  const { text, x, y, fontSize, fontFamily, cursorPosition, completed, rotation, rotationDirection, rotationCenterX, rotationCenterY } = word;
  
  // Calculate rotation speed based on difficulty (wordsTyped)
  // Get the current game state to determine difficulty
  const { wordsTyped } = useWordRain.getState();
  const difficulty = Math.floor(wordsTyped / 10);
  const rotationSpeed = Math.max(12 - (difficulty * 1), 3); // Start at 12 seconds per rotation, decrease by 1 second every 10 words, minimum 3 seconds

  if (completed) return null;

  // Determine if this is a long phrase that needs wrapping
  // Lowered thresholds for easier testing - can be adjusted back later
  const isLongPhrase = text.length > 15 || text.includes(' ') && text.length > 12;
  const maxLineWidth = isLongPhrase ? Math.min(window.innerWidth * 0.8, 400) : undefined;
  
  // Wrap text if needed
  const lines = isLongPhrase && maxLineWidth 
    ? wrapText(text, maxLineWidth, fontSize, fontFamily)
    : [text];
  
  // Calculate total height for multi-line text
  const lineHeight = fontSize * 1.2;
  const totalHeight = lines.length * lineHeight;

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
      <div className="relative" style={{ lineHeight: `${lineHeight}px` }}>
        {lines.map((line, lineIndex) => {
          // Calculate cursor position for this line
          let lineStartIndex = 0;
          let lineEndIndex = 0;
          
          if (lines.length > 1) {
            // Calculate character positions for each line
            for (let i = 0; i < lineIndex; i++) {
              lineStartIndex += lines[i].length + 1; // +1 for space
            }
            lineEndIndex = lineStartIndex + line.length;
          } else {
            lineEndIndex = text.length;
          }
          
          return (
            <div key={lineIndex} className="relative whitespace-pre">
              {line.split("").map((letter, letterIndex) => {
                const globalIndex = lineStartIndex + letterIndex;
                const isCompleted = globalIndex < cursorPosition;
                const isCurrent = globalIndex === cursorPosition;
                
                return (
                  <span
                    key={letterIndex}
                    className={`inline-block transition-all duration-200 relative ${
                      isCompleted
                        ? "text-green-400 scale-110"
                        : isCurrent
                        ? "text-yellow-300"
                        : "text-gray-300"
                    }`}
                    style={{
                      textShadow: isCompleted 
                        ? "0 0 8px rgba(34, 197, 94, 0.6)" 
                        : isCurrent 
                        ? "0 0 8px rgba(253, 224, 71, 0.8)" 
                        : "2px 2px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                    {isCurrent && (
                      <span 
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400 animate-pulse"
                        style={{
                          boxShadow: "0 0 4px rgba(253, 224, 71, 0.8)"
                        }}
                      />
                    )}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
