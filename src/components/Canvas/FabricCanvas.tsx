import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Triangle, Path, FabricText, PencilBrush } from "fabric";
import { WhiteboardTool, ShapeTool, DrawingElement, Position } from "@/types/whiteboard";
import { toast } from "sonner";

interface FabricCanvasProps {
  tool: WhiteboardTool;
  shapeTool: ShapeTool;
  brushSize: number;
  brushColor: string;
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

    // Manually create and configure the drawing brush for Fabric.js v6
    try {
      const brush = new PencilBrush(canvas);
      brush.color = brushColor;
      brush.width = brushSize;
      canvas.freeDrawingBrush = brush;
    } catch (error) {
      // Fallback to original method
      canvas.isDrawingMode = true;
      setTimeout(() => {
        if (canvas.freeDrawingBrush) {
          canvas.freeDrawingBrush.color = brushColor;
          canvas.freeDrawingBrush.width = brushSize;
        }
        canvas.isDrawingMode = false;
      }, 0);
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
        
        // Use setTimeout to ensure brush is available
        setTimeout(() => {
          if (fabricCanvas.freeDrawingBrush) {
            fabricCanvas.freeDrawingBrush.color = brushColor;
            fabricCanvas.freeDrawingBrush.width = brushSize;
          }
        }, 0);
        break;
      
      case 'highlighter':
        fabricCanvas.isDrawingMode = true;
        
        // Use setTimeout to ensure brush is available
        setTimeout(() => {
          if (fabricCanvas.freeDrawingBrush) {
            // Convert hex color to rgba with transparency for highlighter effect
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16);
              const g = parseInt(hex.slice(3, 5), 16);
              const b = parseInt(hex.slice(5, 7), 16);
              return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            };
            
            fabricCanvas.freeDrawingBrush.color = hexToRgba(brushColor, 0.5); // 50% transparency for better visibility
            fabricCanvas.freeDrawingBrush.width = brushSize * 4; // Wider for highlighter
            
            // Set brush properties for highlighter effect
            if (fabricCanvas.freeDrawingBrush instanceof PencilBrush) {
              fabricCanvas.freeDrawingBrush.strokeLineCap = 'round';
              fabricCanvas.freeDrawingBrush.strokeLineJoin = 'round';
            }
          }
        }, 0);
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

  // Update brush properties when they change
  useEffect(() => {
    if (!fabricCanvas || !fabricCanvas.freeDrawingBrush) return;
    
    if (tool === 'draw') {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    } else if (tool === 'highlighter') {
      fabricCanvas.freeDrawingBrush.color = brushColor;
      fabricCanvas.freeDrawingBrush.width = brushSize * 3;
    }
  }, [fabricCanvas, brushSize, brushColor, tool]);

  // Handle zoom and pan
  useEffect(() => {
    if (!fabricCanvas) return;

    const viewportTransform = fabricCanvas.viewportTransform;
    if (viewportTransform) {
      viewportTransform[0] = zoom;
      viewportTransform[3] = zoom;
      viewportTransform[4] = pan.x * zoom;
      viewportTransform[5] = pan.y * zoom;
      fabricCanvas.setViewportTransform(viewportTransform);
    }
  }, [fabricCanvas, zoom, pan]);

  // Handle mouse events for custom tools
  const handleMouseDown = useCallback((e: any) => {
    if (!fabricCanvas) return;

    const pointer = fabricCanvas.getPointer(e.e);
    
    if (tool === 'shape') {
      addShape(pointer, shapeTool);
    } else if (tool === 'text') {
      addText(pointer);
    }
  }, [fabricCanvas, tool, shapeTool]);

  const addShape = (pointer: { x: number; y: number }, type: ShapeTool) => {
    if (!fabricCanvas) return;

    const elementId = `shape-${Date.now()}`;
    let shape;
    const commonProps = {
      left: pointer.x,
      top: pointer.y,
      fill: brushColor,
      stroke: brushColor,
      strokeWidth: 2,
      data: { elementId }, // Store element ID in fabric object
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
      id: elementId,
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

    const elementId = `text-${Date.now()}`;
    const text = new FabricText('Type here...', {
      left: pointer.x,
      top: pointer.y,
      fontFamily: 'Arial',
      fontSize: 20,
      fill: brushColor,
      data: { elementId }, // Store element ID in fabric object
    });

    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
    // @ts-ignore - enterEditing method exists but not in types
    text.enterEditing?.();
    fabricCanvas.renderAll();

    // Create drawing element for state management
    const element: DrawingElement = {
      id: elementId,
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

  // Handle keyboard events for deleting selected objects
  useEffect(() => {
    if (!fabricCanvas) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && tool === 'select') {
        const activeObject = fabricCanvas.getActiveObject();
        const activeObjects = fabricCanvas.getActiveObjects();
        
        if (activeObjects && activeObjects.length > 0) {
          event.preventDefault();
          
          // Remove objects from canvas
          activeObjects.forEach(obj => {
            fabricCanvas.remove(obj);
            
            // If object has a custom id, call onElementDelete
            if (obj.data && obj.data.elementId) {
              onElementDelete(obj.data.elementId);
            }
          });
          
          fabricCanvas.discardActiveObject();
          fabricCanvas.renderAll();
          toast.success('Desenho(s) excluído(s)');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [fabricCanvas, tool, onElementDelete]);

  // Handle drawing events
  useEffect(() => {
    if (!fabricCanvas) return;

    const handlePathCreated = (e: any) => {
      const path = e.path;
      if (path) {
        const elementId = `drawing-${Date.now()}`;
        
        // Store element ID in the fabric object for later reference
        path.set('data', { elementId });
        
        const element: DrawingElement = {
          id: elementId,
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
  }, [fabricCanvas, handleMouseDown, onElementAdd, onElementDelete, brushSize, brushColor, tool]);

  return (
    <div className="absolute inset-0 pointer-events-auto">
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0"
        style={{
          pointerEvents: tool === 'pan' ? 'none' : 'auto',
        }}
      />
    </div>
  );
}