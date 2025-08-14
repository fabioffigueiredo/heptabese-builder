import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Search, 
  MoreHorizontal,
  FileText,
  Calendar,
  Eye,
  Star,
  Archive
} from "lucide-react";
import { WhiteboardGroup, WhiteboardData } from "@/types/heptabase";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface WhiteboardExplorerProps {
  groups: WhiteboardGroup[];
  whiteboards: WhiteboardData[];
  currentWhiteboardId?: string;
  onGroupCreate: (group: Omit<WhiteboardGroup, 'id'>) => void;
  onWhiteboardCreate: (whiteboard: Omit<WhiteboardData, 'id' | 'dateCreated' | 'dateModified' | 'viewCount'>) => void;
  onWhiteboardSelect: (whiteboardId: string) => void;
  onGroupUpdate: (id: string, updates: Partial<WhiteboardGroup>) => void;
  onWhiteboardUpdate: (id: string, updates: Partial<WhiteboardData>) => void;
}

export default function WhiteboardExplorer({
  groups,
  whiteboards,
  currentWhiteboardId,
  onGroupCreate,
  onWhiteboardCreate,
  onWhiteboardSelect,
  onGroupUpdate,
  onWhiteboardUpdate
}: WhiteboardExplorerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newWhiteboardName, setNewWhiteboardName] = useState("");
  const [newWhiteboardDescription, setNewWhiteboardDescription] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const filteredWhiteboards = whiteboards.filter(wb => 
    wb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wb.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRootGroups = () => groups.filter(g => !g.parentId);
  const getChildGroups = (parentId: string) => groups.filter(g => g.parentId === parentId);
  const getGroupWhiteboards = (groupId: string) => whiteboards.filter(wb => wb.groupId === groupId);
  const getUngroupedWhiteboards = () => whiteboards.filter(wb => !wb.groupId);

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onGroupCreate({
        name: newGroupName.trim(),
        color: 'accent-blue',
        children: [],
        whiteboards: [],
        parentId: selectedGroupId || undefined,
      });
      setNewGroupName("");
      setSelectedGroupId("");
    }
  };

  const handleCreateWhiteboard = () => {
    if (newWhiteboardName.trim()) {
      onWhiteboardCreate({
        name: newWhiteboardName.trim(),
        description: newWhiteboardDescription.trim(),
        groupId: selectedGroupId || undefined,
        isNested: false,
      });
      setNewWhiteboardName("");
      setNewWhiteboardDescription("");
      setSelectedGroupId("");
    }
  };

  const renderGroup = (group: WhiteboardGroup, level: number = 0) => {
    const isExpanded = expandedGroups.has(group.id);
    const childGroups = getChildGroups(group.id);
    const groupWhiteboards = getGroupWhiteboards(group.id);

    return (
      <div key={group.id} className="space-y-1">
        <div 
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => toggleGroup(group.id)}
        >
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            <Folder className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="flex-1 text-sm font-medium">{group.name}</span>
          <Badge variant="secondary" className="text-xs">
            {groupWhiteboards.length}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedGroupId(group.id)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Whiteboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedGroupId(group.id)}>
                <Folder className="h-4 w-4 mr-2" />
                Add Subgroup
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archive Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && (
          <div className="space-y-1">
            {/* Child Groups */}
            {childGroups.map(childGroup => renderGroup(childGroup, level + 1))}
            
            {/* Whiteboards in this group */}
            {groupWhiteboards.map(whiteboard => (
              <div
                key={whiteboard.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentWhiteboardId === whiteboard.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/30'
                }`}
                style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                onClick={() => onWhiteboardSelect(whiteboard.id)}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{whiteboard.name}</div>
                  {whiteboard.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {whiteboard.description}
                    </div>
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
                    <DropdownMenuItem>
                      <Star className="h-4 w-4 mr-2" />
                      Add to Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Whiteboards</h3>
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Folder className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Group</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="groupName">Group Name</Label>
                  <Input
                    id="groupName"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Enter group name..."
                  />
                </div>
                <Button onClick={handleCreateGroup} className="w-full">
                  Create Group
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Whiteboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whiteboardName">Whiteboard Name</Label>
                  <Input
                    id="whiteboardName"
                    value={newWhiteboardName}
                    onChange={(e) => setNewWhiteboardName(e.target.value)}
                    placeholder="Enter whiteboard name..."
                  />
                </div>
                <div>
                  <Label htmlFor="whiteboardDescription">Description (Optional)</Label>
                  <Textarea
                    id="whiteboardDescription"
                    value={newWhiteboardDescription}
                    onChange={(e) => setNewWhiteboardDescription(e.target.value)}
                    placeholder="Enter description..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleCreateWhiteboard} className="w-full">
                  Create Whiteboard
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search whiteboards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Separator />

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {/* Root Groups */}
        {getRootGroups().map(group => renderGroup(group))}
        
        {/* Ungrouped Whiteboards */}
        {getUngroupedWhiteboards().length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1">
              Ungrouped
            </div>
            {getUngroupedWhiteboards().map(whiteboard => (
              <div
                key={whiteboard.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                  currentWhiteboardId === whiteboard.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/30'
                }`}
                onClick={() => onWhiteboardSelect(whiteboard.id)}
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{whiteboard.name}</div>
                  {whiteboard.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {whiteboard.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  {whiteboard.viewCount}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}