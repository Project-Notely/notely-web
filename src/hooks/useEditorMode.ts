import { useCallback, useState } from "react";

export type EditorMode = "text" | "drawing";

export interface ModeState {
  current: EditorMode;
  isTransitioning: boolean;
  canvasVisible: boolean;
  textEditable: boolean;
}

export interface EditorModeHook {
  mode: EditorMode;
  modeState: ModeState;
  setTextMode: () => void;
  setDrawingMode: () => void;
  toggleMode: () => void;
  isTextMode: boolean;
  isDrawingMode: boolean;
}

export const useEditorMode = (
  initialMode: EditorMode = "text"
): EditorModeHook => {
  const [mode, setMode] = useState<EditorMode>(initialMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const modeState: ModeState = {
    current: mode,
    isTransitioning,
    canvasVisible: mode === "drawing" || isTransitioning,
    textEditable: mode === "text" && !isTransitioning,
  };

  const setTextMode = useCallback(() => {
    if (mode === "text" || isTransitioning) return;

    console.log("🔄 [MODE] Switching to text mode");
    setIsTransitioning(true);

    // Small delay for smooth transition
    setTimeout(() => {
      setMode("text");
      setIsTransitioning(false);
      console.log("✅ [MODE] Text mode activated");
    }, 150);
  }, [mode, isTransitioning]);

  const setDrawingMode = useCallback(() => {
    if (mode === "drawing" || isTransitioning) return;

    console.log("🔄 [MODE] Switching to drawing mode");
    setIsTransitioning(true);

    // Small delay for smooth transition
    setTimeout(() => {
      setMode("drawing");
      setIsTransitioning(false);
      console.log("✅ [MODE] Drawing mode activated");
    }, 150);
  }, [mode, isTransitioning]);

  const toggleMode = useCallback(() => {
    if (mode === "text") {
      setDrawingMode();
    } else {
      setTextMode();
    }
  }, [mode, setDrawingMode, setTextMode]);

  return {
    mode,
    modeState,
    setTextMode,
    setDrawingMode,
    toggleMode,
    isTextMode: mode === "text",
    isDrawingMode: mode === "drawing",
  };
};
