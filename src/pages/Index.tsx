import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import Whiteboard from "@/components/Whiteboard";
import CardDatabase from "@/components/Database/CardDatabase";
import { EnhancedCardData, CardProperties } from "@/types/heptabase";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<'whiteboard' | 'database'>('whiteboard');
  
  // Enhanced cards with properties for database view
  const [enhancedCards, setEnhancedCards] = useState<EnhancedCardData[]>([
    {
      id: "1",
      title: "Deep Learning Fundamentals",
      content: "Understanding neural networks, backpropagation, and gradient descent. Key concepts include layers, weights, biases, and activation functions.",
      position: { x: 100, y: 100 },
      size: { width: 320, height: 240 },
      tags: ["machine-learning", "ai", "neural-networks"],
      color: "accent-purple",
      properties: {
        status: 'in-progress',
        priority: 'high',
        progress: 75,
        rating: 4,
        dateCreated: new Date('2024-01-15'),
        dateModified: new Date(),
        category: 'Research',
        favorite: true,
      },
      linkedCards: ["2"],
      backlinks: [],
    },
    {
      id: "2", 
      title: "Philosophy of Mind",
      content: "Exploring consciousness, qualia, and the hard problem of consciousness. How does subjective experience arise from physical processes?",
      position: { x: 400, y: 200 },
      size: { width: 320, height: 240 },
      tags: ["philosophy", "consciousness", "qualia"],
      color: "accent-blue",
      properties: {
        status: 'todo',
        priority: 'medium',
        progress: 25,
        rating: 5,
        dateCreated: new Date('2024-01-10'),
        dateModified: new Date(),
        category: 'Philosophy',
        favorite: false,
      },
      linkedCards: ["3"],
      backlinks: ["1"],
    },
    {
      id: "3",
      title: "Design Systems", 
      content: "Creating consistent, scalable design languages. Includes color palettes, typography, spacing, and component libraries.",
      position: { x: 700, y: 150 },
      size: { width: 320, height: 240 },
      tags: ["design", "ui-ux", "systems"],
      color: "accent-green",
      properties: {
        status: 'done',
        priority: 'low',
        progress: 100,
        rating: 3,
        dateCreated: new Date('2024-01-05'),
        dateModified: new Date(),
        category: 'Design',
        favorite: true,
      },
      linkedCards: [],
      backlinks: ["2"],
    },
  ]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleCardUpdate = (id: string, updates: Partial<EnhancedCardData>) => {
    setEnhancedCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ));
  };

  const handleCardCreate = () => {
    const newCard: EnhancedCardData = {
      id: `card-${Date.now()}`,
      title: "New Idea",
      content: "Click to edit this card and start writing your thoughts...",
      position: { x: Math.random() * 300 + 150, y: Math.random() * 200 + 150 },
      tags: [],
      color: "accent-purple",
      properties: {
        status: 'todo',
        priority: 'medium',
        progress: 0,
        rating: 0,
        dateCreated: new Date(),
        dateModified: new Date(),
        favorite: false,
      },
      linkedCards: [],
      backlinks: [],
    };
    setEnhancedCards(prev => [...prev, newCard]);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar 
        sidebarCollapsed={sidebarCollapsed} 
        onToggleSidebar={toggleSidebar}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onViewModeChange={setCurrentView}
          currentView={currentView}
        />
        
        {currentView === 'whiteboard' ? (
          <Whiteboard />
        ) : (
          <CardDatabase
            cards={enhancedCards}
            onCardUpdate={handleCardUpdate}
            onCardCreate={handleCardCreate}
            onViewModeChange={setCurrentView}
            currentView={currentView}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
