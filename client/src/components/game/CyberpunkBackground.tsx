import { useEffect, useState } from "react";

interface FloatingShape {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  type: 'circle' | 'triangle' | 'hexagon';
  color: string;
}

export default function CyberpunkBackground() {
  const [shapes, setShapes] = useState<FloatingShape[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    // Generate floating geometric shapes
    const newShapes: FloatingShape[] = [];
    const colors = ['#22d3ee', '#8b5cf6', '#ec4899', '#f59e0b'];
    
    for (let i = 0; i < 25; i++) {
      newShapes.push({
        id: `shape-${i}`,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 30 + 10,
        opacity: Math.random() * 0.3 + 0.1,
        type: ['circle', 'triangle', 'hexagon'][Math.floor(Math.random() * 3)] as any,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setShapes(newShapes);

    // Animation loop
    const interval = setInterval(() => {
      setTime(t => t + 1);
      setShapes(prevShapes => 
        prevShapes.map(shape => ({
          ...shape,
          x: (shape.x + shape.vx + window.innerWidth) % window.innerWidth,
          y: (shape.y + shape.vy + window.innerHeight) % window.innerHeight,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const renderShape = (shape: FloatingShape) => {
    const style = {
      left: shape.x,
      top: shape.y,
      opacity: shape.opacity * (0.5 + 0.5 * Math.sin(time * 0.02 + shape.id.length)),
      transform: `rotate(${time * 0.5 + shape.id.length}deg)`,
      pointerEvents: 'none' as const,
    };

    if (shape.type === 'circle') {
      return (
        <div
          key={shape.id}
          className="absolute rounded-full border-2 transition-opacity duration-1000"
          style={{
            ...style,
            width: shape.size,
            height: shape.size,
            borderColor: shape.color,
            background: `radial-gradient(circle, ${shape.color}20, transparent)`
          }}
        />
      );
    } else if (shape.type === 'triangle') {
      return (
        <div
          key={shape.id}
          className="absolute transition-opacity duration-1000"
          style={{
            ...style,
            width: 0,
            height: 0,
            borderLeft: `${shape.size/2}px solid transparent`,
            borderRight: `${shape.size/2}px solid transparent`,
            borderBottom: `${shape.size}px solid ${shape.color}40`,
          }}
        />
      );
    } else {
      return (
        <div
          key={shape.id}
          className="absolute transition-opacity duration-1000"
          style={{
            ...style,
            width: shape.size,
            height: shape.size,
            background: `conic-gradient(${shape.color}60, transparent, ${shape.color}40)`,
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
          }}
        />
      );
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Dynamic gradient background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 60%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23, #1a0b2e, #16213e)
          `
        }}
      />
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {shapes.map(renderShape)}
      </div>
      
      {/* Subtle moving lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <path
            key={`line-${i}`}
            d={`M ${-100} ${(i * window.innerHeight) / 8} Q ${window.innerWidth / 2} ${((i + 0.5) * window.innerHeight) / 8} ${window.innerWidth + 100} ${(i * window.innerHeight) / 8}`}
            stroke="rgba(34, 211, 238, 0.1)"
            strokeWidth="2"
            fill="none"
            opacity={0.3 + 0.2 * Math.sin(time * 0.01 + i)}
            className="transition-opacity duration-2000"
          />
        ))}
      </svg>
      
      {/* Data stream effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={`stream-${i}`}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-20"
            style={{
              left: `${(i * 100) / 12}%`,
              height: '200px',
              top: `${-200 + ((time + i * 50) % (window.innerHeight + 400))}px`,
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}