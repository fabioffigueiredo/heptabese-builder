import { useEffect, useRef } from "react";
import { Connection, ConnectionStyle } from "@/types/whiteboard";

interface EnhancedConnectionCanvasProps {
  connections: Connection[];
  onConnectionUpdate: (connections: Connection[]) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  pan: { x: number; y: number };
}

export default function EnhancedConnectionCanvas({
  connections,
  onConnectionUpdate,
  containerRef,
  zoom,
  pan,
}: EnhancedConnectionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan transformation
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw connections
    connections.forEach((connection) => {
      drawConnection(ctx, connection);
    });

    ctx.restore();
  }, [connections, zoom, pan, containerRef]);

  const drawConnection = (ctx: CanvasRenderingContext2D, connection: Connection) => {
    const { fromPosition, toPosition, style } = connection;
    
    ctx.save();
    
    // Set line properties
    ctx.strokeStyle = style.strokeColor;
    ctx.lineWidth = style.strokeWidth;
    
    if (style.strokeDashArray && style.strokeDashArray.length > 0) {
      ctx.setLineDash(style.strokeDashArray);
    } else {
      ctx.setLineDash([]);
    }

    ctx.beginPath();

    switch (style.type) {
      case 'straight':
        drawStraightLine(ctx, fromPosition, toPosition);
        break;
      case 'bezier':
        drawBezierLine(ctx, fromPosition, toPosition);
        break;
      case 'orthogonal':
        drawOrthogonalLine(ctx, fromPosition, toPosition);
        break;
      case 'zigzag':
        drawZigzagLine(ctx, fromPosition, toPosition);
        break;
      default:
        drawBezierLine(ctx, fromPosition, toPosition);
    }

    ctx.stroke();

    // Draw arrow
    if (style.arrowType !== 'none') {
      drawArrow(ctx, fromPosition, toPosition, style);
    }

    ctx.restore();
  };

  const drawStraightLine = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  };

  const drawBezierLine = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const midX = (from.x + to.x) / 2;
    const cp1x = midX;
    const cp1y = from.y;
    const cp2x = midX;
    const cp2y = to.y;

    ctx.moveTo(from.x, from.y);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, to.x, to.y);
  };

  const drawOrthogonalLine = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const midX = (from.x + to.x) / 2;
    
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(midX, from.y);
    ctx.lineTo(midX, to.y);
    ctx.lineTo(to.x, to.y);
  };

  const drawZigzagLine = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const segments = 8;
    const deltaX = (to.x - from.x) / segments;
    const deltaY = (to.y - from.y) / segments;
    const zigzagHeight = 10;

    ctx.moveTo(from.x, from.y);
    
    for (let i = 1; i <= segments; i++) {
      const x = from.x + deltaX * i;
      const y = from.y + deltaY * i + (i % 2 === 0 ? zigzagHeight : -zigzagHeight);
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(to.x, to.y);
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    style: ConnectionStyle
  ) => {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const arrowLength = 15;
    const arrowAngle = Math.PI / 6;

    ctx.save();
    ctx.fillStyle = style.strokeColor;

    switch (style.arrowType) {
      case 'arrow':
        drawArrowHead(ctx, to, angle, arrowLength, arrowAngle);
        break;
      case 'double':
        drawArrowHead(ctx, to, angle, arrowLength, arrowAngle);
        drawArrowHead(ctx, from, angle + Math.PI, arrowLength, arrowAngle);
        break;
      case 'diamond':
        drawDiamond(ctx, to, angle, arrowLength);
        break;
      case 'circle':
        drawCircle(ctx, to, arrowLength / 2);
        break;
    }

    ctx.restore();
  };

  const drawArrowHead = (
    ctx: CanvasRenderingContext2D,
    point: { x: number; y: number },
    angle: number,
    length: number,
    arrowAngle: number
  ) => {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(
      point.x - length * Math.cos(angle - arrowAngle),
      point.y - length * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      point.x - length * Math.cos(angle + arrowAngle),
      point.y - length * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();
  };

  const drawDiamond = (
    ctx: CanvasRenderingContext2D,
    point: { x: number; y: number },
    angle: number,
    size: number
  ) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineTo(point.x - size * cos + size/2 * sin, point.y - size * sin - size/2 * cos);
    ctx.lineTo(point.x - size * cos, point.y - size * sin);
    ctx.lineTo(point.x - size * cos - size/2 * sin, point.y - size * sin + size/2 * cos);
    ctx.closePath();
    ctx.fill();
  };

  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    point: { x: number; y: number },
    radius: number
  ) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
    ctx.fill();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}