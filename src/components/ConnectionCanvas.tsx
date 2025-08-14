import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Path } from "fabric";

interface Connection {
  id: string;
  fromCardId: string;
  toCardId: string;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
}

interface Position {
  x: number;
  y: number;
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
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    
    const canvas = new FabricCanvas(canvasRef.current, {
      width: containerRect.width,
      height: containerRect.height,
      backgroundColor: "transparent",
      selection: false,
      hoverCursor: "default",
      moveCursor: "default",
    });

    canvas.defaultCursor = "default";
    
    setFabricCanvas(canvas);

    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.setDimensions({ width: rect.width, height: rect.height });
        canvas.renderAll();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, [containerRef]);

  // Update canvas transform based on zoom and pan
  useEffect(() => {
    if (!fabricCanvas) return;

    const transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
    fabricCanvas.getElement().style.transform = transform;
    fabricCanvas.getElement().style.transformOrigin = "0 0";
  }, [fabricCanvas, zoom, pan]);

  // Render connections
  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.clear();

    connections.forEach((connection) => {
      // Calculate arrow points
      const fromX = connection.fromPosition.x;
      const fromY = connection.fromPosition.y;
      const toX = connection.toPosition.x;
      const toY = connection.toPosition.y;

      // Create curved line
      const deltaX = toX - fromX;
      const deltaY = toY - fromY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Control points for bezier curve
      const controlOffset = Math.min(distance * 0.3, 100);
      const control1X = fromX + controlOffset;
      const control1Y = fromY;
      const control2X = toX - controlOffset;
      const control2Y = toY;

      // Create SVG path for curved line
      const pathString = `M ${fromX} ${fromY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${toX} ${toY}`;
      
      const line = new Path(pathString, {
        stroke: "hsl(262 40% 70%)",
        strokeWidth: 2,
        fill: "",
        selectable: false,
        evented: false,
        strokeDashArray: [5, 5],
      });

      fabricCanvas.add(line);

      // Add arrowhead
      const angle = Math.atan2(deltaY, deltaX);
      const arrowLength = 12;
      const arrowAngle = Math.PI / 6;

      const arrowPoint1X = toX - arrowLength * Math.cos(angle - arrowAngle);
      const arrowPoint1Y = toY - arrowLength * Math.sin(angle - arrowAngle);
      const arrowPoint2X = toX - arrowLength * Math.cos(angle + arrowAngle);
      const arrowPoint2Y = toY - arrowLength * Math.sin(angle + arrowAngle);

      const arrowPath = `M ${toX} ${toY} L ${arrowPoint1X} ${arrowPoint1Y} M ${toX} ${toY} L ${arrowPoint2X} ${arrowPoint2Y}`;
      
      const arrow = new Path(arrowPath, {
        stroke: "hsl(262 40% 70%)",
        strokeWidth: 2,
        fill: "",
        selectable: false,
        evented: false,
      });

      fabricCanvas.add(arrow);
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, connections]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ mixBlendMode: "multiply" }}
    />
  );
}