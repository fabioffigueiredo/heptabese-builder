
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Edit3,
  Trash2,
  Hash,
  Link2,
  Save,
  X,
  Plus,
  Maximize2,
  Minimize2,
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
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  position: Position;
  size?: Size;
  onPositionChange: (id: string, position: Position) => void;
  onSizeChange?: (id: string, size: Size) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  onStartConnection: (cardId: string, position: Position) => void;
  onEndConnection: (cardId: string, position: Position) => void;
  disabled?: boolean;
  scale?: number;
}

export default function KnowledgeCard({
  id,
  title,
  content,
  tags,
  color,
  position,
  size = { width: 320, height: 240 },
  onPositionChange,
  onSizeChange,
  onDelete,
  onUpdate,
  onStartConnection,
  onEndConnection,
  disabled = false,
  scale = 1,
}: KnowledgeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [editTags, setEditTags] = useState(tags.join(", "));
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isEditing) return;
    
    // Prevent drag if clicking on buttons or inputs
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      setIsDragging(true);
    }
  }, [disabled, isEditing, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !disabled) {
      e.preventDefault();
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      onPositionChange(id, newPosition);
    }
  }, [isDragging, dragOffset, id, onPositionChange, disabled]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleSave = () => {
    onUpdate(id, {
      title: editTitle,
      content: editContent,
      tags: editTags.split(",").map(tag => tag.trim()).filter(tag => tag),
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditContent(content);
    setEditTags(tags.join(", "));
    setIsEditing(false);
  };

  const handleIncreaseSize = () => {
    if (onSizeChange) {
      const newSize = {
        width: Math.min(size.width + 80, 600), // máximo 600px
        height: Math.min(size.height + 60, 400), // máximo 400px
      };
      onSizeChange(id, newSize);
    }
  };

  const handleDecreaseSize = () => {
    if (onSizeChange) {
      const newSize = {
        width: Math.max(size.width - 80, 240), // mínimo 240px
        height: Math.max(size.height - 60, 180), // mínimo 180px
      };
      onSizeChange(id, newSize);
    }
  };

  const handleStartConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate the exact position of the right connection point
      const connectionX = position.x + size.width; // right edge using actual card width
      const connectionY = position.y + size.height / 2; // middle of card height
      console.log(`Start connection from card ${id} at position:`, { x: connectionX, y: connectionY });
      onStartConnection(id, { x: connectionX, y: connectionY });
    }
  };

  const handleEndConnection = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate the exact position of the left connection point
      const connectionX = position.x; // left edge of card
      const connectionY = position.y + size.height / 2; // middle of card height
      console.log(`End connection to card ${id} at position:`, { x: connectionX, y: connectionY });
      onEndConnection(id, { x: connectionX, y: connectionY });
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
        ${isDragging ? "cursor-grabbing shadow-large scale-105 z-50" : !disabled ? "cursor-grab" : "cursor-default"}
        ${disabled ? "opacity-50" : ""}
      `}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        transform: `scale(${scale})`,
        transformOrigin: "0 0",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start justify-between gap-2">
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="text-base font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
              placeholder="Card title..."
            />
          ) : (
            <h3 className="text-base font-semibold text-card-foreground leading-tight">
              {title}
            </h3>
          )}
          
          <div className="flex items-center gap-1">
            {/* Size controls */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={handleDecreaseSize}
              title="Diminuir card"
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
              onClick={handleIncreaseSize}
              title="Aumentar card"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
            
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
                <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
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
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-transparent border-none p-0 resize-none focus-visible:ring-0"
            style={{ minHeight: `${size.height - 160}px` }}
            placeholder="Write your thoughts here..."
          />
        ) : (
          <p className="text-sm text-card-foreground/80 leading-relaxed overflow-y-auto"
             style={{ maxHeight: `${size.height - 160}px` }}>
            {content}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="px-4 pb-4 mt-auto">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editTags}
              onChange={(e) => setEditTags(e.target.value)}
              placeholder="tag1, tag2, tag3..."
              className="text-xs bg-transparent border-border/50"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} variant="default">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" onClick={handleCancel} variant="ghost">
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
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
    </div>
  );
}
