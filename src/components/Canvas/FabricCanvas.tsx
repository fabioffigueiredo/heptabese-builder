import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Path, FabricText } from "fabric";
import { WhiteboardTool, ShapeTool, DrawingElement, Position } from "@/types/whiteboard";
import { toast } from "sonner";

interface FabricCanvasProps {
  tool: WhiteboardTool;
  shapeTool: ShapeTool;
  brushSize: number;
  brushColor: string;
  stickyNoteColor?: string;
  zoom: number;
  pan: Position;
  onElementAdd: (element: DrawingElement) => void;
  onElementUpdate: (id: string, updates: Partial<DrawingElement>) => void;
  onElementDelete: (id: string) => void;
}

export default function FabricCanvasComponent({
  tool,
  shapeTool,
  brushSize,
  brushColor,
  stickyNoteColor = "#fbbf24",
  zoom,
  pan,
  onElementAdd,
  onElementUpdate,
  onElementDelete
}: FabricCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: "transparent",
      selection: tool === "select",
    });

    // Initialize the freeDrawingBrush for Fabric.js v6 with proper checks
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushSize;
    } else {
      // For Fabric.js v6, we may need to enable drawing mode first to initialize the brush
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushSize;
      }
      canvas.isDrawingMode = false;
    }

    setFabricCanvas(canvas);

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
    };
  }, []);

  // Update canvas settings when tool changes
  useEffect(() => {
    if (!fabricCanvas) return;

    // Reset canvas interaction mode
    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false;
    fabricCanvas.defaultCursor = 'default';

    switch (tool) {
      case 'select':
        fabricCanvas.selection = true;
        fabricCanvas.defaultCursor = 'default';
        break;
      
      case 'draw':
        fabricCanvas.isDrawingMode = true;
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = brushColor;
          fabricCanvas.freeDrawingBrush.width = brushSize;
        }
        break;
      
      case 'highlighter':
        fabricCanvas.isDrawingMode = true;
        if (fabricCanvas.freeDrawingBrush) {
          fabricCanvas.freeDrawingBrush.color = brushColor;
          fabricCanvas.freeDrawingBrush.width = brushSize * 3; // Thicker for highlighter
        }
        break;
      
      case 'text':
        fabricCanvas.defaultCursor = 'text';
        break;
      
      case 'shape':
        fabricCanvas.defaultCursor = 'crosshair';
        break;
      
      case 'pan':
        fabricCanvas.defaultCursor = 'grab';
        break;
      
      default:
        fabricCanvas.defaultCursor = 'default';
    }
  }, [tool, fabricCanvas, brushSize, brushColor]);

  // Handle zoom and pan - removed to prevent double transform

  // Handle mouse events for custom tools
  const handleMouseDown = useCallback((e: any) => {
    if (!fabricCanvas) return;

    const pointer = fabricCanvas.getPointer(e.e);
    
    if (tool === 'shape') {
      addShape(pointer, shapeTool);
    } else if (tool === 'text') {
      addText(pointer);
    } else if (tool === 'sticky-note') {
      addStickyNote(pointer);
    }
  }, [fabricCanvas, tool, shapeTool, stickyNoteColor]);

  const addShape = (pointer: { x: number; y: number }, type: ShapeTool) => {
    if (!fabricCanvas) return;

    let shape;
    const commonProps = {
      left: pointer.x,
      top: pointer.y,
      fill: brushColor,
      stroke: brushColor,
      strokeWidth: 2,
    };

    switch (type) {
      case 'rectangle':
        shape = new Rect({
          ...commonProps,
          width: 100,
          height: 60,
        });
        break;
      
      case 'circle':
        shape = new Circle({
          ...commonProps,
          radius: 50,
        });
        break;
      
      case 'triangle':
        shape = new Triangle({
          ...commonProps,
          width: 100,
          height: 100,
        });
        break;
      
      default:
        return;
    }

    fabricCanvas.add(shape);
    fabricCanvas.setActiveObject(shape);
    fabricCanvas.renderAll();

    // Create drawing element for state management
    const element: DrawingElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      position: { x: pointer.x, y: pointer.y },
      size: { width: 100, height: 100 },
      properties: {
        shapeType: type,
        fill: brushColor,
        stroke: brushColor,
        strokeWidth: 2,
      },
      layer: 1,
    };

    onElementAdd(element);
    toast(`${type} added`);
  };

  const addText = (pointer: { x: number; y: number }) => {
    if (!fabricCanvas) return;

    const text = new FabricText('Type here...', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: brushColor,
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    // @ts-ignore - enterEditing method exists but not in types
    text.enterEditing?.();
    fabricCanvas.renderAll();

    // Create drawing element for state management
    const element: DrawingElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      position: { x: pointer.x, y: pointer.y },
      properties: {
        text: 'Type here...',
        fontSize: 20,
        fontFamily: 'Arial',
        fill: brushColor,
      },
      layer: 1,
    };

    onElementAdd(element);
    toast("Text added - click to edit");
  };

  const addStickyNote = (pointer: { x: number; y: number }) => {
    const element: DrawingElement = {
      id: `sticky-${Date.now()}`,
      type: 'sticky-note',
      position: { x: pointer.x, y: pointer.y },
      size: { width: 200, height: 150 },
      properties: {
        stickyColor: stickyNoteColor,
        stickyText: "New note",
      },
      layer: 1,
    };

    onElementAdd(element);
    toast("Sticky note added - double click to edit");
  };

  // Handle drawing events
  useEffect(() => {
    if (!fabricCanvas) return;

    const handlePathCreated = (e: any) => {
      const path = e.path;
      if (path) {
        const element: DrawingElement = {
          id: `drawing-${Date.now()}`,
          type: 'drawing',
          position: { x: path.left || 0, y: path.top || 0 },
          properties: {
            brushSize: tool === 'highlighter' ? brushSize * 3 : brushSize,
            brushColor,
            brushType: tool === 'highlighter' ? 'highlighter' : 'pen',
          },
          layer: 1,
        };
        onElementAdd(element);
      }
    };

    fabricCanvas.on('path:created', handlePathCreated);
    fabricCanvas.on('mouse:down', handleMouseDown);

    return () => {
      fabricCanvas.off('path:created', handlePathCreated);
      fabricCanvas.off('mouse:down', handleMouseDown);
    };
  }, [fabricCanvas, handleMouseDown, onElementAdd, brushSize, brushColor, tool]);

  const isDrawingTool = tool === 'draw' || tool === 'highlighter' || tool === 'shape' || tool === 'text' || tool === 'sticky-note';
  
  return (
    <div 
      className={`absolute inset-0 ${isDrawingTool ? 'z-30' : 'z-10'}`}
      style={{
        pointerEvents: tool === 'pan' ? 'none' : 'auto',
      }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}