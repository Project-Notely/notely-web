import EditorModeToggle from "@/components/AnnotatedTextEditior/EditorModeToggle";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { useEditorMode, type EditorMode } from "@/hooks/useEditorMode";
import {
  createTLStore,
  defaultShapeUtils,
  Editor,
  Tldraw,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import React, { useCallback, useRef, useState } from "react";

interface TLDrawAnnotatedEditorProps {
  className?: string;
  initialMode?: EditorMode;
  // TODO: fix this later
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSave?: (data: { content: any; drawing: any }) => void;
}

const TLDrawAnnotatedEditor: React.FC<TLDrawAnnotatedEditorProps> = ({
  className = "",
  initialMode = "text",
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const [tldrawStore] = useState(() =>
    createTLStore({ shapeUtils: defaultShapeUtils })
  );

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

  // Store TLDraw editor reference
  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;
    console.log("🎨 [TLDRAW] Editor mounted");
  }, []);

  // Save drawing data
  const saveDrawing = useCallback(() => {
    if (!editorRef.current) return null;

    const editor = editorRef.current;
    const snapshot = editor.store.getSnapshot();

    console.log("💾 [TLDRAW] Saving drawing data");
    return snapshot;
  }, []);

  // Clear drawing
  const clearDrawing = useCallback(() => {
    if (!editorRef.current) return;

    console.log("🗑️ [TLDRAW] Clearing drawing");
    editorRef.current.selectAll();
    editorRef.current.deleteShapes(editorRef.current.getSelectedShapeIds());
  }, []);

  // Handle combined save
  const handleSave = useCallback(() => {
    const drawingSnapshot = saveDrawing();
    const combinedData = {
      content: null, // TODO: Get Tiptap content
      drawing: drawingSnapshot,
    };

    console.log("💾 [COMBINED] Saving document:", combinedData);
    onSave?.(combinedData);
  }, [saveDrawing, onSave]);

  return (
    <div className={`tldraw-annotated-editor ${className}`} data-mode={mode}>
      {/* Mode Toggle */}
      <div className='mb-4 flex justify-center border-green-500'>
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

      {/* Single Canvas Container - Both layers always present */}
      <div
        ref={containerRef}
        className='relative w-full bg-white rounded-lg shadow-lg border border-gray-200'
      >
        {/* Text Editor Layer */}
        <div
          className='simple-editor-wrapper'
          style={{
            position: "relative",
            zIndex: isTextMode ? 20 : 1, // Higher z-index in text mode to be above TLDraw
            background: "white",
            minHeight: "100%",
            width: "100%",
            padding: "16px", // Ensure clickable area
            pointerEvents: "auto", // Always interactive
          }}
          onClick={e => {
            console.log("🖱️ [TEXT-WRAPPER-CLICK] Text wrapper clicked:", {
              mode,
              zIndex: isTextMode ? 20 : 1,
              pointerEvents: "auto",
              target: e.target,
              currentTarget: e.currentTarget,
              timestamp: new Date().toISOString(),
            });
          }}
        >
          <SimpleEditor />
        </div>

        {/* TLDraw Layer - Always rendered for visibility */}
        <div
          className='absolute inset-0'
          style={{
            zIndex: 10,
            background: "transparent",
            pointerEvents: isDrawingMode ? "auto" : "none", // Interactive only in draw mode
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: isDrawingMode ? "auto" : "none",
            }}
            className={isTextMode ? "tldraw-disabled" : ""}
          >
            <Tldraw
              store={tldrawStore}
              onMount={handleMount}
              autoFocus={false} // Never auto-focus to avoid stealing focus
              style={{
                background: "rgba(0, 0, 0, 0)", // Completely transparent
                backgroundColor: "rgba(0, 0, 0, 0)", // Completely transparent
                opacity: 1,
                pointerEvents: isDrawingMode ? "auto" : "none", // Disable TLDraw interactions in text mode
              }}
              components={{
                // Hide UI elements for clean overlay
                MainMenu: null,
                QuickActions: null,
                HelpMenu: null,
                DebugMenu: null,
                SharePanel: null,
                MenuPanel: null,
                TopPanel: null,
                NavigationPanel: null,
              }}
            />
          </div>
        </div>

        {/* Debug indicators */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              background: isDrawingMode ? "green" : "orange",
              color: "white",
              padding: "4px",
              fontSize: "12px",
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            TLDRAW: {isDrawingMode ? "INTERACTIVE" : "READ-ONLY"}
          </div>
        )}

        {/* Debug indicator for text editor z-index */}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "44px",
              right: "4px",
              background: "red",
              color: "white",
              padding: "4px",
              fontSize: "12px",
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            TEXT Z-INDEX: {isTextMode ? 20 : 1}
          </div>
        )}

        {/* Debug indicator for text editor clickability */}
        {!isDrawingMode && process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "4px",
              background: "purple",
              color: "white",
              padding: "4px",
              fontSize: "12px",
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            TEXT EDITOR CLICKABLE
          </div>
        )}

        {/* Mode Indicator */}
        <div className='absolute top-4 right-4 z-20'>
          <div
            className={`
            px-3 py-1 rounded-full text-sm font-medium
            ${
              isTextMode
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }
            ${modeState.isTransitioning ? "animate-pulse" : ""}
          `}
          >
            {isTextMode ? "✏️ Text Tool" : "🎨 Draw Tool"}
          </div>
        </div>
      </div>

      {/* Simple Controls */}
      <div className='mt-4 flex justify-center gap-4'>
        <button
          onClick={clearDrawing}
          className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors'
        >
          🗑️ Clear Drawings
        </button>

        <button
          onClick={handleSave}
          className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
        >
          💾 Save
        </button>
      </div>
    </div>
  );
};

export default TLDrawAnnotatedEditor;
