import EditorModeToggle from "@/components/AnnotatedTextEditor/EditorModeToggle";
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

interface AnnotatedEditorProps {
  className?: string;
  initialMode?: EditorMode;
  onSave?: (data: { content: unknown; drawing: unknown }) => void;
}

const AnnotatedTextEditor: React.FC<AnnotatedEditorProps> = ({
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
  }, []);

  // Save drawing data
  const saveDrawing = useCallback(() => {
    if (!editorRef.current) return null;
    return editorRef.current.store.getSnapshot();
  }, []);

  // Clear drawing
  const clearDrawing = useCallback(() => {
    if (!editorRef.current) return;

    editorRef.current.selectAll();
    editorRef.current.deleteShapes(editorRef.current.getSelectedShapeIds());
  }, []);

  // Handle combined save
  const handleSave = useCallback(() => {
    const drawingSnapshot = saveDrawing();
    const combinedData = {
      content: null, // TODO: Get Tiptap content when implemented
      drawing: drawingSnapshot,
    };

    onSave?.(combinedData);
  }, [saveDrawing, onSave]);

  return (
    <div className={`annotated-editor ${className}`}>
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
        className='relative w-full bg-white rounded-lg shadow-lg border border-gray-200 h-[600px]'
      >
        {/* Text Editor Layer */}
        <div
          className={`
            simple-editor-wrapper relative w-full h-full p-4 bg-white
            ${isTextMode ? "z-20" : "z-10"}
            ${isTextMode ? "pointer-events-auto" : "pointer-events-none"}
          `}
        >
          <SimpleEditor />
        </div>

        {/* TLDraw Layer */}
        <div
          className={`
            absolute inset-0 bg-transparent
            ${isDrawingMode ? "z-20 pointer-events-auto" : "z-10 pointer-events-none"}
          `}
        >
          <div
            className={`
              w-full h-full
              ${isTextMode ? "tldraw-disabled" : ""}
              ${isDrawingMode ? "pointer-events-auto" : "pointer-events-none"}
            `}
          >
            <Tldraw
              store={tldrawStore}
              onMount={handleMount}
              autoFocus={false}
              components={{
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

        {/* Mode Indicator */}
        <div className='absolute top-4 right-4 z-30 pointer-events-none'>
          <div
            className={`
              px-3 py-1 rounded-full text-sm font-medium transition-colors
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

      {/* Controls */}
      <div className='mt-4 flex justify-center gap-4'>
        <button
          onClick={clearDrawing}
          className='px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors'
          disabled={modeState.isTransitioning}
        >
          🗑️ Clear Drawings
        </button>

        <button
          onClick={handleSave}
          className='px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors'
          disabled={modeState.isTransitioning}
        >
          💾 Save
        </button>
      </div>
    </div>
  );
};

export default AnnotatedTextEditor;
