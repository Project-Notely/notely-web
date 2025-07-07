import type {
  DrawingData,
  DrawingState,
  DrawingTool,
  Point,
  Stroke,
} from "@/models/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Default tool
const defaultTool: DrawingTool = {
  type: "pen",
  style: {
    color: "#000000",
    thickness: 2,
    opacity: 1,
    lineCap: "round",
    lineJoin: "round",
  },
};

// Available options
const availableColors = [
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
  "#FFC0CB",
  "#A52A2A",
  "#808080",
];

const availableThicknesses = [1, 2, 4, 6, 8, 12, 16, 24];

// Generate unique ID for strokes
const generateStrokeId = (): string => {
  return `stroke_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useDrawingStore = create<DrawingState>()(
  devtools(
    (set, get) => ({
      // Drawing state
      strokes: [],
      currentStroke: null,
      isDrawing: false,

      // Tool state
      currentTool: defaultTool,
      availableColors,
      availableThicknesses,

      // History
      history: [[]],
      historyIndex: 0,
      maxHistorySize: 50,

      // UI state
      isToolbarVisible: true,
      canvasSize: { width: 800, height: 600 },

      // Actions
      startDrawing: (point: Point) => {
        const state = get();
        const newStroke: Stroke = {
          id: generateStrokeId(),
          points: [point],
          style: { ...state.currentTool.style },
          timestamp: Date.now(),
          completed: false,
        };

        set({
          currentStroke: newStroke,
          isDrawing: true,
        });
      },

      continueDrawing: (point: Point) => {
        const state = get();
        if (!state.isDrawing || !state.currentStroke) return;

        const updatedStroke = {
          ...state.currentStroke,
          points: [...state.currentStroke.points, point],
        };

        set({
          currentStroke: updatedStroke,
        });
      },

      endDrawing: () => {
        const state = get();
        if (!state.isDrawing || !state.currentStroke) return;

        const completedStroke = {
          ...state.currentStroke,
          completed: true,
        };

        const newStrokes = [...state.strokes, completedStroke];

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newStrokes]);

        // Limit history size
        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        set({
          strokes: newStrokes,
          currentStroke: null,
          isDrawing: false,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      addStroke: (stroke: Stroke) => {
        const state = get();
        const newStrokes = [...state.strokes, stroke];

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newStrokes]);

        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        set({
          strokes: newStrokes,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      removeStroke: (strokeId: string) => {
        const state = get();
        const newStrokes = state.strokes.filter(
          stroke => stroke.id !== strokeId
        );

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...newStrokes]);

        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        set({
          strokes: newStrokes,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      clearCanvas: () => {
        const state = get();

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([]);

        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        set({
          strokes: [],
          currentStroke: null,
          isDrawing: false,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex <= 0) return;

        const newHistoryIndex = state.historyIndex - 1;
        const newStrokes = state.history[newHistoryIndex] || [];

        set({
          strokes: newStrokes,
          historyIndex: newHistoryIndex,
          currentStroke: null,
          isDrawing: false,
        });
      },

      redo: () => {
        const state = get();
        if (state.historyIndex >= state.history.length - 1) return;

        const newHistoryIndex = state.historyIndex + 1;
        const newStrokes = state.history[newHistoryIndex] || [];

        set({
          strokes: newStrokes,
          historyIndex: newHistoryIndex,
          currentStroke: null,
          isDrawing: false,
        });
      },

      setTool: (tool: DrawingTool) => {
        set({ currentTool: tool });
      },

      setToolbarVisibility: (visible: boolean) => {
        set({ isToolbarVisible: visible });
      },

      setCanvasSize: (size: { width: number; height: number }) => {
        set({ canvasSize: size });
      },

      loadDrawing: (drawing: DrawingData) => {
        const state = get();

        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push([...drawing.strokes]);

        if (newHistory.length > state.maxHistorySize) {
          newHistory.shift();
        }

        set({
          strokes: drawing.strokes,
          canvasSize: drawing.dimensions,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          currentStroke: null,
          isDrawing: false,
        });
      },

      exportDrawing: (): DrawingData => {
        const state = get();
        return {
          strokes: state.strokes,
          dimensions: state.canvasSize,
          metadata: {
            created: Date.now(),
            modified: Date.now(),
            version: "2.0",
          },
        };
      },
    }),
    {
      name: "drawing-store",
      enabled: process.env.NODE_ENV === "development",
    }
  )
);

// Computed selectors
export const useDrawingSelectors = () => {
  const state = useDrawingStore();

  return {
    ...state,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
    strokeCount: state.strokes.length,
    currentStrokePointCount: state.currentStroke?.points.length || 0,
    isToolbarVisible: state.isToolbarVisible,
  };
};
