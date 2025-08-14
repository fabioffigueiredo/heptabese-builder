import { useEffect, useRef } from "react";
import { Position } from "@/types/whiteboard";

interface DynamicGridProps {
  zoom: number;
  pan: Position;
  containerSize: { width: number; height: number };
  visible: boolean;
  className?: string;
}

export default function DynamicGrid({
  zoom,
  pan,
  containerSize,
  visible,
  className = ""
}: DynamicGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !pan || typeof pan.x !== 'number' || typeof pan.y !== 'number') return;
    
    const canvas = canvasRef.current;
    if (!canvas || containerSize.width === 0 || containerSize.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, containerSize.width, containerSize.height);

    // Calculate grid spacing based on zoom
    const baseSpacing = 50;
    let spacing = baseSpacing * zoom;
    
    // Adjust spacing to maintain readability
    while (spacing < 10) spacing *= 2;
    while (spacing > 100) spacing /= 2;

    // Calculate grid offset with safe pan values
    const safeX = pan?.x || 0;
    const safeY = pan?.y || 0;
    const offsetX = (safeX % spacing + spacing) % spacing;
    const offsetY = (safeY % spacing + spacing) % spacing;

    // Set grid style
    ctx.strokeStyle = `hsl(var(--border))`;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = Math.min(0.5, zoom * 0.3);

    // Draw vertical lines
    for (let x = offsetX; x < containerSize.width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, containerSize.height);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = offsetY; y < containerSize.height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(containerSize.width, y);
      ctx.stroke();
    }

    // Draw major grid lines (every 5th line)
    ctx.strokeStyle = `hsl(var(--border))`;
    ctx.lineWidth = 1;
    ctx.globalAlpha = Math.min(0.3, zoom * 0.2);

    const majorSpacing = spacing * 5;
    const majorOffsetX = (safeX % majorSpacing + majorSpacing) % majorSpacing;
    const majorOffsetY = (safeY % majorSpacing + majorSpacing) % majorSpacing;

    // Draw major vertical lines
    for (let x = majorOffsetX; x < containerSize.width; x += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, containerSize.height);
      ctx.stroke();
    }

    // Draw major horizontal lines
    for (let y = majorOffsetY; y < containerSize.height; y += majorSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(containerSize.width, y);
      ctx.stroke();
    }

    // Draw origin indicator
    if (zoom > 0.1) {
      const originX = safeX;
      const originY = safeY;
      
      if (originX >= 0 && originX <= containerSize.width && 
          originY >= 0 && originY <= containerSize.height) {
        ctx.strokeStyle = `hsl(var(--primary))`;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        
        // Draw cross at origin
        const crossSize = 10;
        ctx.beginPath();
        ctx.moveTo(originX - crossSize, originY);
        ctx.lineTo(originX + crossSize, originY);
        ctx.moveTo(originX, originY - crossSize);
        ctx.lineTo(originX, originY + crossSize);
        ctx.stroke();
        
        // Draw origin circle
        ctx.beginPath();
        ctx.arc(originX, originY, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(var(--primary))`;
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }, [zoom, pan, containerSize, visible]);

  if (!visible || containerSize.width === 0 || containerSize.height === 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none z-5 ${className}`}
      style={{
        width: containerSize.width,
        height: containerSize.height
      }}
    />
  );
}