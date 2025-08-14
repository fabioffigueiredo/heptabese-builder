import React, { useState, useRef, useCallback, useEffect } from "react";
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

interface WhiteboardProps {
  onNewCard?: () => void;
  cards?: CardData[];
  onCardsChange?: (cards: CardData[]) => void;
}

export default function Whiteboard({ onNewCard, cards: externalCards, onCardsChange }: WhiteboardProps) {
  // Use external cards if provided, otherwise use default internal cards
  const defaultCards: CardData[] = [
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
  ];
  
  const [cards, setCards] = useState<CardData[]>(externalCards || defaultCards);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  // Sync with external cards when they change
  useEffect(() => {
    if (externalCards) {
      setCards(externalCards);
    }
  }, [externalCards]);

  // Handle keyboard events for deleting selected cards
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedCardId) {
        event.preventDefault();
        deleteCard(selectedCardId);
        setSelectedCardId(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCardId]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Virtual canvas bounds for infinite scrolling
  const VIRTUAL_BOUNDS = {
    minX: -50000,
    maxX: 50000,
    minY: -50000,
    maxY: 50000,
  };
  const [tool, setTool] = useState<WhiteboardTool>("select");
  const [shapeTool, setShapeTool] = useState<ShapeTool>("rectangle");
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#000000");
  const [highlightColor, setHighlightColor] = useState("#ffff00");
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
    toast("Zoom in");
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
    toast("Zoom out");
  };

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl/Cmd + scroll
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.1), 5));
    } else {
      // Pan with scroll - with virtual bounds
      setPan(prev => {
        const newX = Math.max(VIRTUAL_BOUNDS.minX, Math.min(VIRTUAL_BOUNDS.maxX, prev.x - e.deltaX));
        const newY = Math.max(VIRTUAL_BOUNDS.minY, Math.min(VIRTUAL_BOUNDS.maxY, prev.y - e.deltaY));
        return { x: newX, y: newY };
      });
    }
  }, []);

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
      
      setPan(prev => {
        const newX = Math.max(VIRTUAL_BOUNDS.minX, Math.min(VIRTUAL_BOUNDS.maxX, prev.x + deltaX));
        const newY = Math.max(VIRTUAL_BOUNDS.minY, Math.min(VIRTUAL_BOUNDS.maxY, prev.y + deltaY));
        return { x: newX, y: newY };
      });
      
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
    
    // Calculate position relative to current viewport
    const viewportCenterX = (-pan.x / zoom) + (window.innerWidth / 2 / zoom);
    const viewportCenterY = (-pan.y / zoom) + (window.innerHeight / 2 / zoom);
    
    const newCard: CardData = {
      id: `card-${Date.now()}`,
      title: "New Idea",
      content: "Click to edit this card and start writing your thoughts...",
      position: { 
        x: viewportCenterX - 160, // Center the card (320px width / 2)
        y: viewportCenterY - 120  // Center the card (240px height / 2)
      },
      tags: [],
      color: randomColor,
    };
    
    setCards(prev => {
      const updated = [...prev, newCard];
      console.log("Cards updated:", updated);
      // Notify parent component if callback is provided
      if (onCardsChange) {
        onCardsChange(updated);
      }
      return updated;
    });
    
    toast("New card added! Click to edit it.");
  };

  // Use external onNewCard if provided, otherwise use internal addNewCard
  const handleAddCard = onNewCard || addNewCard;

  // Center view on content
  const centerView = () => {
    if (cards.length === 0) {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      return;
    }

    // Calculate bounding box of all cards
    const bounds = cards.reduce(
      (acc, card) => {
        const cardRight = card.position.x + (card.size?.width || 320);
        const cardBottom = card.position.y + (card.size?.height || 240);
        return {
          minX: Math.min(acc.minX, card.position.x),
          minY: Math.min(acc.minY, card.position.y),
          maxX: Math.max(acc.maxX, cardRight),
          maxY: Math.max(acc.maxY, cardBottom),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    );

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    setPan({
      x: viewportCenterX - centerX * zoom,
      y: viewportCenterY - centerY * zoom,
    });
  };

  // Auto-center on first load if no cards are visible
  useEffect(() => {
    if (cards.length > 0) {
      const viewportBounds = {
        left: -pan.x / zoom,
        top: -pan.y / zoom,
        right: (-pan.x + window.innerWidth) / zoom,
        bottom: (-pan.y + window.innerHeight) / zoom,
      };

      const hasVisibleCards = cards.some(card => {
        const cardRight = card.position.x + (card.size?.width || 320);
        const cardBottom = card.position.y + (card.size?.height || 240);
        return (
          card.position.x < viewportBounds.right &&
          cardRight > viewportBounds.left &&
          card.position.y < viewportBounds.bottom &&
          cardBottom > viewportBounds.top
        );
      });

      if (!hasVisibleCards) {
        centerView();
      }
    }
  }, [cards.length]);

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
    toast.success('Elemento de mídia adicionado');
  };

  const handleElementUpdate = (id: string, updates: Partial<DrawingElement>) => {
    setDrawingElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const handleElementDelete = (id: string) => {
    setDrawingElements(prev => prev.filter(el => el.id !== id));
    toast.success('Elemento excluído com sucesso');
  };



  return (
    <div className="flex-1 relative overflow-hidden bg-whiteboard">
      {/* Advanced Toolbar */}
      <AdvancedToolbar
        tool={tool}
        shapeTool={shapeTool}
        zoom={zoom}
        brushSize={brushSize}
        brushColor={brushColor}
        highlightColor={highlightColor}
        onToolChange={setTool}
        onShapeToolChange={setShapeTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onBrushSizeChange={setBrushSize}
        onBrushColorChange={setBrushColor}
        onHighlightColorChange={setHighlightColor}
        onAddCard={handleAddCard}
        onConnect={handleConnect}
        onCenterView={centerView}
      />

      {/* Whiteboard Canvas */}
      <div
        ref={whiteboardRef}
        className={`w-full h-full relative ${tool === "pan" ? "cursor-grab" : tool === "connect" ? "cursor-crosshair" : "cursor-default"} ${isPanning ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Infinite Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            backgroundPosition: `${pan.x % (20 * zoom)}px ${pan.y % (20 * zoom)}px`,
            transform: 'translateZ(0)', // Force GPU acceleration
          }}
        />

        {/* Static Grid for reference */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
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
              isSelected={selectedCardId === card.id}
              onSelect={setSelectedCardId}
              currentTool={tool}
              highlightColor={highlightColor}
            />
          ))}
        </div>

        {/* Drawing Elements */}
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {drawingElements.filter(element => element.type !== 'drawing').map((element) => (
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
