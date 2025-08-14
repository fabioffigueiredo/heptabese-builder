import { useRef, useEffect, useState, useCallback } from "react";
import { Position, CardData } from "@/types/whiteboard";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MiniMapProps {
  cards: CardData[];
  zoom: number;
  pan: Position;
  onNavigate: (pan: Position, zoom?: number) => void;
  containerSize: { width: number; height: number };
  className?: string;
}

export default function MiniMap({
  cards,
  zoom,
  pan,
  onNavigate,
  containerSize,
  className = ""
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const miniMapSize = { width: 200, height: 150 };
  const scale = 0.05; // Scale factor for minimap

  // Calculate bounds of all content
  const getContentBounds = useCallback(() => {
    if (cards.length === 0) {
      return { 
        minX: -500, 
        minY: -500, 
        maxX: 500, 
        maxY: 500 
      };
    }

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    cards.forEach(card => {
      const cardWidth = card.size?.width || 300;
      const cardHeight = card.size?.height || 200;
      
      minX = Math.min(minX, card.position.x);
      minY = Math.min(minY, card.position.y);
      maxX = Math.max(maxX, card.position.x + cardWidth);
      maxY = Math.max(maxY, card.position.y + cardHeight);
    });

    // Add padding
    const padding = 200;
    return {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    };
  }, [cards]);

  // Draw minimap
  const drawMiniMap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bounds = getContentBounds();
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    // Clear canvas
    ctx.clearRect(0, 0, miniMapSize.width, miniMapSize.height);
    
    // Set canvas size
    canvas.width = miniMapSize.width;
    canvas.height = miniMapSize.height;
    
    // Calculate scale to fit content
    const scaleX = miniMapSize.width / contentWidth;
    const scaleY = miniMapSize.height / contentHeight;
    const miniScale = Math.min(scaleX, scaleY) * 0.8; // 80% to leave margin
    
    // Center the content
    const offsetX = (miniMapSize.width - contentWidth * miniScale) / 2;
    const offsetY = (miniMapSize.height - contentHeight * miniScale) / 2;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, miniMapSize.width, miniMapSize.height);
    
    // Draw cards
    cards.forEach(card => {
      const x = (card.position.x - bounds.minX) * miniScale + offsetX;
      const y = (card.position.y - bounds.minY) * miniScale + offsetY;
      const width = (card.size?.width || 300) * miniScale;
      const height = (card.size?.height || 200) * miniScale;
      
      // Card background
      ctx.fillStyle = 'rgba(100, 100, 200, 0.7)';
      ctx.fillRect(x, y, width, height);
      
      // Card border
      ctx.strokeStyle = 'rgba(100, 100, 200, 1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    });
    
    // Draw viewport
    const viewportX = (-pan.x / zoom - bounds.minX) * miniScale + offsetX;
    const viewportY = (-pan.y / zoom - bounds.minY) * miniScale + offsetY;
    const viewportWidth = (containerSize.width / zoom) * miniScale;
    const viewportHeight = (containerSize.height / zoom) * miniScale;
    
    ctx.strokeStyle = 'rgba(255, 100, 100, 1)';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
    
    // Fill viewport with semi-transparent color
    ctx.fillStyle = 'rgba(255, 100, 100, 0.2)';
    ctx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
    
    // Store scale and offset for click handling
    (canvas as any).miniMapData = {
      scale: miniScale,
      offsetX,
      offsetY,
      bounds
    };
  }, [cards, zoom, pan, containerSize, getContentBounds]);

  // Handle click on minimap
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const canvasData = (canvas as any).miniMapData;
    if (!canvasData) return;
    const { scale: miniScale, offsetX, offsetY, bounds } = canvasData;
    
    // Convert click position to world coordinates
    const worldX = (clickX - offsetX) / miniScale + bounds.minX;
    const worldY = (clickY - offsetY) / miniScale + bounds.minY;
    
    // Calculate new pan to center the clicked position
    const newPanX = -worldX * zoom + containerSize.width / 2;
    const newPanY = -worldY * zoom + containerSize.height / 2;
    
    onNavigate({ x: newPanX, y: newPanY });
  }, [onNavigate, zoom, containerSize]);

  // Update minimap when data changes
  useEffect(() => {
    drawMiniMap();
  }, [drawMiniMap]);

  if (!isVisible) {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg p-2 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">Overview</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            <EyeOff className="h-3 w-3" />
          </Button>
        </div>
        <canvas
          ref={canvasRef}
          width={miniMapSize.width}
          height={miniMapSize.height}
          className="border rounded cursor-pointer hover:border-primary/50 transition-colors"
          onClick={handleClick}
          style={{
            width: miniMapSize.width,
            height: miniMapSize.height
          }}
        />
        <div className="text-xs text-muted-foreground mt-1 text-center">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}