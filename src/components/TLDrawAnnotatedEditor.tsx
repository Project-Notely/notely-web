import EditorModeToggle from "@/components/EditorModeToggle";
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

      {/* Single Canvas Container - Both layers always present */}
      <div
        ref={containerRef}
        className='relative w-full bg-white rounded-lg shadow-lg border border-gray-200'
        style={{ height: "600px" }}
      >
        {/* Text Editor Layer - ALWAYS visible and ALWAYS interactive */}
        <div
          className="absolute inset-0"
          style={{
            pointerEvents: "auto", // Always interactive
            zIndex: 1,
            background: "white",
            border: process.env.NODE_ENV === 'development' ? "2px solid red" : "none", // Debug border
          }}
        >
          <div
            className="simple-editor-wrapper"
            style={{
              color: "black",
              backgroundColor: "white",
              height: "100%",
              width: "100%",
              padding: "16px",
              overflow: "auto",
              border: process.env.NODE_ENV === 'development' ? "2px solid blue" : "none", // Debug border
              minHeight: "400px",
            }}
          >
            <SimpleEditor />
            {/* Debug indicator */}
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                position: 'absolute',
                top: '4px',
                left: '4px',
                background: 'red',
                color: 'white',
                padding: '4px',
                fontSize: '12px',
                zIndex: 999
              }}>
                TEXT EDITOR HERE
              </div>
            )}
          </div>
        </div>

        {/* TLDraw Overlay Layer - ALWAYS transparent, interactive only in draw mode */}
        <div
          className='absolute inset-0'
          style={{
            pointerEvents: isDrawingMode ? "auto" : "none", // Only interactive in draw mode
            zIndex: 10, // Always on top
            background: "transparent",
            opacity: 1, // Canvas itself fully visible
          }}
        >
          <Tldraw
            store={tldrawStore}
            onMount={handleMount}
            autoFocus={false} // Don't steal focus from text editor
            style={{
              background: "rgba(0, 0, 0, 0)", // Completely transparent
              backgroundColor: "rgba(0, 0, 0, 0)", // Completely transparent
              opacity: 1,
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
          {/* Debug indicator for TLDraw layer */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              background: isDrawingMode ? 'green' : 'orange',
              color: 'white',
              padding: '4px',
              fontSize: '12px',
              zIndex: 999,
              pointerEvents: 'none'
            }}>
              TLDRAW: {isDrawingMode ? 'ACTIVE' : 'INACTIVE'}
            </div>
          )}
        </div>

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
