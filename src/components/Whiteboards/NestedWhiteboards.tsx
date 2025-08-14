import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  FolderPlus, 
  Layers, 
  Grid3X3, 
  ChevronRight, 
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  ExternalLink
} from "lucide-react";
import { WhiteboardData, WhiteboardGroup } from "@/types/heptabase";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface NestedWhiteboardsProps {
  whiteboards: WhiteboardData[];
  groups: WhiteboardGroup[];
  currentWhiteboardId?: string;
  onWhiteboardSelect: (id: string) => void;
  onWhiteboardCreate: (parentId?: string) => void;
  onGroupCreate: (parentId?: string) => void;
  onWhiteboardUpdate: (id: string, updates: Partial<WhiteboardData>) => void;
  onGroupUpdate: (id: string, updates: Partial<WhiteboardGroup>) => void;
}

export default function NestedWhiteboards({
  whiteboards,
  groups,
  currentWhiteboardId,
  onWhiteboardSelect,
  onWhiteboardCreate,
  onGroupCreate,
  onWhiteboardUpdate,
  onGroupUpdate
}: NestedWhiteboardsProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [selectedParentGroup, setSelectedParentGroup] = useState<string>("");

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const createNewGroup = () => {
    if (!newGroupName) return;
    
    onGroupCreate(selectedParentGroup || undefined);
    setNewGroupName("");
    setSelectedParentGroup("");
  };

  const createNewWhiteboard = () => {
    if (!newWhiteboardName) return;
    
    onWhiteboardCreate(selectedParentGroup || undefined);
    setNewWhiteboardName("");
    setSelectedParentGroup("");
  };

  // Filter whiteboards and groups based on search
  const filteredWhiteboards = whiteboards.filter(wb => 
    wb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wb.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render a group with its children
  const renderGroup = (group: WhiteboardGroup, level = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const childGroups = filteredGroups.filter(g => g.parentId === group.id);
    const groupWhiteboards = filteredWhiteboards.filter(wb => wb.groupId === group.id);
    
    return (
      <div key={group.id} className="space-y-1">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer`}
          style={{ paddingLeft: `${(level + 1) * 12}px` }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleGroupExpansion(group.id)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          
          <div 
            className={`w-3 h-3 rounded-sm`}
            style={{ backgroundColor: group.color }}
          />
          
          <span className="text-sm font-medium flex-1">{group.name}</span>
          
          <Badge variant="outline" className="text-xs">
            {groupWhiteboards.length}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onWhiteboardCreate(group.id)}>
                <Plus className="h-4 w-4 mr-2" />
                New Whiteboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onGroupCreate(group.id)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Subgroup
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {isExpanded && (
          <div className="space-y-1">
            {/* Child groups */}
            {childGroups.map(childGroup => renderGroup(childGroup, level + 1))}
            
            {/* Whiteboards in this group */}
            {groupWhiteboards.map(whiteboard => renderWhiteboard(whiteboard, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render a whiteboard item
  const renderWhiteboard = (whiteboard: WhiteboardData, level = 0) => {
    const isActive = currentWhiteboardId === whiteboard.id;
    
    return (
      <div
        key={whiteboard.id}
        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
          isActive ? 'bg-primary/10 border border-primary/20' : ''
        }`}
        style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }}
        onClick={() => onWhiteboardSelect(whiteboard.id)}
      >
        <Grid3X3 className="h-4 w-4 text-muted-foreground" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{whiteboard.name}</span>
            {whiteboard.isNested && (
              <Layers className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
          {whiteboard.description && (
            <p className="text-xs text-muted-foreground truncate">
              {whiteboard.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          {whiteboard.viewCount}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onWhiteboardSelect(whiteboard.id)}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  // Get root groups (no parent)
  const rootGroups = filteredGroups.filter(group => !group.parentId);
  
  // Get root whiteboards (no group)
  const rootWhiteboards = filteredWhiteboards.filter(wb => !wb.groupId);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Whiteboards</h2>
          
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Group</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Group name..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                  />
                  <Button onClick={createNewGroup} className="w-full">
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Whiteboard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Whiteboard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Whiteboard name..."
                    value={newWhiteboardName}
                    onChange={(e) => setNewWhiteboardName(e.target.value)}
                  />
                  <Button onClick={createNewWhiteboard} className="w-full">
                    Create Whiteboard
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Search */}
        <Input
          placeholder="Search whiteboards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Navigation Tree */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Root groups */}
          {rootGroups.map(group => renderGroup(group))}
          
          {/* Root whiteboards */}
          {rootWhiteboards.length > 0 && (
            <>
              {rootGroups.length > 0 && <Separator className="my-2" />}
              {rootWhiteboards.map(whiteboard => renderWhiteboard(whiteboard))}
            </>
          )}
          
          {/* Empty state */}
          {rootGroups.length === 0 && rootWhiteboards.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Grid3X3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No whiteboards found</p>
              <p className="text-xs">Create your first whiteboard to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}