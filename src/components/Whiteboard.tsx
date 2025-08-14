import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { CardData, Position, Connection, ConnectionStyle, DrawingElement, WhiteboardTool, ShapeTool } from "@/types/whiteboard";
import KnowledgeCard from "./KnowledgeCard";
import AdvancedToolbar from "./Toolbar/AdvancedToolbar";
import EnhancedConnectionCanvas from "./Connections/EnhancedConnectionCanvas";
import FabricCanvasComponent from "./Canvas/FabricCanvas";
import MediaElement from "./Elements/MediaElement";
import MediaUploader from "./Media/MediaUploader";
import InfiniteCanvas from "./Canvas/InfiniteCanvas";
import MiniMap from "./Canvas/MiniMap";
import NavigationPanel from "./Canvas/NavigationPanel";
import DynamicGrid from "./Canvas/DynamicGrid";

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
  const [pan, setPan] = useState<Position>({ x: 100, y: 100 });
  const [currentTool, setCurrentTool] = useState<WhiteboardTool>("select");
  const [shapeTool, setShapeTool] = useState<ShapeTool>("rectangle");
  const [drawingElements, setDrawingElements] = useState<DrawingElement[]>([]);
  const [brushSize, setBrushSize] = useState(2);
  const [brushColor, setBrushColor] = useState("#000000");
  
  // Navigation state
  const [showGrid, setShowGrid] = useState(true);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  
  const whiteboardRef = useRef<HTMLDivElement>(null);

  // Update container size
  useEffect(() => {
    const updateSize = () => {
      if (whiteboardRef.current) {
        setContainerSize({
          width: whiteboardRef.current.clientWidth,
          height: whiteboardRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const handlePanChange = (newPan: Position) => {
    console.log("Pan changed to:", newPan);
    setPan(newPan);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(100, prev * 1.2));
    toast("Zoomed in");
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(0.01, prev / 1.2));
    toast("Zoomed out");
  };

  const handleToggleGrid = () => {
    setShowGrid(prev => !prev);
    toast(showGrid ? "Grid hidden" : "Grid shown");
  };

  const handleNavigate = (newPan: Position, newZoom?: number) => {
    setPan(newPan);
    if (newZoom !== undefined) {
      setZoom(newZoom);
    }
  };

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
    if (currentTool === "connect" || !connectingFrom) {
      setConnectingFrom(cardId);
      setCurrentTool("connect");
      toast("Click on another card to connect them!");
    }
  };

  const handleConnect = () => {
    setCurrentTool("connect");
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
      setCurrentTool("select");
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
  console.log("Current zoom:", zoom, "pan:", pan);
  console.log("Container size:", containerSize);
  console.log("Show grid:", showGrid);

  return (
    <div className="flex flex-col h-full">
      <AdvancedToolbar
        tool={currentTool}
        onToolChange={setCurrentTool}
        shapeTool={shapeTool}
        onShapeToolChange={setShapeTool}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        brushSize={brushSize}
        onBrushSizeChange={setBrushSize}
        brushColor={brushColor}
        onBrushColorChange={setBrushColor}
        onConnect={handleConnect}
        isConnecting={connectingFrom !== null}
        onAddCard={addNewCard}
      />
      
      <div 
        ref={whiteboardRef}
        className="flex-1 relative overflow-hidden bg-background"
      >
        <InfiniteCanvas
          zoom={zoom}
          pan={pan}
          onZoomChange={handleZoomChange}
          onPanChange={handlePanChange}
          tool={currentTool}
          className="w-full h-full"
        >
          {/* Dynamic Grid */}
          <DynamicGrid
            zoom={zoom}
            pan={pan}
            containerSize={containerSize}
            visible={showGrid}
          />

          {/* Connections */}
          <EnhancedConnectionCanvas
            connections={connections}
            onConnectionUpdate={setConnections}
            containerRef={whiteboardRef}
            zoom={zoom}
            pan={pan}
          />

          {/* Fabric.js Canvas for Drawing */}
          <FabricCanvasComponent
            tool={currentTool}
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
          <div className="relative z-20">
            {cards.map((card) => (
              <KnowledgeCard
                key={card.id}
                data={card}
                onPositionChange={(position) => updateCardPosition(card.id, position)}
                onSizeChange={(size) => updateCardSize(card.id, size)}
                onUpdate={(updates) => updateCard(card.id, updates)}
                onDelete={() => deleteCard(card.id)}
                onConnectionStart={() => handleStartConnection(card.id, card.position)}
                onConnectionEnd={() => handleEndConnection(card.id, card.position)}
                isConnecting={connectingFrom !== null}
                zoom={zoom}
                disabled={currentTool !== 'select'}
              />
            ))}
          </div>

          {/* Drawing Elements */}
          <div className="relative z-15">
            {drawingElements.map((element) => (
              <MediaElement
                key={element.id}
                element={element}
                onUpdate={(updates) => handleElementUpdate(element.id, updates)}
                onDelete={() => handleElementDelete(element.id)}
                zoom={zoom}
              />
            ))}
          </div>
        </InfiniteCanvas>

        {/* Media Uploader */}
        {(currentTool === 'image' || currentTool === 'video' || currentTool === 'pdf') && (
          <MediaUploader
            tool={currentTool}
            onUpload={(element) => {
              setDrawingElements(prev => [...prev, element]);
              setCurrentTool('select');
            }}
            onCancel={() => setCurrentTool('select')}
          />
        )}

        {/* Mini Map */}
        <MiniMap
          cards={cards}
          zoom={zoom}
          pan={pan}
          onNavigate={handleNavigate}
          containerSize={containerSize}
        />

        {/* Navigation Panel */}
        <NavigationPanel
          zoom={zoom}
          pan={pan}
          onZoomChange={handleZoomChange}
          onPanChange={handlePanChange}
          cards={cards}
          containerSize={containerSize}
          showGrid={showGrid}
          onToggleGrid={handleToggleGrid}
        />
      </div>
    </div>
  );
}