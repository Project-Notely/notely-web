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

  // Debug logging for mode changes and event handling
  React.useEffect(() => {
    console.log("🔄 [MODE-DEBUG] Mode changed:", {
      mode,
      isTextMode,
      isDrawingMode,
      timestamp: new Date().toISOString(),
    });
  }, [mode, isTextMode, isDrawingMode]);

  // Add click event logging to text editor container
  const handleTextContainerClick = useCallback(
    (e: React.MouseEvent) => {
      console.log("🖱️ [TEXT-CLICK] Text container clicked:", {
        mode,
        target: e.target,
        currentTarget: e.currentTarget,
        pointerEvents: (e.currentTarget as HTMLElement).style.pointerEvents,
        zIndex: (e.currentTarget as HTMLElement).style.zIndex,
        timestamp: new Date().toISOString(),
      });
    },
    [mode]
  );

  // Add click event logging to TLDraw container
  const handleTLDrawContainerClick = useCallback(
    (e: React.MouseEvent) => {
      console.log("🖱️ [TLDRAW-CLICK] TLDraw container clicked:", {
        mode,
        target: e.target,
        currentTarget: e.currentTarget,
        pointerEvents: (e.currentTarget as HTMLElement).style.pointerEvents,
        zIndex: (e.currentTarget as HTMLElement).style.zIndex,
        shouldBeInteractive: isDrawingMode,
        timestamp: new Date().toISOString(),
      });
    },
    [mode, isDrawingMode]
  );

  // Monitor text editor focus events
  React.useEffect(() => {
    const textContainer = containerRef.current?.querySelector(
      ".simple-editor-wrapper"
    );
    if (!textContainer) return;

    const handleFocus = (e: Event) => {
      console.log("🎯 [FOCUS] Text editor gained focus:", {
        mode,
        target: e.target,
        timestamp: new Date().toISOString(),
      });
    };

    const handleBlur = (e: Event) => {
      console.log("🎯 [BLUR] Text editor lost focus:", {
        mode,
        target: e.target,
        timestamp: new Date().toISOString(),
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("⌨️ [KEYDOWN] Key pressed in text editor:", {
        mode,
        key: e.key,
        target: e.target,
        timestamp: new Date().toISOString(),
      });
    };

    textContainer.addEventListener("focus", handleFocus, true);
    textContainer.addEventListener("blur", handleBlur, true);
    textContainer.addEventListener("keydown", handleKeyDown, true);

    return () => {
      textContainer.removeEventListener("focus", handleFocus, true);
      textContainer.removeEventListener("blur", handleBlur, true);
      textContainer.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [mode]);

  // Log pointer events state on each render
  React.useEffect(() => {
    console.log("📊 [POINTER-EVENTS] Current state:", {
      mode,
      textLayerPointerEvents: "auto",
      tldrawLayerPointerEvents: isDrawingMode ? "auto" : "none",
      textLayerZIndex: 1,
      tldrawLayerZIndex: 10,
      timestamp: new Date().toISOString(),
    });
  }, [mode, isDrawingMode]);

  // Check if Tiptap editor is properly initialized and editable
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const tiptapEditor = containerRef.current?.querySelector(".tiptap");
      const isEditable = tiptapEditor?.getAttribute("contenteditable");
      const hasTabIndex = tiptapEditor?.getAttribute("tabindex");

      console.log("📝 [TIPTAP-DEBUG] Editor state:", {
        mode,
        editorElement: !!tiptapEditor,
        contentEditable: isEditable,
        tabIndex: hasTabIndex,
        canFocus: tiptapEditor ? true : false,
        timestamp: new Date().toISOString(),
      });

      // Try to programmatically focus the editor when in text mode
      if (isTextMode && tiptapEditor) {
        console.log("🎯 [FOCUS-TEST] Attempting to focus Tiptap editor...");
        (tiptapEditor as HTMLElement).focus();
      }
    }, 1000); // Wait for editor to initialize

    return () => clearTimeout(timer);
  }, [mode, isTextMode]);

  // Focus text editor when switching to text mode
  React.useEffect(() => {
    if (isTextMode) {
      const timer = setTimeout(() => {
        const tiptapEditor = containerRef.current?.querySelector(".tiptap");
        if (tiptapEditor) {
          console.log(
            "🎯 [AUTO-FOCUS] Focusing text editor on mode switch to text"
          );
          (tiptapEditor as HTMLElement).focus();
        }
      }, 100); // Small delay to ensure mode switch is complete

      return () => clearTimeout(timer);
    }
  }, [isTextMode]);

  // Focus TLDraw when switching to draw mode
  React.useEffect(() => {
    if (isDrawingMode && editorRef.current) {
      const timer = setTimeout(() => {
        console.log("🎯 [AUTO-FOCUS] Focusing TLDraw on mode switch to draw");
        // TLDraw should be ready to receive events now
        editorRef.current?.updateInstanceState({ isToolLocked: false });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isDrawingMode]);

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
          className='absolute inset-0'
          onClick={handleTextContainerClick}
          style={{
            pointerEvents: "auto", // Always interactive
            zIndex: 1,
            background: "white",
            border:
              process.env.NODE_ENV === "development" ? "2px solid red" : "none", // Debug border
          }}
        >
          <div
            className='simple-editor-wrapper'
            style={{
              color: "black",
              backgroundColor: "white",
              height: "100%",
              width: "100%",
              padding: "16px",
              overflow: "auto",
              border:
                process.env.NODE_ENV === "development"
                  ? "2px solid blue"
                  : "none", // Debug border
              minHeight: "400px",
            }}
          >
            <SimpleEditor />
            {/* Debug indicator */}
            {process.env.NODE_ENV === "development" && (
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "4px",
                  background: "red",
                  color: "white",
                  padding: "4px",
                  fontSize: "12px",
                  zIndex: 999,
                }}
              >
                TEXT EDITOR HERE
              </div>
            )}
          </div>
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
          <Tldraw
            store={tldrawStore}
            onMount={handleMount}
            autoFocus={false} // Never auto-focus to avoid stealing focus
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
        </div>

        {/* Event Management Overlay - Only blocks events in text mode */}
        {!isDrawingMode && (
          <div
            className='absolute inset-0'
            style={{
              zIndex: 15, // Above TLDraw
              background: "transparent",
              pointerEvents: "auto", // Capture all events in text mode
            }}
            onClick={e => {
              console.log(
                "🔄 [EVENT-BLOCK] Blocking TLDraw click, forwarding to text editor"
              );

              // Prevent TLDraw from getting the event
              e.preventDefault();
              e.stopPropagation();

              // Forward click to text editor
              const textEditor = containerRef.current?.querySelector(".tiptap");
              if (textEditor) {
                (textEditor as HTMLElement).focus();
              }
            }}
            onMouseDown={e => {
              // Block all mouse events that could trigger TLDraw
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseMove={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        )}

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

        {/* Debug indicator when TLDraw is not rendered */}
        {!isDrawingMode && process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "24px",
              right: "4px",
              background: "blue",
              color: "white",
              padding: "4px",
              fontSize: "12px",
              zIndex: 999,
              pointerEvents: "none",
            }}
          >
            EVENT BLOCKER ACTIVE
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
