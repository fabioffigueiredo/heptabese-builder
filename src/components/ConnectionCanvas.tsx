
import { useEffect, useRef, useState } from "react";

interface Connection {
  id: string;
  fromCardId: string;
  toCardId: string;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
}

interface ConnectionCanvasProps {
  connections: Connection[];
  onConnectionUpdate: (connections: Connection[]) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  pan: { x: number; y: number };
}

export default function ConnectionCanvas({ 
  connections, 
  onConnectionUpdate, 
  containerRef,
  zoom,
  pan 
}: ConnectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const updateCanvasSize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
    };
  }, [containerRef]);

  // Draw connections using HTML5 Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformations
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    connections.forEach((connection) => {
      const fromX = connection.fromPosition.x;
      const fromY = connection.fromPosition.y;
      const toX = connection.toPosition.x;
      const toY = connection.toPosition.y;

      // Calculate control points for bezier curve
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const controlOffset = Math.min(distance * 0.3, 100);

      const control1X = fromX + controlOffset;
      const control1Y = fromY;
      const control2X = toX - controlOffset;
      const control2Y = toY;

      // Draw curved line
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, toX, toY);
      ctx.strokeStyle = "hsl(262 40% 70%)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(deltaY, deltaX);
      const arrowLength = 12;
      const arrowAngle = Math.PI / 6;

      const arrowPoint1X = toX - arrowLength * Math.cos(angle - arrowAngle);
      const arrowPoint1Y = toY - arrowLength * Math.sin(angle - arrowAngle);
      const arrowPoint2X = toX - arrowLength * Math.cos(angle + arrowAngle);
      const arrowPoint2Y = toY - arrowLength * Math.sin(angle + arrowAngle);

      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(toX, toY);
      ctx.lineTo(arrowPoint1X, arrowPoint1Y);
      ctx.moveTo(toX, toY);
      ctx.lineTo(arrowPoint2X, arrowPoint2Y);
      ctx.strokeStyle = "hsl(262 40% 70%)";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    ctx.restore();
  }, [connections, zoom, pan, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ 
        width: canvasSize.width,
        height: canvasSize.height,
      }}
    />
  );
}
