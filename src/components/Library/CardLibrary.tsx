import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Star, 
  Hash, 
  Grid3X3, 
  List,
  Archive,
  FileText,
  Calendar
} from "lucide-react";
import { EnhancedCardData } from "@/types/heptabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CardLibraryProps {
  cards: EnhancedCardData[];
  onCardSelect: (card: EnhancedCardData) => void;
  onCardDuplicate: (card: EnhancedCardData) => void;
  onCardUpdate: (id: string, updates: Partial<EnhancedCardData>) => void;
}

export default function CardLibrary({
  cards,
  onCardSelect,
  onCardDuplicate,
  onCardUpdate
}: CardLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("dateModified");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState("all");

  // Get all unique tags
  const allTags = Array.from(new Set(cards.flatMap(card => card.tags)));

  // Filter and sort cards
  const filteredCards = cards
    .filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.content.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => card.tags.includes(tag));
      
      const matchesCategory = filterCategory === "all" || 
                             card.properties.category === filterCategory;

      return matchesSearch && matchesTags && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'dateCreated':
          return new Date(b.properties.dateCreated || 0).getTime() - 
                 new Date(a.properties.dateCreated || 0).getTime();
        case 'dateModified':
        default:
          return new Date(b.properties.dateModified || 0).getTime() - 
                 new Date(a.properties.dateModified || 0).getTime();
      }
    });

  const handleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleFavoriteToggle = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      onCardUpdate(cardId, {
        properties: { 
          ...card.properties, 
          favorite: !card.properties.favorite 
        }
      });
    }
  };

  const renderCardGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredCards.map(card => (
        <Card key={card.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm truncate flex-1">{card.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavoriteToggle(card.id);
                }}
                className="h-6 w-6 p-0"
              >
                <Star className={`h-3 w-3 ${card.properties.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground line-clamp-3">
              {card.content}
            </p>
            
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {card.properties.dateModified ? 
                  new Date(card.properties.dateModified).toLocaleDateString() : 
                  'No date'
                }
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCardDuplicate(card);
                  }}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCardSelect(card)}
                  className="h-6 w-6 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCardList = () => (
    <div className="space-y-2">
      {filteredCards.map(card => (
        <Card key={card.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">{card.title}</h3>
                {card.properties.favorite && (
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate mt-1">
                {card.content}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1 max-w-xs">
              {card.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="text-xs text-muted-foreground min-w-20">
              {card.properties.dateModified ? 
                new Date(card.properties.dateModified).toLocaleDateString() : 
                'No date'
              }
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCardDuplicate(card);
                }}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCardSelect(card)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Card Library</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCards.length} of {cards.length} cards
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateModified">Last Modified</SelectItem>
              <SelectItem value="dateCreated">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="ideas">Ideas</SelectItem>
              <SelectItem value="notes">Notes</SelectItem>
              <SelectItem value="projects">Projects</SelectItem>
            </SelectContent>
          </Select>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter by Tags</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagFilter(tag)}
                    className="justify-start text-xs"
                  >
                    <Hash className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        {viewMode === 'grid' ? renderCardGrid() : renderCardList()}
      </ScrollArea>
    </div>
  );
}