
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
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Sidebar,
  FileText,
  Download,
  Info,
  History,
  Tag,
  FolderOpen,
  Lightbulb,
  GitBranch,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  currentTool?: string;
  highlightColor?: string;
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
  isSelected = false,
  onSelect,
  currentTool = 'select',
  highlightColor = '#ffff00',
}: KnowledgeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [editTags, setEditTags] = useState(tags.join(", "));
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeType, setResizeType] = useState('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, posX: 0, posY: 0 });
  const [highlightedContent, setHighlightedContent] = useState(content);
  const [isFolded, setIsFolded] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLParagraphElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isEditing || isResizing || currentTool === 'highlighter') return;
    
    // Prevent drag if clicking on buttons or inputs or resize handles
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('.resize-handle')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Select the card when clicked
    if (onSelect) {
      onSelect(id);
    }
    
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      setIsDragging(true);
    }
  }, [disabled, isEditing, isResizing, currentTool, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !disabled && !isResizing) {
      e.preventDefault();
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      };
      onPositionChange(id, newPosition);
    } else if (isResizing && onSizeChange) {
      e.preventDefault();
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newSize = { width: size.width, height: size.height };
      let newPosition = { x: position.x, y: position.y };
      
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
      
      onSizeChange(id, newSize);
      if (newPosition.x !== position.x || newPosition.y !== position.y) {
        onPositionChange(id, newPosition);
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

  // Handle text selection and highlighting
  const handleTextSelection = useCallback(() => {
    if (currentTool !== 'highlighter' || isEditing || !contentRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();
    
    if (selectedText && range.commonAncestorContainer.parentElement?.closest('.card-content')) {
      // Create a span element with highlight styling
      const highlightSpan = document.createElement('span');
      // Convert hex color to rgba with transparency
      const hexToRgba = (hex: string, alpha: number) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
      };
      
      highlightSpan.style.backgroundColor = hexToRgba(highlightColor, 0.3);
      highlightSpan.style.padding = '1px 2px';
      highlightSpan.style.borderRadius = '2px';
      highlightSpan.style.border = `1px solid ${hexToRgba(highlightColor, 0.6)}`;
      highlightSpan.className = 'highlighted-text';
      highlightSpan.style.cursor = 'pointer';
       highlightSpan.title = 'Clique duplo para remover destaque';
       
       // Add double-click event to remove highlight
       highlightSpan.addEventListener('dblclick', (e) => {
         e.stopPropagation();
         const parent = highlightSpan.parentNode;
         if (parent) {
           // Replace the span with its text content
           const textNode = document.createTextNode(highlightSpan.textContent || '');
           parent.replaceChild(textNode, highlightSpan);
           
           // Update the content
           if (contentRef.current) {
             const updatedContent = contentRef.current.innerHTML;
             setHighlightedContent(updatedContent);
             onUpdate(id, { content: updatedContent });
           }
         }
       });
       
       try {
         range.surroundContents(highlightSpan);
         
         // Update the content with highlighted text
         const updatedContent = contentRef.current.innerHTML;
         setHighlightedContent(updatedContent);
         
         // Update the card content
         onUpdate(id, { content: updatedContent });
         
         // Clear selection
         selection.removeAllRanges();
       } catch (error) {
         console.warn('Could not highlight selected text:', error);
       }
    }
  }, [currentTool, isEditing, highlightColor, id, onUpdate]);

  // Update highlighted content when content changes
  useEffect(() => {
    setHighlightedContent(content);
  }, [content]);

  // Add event listeners to existing highlighted elements
  useEffect(() => {
    if (!contentRef.current) return;
    
    const highlightedElements = contentRef.current.querySelectorAll('.highlighted-text');
    
    const handleDoubleClick = (e: Event) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      const parent = target.parentNode;
      
      if (parent) {
        const textNode = document.createTextNode(target.textContent || '');
        parent.replaceChild(textNode, target);
        
        if (contentRef.current) {
          const updatedContent = contentRef.current.innerHTML;
          setHighlightedContent(updatedContent);
          onUpdate(id, { content: updatedContent });
        }
      }
    };
    
    highlightedElements.forEach(element => {
      element.addEventListener('dblclick', handleDoubleClick);
      (element as HTMLElement).style.cursor = 'pointer';
      (element as HTMLElement).title = 'Clique duplo para remover destaque';
    });
    
    return () => {
      highlightedElements.forEach(element => {
        element.removeEventListener('dblclick', handleDoubleClick);
      });
    };
  }, [highlightedContent, id, onUpdate]);

  const handleResizeStart = useCallback((e: React.MouseEvent, type: string) => {
    if (disabled || isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeType(type);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y,
    });
  }, [disabled, isEditing, size, position]);

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

  // New menu option handlers
  const handleDefaultSize = useCallback(() => {
    if (onSizeChange) {
      onSizeChange(id, { width: 320, height: 240 });
    }
  }, [id, onSizeChange]);

  const handleFitToContent = useCallback(() => {
    if (onSizeChange && contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      const newHeight = Math.max(240, contentHeight + 160); // 160px for header, tags, padding
      onSizeChange(id, { width: size.width, height: newHeight });
    }
  }, [id, onSizeChange, size.width]);

  const handleFold = useCallback(() => {
    setIsFolded(!isFolded);
    if (onSizeChange) {
      const newHeight = isFolded ? 240 : 80; // Collapsed height
      onSizeChange(id, { width: size.width, height: newHeight });
    }
  }, [id, isFolded, onSizeChange, size.width]);

  const handleCopy = useCallback(() => {
    const cardData = {
      title,
      content,
      tags
    };
    navigator.clipboard.writeText(JSON.stringify(cardData, null, 2));
  }, [title, content, tags]);

  const handleCopyLink = useCallback(() => {
    const link = `${window.location.origin}${window.location.pathname}#card-${id}`;
    navigator.clipboard.writeText(link);
  }, [id]);

  const handleExportMarkdown = useCallback(() => {
    const markdown = `# ${title}\n\n${content}\n\n${tags.map(tag => `#${tag}`).join(' ')}`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title, content, tags]);

  const handleExportPDF = useCallback(() => {
    // This would require a PDF library like jsPDF
    console.log('Export as PDF - Feature to be implemented');
  }, []);

  const handleShowInfo = useCallback(() => {
    console.log('Show info - Feature to be implemented');
  }, []);

  const handleVersionHistory = useCallback(() => {
    console.log('Version history - Feature to be implemented');
  }, []);

  const handleManageTags = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleMoveTo = useCallback(() => {
    console.log('Move to - Feature to be implemented');
  }, []);

  const handleGenerateInsight = useCallback(() => {
    console.log('Generate insight - Feature to be implemented');
  }, []);

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
        ${isDragging ? "cursor-grabbing shadow-large scale-105 z-50" : isResizing ? "z-50" : currentTool === 'highlighter' ? "cursor-text" : !disabled ? "cursor-grab" : "cursor-default"}
        ${disabled ? "opacity-50" : ""}
        ${isSelected ? "ring-2 ring-accent-purple ring-offset-2 ring-offset-background" : ""}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Maximize2 className="h-4 w-4 mr-2" />
                    Size
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleDefaultSize}>
                      Default Size
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleFitToContent}>
                      Fit to Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleFold}>
                      {isFolded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronUp className="h-4 w-4 mr-2" />}
                      {isFolded ? 'Expand' : 'Fold'}
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleCopyLink}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={handleExportMarkdown}>
                      <FileText className="h-4 w-4 mr-2" />
                      Markdown
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleStartConnection}>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Start Connection
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleShowInfo}>
                  <Info className="h-4 w-4 mr-2" />
                  Info
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleVersionHistory}>
                  <History className="h-4 w-4 mr-2" />
                  Version History
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleManageTags}>
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Tags
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleMoveTo}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Move To
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={handleGenerateInsight}>
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Insight
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
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
      {!isFolded && (
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
            <div 
              ref={contentRef}
              className="card-content text-sm text-card-foreground/80 leading-relaxed overflow-y-auto cursor-text"
              style={{ 
                maxHeight: `${size.height - 160}px`,
                userSelect: currentTool === 'highlighter' ? 'text' : 'none'
              }}
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{ __html: highlightedContent }}
            />
          )}
        </div>
      )}

      {/* Tags */}
      {!isFolded && (
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
      )}

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
