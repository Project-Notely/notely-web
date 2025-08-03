import { useAnalyzeDocument, useSaveDocument } from "@/hooks/useTextQueries";
import type { AnnotatedDocument, TextContent } from "@/models/types";
import { Editor as TiptapEditor } from "@tiptap/react";
import { Editor as TldrawEditor } from "@tldraw/tldraw";
import html2canvas from "html2canvas";
import { useCallback, useRef, useState } from "react";

// Interface for text capture positioning info (no longer needed for unified approach)
// let globalTextCaptureInfo: TextCaptureInfo | null = null;

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
  debugScreenshots?: {
    textCanvas?: string;
    drawingCanvas?: string;
    combinedCanvas?: string;
    timestamp: number;
  };
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

  // Capture text editor only (without TLDraw interference)
  const captureTextOnly = useCallback(async (): Promise<string | null> => {
    try {
      console.log("📸 [TEXT] Capturing text editor only...");

      // Target the text content wrapper
      const contentWrapper = document.querySelector(
        ".annotated-editor .content-wrapper"
      ) as HTMLElement;

      if (!contentWrapper) {
        console.warn("❌ Text content wrapper not found");
        return null;
      }

      const wrapperRect = contentWrapper.getBoundingClientRect();
      console.log("📊 [TEXT] Content wrapper:", {
        width: wrapperRect.width,
        height: wrapperRect.height,
      });

      const canvas = await html2canvas(contentWrapper, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: wrapperRect.width,
        height: wrapperRect.height,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: element => {
          // Ignore ALL TLDraw elements - we'll capture them separately
          const src = element.getAttribute("src");
          return (
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE" ||
            element.classList.contains("tldraw") ||
            element.classList.contains("tl-canvas") ||
            element.getAttribute("data-testid") === "canvas" ||
            element.classList.contains("tl-ui") ||
            Boolean(src && src.includes("placeholder"))
          );
        },
        onclone: clonedDoc => {
          const style = clonedDoc.createElement("style");
          style.textContent = `
            /* Clean text rendering */
            .tiptap, .ProseMirror {
              font-family: "DM Sans", -apple-system, BlinkMacSystemFont, sans-serif !important;
              color: #1f2937 !important;
              background-color: white !important;
            }

            /* Hide all TLDraw elements completely */
            .tldraw, .tl-canvas, [data-testid="canvas"], [class*="tl-"] {
              display: none !important;
            }

            /* Remove placeholder images */
            img[src*="placeholder"] {
              display: none !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      const dataUrl = canvas.toDataURL("image/png", 1.0);
      console.log("✅ [TEXT] Text captured successfully");
      return dataUrl;
    } catch (error) {
      console.error("❌ [TEXT] Text capture failed:", error);
      return null;
    }
  }, []);

  // Capture TLDraw using direct SVG export (bypass broken helper)
  const captureDrawingNative = useCallback(async (): Promise<string | null> => {
    try {
      if (!tldrawEditorRef.current) {
        console.log("📊 [DRAWING] No TLDraw editor available");
        return null;
      }

      console.log("📸 [DRAWING] Using TLDraw direct SVG export...");
      const editor = tldrawEditorRef.current;
      const shapes = editor.getCurrentPageShapes();

      if (shapes.length === 0) {
        console.log("📊 [DRAWING] No shapes to export");
        return null;
      }

      console.log("📊 [DRAWING] Exporting", shapes.length, "shapes");

      // Use TLDraw's basic getSvg method
      const svg = await editor.getSvg(
        Array.from(editor.getCurrentPageShapeIds()),
        {
          scale: 2,
          background: false,
        }
      );

      if (!svg) {
        console.warn("❌ [DRAWING] TLDraw SVG export returned null");
        return null;
      }

      // Convert SVG to PNG using canvas
      const svgString = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/png", 1.0);
          URL.revokeObjectURL(svgUrl);
          resolve(dataUrl);
        };
        img.onerror = () => {
          URL.revokeObjectURL(svgUrl);
          reject(new Error("Failed to load SVG image"));
        };
        img.src = svgUrl;
      });

      console.log("✅ [DRAWING] Drawing exported via direct TLDraw SVG method");
      return dataUrl;
    } catch (error) {
      console.error("❌ [DRAWING] Direct export failed:", error);
      return null;
    }
  }, []);

  // Combine text and drawing with proper positioning
  const combineTextAndDrawing = useCallback(
    async (textDataUrl: string, drawingDataUrl?: string): Promise<string> => {
      console.log("🖼️ [COMBINE] Combining text and drawing...");

      return new Promise((resolve, reject) => {
        const textImg = new Image();
        textImg.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = textImg.width;
          canvas.height = textImg.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw text as background
          ctx.drawImage(textImg, 0, 0);

          if (drawingDataUrl) {
            const drawingImg = new Image();
            drawingImg.onload = () => {
              // Draw drawing on top with proper positioning
              // TLDraw export maintains proper coordinates
              ctx.globalCompositeOperation = "source-over";
              ctx.drawImage(drawingImg, 0, 0, canvas.width, canvas.height);

              const combinedDataUrl = canvas.toDataURL("image/png", 1.0);
              console.log(
                "✅ [COMBINE] Text and drawing combined successfully"
              );
              resolve(combinedDataUrl);
            };
            drawingImg.onerror = () =>
              reject(new Error("Failed to load drawing"));
            drawingImg.src = drawingDataUrl;
          } else {
            // No drawing, just return text
            const combinedDataUrl = canvas.toDataURL("image/png", 1.0);
            console.log("✅ [COMBINE] Text only (no drawing)");
            resolve(combinedDataUrl);
          }
        };
        textImg.onerror = () => reject(new Error("Failed to load text"));
        textImg.src = textDataUrl;
      });
    },
    []
  );

  // Main unified capture using dual approach
  const captureUnifiedScreenshot = useCallback(async (): Promise<
    string | null
  > => {
    try {
      console.log("📸 [UNIFIED] Starting dual capture approach...");

      // Capture text and drawing separately
      const [textCapture, drawingCapture] = await Promise.all([
        captureTextOnly(),
        captureDrawingNative(),
      ]);

      if (!textCapture) {
        console.error("❌ [UNIFIED] Text capture failed");
        return null;
      }

      console.log("📊 [UNIFIED] Capture results:", {
        hasText: !!textCapture,
        hasDrawing: !!drawingCapture,
      });

      // Combine them properly
      const combinedCapture = await combineTextAndDrawing(
        textCapture,
        drawingCapture || undefined
      );

      console.log("✅ [UNIFIED] Dual capture completed successfully!");
      return combinedCapture;
    } catch (error) {
      console.error("❌ [UNIFIED] Dual capture failed:", error);
      return null;
    }
  }, [captureTextOnly, captureDrawingNative, combineTextAndDrawing]);

  // Enhanced TLDraw capture with working selectors
  // REMOVED: No longer needed - unified capture handles everything
  // const captureDrawingScreenshot = useCallback(async (): Promise<string | null> => {
  //   // This function is obsolete with unified container capture
  // }, []);

  // Combine text and drawing screenshots
  // REMOVED: No longer needed - unified capture provides complete result
  // const combineBothScreenshots = useCallback(
  //   // This function is obsolete with unified container capture
  // ), []);

  // Utility function to download a screenshot
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

  // Enhanced analyze function with screenshot storage
  const analyzeDocument = useCallback(
    async (options?: {
      analysisType?: string;
      includeText?: boolean;
      includeDrawing?: boolean;
    }): Promise<boolean> => {
      console.log("🔍 Starting document analysis...");

      setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        // Capture screenshots for debugging
        const unifiedScreenshot = await captureUnifiedScreenshot();

        // Store screenshots for debugging
        setState(prev => ({
          ...prev,
          debugScreenshots: {
            timestamp: Date.now(),
            textCanvas: unifiedScreenshot || undefined, // Use unified for text display
            drawingCanvas: undefined, // No separate drawing needed
            combinedCanvas: unifiedScreenshot || undefined, // Unified IS the combined result
          },
        }));

        if (!unifiedScreenshot) {
          throw new Error("Failed to capture screenshot");
        }

        // Simulate successful analysis with unified capture
        const mockAnalysisResult = {
          analysisId: `unified_analysis_${Date.now()}`,
          timestamp: new Date().toISOString(),
          result: {
            captureMethod: "unified_container",
            hasContent: true,
            status: "completed",
          },
        };

        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          analysisResult: mockAnalysisResult,
          lastSaved: new Date(),
        }));

        console.log("✅ [UNIFIED] Screenshot capture completed successfully");
        return true;
      } catch (error) {
        console.error("❌ Screenshot capture failed:", error);
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: `Screenshot capture failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        }));
        return false;
      }
    },
    [captureUnifiedScreenshot]
  );

  // Clear debug screenshots
  const clearDebugScreenshots = useCallback(() => {
    setState(prev => ({
      ...prev,
      debugScreenshots: undefined,
    }));
  }, []);

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

  // Save document
  const saveDocument = useCallback(
    async (title?: string, description?: string): Promise<boolean> => {
      console.log("🚀 [ANNOTATED-EDITOR] Starting save process...", {
        title,
        description,
      });

      setState(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        const document = createDocument(title, description);

        console.log("📊 [ANNOTATED-EDITOR] Document data prepared:", {
          textContentLength: JSON.stringify(document.textContent).length,
          hasDrawing: !!document.drawingContent,
          userId: userId,
        });

        const result = await saveDocumentMutation.mutateAsync({
          document,
          userId: userId,
          title,
          description,
        });

        console.log("✅ [ANNOTATED-EDITOR] API response:", result);

        if (result.success) {
          setState(prev => ({
            ...prev,
            isSaving: false,
            hasUnsavedChanges: false,
            lastSaved: new Date(),
            error: null,
          }));
          console.log("✅ [ANNOTATED-EDITOR] Save successful!");
          return true;
        } else {
          console.error("❌ [ANNOTATED-EDITOR] Save failed:", result.error);
          setState(prev => ({
            ...prev,
            isSaving: false,
            error: result.error || "Failed to save document",
          }));
          return false;
        }
      } catch (error) {
        console.error("❌ [ANNOTATED-EDITOR] Exception during save:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState(prev => ({
          ...prev,
          isSaving: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [userId, createDocument, saveDocumentMutation]
  );

  // Load document into editors
  const loadDocument = useCallback((document: AnnotatedDocument): void => {
    console.log("🚀 [ANNOTATED-EDITOR] Loading document...", document);

    try {
      // Load text content into Tiptap
      if (tiptapEditorRef.current && document.textContent) {
        tiptapEditorRef.current.commands.setContent(document.textContent);
      }

      // Load drawing content into TLDraw
      if (tldrawEditorRef.current && document.drawingContent) {
        tldrawEditorRef.current.store.loadSnapshot(document.drawingContent);
      }

      setState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date(document.metadata.modified),
        error: null,
      }));

      console.log("✅ [ANNOTATED-EDITOR] Document loaded successfully");
    } catch (error) {
      console.error("❌ [ANNOTATED-EDITOR] Failed to load document:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load document";
      setState(prev => ({ ...prev, error: errorMessage }));
    }
  }, []);

  // Clear both editors
  const clearContent = useCallback(() => {
    if (tiptapEditorRef.current) {
      tiptapEditorRef.current.commands.clearContent();
    }

    if (tldrawEditorRef.current) {
      tldrawEditorRef.current.selectAll();
      tldrawEditorRef.current.deleteShapes(
        tldrawEditorRef.current.getSelectedShapeIds()
      );
    }

    setState(prev => ({
      ...prev,
      hasUnsavedChanges: false,
      lastSaved: null,
      error: null,
    }));
  }, []);

  // Mark as having unsaved changes
  const markAsChanged = useCallback(() => {
    setState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Get content preview (for display purposes)
  const getContentPreview = useCallback((): string => {
    const textContent = getTextContent();

    // Extract plain text from the document
    const extractText = (content: TextNode[]): string => {
      let text = "";
      content?.forEach((node: TextNode) => {
        if (node.type === "text") {
          text += node.text || "";
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
    setTiptapEditor,
    setTldrawEditor,
    saveDocument,
    loadDocument,
    clearContent,
    markAsChanged,
    getContentPreview,
    analyzeDocument,
    downloadScreenshot,
    clearDebugScreenshots,
  };
};
