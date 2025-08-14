import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import KnowledgeCard from "./KnowledgeCard";
import { Plus, ZoomIn, ZoomOut, Move, Hand } from "lucide-react";

interface Position {
  x: number;
  y: number;
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

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<"select" | "pan">("select");
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
  };

  const updateCard = (id: string, updates: Partial<CardData>) => {
    setCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
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
        
        <div className="w-px h-6 bg-border mx-1" />
        
        <Button variant="default" size="sm" onClick={addNewCard}>
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      {/* Whiteboard Canvas */}
      <div
        ref={whiteboardRef}
        className={`w-full h-full relative ${tool === "pan" ? "cursor-grab" : "cursor-default"} ${isPanning ? "cursor-grabbing" : ""}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: "0 0",
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
          }}
        />

        {/* Cards */}
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              position: "absolute",
              left: card.position.x,
              top: card.position.y,
              transform: `scale(${1/zoom})`,
              transformOrigin: "0 0",
            }}
          >
            <KnowledgeCard
              id={card.id}
              title={card.title}
              content={card.content}
              tags={card.tags}
              color={card.color}
              position={card.position}
              onPositionChange={updateCardPosition}
              onDelete={deleteCard}
              onUpdate={updateCard}
              disabled={tool === "pan"}
            />
          </div>
        ))}
      </div>
    </div>
  );
}