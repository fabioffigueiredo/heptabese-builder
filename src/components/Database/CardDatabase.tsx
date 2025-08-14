import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Table2, 
  Grid3X3, 
  Search, 
  Filter, 
  SortAsc, 
  Plus,
  Star,
  Calendar,
  Tag,
  User,
  Clock,
  Percent,
  CheckCircle
} from "lucide-react";
import { EnhancedCardData, CardTableView, TableColumn, CardProperties } from "@/types/heptabase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";

interface CardDatabaseProps {
  cards: EnhancedCardData[];
  onCardUpdate: (id: string, updates: Partial<EnhancedCardData>) => void;
  onCardCreate: () => void;
  onViewModeChange: (mode: 'whiteboard' | 'database') => void;
  currentView: 'whiteboard' | 'database';
}

export default function CardDatabase({
  cards,
  onCardUpdate,
  onCardCreate,
  onViewModeChange,
  currentView
}: CardDatabaseProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Get all unique tags from cards
  const allTags = Array.from(new Set(cards.flatMap(card => card.tags)));

  // Filter cards based on search and filters
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => card.tags.includes(tag));
    
    const matchesStatus = statusFilter === "all" || card.properties.status === statusFilter;
    
    const matchesPriority = priorityFilter === "all" || card.properties.priority === priorityFilter;

    return matchesSearch && matchesTags && matchesStatus && matchesPriority;
  });

  const renderTableView = () => (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-8 gap-4 p-3 bg-muted/30 rounded-lg font-medium text-sm">
        <div>Title</div>
        <div>Tags</div>
        <div>Status</div>
        <div>Priority</div>
        <div>Progress</div>
        <div>Rating</div>
        <div>Created</div>
        <div>Actions</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-2">
        {filteredCards.map(card => (
          <Card key={card.id} className="p-3">
            <div className="grid grid-cols-8 gap-4 items-center">
              {/* Title */}
              <div className="font-medium truncate">{card.title}</div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {card.tags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {card.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{card.tags.length - 2}
                  </Badge>
                )}
              </div>
              
              {/* Status */}
              <div>
                <Select
                  value={card.properties.status || "todo"}
                  onValueChange={(value) => 
                    onCardUpdate(card.id, {
                      properties: { ...card.properties, status: value as any }
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Priority */}
              <div>
                <Select
                  value={card.properties.priority || "low"}
                  onValueChange={(value) => 
                    onCardUpdate(card.id, {
                      properties: { ...card.properties, priority: value as any }
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Progress */}
              <div className="flex items-center gap-2">
                <Slider
                  value={[card.properties.progress || 0]}
                  onValueChange={([value]) => 
                    onCardUpdate(card.id, {
                      properties: { ...card.properties, progress: value }
                    })
                  }
                  max={100}
                  step={10}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {card.properties.progress || 0}%
                </span>
              </div>
              
              {/* Rating */}
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => 
                      onCardUpdate(card.id, {
                        properties: { ...card.properties, rating: star }
                      })
                    }
                    className={`text-xs ${
                      (card.properties.rating || 0) >= star 
                        ? 'text-yellow-500' 
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Star className="h-3 w-3 fill-current" />
                  </button>
                ))}
              </div>
              
              {/* Created Date */}
              <div className="text-xs text-muted-foreground">
                {card.properties.dateCreated 
                  ? new Date(card.properties.dateCreated).toLocaleDateString()
                  : 'N/A'
                }
              </div>
              
              {/* Actions */}
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCardUpdate(card.id, {
                    properties: { ...card.properties, favorite: !card.properties.favorite }
                  })}
                >
                  <Star className={`h-4 w-4 ${card.properties.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredCards.map(card => (
        <Card key={card.id} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-sm truncate flex-1">{card.title}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCardUpdate(card.id, {
                properties: { ...card.properties, favorite: !card.properties.favorite }
              })}
            >
              <Star className={`h-4 w-4 ${card.properties.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground line-clamp-2">
            {card.content}
          </p>
          
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span>{card.properties.progress || 0}%</span>
            </div>
            <div className="w-full bg-muted h-1 rounded-full">
              <div 
                className="bg-primary h-1 rounded-full transition-all"
                style={{ width: `${card.properties.progress || 0}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {card.properties.status || 'todo'}
            </Badge>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    (card.properties.rating || 0) >= star 
                      ? 'fill-yellow-500 text-yellow-500' 
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Card Database</h2>
          <p className="text-muted-foreground">
            Manage your knowledge cards with properties and filters
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={currentView === 'whiteboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('whiteboard')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              <Table2 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={onCardCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Card
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Priority Filter */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Tags Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Tag className="h-4 w-4 mr-2" />
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="end">
              <div className="space-y-2">
                <div className="font-medium text-sm">Filter by tags</div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {allTags.map(tag => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox
                        id={tag}
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedTags([...selectedTags, tag]);
                          } else {
                            setSelectedTags(selectedTags.filter(t => t !== tag));
                          }
                        }}
                      />
                      <label htmlFor={tag} className="text-sm">{tag}</label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredCards.length} of {cards.length} cards
      </div>

      {/* Content */}
      {viewMode === 'table' ? renderTableView() : renderGridView()}
    </div>
  );
}