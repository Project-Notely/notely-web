import { Graphics } from "pixi.js";

export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface StrokeStyle {
  color: string;
  thickness: number;
  opacity: number;
  lineCap: "round" | "square" | "butt";
  lineJoin: "round" | "bevel" | "miter";
}

export interface Stroke {
  id: string;
  points: Point[];
  style: StrokeStyle;
  timestamp: number;
  completed: boolean;
  pixiGraphics?: Graphics;
}

export interface DrawingData {
  strokes: Stroke[];
  dimensions: {
    width: number;
    height: number;
  };
  metadata: {
    created: number;
    modified: number;
    version: string;
  };
}

export interface DrawingTool {
  type: "pen" | "brush" | "eraser" | "highlighter";
  style: StrokeStyle;
}

export interface DrawingState {
  // Drawing state
  strokes: Stroke[];
  currentStroke: Stroke | null;
  isDrawing: boolean;

  // Tool state
  currentTool: DrawingTool;
  availableColors: string[];
  availableThicknesses: number[];

  // History
  history: Stroke[][];
  historyIndex: number;
  maxHistorySize: number;

  // UI state
  isToolbarVisible: boolean;
  canvasSize: { width: number; height: number };

  // Actions
  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  endDrawing: () => void;
  addStroke: (stroke: Stroke) => void;
  removeStroke: (strokeId: string) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  setTool: (tool: DrawingTool) => void;
  setToolbarVisibility: (visible: boolean) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  loadDrawing: (drawing: DrawingData) => void;
  exportDrawing: () => DrawingData;
}

export interface DrawingCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  onStrokeComplete?: (stroke: Stroke) => void;
  onDrawingChange?: (drawing: DrawingData) => void;
  initialDrawing?: DrawingData;
}

// Text Content Types
export interface TextContent {
  type: "doc";
  content?: any[];
}

export interface AnnotatedDocument {
  id?: string;
  textContent: TextContent;
  drawingContent?: any; // TLDraw snapshot
  metadata: {
    title?: string;
    description?: string;
    created: number;
    modified: number;
    version: string;
  };
}

export interface SaveAnnotatedDocumentRequest {
  document: AnnotatedDocument;
  userId?: string;
  title?: string;
  description?: string;
}

export interface SaveAnnotatedDocumentResponse {
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoadAnnotatedDocumentResponse {
  document: AnnotatedDocument;
  metadata: {
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PixiDrawingServiceConfig {
  width: number;
  height: number;
  backgroundColor: string;
  antialias: boolean;
  resolution: number;
}
