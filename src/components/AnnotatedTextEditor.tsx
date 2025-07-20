import EditorModeToggle from "@/components/EditorModeToggle";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { useDrawingCanvas } from "@/hooks/useDrawingCanvas";
import { useEditorMode, type EditorMode } from "@/hooks/useEditorMode";
import type { StrokeStyle } from "@/models/types";
import React, { useCallback, useEffect, useRef } from "react";

interface AnnotatedTextEditorProps {
  className?: string;
  initialMode?: EditorMode;
  width?: number;
  height?: number;
  onSave?: (data: { content: any; drawings: any }) => void;
}

const AnnotatedTextEditor: React.FC<AnnotatedTextEditorProps> = ({
  className = "",
  initialMode = "text",
  width = 800,
  height = 600,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Mode management
  const {
    mode,
    modeState,
    setTextMode,
    setDrawingMode,
    toggleMode,
    isTextMode,
    isDrawingMode,
  } = useEditorMode(initialMode);

  // Drawing canvas setup
  const drawingConfig = {
    width,
    height,
    backgroundColor: "transparent",
    autoSaveEnabled: false,
    userId: "annotated_editor_user",
  };

  const {
    canvasRef,
    isInitialized: canvasInitialized,
    startDrawing,
    continueDrawing,
    endDrawing,
    clearCanvas,
    statistics,
    error: canvasError,
  } = useDrawingCanvas(drawingConfig);

  // Drawing style
  const drawingStyle: StrokeStyle = {
    color: "#ff0000",
    thickness: 3,
    opacity: 0.8,
    lineCap: "round",
    lineJoin: "round",
  };

  // Sync canvas size with editor container
  useEffect(() => {
    const syncSize = () => {
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      const rect = container.getBoundingClientRect();

      // Update canvas size to match container
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      console.log("📐 [CANVAS-SYNC] Canvas size synced:", {
        width: rect.width,
        height: rect.height,
      });
    };

    // Initial sync
    if (canvasInitialized) {
      setTimeout(syncSize, 100);
    }

    // Sync on resize
    const resizeObserver = new ResizeObserver(syncSize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasInitialized]);

  // Position canvas overlay
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;

    // Position canvas absolutely over the editor
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = isDrawingMode ? "10" : "5";
    canvas.style.pointerEvents = isDrawingMode ? "auto" : "none";
    canvas.style.opacity = modeState.canvasVisible ? "1" : "0";
    canvas.style.transition =
      "opacity 300ms ease-in-out, z-index 300ms ease-in-out";

    console.log("🎯 [CANVAS-POSITION] Canvas positioned:", {
      mode,
      zIndex: canvas.style.zIndex,
      pointerEvents: canvas.style.pointerEvents,
      opacity: canvas.style.opacity,
    });
  }, [mode, isDrawingMode, modeState.canvasVisible]);

  // Drawing event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingMode) return;
      event.preventDefault();
      event.stopPropagation();
      console.log("🖱️ [DRAW] Mouse down in drawing mode");
      startDrawing(event, drawingStyle);
    },
    [isDrawingMode, startDrawing, drawingStyle]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingMode) return;
      continueDrawing(event, drawingStyle);
    },
    [isDrawingMode, continueDrawing, drawingStyle]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawingMode) return;
    console.log("🖱️ [DRAW] Mouse up in drawing mode");
    endDrawing();
  }, [isDrawingMode, endDrawing]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingMode) return;
      event.preventDefault();
      event.stopPropagation();
      console.log("👆 [DRAW] Touch start in drawing mode");
      startDrawing(event, drawingStyle);
    },
    [isDrawingMode, startDrawing, drawingStyle]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingMode) return;
      event.preventDefault();
      continueDrawing(event, drawingStyle);
    },
    [isDrawingMode, continueDrawing, drawingStyle]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDrawingMode) return;
    console.log("👆 [DRAW] Touch end in drawing mode");
    endDrawing();
  }, [isDrawingMode, endDrawing]);

  return (
    <div className={`annotated-text-editor ${className}`}>
      {/* Mode Toggle */}
      <div className='mb-4 flex justify-center'>
        <EditorModeToggle
          mode={mode}
          isTransitioning={modeState.isTransitioning}
          onTextMode={setTextMode}
          onDrawingMode={setDrawingMode}
          onToggle={toggleMode}
          size='md'
          variant='buttons'
        />
      </div>

      {/* Editor Container */}
      <div
        ref={containerRef}
        className='relative w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden'
        style={{ minHeight: `${height}px` }}
      >
        {/* Mode Indicator */}
        <div className='absolute top-4 right-4 z-20'>
          <div
            className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${
              isTextMode
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
            }
            ${modeState.isTransitioning ? "animate-pulse" : ""}
          `}
          >
            {isTextMode ? "✏️ Text Mode" : "🎨 Drawing Mode"}
          </div>
        </div>

        {/* Text Editor Layer */}
        <div
          ref={editorRef}
          className={`
            relative z-1 transition-all duration-300
            ${modeState.textEditable ? "opacity-100" : "opacity-50"}
          `}
          style={{
            pointerEvents: modeState.textEditable ? "auto" : "none",
          }}
        >
          <SimpleEditor />
        </div>

        {/* Drawing Canvas Layer */}
        {modeState.canvasVisible && (
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className='absolute top-0 left-0 cursor-crosshair'
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={e => e.preventDefault()}
          />
        )}

        {/* Canvas Debug Info (Development only) */}
        {process.env.NODE_ENV === "development" && (
          <div className='absolute bottom-4 left-4 z-20 bg-black bg-opacity-75 text-white text-xs p-2 rounded'>
            <div>Canvas: {canvasInitialized ? "✅" : "❌"}</div>
            <div>Mode: {mode}</div>
            <div>Strokes: {statistics.totalStrokes}</div>
            {canvasError && (
              <div className='text-red-300'>Error: {canvasError}</div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className='mt-4 flex justify-center gap-4'>
        <button
          onClick={clearCanvas}
          disabled={statistics.totalStrokes === 0}
          className='px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white rounded-lg transition-colors'
        >
          🗑️ Clear Drawings
        </button>

        {onSave && (
          <button
            onClick={() => {
              // TODO: Implement combined save functionality
              console.log("💾 [SAVE] Combined save not yet implemented");
            }}
            className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors'
          >
            💾 Save Document
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnotatedTextEditor;
