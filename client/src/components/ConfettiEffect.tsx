import { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  onComplete?: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

export function ConfettiEffect({ trigger, onComplete }: ConfettiEffectProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    console.log('ConfettiEffect: trigger =', trigger, 'isAnimating =', isAnimating);
    if (trigger && !isAnimating) {
      console.log('🎊 Starting confetti animation!');
      setIsAnimating(true);
      
      // Create confetti pieces
      const pieces: ConfettiPiece[] = [];
      const colors = [
        'hsl(var(--primary))',
        'hsl(var(--secondary))',
        '#FFD700', // gold
        '#FF69B4', // pink
        '#00CED1', // turquoise
        '#FF6347', // tomato
        '#9370DB', // purple
        '#32CD32', // lime
      ];
      
      // Generate 100 confetti pieces (more dramatic!)
      for (let i = 0; i < 100; i++) {
        pieces.push({
          id: i,
          x: Math.random() * 100, // percentage
          y: -10, // start above viewport
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 12 + 8, // 8-20px (bigger)
          velocityX: (Math.random() - 0.5) * 2, // -1 to 1 (slower horizontal)
          velocityY: Math.random() * 1 + 0.5, // 0.5 to 1.5 (much slower fall - sparkle effect)
          rotationSpeed: (Math.random() - 0.5) * 8, // -4 to 4 (slower rotation)
        });
      }
      
      setConfetti(pieces);
      
      // Animate confetti
      let animationFrame: number;
      let startTime = Date.now();
      const duration = 4000; // 4 seconds (slightly longer)
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= duration) {
          setConfetti([]);
          setIsAnimating(false);
          if (onComplete) onComplete();
          return;
        }
        
        setConfetti((prev) =>
          prev.map((piece) => ({
            ...piece,
            x: piece.x + piece.velocityX * 0.5, // Gentle horizontal movement
            y: piece.y + piece.velocityY,
            rotation: piece.rotation + piece.rotationSpeed,
            velocityY: piece.velocityY + 0.03, // Very light gravity - sparkle effect
          }))
        );
        
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      };
    }
  }, [trigger, isAnimating, onComplete]);

  if (!isAnimating || confetti.length === 0) {
    if (confetti.length > 0) {
      console.log('⚠️ Confetti exists but isAnimating is false');
    }
    return null;
  }

  console.log('✨ Rendering', confetti.length, 'confetti pieces');
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: piece.id % 3 === 0 ? '50%' : piece.id % 3 === 1 ? '20%' : '0%',
            transition: 'none',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 0 20px rgba(255,255,255,0.5)',
            opacity: 0.95,
          }}
        />
      ))}
    </div>
  );
}

