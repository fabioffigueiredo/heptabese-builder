import { useState, useRef, useCallback } from "react";
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

interface KnowledgeCardProps {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: string;
  position: Position;
  onPositionChange: (id: string, position: Position) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
  disabled?: boolean;
}

export default function KnowledgeCard({
  id,
  title,
  content,
  tags,
  color,
  position,
  onPositionChange,
  onDelete,
  onUpdate,
  disabled = false,
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
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, [disabled, isEditing]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !disabled) {
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
  useState(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  });

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
        w-80 bg-card-bg border-2 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200
        ${colorClasses[color as keyof typeof colorClasses] || colorClasses["accent-purple"]}
        ${isDragging ? "cursor-grabbing shadow-large scale-105" : !disabled ? "cursor-grab" : "cursor-default"}
        ${disabled ? "opacity-50" : ""}
      `}
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
              <DropdownMenuItem onClick={() => onDelete(id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="min-h-[100px] bg-transparent border-none p-0 resize-none focus-visible:ring-0"
            placeholder="Write your thoughts here..."
          />
        ) : (
          <p className="text-sm text-card-foreground/80 leading-relaxed">
            {content}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="px-4 pb-4">
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

      {/* Connection indicator */}
      <div className="absolute -right-1 top-1/2 transform -translate-y-1/2">
        <div className="w-2 h-2 bg-connection-line rounded-full opacity-60 hover:opacity-100 cursor-pointer">
          <Link2 className="h-3 w-3 text-connection-line -ml-0.5 -mt-0.5" />
        </div>
      </div>
    </div>
  );
}