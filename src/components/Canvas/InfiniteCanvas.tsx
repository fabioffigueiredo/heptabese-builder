import { useEffect, useRef, useState, useCallback } from "react";
import { Position } from "@/types/whiteboard";

interface InfiniteCanvasProps {
  zoom: number;
  pan: Position;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: Position) => void;
  children: React.ReactNode;
  className?: string;
  tool?: string;
}

export default function InfiniteCanvas({
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  children,
  className = "",
  tool
}: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState<Position>({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  // Smooth zoom with mouse wheel
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!containerRef.current) return;
    
    e.preventDefault();
    
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate world position before zoom
    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;
    
    // Calculate new zoom
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.01, Math.min(100, zoom * zoomDelta));
    
    // Calculate new pan to keep mouse position stable
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    
    onZoomChange(newZoom);
    onPanChange({ x: newPanX, y: newPanY });
  }, [zoom, pan, onZoomChange, onPanChange]);

  // Pan with momentum
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool !== 'pan' && !e.metaKey && !e.ctrlKey && e.button !== 1) return;
    
    e.preventDefault();
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
    setVelocity({ x: 0, y: 0 });
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [tool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    const newPan = {
      x: pan.x + deltaX,
      y: pan.y + deltaY
    };
    
    onPanChange(newPan);
    setVelocity({ x: deltaX, y: deltaY });
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMousePos, pan, onPanChange]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply momentum
    if (Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 1) {
      let currentVelocity = { ...velocity };
      const friction = 0.92;
      
      const animate = () => {
        currentVelocity.x *= friction;
        currentVelocity.y *= friction;
        
        if (Math.abs(currentVelocity.x) > 0.1 || Math.abs(currentVelocity.y) > 0.1) {
          onPanChange({ 
            x: pan.x + currentVelocity.x, 
            y: pan.y + currentVelocity.y 
          });
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isDragging, velocity, onPanChange]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      
      const step = 50;
      const zoomStep = e.ctrlKey || e.metaKey ? 0.1 : 0.2;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          onPanChange({ x: pan.x + step, y: pan.y });
          break;
        case 'ArrowRight':
          e.preventDefault();
          onPanChange({ x: pan.x - step, y: pan.y });
          break;
        case 'ArrowUp':
          e.preventDefault();
          onPanChange({ x: pan.x, y: pan.y + step });
          break;
        case 'ArrowDown':
          e.preventDefault();
          onPanChange({ x: pan.x, y: pan.y - step });
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onZoomChange(Math.min(100, zoom + zoomStep));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onZoomChange(Math.max(0.01, zoom - zoomStep));
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onZoomChange(1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoom, onZoomChange, onPanChange]);

  // Mouse events
  useEffect(() => {
    if (!containerRef.current) return;
    
    const element = containerRef.current;
    element.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      element.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  // Global mouse events for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      
      const newPan = {
        x: pan.x + deltaX,
        y: pan.y + deltaY
      };
      
      onPanChange(newPan);
      setVelocity({ x: deltaX, y: deltaY });
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      
      // Apply momentum
      if (Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 1) {
        let currentVelocity = { ...velocity };
        const friction = 0.92;
        
        const animate = () => {
          currentVelocity.x *= friction;
          currentVelocity.y *= friction;
          
          if (Math.abs(currentVelocity.x) > 0.1 || Math.abs(currentVelocity.y) > 0.1) {
            onPanChange({ 
              x: pan.x + currentVelocity.x, 
              y: pan.y + currentVelocity.y 
            });
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, lastMousePos, pan, velocity, onPanChange]);

  // Cleanup animation
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: isDragging ? 'grabbing' : tool === 'pan' ? 'grab' : 'default'
      }}
    >
      <div
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "0 0",
          transition: isDragging ? 'none' : 'transform 0.2s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}
