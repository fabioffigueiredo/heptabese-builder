import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, ZoomIn, ZoomOut, Move, Hand, Link, 
  Pen, Highlighter, Type, Square, Circle, 
  Triangle, Image, Video, FileText, Globe,
  Palette, Settings, Layers, Target
} from "lucide-react";
import { WhiteboardTool, ShapeTool } from "@/types/whiteboard";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

interface AdvancedToolbarProps {
  tool: WhiteboardTool;
  shapeTool?: ShapeTool;
  zoom: number;
  brushSize: number;
  brushColor: string;
  highlightColor?: string;
  onToolChange: (tool: WhiteboardTool) => void;
  onShapeToolChange: (tool: ShapeTool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onBrushSizeChange: (size: number) => void;
  onBrushColorChange: (color: string) => void;
  onHighlightColorChange?: (color: string) => void;
  onAddCard: () => void;
  onConnect: () => void;
  onCenterView?: () => void;
}

const colors = [
  "#000000", "#ff0000", "#39ff14", "#0000ff", "#ffff00", 
  "#ff00ff", "#00ffff", "#ffa500", "#800080", "#008000"
];

const highlightColors = [
  { name: "Amarelo", color: "#ffff00" },
  { name: "Verde", color: "#39ff14" },
  { name: "Azul", color: "#00bfff" },
  { name: "Rosa", color: "#ff69b4" },
  { name: "Laranja", color: "#ffa500" },
  { name: "Roxo", color: "#da70d6" },
  { name: "Vermelho", color: "#ff6b6b" },
  { name: "Ciano", color: "#40e0d0" }
];

export default function AdvancedToolbar({
  tool,
  shapeTool = 'rectangle',
  zoom,
  brushSize,
  brushColor,
  highlightColor = "#ffff00",
  onToolChange,
  onShapeToolChange,
  onZoomIn,
  onZoomOut,
  onBrushSizeChange,
  onBrushColorChange,
  onHighlightColorChange,
  onAddCard,
  onConnect,
  onCenterView
}: AdvancedToolbarProps) {
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const [isHighlightMenuOpen, setIsHighlightMenuOpen] = useState(false);

  const handleToolClick = (newTool: WhiteboardTool) => {
    onToolChange(newTool);
    toast(`${newTool} tool active`);
  };

  const handleShapeClick = (shape: ShapeTool) => {
    onShapeToolChange(shape);
    onToolChange('shape');
    setIsShapeMenuOpen(false);
    toast(`${shape} shape selected`);
  };

  return (
    <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-card-bg/90 backdrop-blur-sm rounded-lg border border-border p-2 shadow-soft">
      {/* Basic Tools */}
      <Button
        variant={tool === "select" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("select")}
      >
        <Move className="h-4 w-4" />
      </Button>
      <Button
        variant={tool === "pan" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("pan")}
      >
        <Hand className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Drawing Tools */}
      <Button
        variant={tool === "draw" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("draw")}
      >
        <Pen className="h-4 w-4" />
      </Button>
      {/* Highlighter with Color Menu */}
      <Popover open={isHighlightMenuOpen} onOpenChange={setIsHighlightMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={tool === "highlighter" ? "default" : "ghost"}
            size="sm"
            onClick={() => {
              if (tool !== "highlighter") {
                handleToolClick("highlighter");
              }
              setIsHighlightMenuOpen(!isHighlightMenuOpen);
            }}
          >
            <Highlighter className="h-4 w-4" style={{ color: tool === "highlighter" ? highlightColor : undefined }} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Cores do Marca-texto</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {highlightColors.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    className={`w-10 h-10 rounded-md border-2 flex items-center justify-center transition-all hover:scale-105 ${
                      highlightColor === colorOption.color ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    onClick={() => {
                      onHighlightColorChange?.(colorOption.color);
                      if (tool !== "highlighter") {
                        handleToolClick("highlighter");
                      }
                      setIsHighlightMenuOpen(false);
                    }}
                    title={colorOption.name}
                  >
                    {highlightColor === colorOption.color && (
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Shape Tools */}
      <Popover open={isShapeMenuOpen} onOpenChange={setIsShapeMenuOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={tool === "shape" ? "default" : "ghost"}
            size="sm"
          >
            {shapeTool === 'circle' && <Circle className="h-4 w-4" />}
            {shapeTool === 'rectangle' && <Square className="h-4 w-4" />}
            {shapeTool === 'triangle' && <Triangle className="h-4 w-4" />}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2">
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShapeClick('rectangle')}
            >
              <Square className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShapeClick('circle')}
            >
              <Circle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleShapeClick('triangle')}
            >
              <Triangle className="h-4 w-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      <Button
        variant={tool === "text" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("text")}
      >
        <Type className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Media Tools */}
      <Button
        variant={tool === "image" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("image")}
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        variant={tool === "video" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("video")}
      >
        <Video className="h-4 w-4" />
      </Button>
      <Button
        variant={tool === "pdf" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("pdf")}
      >
        <FileText className="h-4 w-4" />
      </Button>
      <Button
        variant={tool === "link" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleToolClick("link")}
      >
        <Globe className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Brush Properties */}
      {(tool === "draw" || tool === "highlighter") && (
        <>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Brush Size: {brushSize}px</label>
                  <Slider
                    value={[brushSize]}
                    onValueChange={(value) => onBrushSizeChange(value[0])}
                    max={20}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-md border-2 ${brushColor === color ? 'border-primary' : 'border-border'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onBrushColorChange(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Separator orientation="vertical" className="h-6 mx-1" />
        </>
      )}
      
      {/* Zoom Controls */}
      <Button variant="ghost" size="sm" onClick={onZoomOut}>
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button variant="ghost" size="sm" onClick={onZoomIn}>
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      {onCenterView && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCenterView}
          title="Center view on content"
        >
          <Target className="h-4 w-4" />
        </Button>
      )}
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Connection Tool */}
      <Button
        variant={tool === "connect" ? "default" : "ghost"}
        size="sm"
        onClick={onConnect}
      >
        <Link className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Add Card */}
      <Button 
        variant="default" 
        size="sm" 
        onClick={onAddCard}
        className="bg-primary hover:bg-primary/90"
      >
        <Plus className="h-4 w-4" />
        Add Card
      </Button>
    </div>
  );
}