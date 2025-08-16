import { useState } from "react";
import { Position, CardData } from "@/types/whiteboard";
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Target, 
  Grid3X3, 
  Navigation,
  Home,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NavigationPanelProps {
  zoom: number;
  pan: Position;
  onZoomChange: (zoom: number) => void;
  onPanChange: (pan: Position) => void;
  cards: CardData[];
  containerSize: { width: number; height: number };
  showGrid: boolean;
  onToggleGrid: () => void;
  className?: string;
}

export default function NavigationPanel({
  zoom,
  pan,
  onZoomChange,
  onPanChange,
  cards,
  containerSize,
  showGrid,
  onToggleGrid,
  className = ""
}: NavigationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Zoom functions
  const zoomIn = () => {
    const newZoom = Math.min(100, zoom * 1.2);
    onZoomChange(newZoom);
    toast(`Zoom: ${Math.round(newZoom * 100)}%`);
  };

  const zoomOut = () => {
    const newZoom = Math.max(0.01, zoom / 1.2);
    onZoomChange(newZoom);
    toast(`Zoom: ${Math.round(newZoom * 100)}%`);
  };

  const resetZoom = () => {
    onZoomChange(1);
    toast("Zoom reset to 100%");
  };

  // Fit functions
  const fitAll = () => {
    if (cards.length === 0) {
      onZoomChange(1);
      onPanChange({ x: 0, y: 0 });
      toast("No cards to fit");
      return;
    }

    // Calculate bounds of all cards
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    cards.forEach(card => {
      const cardWidth = card.size?.width || 300;
      const cardHeight = card.size?.height || 200;
      
      minX = Math.min(minX, card.position.x);
      minY = Math.min(minY, card.position.y);
      maxX = Math.max(maxX, card.position.x + cardWidth);
      maxY = Math.max(maxY, card.position.y + cardHeight);
    });

    // Add padding
    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    // Calculate zoom to fit
    const zoomX = containerSize.width / contentWidth;
    const zoomY = containerSize.height / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 3); // Cap at 300%

    // Center the content
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const newPanX = containerSize.width / 2 - centerX * newZoom;
    const newPanY = containerSize.height / 2 - centerY * newZoom;

    onZoomChange(newZoom);
    onPanChange({ x: newPanX, y: newPanY });
    toast("Fitted all cards");
  };

  const centerView = () => {
    onPanChange({ x: 0, y: 0 });
    toast("View centered");
  };

  const goHome = () => {
    onZoomChange(1);
    onPanChange({ x: 0, y: 0 });
    toast("Returned to origin");
  };

  // Get zoom percentage for display
  const zoomPercentage = Math.round(zoom * 100);

  const navigationButtons = [
    {
      icon: ZoomIn,
      tooltip: "Zoom In (Ctrl/Cmd + +)",
      onClick: zoomIn,
      disabled: zoom >= 100
    },
    {
      icon: ZoomOut,
      tooltip: "Zoom Out (Ctrl/Cmd + -)",
      onClick: zoomOut,
      disabled: zoom <= 0.01
    },
    {
      icon: Target,
      tooltip: "Reset Zoom (Ctrl/Cmd + 0)",
      onClick: resetZoom,
      disabled: zoom === 1
    },
    {
      icon: Maximize,
      tooltip: "Fit All Cards",
      onClick: fitAll,
      disabled: cards.length === 0
    },
    {
      icon: Navigation,
      tooltip: "Center View",
      onClick: centerView,
      disabled: pan.x === 0 && pan.y === 0
    },
    {
      icon: Home,
      tooltip: "Go to Origin",
      onClick: goHome,
      disabled: zoom === 1 && pan.x === 0 && pan.y === 0
    },
    {
      icon: Grid3X3,
      tooltip: showGrid ? "Hide Grid" : "Show Grid",
      onClick: onToggleGrid,
      variant: showGrid ? "default" : "outline"
    }
  ];

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg">
        {/* Zoom indicator */}
        <div className="px-3 py-2 border-b">
          <div className="text-xs font-medium text-center text-muted-foreground">
            {zoomPercentage}%
          </div>
        </div>

        {/* Main controls */}
        <div className="p-2 space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={zoom >= 100}
                  className="h-8 w-8 p-0"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In (Ctrl/Cmd + +)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={zoom <= 0.01}
                  className="h-8 w-8 p-0"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out (Ctrl/Cmd + -)</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={fitAll}
                disabled={cards.length === 0}
                className="w-full h-8"
              >
                <Maximize className="h-3 w-3 mr-1" />
                Fit All
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit All Cards</TooltipContent>
          </Tooltip>

          {/* Expandable controls */}
          {isExpanded && (
            <>
              <Separator />
              
              <div className="grid grid-cols-2 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetZoom}
                      disabled={zoom === 1}
                      className="h-8 w-8 p-0"
                    >
                      <Target className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reset Zoom (Ctrl/Cmd + 0)</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={centerView}
                      disabled={pan.x === 0 && pan.y === 0}
                      className="h-8 w-8 p-0"
                    >
                      <Navigation className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Center View</TooltipContent>
                </Tooltip>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goHome}
                    disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
                    className="w-full h-8"
                  >
                    <Home className="h-3 w-3 mr-1" />
                    Origin
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Go to Origin</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showGrid ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleGrid}
                    className="w-full h-8"
                  >
                    <Grid3X3 className="h-3 w-3 mr-1" />
                    Grid
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showGrid ? "Hide Grid" : "Show Grid"}</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Expand/collapse button */}
          <Separator />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full h-6 text-xs"
          >
            {isExpanded ? "Less" : "More"}
          </Button>
        </div>
      </div>
    </div>
  );
}