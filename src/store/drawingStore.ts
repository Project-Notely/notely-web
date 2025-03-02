import { create } from "zustand";

interface Stroke {
    x: number;
    y: number;
    pressure: number;
}

interface DrawingStore {
    strokes: Stroke[][];
    addStroke: (stroke: Stroke[]) => void;
    resetCanvas: () => void;
}

export const useDrawingStore = create<DrawingStore>((set) => ({
    strokes: [],
    addStroke: (stroke) =>
        set((state) => ({ strokes: [...state.strokes, stroke] })),
    resetCanvas: () => set({ strokes: [] }),
}));
