import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import KnowledgeCard from "./KnowledgeCard";
import EnhancedConnectionCanvas from "./Connections/EnhancedConnectionCanvas";
import FabricCanvasComponent from "./Canvas/FabricCanvas";
import AdvancedToolbar from "./Toolbar/AdvancedToolbar";
import MediaUploader from "./Media/MediaUploader";
import MediaElement from "./Elements/MediaElement";
import { Plus, ZoomIn, ZoomOut, Move, Hand, Link } from "lucide-react";
import { toast } from "sonner";
import { 
  WhiteboardTool, 
  ShapeTool, 
  CardData, 
  Connection, 
  ConnectionStyle, 
  DrawingElement, 
  Position 
} from "@/types/whiteboard";

// Types are now imported from @/types/whiteboard

export default function Whiteboard() {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: "1",
      title: "Deep Learning Fundamentals",
      content: "Understanding neural networks, backpropagation, and gradient descent. Key concepts include layers, weights, biases, and activation functions.",
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
      tags: ["machine-learning", "ai"],
      color: "accent-purple",
    },
    {
      id: "2",
      title: "Philosophy of Mind",
      content: "Exploring consciousness, qualia, and the hard problem of consciousness. How does subjective experience arise from physical processes?",
      position: { x: 400, y: 200 },
      size: { width: 320, height: 240 },
      tags: ["philosophy", "consciousness"],
      color: "accent-blue",
    },
    {
      id: "3",
      title: "Design Systems",
      content: "Creating consistent, scalable design languages. Includes color palettes, typography, spacing, and component libraries.",
      position: { x: 700, y: 150 },
      size: { width: 320, height: 240 },
      tags: ["design", "ui-ux"],
      color: "accent-green",
    },
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<WhiteboardTool>("select");
  const [shapeTool, setShapeTool] = useState<ShapeTool>("rectangle");
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState("#000000");
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
    toast("Zoom in");
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
    toast("Zoom out");
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === "pan") {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [tool]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning && tool === "pan") {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      setPan(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint, tool]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const updateCardPosition = (id: string, newPosition: Position) => {
    console.log(`Updating card ${id} position to:`, newPosition);
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, position: newPosition } : card
    ));
    
    // Update connections when card moves - using precise positioning
    setConnections(prev => prev.map(conn => {
      const updatedConn = { ...conn };
      const card = cards.find(c => c.id === id);
      const cardSize = card?.size || { width: 320, height: 240 };
      
      if (conn.fromCardId === id) {
        // Right edge connection point for "from" card
        updatedConn.fromPosition = { 
          x: newPosition.x + cardSize.width, // card width
          y: newPosition.y + cardSize.height / 2   // middle of card height
        };
      }
      
      if (conn.toCardId === id) {
        // Left edge connection point for "to" card
        updatedConn.toPosition = { 
          x: newPosition.x, 
          y: newPosition.y + cardSize.height / 2 // middle of card
        };
      }
      
      return updatedConn;
    }));
  };

  const updateCardSize = (id: string, newSize: { width: number; height: number }) => {
    console.log(`Updating card ${id} size to:`, newSize);
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, size: newSize } : card
    ));
    
    // Update connections when card size changes
    setConnections(prev => prev.map(conn => {
      const updatedConn = { ...conn };
      const card = cards.find(c => c.id === id);
      
      if (conn.fromCardId === id && card) {
        updatedConn.fromPosition = { 
          x: card.position.x + newSize.width,
          y: card.position.y + newSize.height / 2
        };
      }
      
      if (conn.toCardId === id && card) {
        updatedConn.toPosition = { 
          x: card.position.x,
          y: card.position.y + newSize.height / 2
        };
      }
      
      return updatedConn;
    }));
  };

  const addNewCard = () => {
    console.log("Adding new card...");
    const colors = ["accent-purple", "accent-blue", "accent-green", "accent-orange"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      title: "New Idea",
      content: "Click to edit this card and start writing your thoughts...",
      position: { 
        x: Math.random() * 300 + 150, 
        y: Math.random() * 200 + 150 
      },
      tags: [],
      color: randomColor,
    };
    
    setCards(prev => {
      const updated = [...prev, newCard];
      console.log("Cards updated:", updated);
      return updated;
    });
    
    toast("New card added! Click to edit it.");
  };

  const deleteCard = (id: string) => {
    console.log(`Deleting card ${id}`);
    setCards(prev => prev.filter(card => card.id !== id));
    // Remove connections related to deleted card
    setConnections(prev => prev.filter(conn => 
      conn.fromCardId !== id && conn.toCardId !== id
    ));
    toast("Card deleted");
  };

  const updateCard = (id: string, updates: Partial<CardData>) => {
    console.log(`Updating card ${id}:`, updates);
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
    toast("Card updated");
  };

  const handleStartConnection = (cardId: string, position: Position) => {
    console.log(`Starting connection from card ${cardId} at:`, position);
    if (tool === "connect" || !connectingFrom) {
      setConnectingFrom(cardId);
      setTool("connect");
      toast("Click on another card to connect them!");
    }
  };

  const handleConnect = () => {
    setTool("connect");
    setConnectingFrom(null);
    toast("Connection mode: Click a card to start connecting!");
  };

  const handleEndConnection = (cardId: string, position: Position) => {
    console.log(`Ending connection to card ${cardId} at:`, position);
    if (connectingFrom && connectingFrom !== cardId) {
      const fromCard = cards.find(card => card.id === connectingFrom);
      const toCard = cards.find(card => card.id === cardId);
      
      if (fromCard && toCard) {
        const fromSize = fromCard.size || { width: 320, height: 240 };
        const toSize = toCard.size || { width: 320, height: 240 };
        
        const defaultStyle: ConnectionStyle = {
          type: 'bezier',
          strokeWidth: 2,
          strokeColor: '#666666',
          arrowType: 'arrow',
        };

        const newConnection: Connection = {
          id: `${connectingFrom}-${cardId}-${Date.now()}`,
          fromCardId: connectingFrom,
          toCardId: cardId,
          fromPosition: { 
            x: fromCard.position.x + fromSize.width, // right edge of from card
            y: fromCard.position.y + fromSize.height / 2  // middle of from card
          },
          toPosition: { 
            x: toCard.position.x,         // left edge of to card
            y: toCard.position.y + toSize.height / 2    // middle of to card
          },
          style: defaultStyle,
        };
        
        console.log("Creating new connection:", newConnection);
        setConnections(prev => [...prev, newConnection]);
        toast("Cards connected successfully!");
      }
      
      setConnectingFrom(null);
      setTool("select");
    }
  };

  // Drawing element handlers
  const handleElementAdd = (element: DrawingElement) => {
    setDrawingElements(prev => [...prev, element]);
  };

  const handleElementUpdate = (id: string, updates: Partial<DrawingElement>) => {
    setDrawingElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleElementDelete = (id: string) => {
    setDrawingElements(prev => prev.filter(el => el.id !== id));
  };

  console.log("Current cards:", cards);
  console.log("Current connections:", connections);
  console.log("Current drawing elements:", drawingElements);

  return (
    <div className="flex-1 relative overflow-hidden bg-whiteboard">
      {/* Advanced Toolbar */}
      <AdvancedToolbar
        tool={tool}
        shapeTool={shapeTool}
        zoom={zoom}
        brushSize={brushSize}
        brushColor={brushColor}
        onToolChange={setTool}
        onShapeToolChange={setShapeTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onBrushSizeChange={setBrushSize}
        onBrushColorChange={setBrushColor}
        onAddCard={addNewCard}
        onConnect={handleConnect}
      />

      {/* Whiteboard Canvas */}
      <div
        ref={whiteboardRef}
        className={`w-full h-full relative ${
          tool === 'pan' ? 'cursor-grab' : 
          tool === 'draw' || tool === 'highlighter' ? 'cursor-crosshair' :
          tool === 'text' ? 'cursor-text' :
          tool === 'connect' ? 'cursor-cell' :
          'cursor-default'
        } ${isPanning ? "cursor-grabbing" : ""}`}
        onMouseDown={tool !== 'draw' && tool !== 'highlighter' && tool !== 'shape' && tool !== 'text' ? handleMouseDown : undefined}
        onMouseMove={tool !== 'draw' && tool !== 'highlighter' && tool !== 'shape' && tool !== 'text' ? handleMouseMove : undefined}
        onMouseUp={tool !== 'draw' && tool !== 'highlighter' && tool !== 'shape' && tool !== 'text' ? handleMouseUp : undefined}
        onMouseLeave={tool !== 'draw' && tool !== 'highlighter' && tool !== 'shape' && tool !== 'text' ? handleMouseUp : undefined}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: '0 0',
          pointerEvents: tool === 'draw' || tool === 'highlighter' || tool === 'shape' || tool === 'text' ? 'none' : 'auto',
        }}
      >
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        />

        {/* Enhanced Connection Canvas */}
        <EnhancedConnectionCanvas
          connections={connections}
          onConnectionUpdate={setConnections}
          containerRef={whiteboardRef}
          zoom={zoom}
          pan={pan}
        />

        {/* Fabric.js Drawing Canvas */}
        <FabricCanvasComponent
          tool={tool}
          shapeTool={shapeTool}
          brushSize={brushSize}
          brushColor={brushColor}
          zoom={zoom}
          pan={pan}
          onElementAdd={handleElementAdd}
          onElementUpdate={handleElementUpdate}
          onElementDelete={handleElementDelete}
        />

        {/* Cards */}
        <div
          className="relative z-20"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {cards.map((card) => (
            <KnowledgeCard
              key={card.id}
              id={card.id}
              title={card.title}
              content={card.content}
              tags={card.tags}
              color={card.color}
              position={card.position}
              size={card.size}
              onPositionChange={updateCardPosition}
              onSizeChange={updateCardSize}
              onDelete={deleteCard}
              onUpdate={updateCard}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
              disabled={tool === "pan"}
              scale={1}
            />
          ))}
        </div>

        {/* Drawing Elements */}
        <div
          className="relative z-15"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {drawingElements.map((element) => (
            <MediaElement
              key={element.id}
              element={element}
              onUpdate={handleElementUpdate}
              onDelete={handleElementDelete}
              scale={1}
            />
          ))}
        </div>

        {/* Media Uploader (positioned for click-to-add) */}
        {(tool === "image" || tool === "video" || tool === "pdf" || tool === "link") && (
          <div className="absolute top-20 left-4 z-10">
            <MediaUploader
              onMediaAdd={handleElementAdd}
              position={{ x: 100, y: 100 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
