import { useState } from "react";
import { DrawingElement } from "@/types/whiteboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Play, Pause, Trash2 } from "lucide-react";
import { toast } from "sonner";
import StickyNote from "@/components/StickyNote/StickyNote";

interface MediaElementProps {
  element: DrawingElement;
  onUpdate: (id: string, updates: Partial<DrawingElement>) => void;
  onDelete: (id: string) => void;
  scale: number;
}

export default function MediaElement({ element, onUpdate, onDelete, scale }: MediaElementProps) {
  // Handle sticky notes separately
  if (element.type === 'sticky-note') {
    return (
      <StickyNote
        element={element}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    );
  }

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - element.position.x * scale,
      y: e.clientY - element.position.y * scale,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: (e.clientX - dragOffset.x) / scale,
      y: (e.clientY - dragOffset.y) / scale,
    };
    
    onUpdate(element.id, { position: newPosition });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleVideoToggle = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };

  const handleLinkClick = () => {
    if (element.properties.url) {
      window.open(element.properties.url, '_blank');
    }
  };

  const renderContent = () => {
    switch (element.type) {
      case 'image':
        return (
          <img
            src={element.properties.src}
            alt={element.properties.alt}
            className="w-full h-full object-cover rounded"
            draggable={false}
          />
        );

      case 'video':
        return (
          <div className="relative w-full h-full bg-black rounded overflow-hidden">
            <video
              src={element.properties.src}
              className="w-full h-full object-cover"
              controls={isVideoPlaying}
            />
            {!isVideoPlaying && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/50 hover:bg-black/70"
                onClick={handleVideoToggle}
              >
                <Play className="h-6 w-6 text-white" />
              </Button>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-muted rounded border-2 border-dashed border-border">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">📄</div>
              <p className="text-sm font-medium">{element.properties.title}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => window.open(element.properties.src, '_blank')}
              >
                Open PDF
              </Button>
            </div>
          </div>
        );

      case 'link':
        return (
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={handleLinkClick}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                <ExternalLink className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {element.properties.title || element.properties.url}
                </h4>
                {element.properties.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {element.properties.description}
                  </p>
                )}
                <p className="text-xs text-primary mt-1 truncate">
                  {element.properties.url}
                </p>
              </div>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="absolute group cursor-move"
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size?.width || 200,
        height: element.size?.height || 150,
        transform: `scale(${scale})`,
        transformOrigin: '0 0',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {renderContent()}
      
      {/* Delete Button */}
      <Button
        variant="destructive"
        size="sm"
        className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(element.id);
          toast.success("Media element deleted");
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}