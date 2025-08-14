import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Plus,
  Hash,
  FileText,
  Bookmark,
  Settings,
  ChevronDown,
  ChevronRight,
  Folder,
  Map,
} from "lucide-react";

interface SidebarProps {
  isCollapsed?: boolean;
}

export default function Sidebar({ isCollapsed = false }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    projects: true,
    tags: true,
    recent: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const projects = [
    { name: "Research Project", color: "accent-purple", cardCount: 12 },
    { name: "Learning Notes", color: "accent-blue", cardCount: 8 },
    { name: "Ideas Collection", color: "accent-green", cardCount: 5 },
  ];

  const tags = [
    { name: "machine-learning", count: 15, color: "accent-purple" },
    { name: "philosophy", count: 8, color: "accent-blue" },
    { name: "productivity", count: 12, color: "accent-green" },
    { name: "design", count: 6, color: "accent-orange" },
  ];

  const recentCards = [
    "Understanding Deep Learning",
    "The Nature of Consciousness",
    "Design Principles",
    "Productivity Systems",
  ];

  if (isCollapsed) {
    return (
      <div className="w-16 bg-sidebar-bg border-r border-border h-full flex flex-col items-center py-4 space-y-4">
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Folder className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Hash className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-sidebar-bg border-r border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Map className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">Heptabase</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search everything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/50 border-border"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 h-9 text-sm hover:bg-accent/50"
            >
              <Plus className="h-4 w-4" />
              New Card
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 h-9 text-sm hover:bg-accent/50"
            >
              <FileText className="h-4 w-4" />
              New Whiteboard
            </Button>
          </div>

          <Separator />

          {/* Projects */}
          <div>
            <Button
              variant="ghost"
              onClick={() => toggleSection("projects")}
              className="w-full justify-between p-0 h-8 text-sm font-medium text-foreground hover:bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Projects
              </span>
              {expandedSections.projects ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {expandedSections.projects && (
              <div className="mt-2 space-y-1">
                {projects.map((project, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between h-8 text-sm px-6 hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-${project.color}`} />
                      <span className="text-foreground">{project.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {project.cardCount}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <Button
              variant="ghost"
              onClick={() => toggleSection("tags")}
              className="w-full justify-between p-0 h-8 text-sm font-medium text-foreground hover:bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Tags
              </span>
              {expandedSections.tags ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {expandedSections.tags && (
              <div className="mt-2 space-y-1">
                {tags.map((tag, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-between h-8 text-sm px-6 hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground">{tag.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {tag.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Recent */}
          <div>
            <Button
              variant="ghost"
              onClick={() => toggleSection("recent")}
              className="w-full justify-between p-0 h-8 text-sm font-medium text-foreground hover:bg-transparent"
            >
              <span className="flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Recent
              </span>
              {expandedSections.recent ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
            
            {expandedSections.recent && (
              <div className="mt-2 space-y-1">
                {recentCards.map((card, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start h-8 text-sm px-6 hover:bg-accent/50"
                  >
                    <FileText className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className="text-foreground truncate">{card}</span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 h-9 text-sm hover:bg-accent/50"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}