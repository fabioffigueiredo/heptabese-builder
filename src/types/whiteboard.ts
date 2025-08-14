export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// Enhanced Connection with style options
export interface Connection {
  id: string;
  fromCardId: string;
  toCardId: string;
  fromPosition: Position;
  toPosition: Position;
  style: ConnectionStyle;
}

export interface ConnectionStyle {
  type: 'straight' | 'bezier' | 'orthogonal' | 'zigzag';
  strokeWidth: number;
  strokeColor: string;
  strokeDashArray?: number[];
  arrowType: 'none' | 'arrow' | 'double' | 'diamond' | 'circle';
}

// Card remains the same
export interface CardData {
  id: string;
  title: string;
  content: string;
  position: Position;
  size?: Size;
  tags: string[];
  color: string;
}

// Drawing Elements
export interface DrawingElement {
  id: string;
  type: 'shape' | 'drawing' | 'image' | 'video' | 'pdf' | 'link' | 'markdown' | 'text' | 'sticky-note';
  position: Position;
  size?: Size;
  properties: ElementProperties;
  layer: number;
}

export interface ElementProperties {
  // Shape properties
  shapeType?: 'circle' | 'rectangle' | 'triangle' | 'hexagon' | 'star' | 'arrow';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  
  // Drawing properties
  brushSize?: number;
  brushColor?: string;
  brushType?: 'pen' | 'highlighter' | 'marker';
  
  // Media properties
  src?: string;
  alt?: string;
  url?: string;
  title?: string;
  description?: string;
  
  // Text properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  
  // Sticky note properties
  stickyColor?: string;
  stickyText?: string;
  
  // Markdown properties
  markdown?: string;
}

// Tool types
export type WhiteboardTool = 
  | 'select' 
  | 'pan' 
  | 'connect'
  | 'draw'
  | 'highlighter'
  | 'text'
  | 'shape'
  | 'sticky-note'
  | 'image'
  | 'video'
  | 'pdf'
  | 'link'
  | 'markdown';

export type ShapeTool = 'circle' | 'rectangle' | 'triangle' | 'hexagon' | 'star' | 'arrow';

// Drawing state
export interface DrawingState {
  isDrawing: boolean;
  currentPath: Position[];
  brushSize: number;
  brushColor: string;
  brushType: 'pen' | 'highlighter' | 'marker';
}

// Layer system
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  zIndex: number;
}
