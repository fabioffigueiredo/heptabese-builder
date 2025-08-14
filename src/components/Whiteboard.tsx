import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import KnowledgeCard from "./KnowledgeCard";
import ConnectionCanvas from "./ConnectionCanvas";
import { Plus, ZoomIn, ZoomOut, Move, Hand, Link } from "lucide-react";
import { toast } from "sonner";

interface Position {
  x: number;
  y: number;
}

interface Connection {
  id: string;
  fromCardId: string;
  toCardId: string;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
}

interface CardData {
  id: string;
  title: string;
  content: string;
  position: Position;
  tags: string[];
  color: string;
}

export default function Whiteboard() {
  const [cards, setCards] = useState<CardData[]>([
    {
      id: "1",
      title: "Deep Learning Fundamentals",
      content: "Understanding neural networks, backpropagation, and gradient descent. Key concepts include layers, weights, biases, and activation functions.",
      position: { x: 100, y: 100 },
      tags: ["machine-learning", "ai"],
      color: "accent-purple",
    },
    {
      id: "2",
      title: "Philosophy of Mind",
      content: "Exploring consciousness, qualia, and the hard problem of consciousness. How does subjective experience arise from physical processes?",
      position: { x: 400, y: 200 },
      tags: ["philosophy", "consciousness"],
      color: "accent-blue",
    },
    {
      id: "3",
      title: "Design Systems",
      content: "Creating consistent, scalable design languages. Includes color palettes, typography, spacing, and component libraries.",
      position: { x: 700, y: 150 },
      tags: ["design", "ui-ux"],
      color: "accent-green",
    },
  ]);

  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "pan" | "connect">("select");
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.3));
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
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, position: newPosition } : card
    ));
    
    // Update connections when card moves
    setConnections(prev => prev.map(conn => {
      if (conn.fromCardId === id) {
        return { ...conn, fromPosition: { x: newPosition.x + 160, y: newPosition.y + 100 } };
      }
      if (conn.toCardId === id) {
        return { ...conn, toPosition: { x: newPosition.x + 160, y: newPosition.y + 100 } };
      }
      return conn;
    }));
  };

  const addNewCard = () => {
    const newCard: CardData = {
      id: Date.now().toString(),
      title: "New Card",
      content: "Start writing your thoughts here...",
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 150 
      },
      tags: [],
      color: "accent-purple",
    };
    setCards(prev => [...prev, newCard]);
  };

  const deleteCard = (id: string) => {
    setCards(prev => prev.filter(card => card.id !== id));
    // Remove connections related to deleted card
    setConnections(prev => prev.filter(conn => 
      conn.fromCardId !== id && conn.toCardId !== id
    ));
  };

  const updateCard = (id: string, updates: Partial<CardData>) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  };

  const handleStartConnection = (cardId: string, position: Position) => {
    if (tool === "connect" || !connectingFrom) {
      setConnectingFrom(cardId);
      setTool("connect");
      toast("Click on another card to connect them!");
    }
  };

  const handleEndConnection = (cardId: string, position: Position) => {
    if (connectingFrom && connectingFrom !== cardId) {
      const fromCard = cards.find(card => card.id === connectingFrom);
      const toCard = cards.find(card => card.id === cardId);
      
      if (fromCard && toCard) {
        const newConnection: Connection = {
          id: `${connectingFrom}-${cardId}-${Date.now()}`,
          fromCardId: connectingFrom,
          toCardId: cardId,
          fromPosition: { x: fromCard.position.x + 160, y: fromCard.position.y + 100 },
          toPosition: { x: toCard.position.x + 160, y: toCard.position.y + 100 },
        };
        
        setConnections(prev => [...prev, newConnection]);
        toast("Cards connected successfully!");
      }
      
      setConnectingFrom(null);
      setTool("select");
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-whiteboard">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-card-bg/90 backdrop-blur-sm rounded-lg border border-border p-2 shadow-soft">
        <Button
          variant={tool === "select" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTool("select")}
        >
          <Move className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "pan" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTool("pan")}
        >
          <Hand className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="ghost" size="sm" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="sm" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant={tool === "connect" ? "default" : "ghost"}
          size="sm"
          onClick={() => {
            setTool("connect");
            setConnectingFrom(null);
            toast("Connection mode: Click a card to start connecting!");
          }}
        >
          <Link className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="default" size="sm" onClick={addNewCard}>
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      {/* Whiteboard Canvas */}
      <div
        ref={whiteboardRef}
        className={`w-full h-full relative ${tool === "pan" ? "cursor-grab" : tool === "connect" ? "cursor-crosshair" : "cursor-default"} ${isPanning ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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

        {/* Connection Canvas */}
        <ConnectionCanvas
          connections={connections}
          onConnectionUpdate={setConnections}
          containerRef={whiteboardRef}
          zoom={zoom}
          pan={pan}
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
              onPositionChange={updateCardPosition}
              onDelete={deleteCard}
              onUpdate={updateCard}
              onStartConnection={handleStartConnection}
              onEndConnection={handleEndConnection}
              disabled={tool === "pan"}
              scale={1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}