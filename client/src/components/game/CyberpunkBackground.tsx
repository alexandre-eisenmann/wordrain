import { useEffect, useState } from "react";

interface GridLine {
  id: string;
  x: number;
  y: number;
  opacity: number;
  direction: 'horizontal' | 'vertical';
}

export default function CyberpunkBackground() {
  const [gridLines, setGridLines] = useState<GridLine[]>([]);

  useEffect(() => {
    // Generate grid lines
    const lines: GridLine[] = [];
    
    // Vertical lines
    for (let i = 0; i < 20; i++) {
      lines.push({
        id: `v-${i}`,
        x: (window.innerWidth / 20) * i,
        y: 0,
        opacity: Math.random() * 0.3 + 0.1,
        direction: 'vertical'
      });
    }
    
    // Horizontal lines
    for (let i = 0; i < 15; i++) {
      lines.push({
        id: `h-${i}`,
        x: 0,
        y: (window.innerHeight / 15) * i,
        opacity: Math.random() * 0.3 + 0.1,
        direction: 'horizontal'
      });
    }
    
    setGridLines(lines);
    
    // Keep grid static to avoid movement illusion
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Animated Grid */}
      <svg className="absolute inset-0 w-full h-full">
        {gridLines.map((line) => (
          <line
            key={line.id}
            x1={line.direction === 'vertical' ? line.x : 0}
            y1={line.direction === 'vertical' ? 0 : line.y}
            x2={line.direction === 'vertical' ? line.x : window.innerWidth}
            y2={line.direction === 'vertical' ? window.innerHeight : line.y}
            stroke="rgb(34, 211, 238)"
            strokeWidth="1"
            opacity={line.opacity}
            className="transition-opacity duration-2000"
          />
        ))}
      </svg>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>
      
      {/* Scanlines effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(34, 211, 238, 0.3) 2px,
            rgba(34, 211, 238, 0.3) 4px
          )`
        }}
      />
    </div>
  );
}