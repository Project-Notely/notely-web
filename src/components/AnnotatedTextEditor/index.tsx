import EditorModeToggle from "@/components/AnnotatedTextEditor/EditorModeToggle";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import { useAnnotatedEditor } from "@/hooks/useAnnotatedEditor";
import { useEditorMode, type EditorMode } from "@/hooks/useEditorMode";
import type { AnnotatedDocument } from "@/models/types";
import { Editor as TiptapEditor } from "@tiptap/react";
import {
  createTLStore,
  defaultShapeUtils,
  Tldraw,
  Editor as TldrawEditor,
} from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import React, { useCallback, useRef, useState } from "react";

interface AnnotatedEditorProps {
  className?: string;
  initialMode?: EditorMode;
  userId?: string;
  initialDocument?: AnnotatedDocument;
  onSave?: (success: boolean, documentId?: string) => void;
  onContentChange?: () => void;
}

const AnnotatedTextEditor: React.FC<AnnotatedEditorProps> = ({
  className = "",
  initialMode = "text",
  userId,
  initialDocument,
  onSave,
  onContentChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tldrawStore] = useState(() =>
    createTLStore({ shapeUtils: defaultShapeUtils })
  );
  const [saveTitle, setSaveTitle] = useState("");
  const [saveDescription, setSaveDescription] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

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

  // Annotated editor management
  const {
    state,
    isSaving,
    isAnalyzing,
    setTiptapEditor,
    setTldrawEditor,
    saveDocument,
    loadDocument,
    clearContent,
    markAsChanged,
    getContentPreview,
    analyzeDocument,
    debugTldrawElements,
    testTldrawCapture,
    inspectTldrawContent,
    downloadScreenshot,
    clearDebugScreenshots,
  } = useAnnotatedEditor({ userId });

  // Store TLDraw editor reference
  const handleTldrawMount = useCallback(
    (editor: TldrawEditor) => {
      setTldrawEditor(editor);
    },
    [setTldrawEditor]
  );

  // Handle Tiptap editor ready
  const handleTiptapEditorReady = useCallback(
    (editor: TiptapEditor | null) => {
      setTiptapEditor(editor);
    },
    [setTiptapEditor]
  );

  // Handle content changes
  const handleContentChange = useCallback(() => {
    markAsChanged();
    onContentChange?.();
  }, [markAsChanged, onContentChange]);

  // Clear drawing
  const clearDrawing = useCallback(() => {
    if (!setTldrawEditor) return;

    const editor = setTldrawEditor as unknown as {
      current: TldrawEditor | null;
    };
    if (editor.current) {
      editor.current.selectAll();
      editor.current.deleteShapes(editor.current.getSelectedShapeIds());
    }
    markAsChanged();
  }, [setTldrawEditor, markAsChanged]);

  // Handle save with dialog
  const handleSaveClick = useCallback(() => {
    setShowSaveDialog(true);
  }, []);

  // Handle actual save
  const handleSave = useCallback(
    async (title?: string, description?: string) => {
      const success = await saveDocument(title, description);
      if (success) {
        onSave?.(true);
        setShowSaveDialog(false);
        setSaveTitle("");
        setSaveDescription("");
      } else {
        onSave?.(false);
      }
    },
    [saveDocument, onSave]
  );

  // Handle quick save without dialog
  const handleQuickSave = useCallback(async () => {
    const success = await saveDocument();
    onSave?.(success);
  }, [saveDocument, onSave]);

  // Handle analyze
  const handleAnalyze = useCallback(async () => {
    const success = await analyzeDocument();
    if (success) {
      console.log("Analysis completed successfully");
    } else {
      console.log("Analysis failed");
    }
  }, [analyzeDocument]);

  // Debug function for development
  const handleDebug = useCallback(() => {
    console.log("🔍 [DEBUG] Manual debug trigger");
    debugTldrawElements();
  }, [debugTldrawElements]);

  // Test TLDraw capture function
  const handleTestCapture = useCallback(() => {
    console.log("🧪 [TEST] Manual TLDraw capture test");
    testTldrawCapture();
  }, [testTldrawCapture]);

  // Inspect TLDraw content function
  const handleInspectContent = useCallback(() => {
    console.log("🔍 [INSPECT] TLDraw content inspection");
    const contentInfo = inspectTldrawContent();
    if (contentInfo) {
      alert(
        `TLDraw Content: ${contentInfo.shapeCount} shapes found. Check console for details.`
      );
    } else {
      alert("TLDraw editor not available or no content found.");
    }
  }, [inspectTldrawContent]);

  // Handle download screenshot
  const handleDownloadScreenshot = useCallback(
    (type: "text" | "drawing" | "combined") => {
      if (!state.debugScreenshots) return;

      const timestamp = new Date(state.debugScreenshots.timestamp)
        .toISOString()
        .replace(/[:.]/g, "-");
      let dataUrl: string | undefined;
      let filename: string;

      switch (type) {
        case "text":
          dataUrl = state.debugScreenshots.textCanvas;
          filename = `text-screenshot-${timestamp}.png`;
          break;
        case "drawing":
          dataUrl = state.debugScreenshots.drawingCanvas;
          filename = `drawing-screenshot-${timestamp}.png`;
          break;
        case "combined":
          dataUrl = state.debugScreenshots.combinedCanvas;
          filename = `combined-screenshot-${timestamp}.png`;
          break;
      }

      if (dataUrl) {
        downloadScreenshot(dataUrl, filename);
      }
    },
    [state.debugScreenshots, downloadScreenshot]
  );

  // Load initial document
  React.useEffect(() => {
    if (initialDocument) {
      loadDocument(initialDocument);
    }
  }, [initialDocument, loadDocument]);

  return (
    <div className={`annotated-editor ${className}`}>
      {/* Header with status and controls */}
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <EditorModeToggle
            mode={mode}
            isTransitioning={modeState.isTransitioning}
            onTextMode={setTextMode}
            onDrawingMode={setDrawingMode}
            onToggle={toggleMode}
            size='md'
            variant='buttons'
          />

          {/* Status indicator */}
          <div className='text-sm text-gray-600'>
            {state.hasUnsavedChanges && !isSaving && !isAnalyzing && (
              <span className='text-orange-600'>● Unsaved changes</span>
            )}
            {isSaving && <span className='text-blue-600'>● Saving...</span>}
            {isAnalyzing && (
              <span className='text-purple-600'>● Analyzing...</span>
            )}
            {!state.hasUnsavedChanges &&
              !isSaving &&
              !isAnalyzing &&
              state.lastSaved && (
                <span className='text-green-600'>
                  ✓ Saved {state.lastSaved.toLocaleTimeString()}
                </span>
              )}
            {state.analysisResult && !isAnalyzing && (
              <span className='text-purple-600'>✓ Analysis complete</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex gap-2'>
          <button
            onClick={clearContent}
            className='px-3 py-1 text-sm bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded transition-colors'
            disabled={modeState.isTransitioning || isSaving || isAnalyzing}
          >
            🗑️ Clear All
          </button>

          <button
            onClick={handleAnalyze}
            className='px-3 py-1 text-sm bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white rounded transition-colors'
            disabled={modeState.isTransitioning || isSaving || isAnalyzing}
          >
            {isAnalyzing ? "🔍 Analyzing..." : "🔍 Analyze"}
          </button>

          {/* Debug button - only show in development or when there's an error */}
          {(process.env.NODE_ENV === "development" || state.error) && (
            <>
              <button
                onClick={handleDebug}
                className='px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors'
                disabled={modeState.isTransitioning || isSaving || isAnalyzing}
              >
                🔍 Debug
              </button>
              <button
                onClick={handleTestCapture}
                className='px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors'
                disabled={modeState.isTransitioning || isSaving || isAnalyzing}
              >
                🧪 Test Capture
              </button>
              <button
                onClick={handleInspectContent}
                className='px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors'
                disabled={modeState.isTransitioning || isSaving || isAnalyzing}
              >
                🔍 Inspect Content
              </button>
            </>
          )}

          {state.hasUnsavedChanges && (
            <button
              onClick={handleQuickSave}
              className='px-3 py-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded transition-colors'
              disabled={modeState.isTransitioning || isSaving || isAnalyzing}
            >
              💾 Quick Save
            </button>
          )}

          <button
            onClick={handleSaveClick}
            className='px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors'
            disabled={modeState.isTransitioning || isSaving || isAnalyzing}
          >
            💾 Save As...
          </button>
        </div>
      </div>

      {/* Error display */}
      {state.error && (
        <div className='mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded'>
          {state.error}
        </div>
      )}

      {/* Analysis result display */}
      {state.analysisResult && (
        <div className='mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg'>
          <h4 className='font-semibold text-purple-900 mb-2'>
            📊 Analysis Results
          </h4>
          <div className='text-sm text-purple-800'>
            <p>
              Analysis ID:{" "}
              <code className='bg-purple-100 px-2 py-1 rounded'>
                {state.analysisResult.analysisId}
              </code>
            </p>
            {state.analysisResult.result !== undefined && (
              <div className='mt-2'>
                <p className='font-medium'>Result:</p>
                <pre className='bg-purple-100 p-2 rounded text-xs mt-1 max-h-32 overflow-y-auto'>
                  {JSON.stringify(state.analysisResult.result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug Screenshots Display */}
      {state.debugScreenshots && (
        <div className='mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg'>
          <div className='flex items-center justify-between mb-3'>
            <h4 className='font-semibold text-gray-900'>
              🔍 Debug Screenshots
            </h4>
            <button
              onClick={clearDebugScreenshots}
              className='text-sm px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-gray-700'
            >
              Clear
            </button>
          </div>

          <div className='text-xs text-gray-600 mb-3'>
            Captured:{" "}
            {new Date(state.debugScreenshots.timestamp).toLocaleString()}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {/* Text Screenshot */}
            {state.debugScreenshots.textCanvas && (
              <div className='border border-gray-300 rounded-lg p-3 bg-white'>
                <div className='flex items-center justify-between mb-2'>
                  <h5 className='font-medium text-sm text-gray-700'>
                    Text Canvas
                  </h5>
                  <button
                    onClick={() => handleDownloadScreenshot("text")}
                    className='text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700'
                  >
                    Download
                  </button>
                </div>
                <img
                  src={state.debugScreenshots.textCanvas}
                  alt='Text Canvas Screenshot'
                  className='w-full h-auto border border-gray-200 rounded'
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            )}

            {/* Drawing Screenshot */}
            {state.debugScreenshots.drawingCanvas && (
              <div className='border border-gray-300 rounded-lg p-3 bg-white'>
                <div className='flex items-center justify-between mb-2'>
                  <h5 className='font-medium text-sm text-gray-700'>
                    Drawing Canvas
                  </h5>
                  <button
                    onClick={() => handleDownloadScreenshot("drawing")}
                    className='text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700'
                  >
                    Download
                  </button>
                </div>
                <img
                  src={state.debugScreenshots.drawingCanvas}
                  alt='Drawing Canvas Screenshot'
                  className='w-full h-auto border border-gray-200 rounded'
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            )}

            {/* Combined Screenshot */}
            {state.debugScreenshots.combinedCanvas && (
              <div className='border border-gray-300 rounded-lg p-3 bg-white'>
                <div className='flex items-center justify-between mb-2'>
                  <h5 className='font-medium text-sm text-gray-700'>
                    Combined Canvas
                  </h5>
                  <button
                    onClick={() => handleDownloadScreenshot("combined")}
                    className='text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-700'
                  >
                    Download
                  </button>
                </div>
                <img
                  src={state.debugScreenshots.combinedCanvas}
                  alt='Combined Canvas Screenshot'
                  className='w-full h-auto border border-gray-200 rounded'
                  style={{ maxHeight: "200px", objectFit: "contain" }}
                />
              </div>
            )}
          </div>

          {/* Status indicators */}
          <div className='mt-3 flex gap-4 text-xs'>
            <span
              className={`px-2 py-1 rounded ${state.debugScreenshots.textCanvas ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              Text:{" "}
              {state.debugScreenshots.textCanvas ? "✓ Captured" : "✗ Failed"}
            </span>
            <span
              className={`px-2 py-1 rounded ${state.debugScreenshots.drawingCanvas ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              Drawing:{" "}
              {state.debugScreenshots.drawingCanvas ? "✓ Captured" : "✗ Failed"}
            </span>
            <span
              className={`px-2 py-1 rounded ${state.debugScreenshots.combinedCanvas ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              Combined:{" "}
              {state.debugScreenshots.combinedCanvas
                ? "✓ Captured"
                : "✗ Failed"}
            </span>
          </div>
        </div>
      )}

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
          <SimpleEditor
            onEditorReady={handleTiptapEditorReady}
            onChange={handleContentChange}
          />
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
              onMount={handleTldrawMount}
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

      {/* Save Dialog Modal */}
      {showSaveDialog && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
            <h3 className='text-lg font-semibold mb-4'>Save Document</h3>

            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Title
                </label>
                <input
                  type='text'
                  value={saveTitle}
                  onChange={e => setSaveTitle(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter document title...'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Description
                </label>
                <textarea
                  value={saveDescription}
                  onChange={e => setSaveDescription(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows={3}
                  placeholder='Enter description (optional)...'
                />
              </div>

              <div className='text-sm text-gray-600'>
                <strong>Preview:</strong> {getContentPreview()}
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <button
                onClick={() => setShowSaveDialog(false)}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors'
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(saveTitle, saveDescription)}
                className='flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded transition-colors'
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnotatedTextEditor;
