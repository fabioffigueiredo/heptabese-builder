
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import InlineEditor from "./Cards/InlineEditor";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Hash,
  Link2,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface KnowledgeCardProps {
  data: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    color: string;
    position: Position;
    size?: Size;
  };
  onPositionChange: (position: Position) => void;
  onSizeChange?: (size: Size) => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<any>) => void;
  onConnectionStart: () => void;
  onConnectionEnd: () => void;
  isConnecting: boolean;
  zoom: number;
  disabled?: boolean;
}

export default function KnowledgeCard({
  data,
  onPositionChange,
  onSizeChange,
  onDelete,
  onUpdate,
  onConnectionStart,
  onConnectionEnd,
  isConnecting,
  zoom,
  disabled = false,
}: KnowledgeCardProps) {
  const { id, title, content, tags, color, position = { x: 0, y: 0 }, size = { width: 320, height: 240 } } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isEditing || isResizing) return;
    
    // Prevent drag if clicking on buttons or inputs or resize handles
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('.resize-handle')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - (position?.x || 0),
        y: e.clientY - (position?.y || 0),
      });
      setIsDragging(true);
    }
  }, [disabled, isEditing, isResizing, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !disabled && !isResizing) {
      e.preventDefault();
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      onPositionChange(newPosition);
    } else if (isResizing && onSizeChange) {
      e.preventDefault();
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newSize = { width: size?.width || 320, height: size?.height || 240 };
      let newPosition = { x: position?.x || 0, y: position?.y || 0 };
      
      switch (resizeType) {
        case 'nw': // northwest
          newSize.width = Math.max(200, resizeStart.width - deltaX);
          newSize.height = Math.max(150, resizeStart.height - deltaY);
          newPosition.x = resizeStart.posX + (resizeStart.width - newSize.width);
          newPosition.y = resizeStart.posY + (resizeStart.height - newSize.height);
          break;
        case 'n': // north
          newSize.height = Math.max(150, resizeStart.height - deltaY);
          newPosition.y = resizeStart.posY + (resizeStart.height - newSize.height);
          break;
        case 'ne': // northeast
          newSize.width = Math.max(200, resizeStart.width + deltaX);
          newSize.height = Math.max(150, resizeStart.height - deltaY);
          newPosition.y = resizeStart.posY + (resizeStart.height - newSize.height);
          break;
        case 'e': // east
          newSize.width = Math.max(200, resizeStart.width + deltaX);
          break;
        case 'se': // southeast
          newSize.width = Math.max(200, resizeStart.width + deltaX);
          newSize.height = Math.max(150, resizeStart.height + deltaY);
          break;
        case 's': // south
          newSize.height = Math.max(150, resizeStart.height + deltaY);
          break;
        case 'sw': // southwest
          newSize.width = Math.max(200, resizeStart.width - deltaX);
          newSize.height = Math.max(150, resizeStart.height + deltaY);
          newPosition.x = resizeStart.posX + (resizeStart.width - newSize.width);
          break;
        case 'w': // west
          newSize.width = Math.max(200, resizeStart.width - deltaX);
          newPosition.x = resizeStart.posX + (resizeStart.width - newSize.width);
          break;
      }
      
      // Apply max size constraints
      newSize.width = Math.min(800, newSize.width);
      newSize.height = Math.min(600, newSize.height);
      
      onSizeChange?.(newSize);
      if (newPosition.x !== (position?.x || 0) || newPosition.y !== (position?.y || 0)) {
        onPositionChange(newPosition);
      }
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeType, id, onPositionChange, onSizeChange, disabled, size, position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeType('');
  }, []);

  // Add global mouse event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleSave = (saveData: { title: string; content: string; tags: string[] }) => {
    onUpdate(saveData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleResizeStart = useCallback((e: React.MouseEvent, type: string) => {
    if (disabled || isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeType(type);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size?.width || 320,
      height: size?.height || 240,
      posX: position?.x || 0,
      posY: position?.y || 0,
    });
  }, [disabled, isEditing, size, position]);

  const handleStartConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate the exact position of the right connection point
      const connectionX = (position?.x || 0) + (size?.width || 320); // right edge using actual card width
      const connectionY = (position?.y || 0) + (size?.height || 240) / 2; // middle of card height
      console.log(`Start connection from card ${id} at position:`, { x: connectionX, y: connectionY });
      onConnectionStart();
    }
  };

  const handleEndConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate the exact position of the left connection point
      const connectionX = position?.x || 0; // left edge of card
      const connectionY = (position?.y || 0) + (size?.height || 240) / 2; // middle of card height
      console.log(`End connection to card ${id} at position:`, { x: connectionX, y: connectionY });
      onConnectionEnd();
    }
  };

  const colorClasses = {
    "accent-purple": "border-accent-purple/30 bg-gradient-to-br from-accent-purple/5 to-accent-purple/10",
    "accent-blue": "border-accent-blue/30 bg-gradient-to-br from-accent-blue/5 to-accent-blue/10",
    "accent-green": "border-accent-green/30 bg-gradient-to-br from-accent-green/5 to-accent-green/10",
    "accent-orange": "border-accent-orange/30 bg-gradient-to-br from-accent-orange/5 to-accent-orange/10",
  };

  return (
    <div
      ref={cardRef}
      className={`
        absolute bg-card-bg border-2 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 select-none
        ${colorClasses[color as keyof typeof colorClasses] || colorClasses["accent-purple"]}
        ${isDragging ? "cursor-grabbing shadow-large scale-105 z-50" : isResizing ? "z-50" : !disabled ? "cursor-grab z-30" : "cursor-default z-30"}
        ${disabled ? "opacity-50" : ""}
      `}
      style={{
        left: position?.x || 0,
        top: position?.y || 0,
        width: size?.width || 320,
        height: size?.height || 240,
        transform: `scale(${zoom})`,
        transformOrigin: "0 0",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-card-foreground leading-tight">
            {title}
          </h3>
          
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleStartConnection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Connection
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 overflow-hidden">
        {isEditing ? (
          <InlineEditor
            title={title}
            content={content}
            tags={tags}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <p className="text-sm text-card-foreground/80 leading-relaxed overflow-y-auto"
               style={{ maxHeight: `${(size?.height || 240) - 160}px` }}>
              {content}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-4">
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-background/60 text-foreground/70 border-border/50"
                >
                  <Hash className="h-2.5 w-2.5 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Connection points - positioned precisely at the edges */}
      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="sm"
          className="w-4 h-4 p-0 bg-connection-line hover:bg-accent-purple rounded-full opacity-60 hover:opacity-100"
          onClick={handleStartConnection}
        >
          <Plus className="h-2 w-2 text-white" />
        </Button>
      </div>
      
      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
        <Button
          variant="ghost"
          size="sm"
          className="w-4 h-4 p-0 bg-connection-line hover:bg-accent-green rounded-full opacity-60 hover:opacity-100"
          onClick={handleEndConnection}
        >
          <Link2 className="h-2 w-2 text-white" />
        </Button>
      </div>

      {/* Resize handles */}
      {!disabled && !isEditing && (
        <>
          {/* Corner handles */}
          <div 
            className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary/60 hover:bg-primary rounded-full cursor-nw-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
          />
          <div 
            className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary/60 hover:bg-primary rounded-full cursor-ne-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary/60 hover:bg-primary rounded-full cursor-sw-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary/60 hover:bg-primary rounded-full cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
          
          {/* Edge handles */}
          <div 
            className="resize-handle absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-primary/60 hover:bg-primary rounded cursor-n-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
          />
          <div 
            className="resize-handle absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-primary/60 hover:bg-primary rounded cursor-e-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
          />
          <div 
            className="resize-handle absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-primary/60 hover:bg-primary rounded cursor-s-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 's')}
          />
          <div 
            className="resize-handle absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-6 bg-primary/60 hover:bg-primary rounded cursor-w-resize opacity-0 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
          />
        </>
      )}
    </div>
  );
}
