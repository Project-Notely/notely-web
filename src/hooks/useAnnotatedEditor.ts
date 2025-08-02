import { useAnalyzeDocument, useSaveDocument } from "@/hooks/useTextQueries";
import type { AnnotatedDocument, TextContent } from "@/models/types";
import { Editor as TiptapEditor } from "@tiptap/react";
import { Editor as TldrawEditor } from "@tldraw/tldraw";
import html2canvas from "html2canvas";
import { useCallback, useRef, useState } from "react";

export interface AnnotatedEditorConfig {
  userId?: string;
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
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

export const useAnnotatedEditor = (config: AnnotatedEditorConfig = {}) => {
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

  // Debug function to inspect TLDraw elements
  const debugTldrawElements = useCallback(() => {
    console.log("🔍 [DEBUG] Inspecting TLDraw elements...");

    const tldrawContainer = document.querySelector(".tldraw");
    if (tldrawContainer) {
      console.log("✅ Found .tldraw container:", tldrawContainer);
      console.log("📏 Container size:", {
        width: (tldrawContainer as HTMLElement).offsetWidth,
        height: (tldrawContainer as HTMLElement).offsetHeight,
        visible: (tldrawContainer as HTMLElement).offsetParent !== null,
        computedStyle: window.getComputedStyle(tldrawContainer as HTMLElement),
      });

      // Find all possible elements
      const allElements = tldrawContainer.querySelectorAll("*");
      console.log(`📋 Total child elements: ${allElements.length}`);

      const canvases = tldrawContainer.querySelectorAll("canvas");
      console.log(`🖼️ Found ${canvases.length} canvas elements:`, canvases);
      canvases.forEach((canvas, index) => {
        const rect = canvas.getBoundingClientRect();
        const style = window.getComputedStyle(canvas);
        console.log(`  Canvas ${index}:`, {
          width: canvas.width,
          height: canvas.height,
          offsetWidth: canvas.offsetWidth,
          offsetHeight: canvas.offsetHeight,
          boundingRect: rect,
          visible: canvas.offsetParent !== null,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          pointerEvents: style.pointerEvents,
          zIndex: style.zIndex,
          position: style.position,
          className: canvas.className,
          id: canvas.id,
        });
      });

      const svgs = tldrawContainer.querySelectorAll("svg");
      console.log(`🎨 Found ${svgs.length} SVG elements:`, svgs);
      svgs.forEach((svg, index) => {
        const rect = svg.getBoundingClientRect();
        const style = window.getComputedStyle(svg);
        const svgElement = svg as SVGSVGElement;
        console.log(`  SVG ${index}:`, {
          width: svg.getAttribute("width"),
          height: svg.getAttribute("height"),
          offsetWidth: (svgElement as unknown as HTMLElement).offsetWidth,
          offsetHeight: (svgElement as unknown as HTMLElement).offsetHeight,
          boundingRect: rect,
          visible: (svgElement as unknown as HTMLElement).offsetParent !== null,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          className: svg.className.baseVal || svg.className,
          id: svg.id,
        });
      });

      // Log all child elements with their classes and IDs
      const children = Array.from(tldrawContainer.children);
      console.log("📂 Direct children:");
      children.forEach((child, index) => {
        const rect = child.getBoundingClientRect();
        const style = window.getComputedStyle(child);
        console.log(`  Child ${index}:`, {
          tagName: child.tagName,
          className: child.className,
          id: child.id,
          width: rect.width,
          height: rect.height,
          visible: (child as HTMLElement).offsetParent !== null,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          element: child,
        });
      });

      // Try to find TLDraw-specific classes
      const tldrawSpecific = tldrawContainer.querySelectorAll(
        '[class*="tl-"], [class*="tldraw"]'
      );
      console.log(
        `🎯 TLDraw-specific elements (${tldrawSpecific.length}):`,
        tldrawSpecific
      );
    } else {
      console.warn("❌ No .tldraw container found");

      // Look for any TLDraw-related elements anywhere in the document
      const anyTldraw = document.querySelectorAll(
        '[class*="tl-"], [class*="tldraw"]'
      );
      console.log(
        `🔍 Found ${anyTldraw.length} TLDraw-related elements anywhere:`,
        anyTldraw
      );
    }
  }, []);

  // Fallback text screenshot using canvas conversion
  const captureTextScreenshotFallback = useCallback(async (): Promise<
    string | null
  > => {
    try {
      console.log("📸 Trying fallback text screenshot method...");

      const editorElement = document.querySelector(
        ".simple-editor-content .tiptap"
      );
      if (!editorElement) {
        console.warn("Tiptap editor element not found for fallback screenshot");
        return null;
      }

      // Create a simple canvas manually
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      const rect = editorElement.getBoundingClientRect();
      canvas.width = rect.width * 2; // 2x for better quality
      canvas.height = rect.height * 2;

      // Scale for retina
      ctx.scale(2, 2);

      // Fill white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Add text content (basic fallback)
      ctx.fillStyle = "#1f2937";
      ctx.font = "16px Inter, sans-serif";
      ctx.fillText("Text content captured (fallback method)", 20, 50);

      const dataUrl = canvas.toDataURL("image/png");
      console.log("✅ Fallback text screenshot created");
      return dataUrl;
    } catch (error) {
      console.error("❌ Fallback text screenshot failed:", error);
      return null;
    }
  }, []);

  // Enhanced text screenshot capture with fallback
  const captureTextScreenshot = useCallback(async (): Promise<
    string | null
  > => {
    try {
      const editorElement = document.querySelector(".simple-editor-content");
      if (!editorElement) {
        console.warn("Text editor element not found for screenshot");
        return await captureTextScreenshotFallback();
      }

      console.log("📸 Capturing text editor screenshot...");
      const canvas = await html2canvas(editorElement as HTMLElement, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        ignoreElements: element => {
          // Skip elements that might cause issues
          return element.tagName === "SCRIPT" || element.tagName === "STYLE";
        },
        onclone: clonedDoc => {
          // Convert oklch colors to hex for html2canvas compatibility
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * {
              color: #1f2937 !important;
              background-color: white !important;
            }
            .tiptap {
              color: #1f2937 !important;
              background-color: white !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      const dataUrl = canvas.toDataURL("image/png");
      console.log("✅ Text editor screenshot captured");
      return dataUrl;
    } catch (error) {
      console.error("❌ Failed to capture text editor screenshot:", error);
      console.log("🔄 Trying fallback method...");
      return await captureTextScreenshotFallback();
    }
  }, [captureTextScreenshotFallback]);

  // Enhanced TLDraw capture with working selectors
  const captureDrawingScreenshot = useCallback(async (): Promise<string | null> => {
    try {
      if (!tldrawEditorRef.current) {
        console.warn("TLDraw editor not available for screenshot");
        return null;
      }

      console.log("📸 Capturing drawing canvas screenshot...");

      // First, let's inspect the TLDraw editor's content
      const editor = tldrawEditorRef.current;
      const currentPageShapeIds = editor.getCurrentPageShapeIds();

      if (currentPageShapeIds.size === 0) {
        console.warn("⚠️ No shapes found in TLDraw editor");
        return null;
      }

      // Try using TLDraw's SVG export
      try {
        // Get the SVG content
        const svg = await editor.getSvg(Array.from(currentPageShapeIds));
        if (!svg) {
          console.warn("Failed to get SVG from TLDraw");
          return null;
        }

        // Set white background
        svg.style.backgroundColor = '#ffffff';

        // Convert SVG to data URL
        const svgString = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        // Create an Image to convert SVG to canvas
        const img = new Image();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = svg.width.baseVal.value;
            canvas.height = svg.height.baseVal.value;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            // Fill white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw the SVG
            ctx.drawImage(img, 0, 0);

            // Convert to PNG
            resolve(canvas.toDataURL('image/png', 1.0));
          };
          img.onerror = () => reject(new Error('Failed to load SVG image'));
          img.src = url;
        });

        // Cleanup
        URL.revokeObjectURL(url);

        console.log("✅ Drawing screenshot captured via SVG export");
        return dataUrl;
      } catch (svgError) {
        console.error("Failed to capture via SVG export:", svgError);
        // Fall back to html2canvas method...
      }

      // Fallback to html2canvas method if SVG export fails
      console.log("📸 Capturing drawing canvas screenshot...");

      // Use the working selectors that were found in testing
      const workingSelectors = [
        ".tl-canvas", // This works!
        '[data-testid="canvas"]', // This also works!
        ".tl-svg-container",
        ".tl-svg-container svg",
        ".tl-shapes",
      ];

      let tldrawElement: Element | null = null;
      let usedSelector = "";

      for (const selector of workingSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const area = rect.width * rect.height;
          const isVisible = (element as HTMLElement).offsetParent !== null;

          console.log(`🔍 Checking selector "${selector}":`, {
            found: true,
            area,
            visible: isVisible,
            tagName: element.tagName,
            className: element.className,
          });

          if (area > 0 && isVisible) {
            tldrawElement = element;
            usedSelector = selector;
            console.log(
              `✅ Using TLDraw element with selector: ${selector} (area: ${area})`
            );
            break;
          }
        } else {
          console.log(`🔍 Checking selector "${selector}": not found`);
        }
      }

      if (!tldrawElement) {
        console.warn("❌ No suitable TLDraw element found for screenshot");
        return null;
      }

      console.log(`📸 Capturing element found with: ${usedSelector}`);

      const elementRect = tldrawElement.getBoundingClientRect();
      console.log("Element capture details:", {
        tagName: tldrawElement.tagName,
        className: tldrawElement.className,
        width: elementRect.width,
        height: elementRect.height,
        visible: (tldrawElement as HTMLElement).offsetParent !== null,
      });

      // Use html2canvas with the working element
      const canvas = await html2canvas(tldrawElement as HTMLElement, {
        backgroundColor: null, // Transparent
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: elementRect.width || 800,
        height: elementRect.height || 600,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: element => {
          const shouldIgnore =
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE" ||
            element.classList.contains("tl-ui") ||
            element.classList.contains("tl-cursor");
          return shouldIgnore;
        },
        onclone: clonedDoc => {
          // Enhanced style fixes for TLDraw
          const style = clonedDoc.createElement("style");
          style.textContent = `
            * {
              color: #000000 !important;
              border-color: #000000 !important;
              fill: currentColor !important;
              stroke: currentColor !important;
            }
            .tl-canvas *, .tl-*, [data-testid="canvas"] {
              background-color: transparent !important;
            }
            .tl-shape * {
              color: inherit !important;
              fill: inherit !important;
              stroke: inherit !important;
            }
            svg * {
              fill: inherit !important;
              stroke: inherit !important;
            }
          `;
          clonedDoc.head.appendChild(style);
        },
      });

      // Convert to PNG with white background
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) return null;

      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      
      // Draw the original canvas on top
      ctx.drawImage(canvas, 0, 0);

      // Convert to PNG
      const dataUrl = tempCanvas.toDataURL('image/png', 1.0);
      console.log("✅ Drawing screenshot captured, data URL length:", dataUrl.length);
      return dataUrl;
    } catch (error) {
      console.error("❌ Failed to capture drawing screenshot:", error);
      return null;
    }
  }, []);

  // Combine both screenshots into one image
  const combineBothScreenshots = useCallback(
    async (
      textScreenshot: string | null,
      drawingScreenshot: string | null
    ): Promise<string | null> => {
      try {
        if (!textScreenshot && !drawingScreenshot) {
          return null;
        }

        console.log("🖼️ Combining screenshots...");

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        const loadImage = (src: string): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        };

        // Load images
        const images: HTMLImageElement[] = [];
        if (textScreenshot) {
          images.push(await loadImage(textScreenshot));
        }
        if (drawingScreenshot) {
          images.push(await loadImage(drawingScreenshot));
        }

        if (images.length === 0) return null;

        // Set canvas size to the largest image dimensions
        const maxWidth = Math.max(...images.map(img => img.width));
        const maxHeight = Math.max(...images.map(img => img.height));
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        // Fill with white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw text screenshot first (background)
        if (textScreenshot && images[0]) {
          ctx.drawImage(images[0], 0, 0);
        }

        // Draw drawing screenshot on top
        if (drawingScreenshot) {
          const drawingImg = textScreenshot ? images[1] : images[0];
          if (drawingImg) {
            ctx.drawImage(drawingImg, 0, 0);
          }
        }

        const combinedDataUrl = canvas.toDataURL("image/png");
        console.log("✅ Screenshots combined successfully");
        return combinedDataUrl;
      } catch (error) {
        console.error("❌ Failed to combine screenshots:", error);
        return null;
      }
    },
    []
  );

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

  // Test function to manually try capturing TLDraw
  const testTldrawCapture = useCallback(async () => {
    console.log("🧪 [TEST] Manual TLDraw capture test...");

    // Try each selector one by one
    const selectors = [
      ".tldraw",
      ".tldraw canvas",
      ".tldraw svg",
      ".tl-canvas",
      ".tl-viewport",
      '[data-testid="canvas"]',
      ".tldraw .tl-background",
      ".tldraw .tl-viewport canvas",
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`🎯 Testing capture with selector: ${selector}`);
        try {
          const canvas = await html2canvas(element as HTMLElement, {
            backgroundColor: "transparent",
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: true,
            ignoreElements: element => {
              return (
                element.tagName === "SCRIPT" || element.tagName === "STYLE"
              );
            },
            onclone: clonedDoc => {
              // Fix OKLCH colors - same as text capture
              const style = clonedDoc.createElement("style");
              style.textContent = `
                * {
                  color: #1f2937 !important;
                  background-color: transparent !important;
                  border-color: #374151 !important;
                  fill: currentColor !important;
                  stroke: currentColor !important;
                }
                .tldraw *, .tl-* {
                  color: #1f2937 !important;
                  background-color: transparent !important;
                }
              `;
              clonedDoc.head.appendChild(style);
            },
          });
          const dataUrl = canvas.toDataURL("image/png");
          console.log(`✅ Successful capture with ${selector}:`, {
            size: `${canvas.width}x${canvas.height}`,
            dataUrl: dataUrl.substring(0, 100) + "...",
          });

          // Download for inspection
          downloadScreenshot(
            dataUrl,
            `test-${selector.replace(/[^a-zA-Z0-9]/g, "-")}.png`
          );
        } catch (error) {
          console.log(`❌ Failed capture with ${selector}:`, error);
        }
      } else {
        console.log(`⚠️ No element found for selector: ${selector}`);
      }
    }
  }, [downloadScreenshot]);

  // Function to inspect TLDraw content details
  const inspectTldrawContent = useCallback(() => {
    if (!tldrawEditorRef.current) {
      console.warn("TLDraw editor not available for inspection");
      return null;
    }

    const editor = tldrawEditorRef.current;
    const currentPageShapeIds = editor.getCurrentPageShapeIds();
    const allShapes = Array.from(currentPageShapeIds).map(id =>
      editor.getShape(id)
    );

    const contentInfo = {
      shapeCount: currentPageShapeIds.size,
      shapeIds: Array.from(currentPageShapeIds),
      shapes: allShapes,
      viewport: editor.getViewportPageBounds(),
      camera: editor.getCamera(),
      currentPageId: editor.getCurrentPageId(),
      hasContent: currentPageShapeIds.size > 0,
    };

    console.log("🔍 [INSPECT] TLDraw Content Details:", contentInfo);
    return contentInfo;
  }, []);

  // Enhanced analyze function with screenshot storage
  const analyzeDocument = useCallback(
    async (options?: {
      analysisType?: string;
      includeText?: boolean;
      includeDrawing?: boolean;
    }): Promise<boolean> => {
      console.log("🔍 [ANALYZE] Starting document analysis...", options);

      setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

      try {
        // Capture screenshots
        console.log("📸 [ANALYZE] Capturing screenshots...");
        const textScreenshot = await captureTextScreenshot();
        const drawingScreenshot = await captureDrawingScreenshot();
        const combinedScreenshot = await combineBothScreenshots(
          textScreenshot,
          drawingScreenshot
        );

        console.log("📊 [ANALYZE] Screenshot capture results:", {
          hasText: !!textScreenshot,
          hasDrawing: !!drawingScreenshot,
          hasCombined: !!combinedScreenshot,
        });

        // Store screenshots for debugging
        const debugScreenshots = {
          textCanvas: textScreenshot || undefined,
          drawingCanvas: drawingScreenshot || undefined,
          combinedCanvas: combinedScreenshot || undefined,
          timestamp: Date.now(),
        };

        setState(prev => ({
          ...prev,
          debugScreenshots,
        }));

        // Log screenshots to console for immediate debugging
        if (textScreenshot) {
          console.log(
            "📸 Text Screenshot (click to view):",
            textScreenshot.substring(0, 100) + "..."
          );
          console.log(
            "🖼️ Text Screenshot Image:",
            `data:image/png;base64,${textScreenshot.split(",")[1]}`
          );
        }
        if (drawingScreenshot) {
          console.log(
            "📸 Drawing Screenshot (click to view):",
            drawingScreenshot.substring(0, 100) + "..."
          );
          console.log(
            "🖼️ Drawing Screenshot Image:",
            `data:image/png;base64,${drawingScreenshot.split(",")[1]}`
          );
        }
        if (combinedScreenshot) {
          console.log(
            "📸 Combined Screenshot (click to view):",
            combinedScreenshot.substring(0, 100) + "..."
          );
          console.log(
            "🖼️ Combined Screenshot Image:",
            `data:image/png;base64,${combinedScreenshot.split(",")[1]}`
          );
        }

        // Check if we have at least one screenshot
        if (!textScreenshot && !drawingScreenshot && !combinedScreenshot) {
          throw new Error(
            "No content to analyze - failed to capture any screenshots"
          );
        }

        console.log("📤 [ANALYZE] Sending screenshots to backend...");

        const result = await analyzeDocumentMutation.mutateAsync({
          screenshots: {
            textCanvas: textScreenshot || undefined,
            drawingCanvas: drawingScreenshot || undefined,
            combinedCanvas: combinedScreenshot || undefined,
          },
          userId: config.userId,
          options: {
            analysisType: "document_analysis",
            includeText: true,
            includeDrawing: true,
            ...options,
          },
        });

        console.log("✅ [ANALYZE] Analysis response:", result);

        if (result.success) {
          setState(prev => ({
            ...prev,
            isAnalyzing: false,
            analysisResult: result.data,
            error: null,
          }));
          console.log("✅ [ANALYZE] Analysis successful!");
          return true;
        } else {
          console.error("❌ [ANALYZE] Analysis failed:", result.error);
          setState(prev => ({
            ...prev,
            isAnalyzing: false,
            error: result.error || "Failed to analyze document",
          }));
          return false;
        }
      } catch (error) {
        console.error("❌ [ANALYZE] Exception during analysis:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [
      config.userId,
      captureTextScreenshot,
      captureDrawingScreenshot,
      combineBothScreenshots,
      analyzeDocumentMutation,
    ]
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
          userId: config.userId,
        });

        const result = await saveDocumentMutation.mutateAsync({
          document,
          userId: config.userId,
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
    [config.userId, createDocument, saveDocumentMutation]
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
    // State
    state,
    isSaving: saveDocumentMutation.isPending,
    isAnalyzing: analyzeDocumentMutation.isPending,

    // Editor references
    setTiptapEditor,
    setTldrawEditor,

    // Content operations
    getTextContent,
    getDrawingContent,
    createDocument,
    getContentPreview,

    // Screenshot operations
    captureTextScreenshot,
    captureDrawingScreenshot,
    combineBothScreenshots,
    debugTldrawElements,
    testTldrawCapture,
    inspectTldrawContent,
    downloadScreenshot,
    clearDebugScreenshots,

    // Document operations
    saveDocument,
    loadDocument,
    clearContent,
    markAsChanged,
    analyzeDocument,
  };
};
