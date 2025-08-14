// Enhanced card properties inspired by Heptabase
export interface CardProperties {
  // Database properties
  status?: 'todo' | 'in-progress' | 'done' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dateCreated?: Date;
  dateModified?: Date;
  dateDeadline?: Date;
  author?: string;
  category?: string;
  source?: string;
  
  // Numeric properties
  rating?: number; // 1-5 stars
  progress?: number; // 0-100%
  estimatedTime?: number; // in minutes
  
  // Text properties
  summary?: string;
  notes?: string;
  references?: string[];
  
  // Boolean properties
  favorite?: boolean;
  archived?: boolean;
  shared?: boolean;
}

// Enhanced card data with properties
export interface EnhancedCardData {
  id: string;
  title: string;
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  tags: string[];
  color: string;
  properties: CardProperties;
  linkedCards?: string[]; // IDs of connected cards
  backlinks?: string[]; // Cards that link to this one
}

// Whiteboard group/folder system
export interface WhiteboardGroup {
  id: string;
  name: string;
  color: string;
  parentId?: string; // For nested groups
  children: string[]; // Child group IDs
  whiteboards: string[]; // Whiteboard IDs in this group
}

// Individual whiteboard data
export interface WhiteboardData {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  groupId?: string;
  dateCreated: Date;
  dateModified: Date;
  viewCount: number;
  isNested: boolean; // Can contain other whiteboards
  parentWhiteboardId?: string;
}

// Table/Database view for cards
export interface CardTableView {
  id: string;
  name: string;
  columns: TableColumn[];
  filters: TableFilter[];
  sorts: TableSort[];
  groupBy?: string;
}

export interface TableColumn {
  id: string;
  property: keyof (EnhancedCardData & CardProperties);
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'tag' | 'rating';
  width: number;
  visible: boolean;
  editable: boolean;
}

export interface TableFilter {
  id: string;
  property: keyof (EnhancedCardData & CardProperties);
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between' | 'in' | 'not_in';
  value: any;
  active: boolean;
}

export interface TableSort {
  property: keyof (EnhancedCardData & CardProperties);
  direction: 'asc' | 'desc';
}

// Export existing types
export * from './whiteboard';