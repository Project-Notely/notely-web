import { useAnalyzeDocument, useSaveDocument } from "@/hooks/useTextQueries";
import type {
  AnalyzeDocumentRequest,
  AnnotatedDocument,
  TextContent,
} from "@/models/types";
import { Editor as TiptapEditor } from "@tiptap/react";
import { Editor as TldrawEditor } from "@tldraw/tldraw";
import { useCallback, useRef, useState } from "react";

// Configuration interface for the hook
interface UseAnnotatedEditorConfig {
  userId?: string;
  containerRef?: React.RefObject<HTMLDivElement | null>; // Allow null values
}

interface AnalysisResult {
  analysisId: string;
  result?: unknown;
}

interface TextNode {
  type: string;
  text?: string;
  content?: TextNode[];
}

export interface AnnotatedEditorState {
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  isAnalyzing: boolean;
  lastSaved: Date | null;
  error: string | null;
  analysisResult?: AnalysisResult;
}

export const useAnnotatedEditor = ({
  userId,
  containerRef,
}: UseAnnotatedEditorConfig = {}) => {
  const tiptapEditorRef = useRef<TiptapEditor | null>(null);
  const tldrawEditorRef = useRef<TldrawEditor | null>(null);

  const [state, setState] = useState<AnnotatedEditorState>({
    hasUnsavedChanges: false,
    isSaving: false,
    isAnalyzing: false,
    lastSaved: null,
    error: null,
  });

  // React Query hooks
  const saveDocumentMutation = useSaveDocument();
  const analyzeDocumentMutation = useAnalyzeDocument();

  // Set editor references
  const setTiptapEditor = useCallback((editor: TiptapEditor | null) => {
    tiptapEditorRef.current = editor;
  }, []);

  const setTldrawEditor = useCallback((editor: TldrawEditor | null) => {
    tldrawEditorRef.current = editor;
  }, []);

  // Extract text content from Tiptap editor
  const getTextContent = useCallback((): TextContent => {
    if (!tiptapEditorRef.current) {
      return { type: "doc", content: [] };
    }

    // Get the JSON representation of the editor content
    const content = tiptapEditorRef.current.getJSON();
    return content as TextContent;
  }, []);

  // Extract drawing content from TLDraw editor
  const getDrawingContent = useCallback(() => {
    if (!tldrawEditorRef.current) {
      return null;
    }

    // Get the TLDraw snapshot
    return tldrawEditorRef.current.getSnapshot();
  }, []);

  // Get layout information for backend reconstruction
  const getLayoutInfo = useCallback(() => {
    const containerElement = containerRef?.current;
    const contentWrapper = document.querySelector(
      ".annotated-editor .content-wrapper"
    ) as HTMLElement;

    if (!containerElement || !contentWrapper) {
      console.warn("❌ Layout elements not found for analysis");
      return {
        containerDimensions: { width: 800, height: 600 },
        textDimensions: { width: 800, height: 600 },
        scrollPosition: { x: 0, y: 0 },
      };
    }

    const containerRect = containerElement.getBoundingClientRect();
    const wrapperRect = contentWrapper.getBoundingClientRect();

    return {
      containerDimensions: {
        width: containerRect.width,
        height: containerRect.height,
      },
      textDimensions: {
        width: wrapperRect.width,
        height: wrapperRect.height,
      },
      scrollPosition: {
        x: contentWrapper.scrollLeft,
        y: contentWrapper.scrollTop,
      },
    };
  }, [containerRef]);

  // Utility function to download a screenshot (kept for legacy downloads)
  const downloadScreenshot = useCallback(
    (dataUrl: string, filename: string) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  // Enhanced analyze function with raw data
  const analyzeDocument = useCallback(async (): Promise<boolean> => {
    console.log("🔍 Starting document analysis with raw data...");

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Gather all data needed for backend reconstruction
      const textContent = getTextContent();
      const drawingContent = getDrawingContent();
      const layoutInfo = getLayoutInfo();

      console.log("📊 [RAW-DATA] Preparing analysis request:", {
        hasTextContent:
          !!textContent &&
          textContent.content &&
          textContent.content.length > 0,
        hasDrawingContent: !!drawingContent,
        layoutInfo,
      });

      // Create analysis request
      const analysisRequest: AnalyzeDocumentRequest = {
        textContent,
        drawingContent,
        layoutInfo,
        userId,
        options: {
          analysisType: "raw_data_reconstruction",
          includeText: true,
          includeDrawing: true,
        },
      };

      // Send to backend using React Query
      const result = await analyzeDocumentMutation.mutateAsync(analysisRequest);

      if (result.success && result.data) {
        const analysisResult = {
          analysisId: result.data.analysisId,
          timestamp: result.data.timestamp,
          result: result.data.result,
        };

        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisResult,
          lastSaved: new Date(),
        }));

        console.log(
          "✅ [RAW-DATA] Analysis completed successfully:",
          analysisResult
        );
        return true;
      } else {
        throw new Error(result.error || "Analysis failed");
      }
    } catch (error) {
      console.error("❌ Raw data analysis failed:", error);
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
      return false;
    }
  }, [
    getTextContent,
    getDrawingContent,
    getLayoutInfo,
    userId,
    analyzeDocumentMutation,
  ]);

  // Create annotated document from current state
  const createDocument = useCallback(
    (title?: string, description?: string): AnnotatedDocument => {
      const textContent = getTextContent();
      const drawingContent = getDrawingContent();
      const now = Date.now();

      return {
        textContent,
        drawingContent,
        metadata: {
          title,
          description,
          created: now,
          modified: now,
          version: "1.0",
        },
      };
    },
    [getTextContent, getDrawingContent]
  );

  // Save document to backend
  const saveDocument = useCallback(
    async (title?: string, description?: string): Promise<boolean> => {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        const document = createDocument(title, description);

        console.log("💾 Saving document...", {
          hasText: !!document.textContent,
          hasDrawing: !!document.drawingContent,
          title,
          description,
        });

        const result = await saveDocumentMutation.mutateAsync({
          document,
          userId,
          title,
          description,
        });

        if (result.success) {
          setState(prev => ({
            ...prev,
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
            error: null,
          }));

          console.log("✅ Document saved successfully");
          return true;
        } else {
          throw new Error(result.error || "Save failed");
        }
      } catch (error) {
        console.error("❌ Save failed:", error);
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        }));
        return false;
      }
    },
    [createDocument, saveDocumentMutation, userId]
  );

  // Load document into editors
  const loadDocument = useCallback((document: AnnotatedDocument) => {
    try {
      console.log("📖 Loading document...", {
        hasText: !!document.textContent,
        hasDrawing: !!document.drawingContent,
      });

      // Load text content
      if (tiptapEditorRef.current && document.textContent) {
        tiptapEditorRef.current.commands.setContent(document.textContent);
      }

      // Load drawing content
      if (tldrawEditorRef.current && document.drawingContent) {
        tldrawEditorRef.current.loadSnapshot(document.drawingContent);
      }

      setState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(document.metadata.modified),
        error: null,
      }));

      console.log("✅ Document loaded successfully");
    } catch (error) {
      console.error("❌ Load failed:", error);
      setState(prev => ({
        ...prev,
        error: `Load failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
    }
  }, []);

  // Clear all content
  const clearContent = useCallback(() => {
    try {
      console.log("🗑️ Clearing all content...");

      // Clear text editor
      if (tiptapEditorRef.current) {
        tiptapEditorRef.current.commands.clearContent();
      }

      // Clear drawing editor
      if (tldrawEditorRef.current) {
        tldrawEditorRef.current.deleteShapes(
          Array.from(tldrawEditorRef.current.getCurrentPageShapeIds())
        );
      }

      setState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: null,
        error: null,
        analysisResult: undefined,
      }));

      console.log("✅ Content cleared successfully");
    } catch (error) {
      console.error("❌ Clear failed:", error);
      setState(prev => ({
        ...prev,
        error: `Clear failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      }));
    }
  }, []);

  // Mark content as changed
  const markAsChanged = useCallback(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Get content preview
  const getContentPreview = useCallback(() => {
    const textContent = getTextContent();

    if (!textContent || !textContent.content) {
      return "Empty document";
    }

    // Extract plain text from structured content
    const extractText = (nodes: TextNode[]): string => {
      let text = "";
      nodes.forEach(node => {
        if (node.type === "text" && node.text) {
          text += node.text;
        } else if (node.content) {
          text += extractText(node.content);
        }
      });
      return text;
    };

    const plainText = extractText(textContent.content || []);
    return plainText.slice(0, 200) + (plainText.length > 200 ? "..." : "");
  }, [getTextContent]);

  return {
    state,
    isSaving: state.isSaving,
    isAnalyzing: state.isAnalyzing,
    tiptapEditorRef, // Expose the editor ref
    setTiptapEditor,
    setTldrawEditor,
    saveDocument,
    loadDocument,
    clearContent,
    markAsChanged,
    getContentPreview,
    analyzeDocument,
    downloadScreenshot,
  };
};
