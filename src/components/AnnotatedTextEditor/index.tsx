import EditorModeToggle from "@/components/AnnotatedTextEditor/EditorModeToggle";
import { LazyTldrawCanvas } from "@/components/AnnotatedTextEditor/LazyTldrawCanvas";
import { TiptapEditor } from "@/components/Tiptap/Editor";
import { useAnnotatedEditor } from "@/hooks/useAnnotatedEditor";
import { useEditorMode, type EditorMode } from "@/hooks/useEditorMode";
import { Editor as TiptapEditorType } from "@tiptap/react";
import type { Editor as TldrawEditor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import type { FC } from "react";
import { useCallback, useEffect, useRef } from "react";

interface AnnotatedEditorProps {
  className?: string;
  initialMode?: EditorMode;
  onSave: (success: boolean, documentId?: string) => void;
}

const AnnotatedTextEditor: FC<AnnotatedEditorProps> = ({
  className = "",
  initialMode = "text",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tldrawContainerRef = useRef<HTMLDivElement>(null);

  const {
    mode,
    modeState,
    setTextMode,
    setDrawingMode,
    toggleMode,
    isTextMode,
    isDrawingMode,
  } = useEditorMode(initialMode);

  const { tldrawEditorRef, setTiptapEditor, setTldrawEditor } =
    useAnnotatedEditor();

  const handleTldrawMount = useCallback(
    (editor: TldrawEditor) => {
      setTldrawEditor(editor);
    },
    [setTldrawEditor]
  );

  const handleTiptapEditorReady = useCallback(
    (editor: TiptapEditorType | null) => {
      setTiptapEditor(editor);
    },
    [setTiptapEditor]
  );

  useEffect(() => {
    const innerScrollContainer = document.querySelector(
      ".annotated-editor .content-wrapper"
    ) as HTMLElement;

    if (!innerScrollContainer) {
      console.warn(
        "Inner scroll container (.content-wrapper) not found for TLDraw sync"
      );
      return;
    }

    const handleScroll = () => {
      const scrollTop = innerScrollContainer.scrollTop;
      const scrollLeft = innerScrollContainer.scrollLeft;

      // Use the TLDraw editor ref instead of misusing setter
      if (tldrawEditorRef?.current) {
        // Update TLDraw camera to follow the inner scroll (where text actually moves)
        const currentCamera = tldrawEditorRef.current.getCamera();
        tldrawEditorRef.current.setCamera({
          ...currentCamera,
          x: -scrollLeft,
          y: -scrollTop,
        });
      }
    };

    innerScrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      innerScrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [tldrawEditorRef]);

  const handleExportPng = useCallback(async () => {
    const editorEl = document.querySelector(
      ".simple-editor-content"
    ) as HTMLElement | null;
    const pmEl = editorEl?.querySelector(
      ".tiptap.ProseMirror"
    ) as HTMLElement | null;

    if (!editorEl) {
      console.warn("Editor content not found for export");
      return;
    }

    // Ensure fonts are ready to avoid metric/multiline differences
    try {
      // Not all browsers implement document.fonts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fontsApi = (document as any).fonts as
        | { ready: Promise<void> }
        | undefined;
      await fontsApi?.ready;
    } catch {
      console.warn("Fonts not ready, using fallback");
    }

    const wrapperRect = editorEl.getBoundingClientRect();
    const width = Math.ceil(wrapperRect.width);
    const height = Math.ceil((pmEl ?? editorEl).scrollHeight);
    const pixelRatio = Math.min(window.devicePixelRatio || 2, 3);

    const collectCSS = (): string => {
      let cssText = "";
      for (const styleSheet of Array.from(document.styleSheets)) {
        try {
          const rules = styleSheet.cssRules;
          if (!rules) continue;
          for (const rule of Array.from(rules)) {
            cssText += rule.cssText + "\n";
          }
        } catch (_e) {
          // Ignore cross-origin stylesheets
        }
      }
      return cssText;
    };

    try {
      // Primary: html-to-image (better style inlining)
      const htmlToImage = await import("html-to-image");
      const target = editorEl as HTMLElement;
      const dataUrl = await htmlToImage.toPng(target, {
        cacheBust: true,
        pixelRatio,
        width,
        height,
        canvasWidth: width * pixelRatio,
        canvasHeight: height * pixelRatio,
        skipFonts: true,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          minWidth: `${width}px`,
          // keep max-width from computed styles to preserve wrapping
          overflow: "visible",
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `tiptap-editor-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      try {
        const { default: html2canvas } = await import("html2canvas-pro");
        const target = editorEl as HTMLElement;
        const canvas = await html2canvas(target, {
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          foreignObjectRendering: true,
          scale: pixelRatio,
          width,
          height,
          scrollX: 0,
          scrollY: 0,
          windowWidth: width,
          windowHeight: height,
          onclone: doc => {
            const styleTag = doc.createElement("style");
            styleTag.setAttribute("type", "text/css");
            styleTag.appendChild(doc.createTextNode(collectCSS()));
            doc.head.appendChild(styleTag);
            const clonedWrapper = doc.querySelector(
              ".simple-editor-content"
            ) as HTMLElement | null;
            if (clonedWrapper) {
              clonedWrapper.style.width = `${width}px`;
              clonedWrapper.style.height = `${height}px`;
              clonedWrapper.style.minWidth = `${width}px`;
              clonedWrapper.style.overflow = "visible";
              clonedWrapper.style.transform = "none";
            }
          },
        });

        // If html2canvas produced a blank canvas, fallback to html-to-image with off-DOM clone
        const ctx = canvas.getContext("2d");
        const sample = ctx?.getImageData(
          0,
          0,
          Math.min(10, canvas.width),
          Math.min(10, canvas.height)
        );
        const isBlank = sample ? !sample.data.some(v => v !== 0) : false;

        if (isBlank) {
          const htmlToImage = await import("html-to-image");
          const dataUrl = await htmlToImage.toPng(editorEl, {
            cacheBust: true,
            pixelRatio,
            width,
            height,
            canvasWidth: width * pixelRatio,
            canvasHeight: height * pixelRatio,
            skipFonts: true,
            style: {
              width: `${width}px`,
              minWidth: `${width}px`,
              maxWidth: "none",
              overflow: "visible",
            },
          });
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `tiptap-editor-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
        }

        const blob: Blob | null = await new Promise(resolve =>
          canvas.toBlob(b => resolve(b), "image/png")
        );
        if (!blob) {
          console.error("Failed to create PNG blob from canvas");
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tiptap-editor-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (fallbackError) {
        console.error("Export PNG failed (both methods):", fallbackError);
      }
    }
  }, []);

  const handleExportDrawingPng = useCallback(async () => {
    const editor = tldrawEditorRef?.current;
    if (!editor) {
      console.warn("TLDraw editor not found for export");
      return;
    }

    try {
      // Cast editor to access TLDraw methods with proper parameters
      const editorInstance = editor as unknown as {
        getCurrentPageShapeIds?: () => string[];
        getCurrentPageShapes?: () => unknown[];
        getSvgString?: (
          shapes?: unknown[],
          opts?: { padding?: number; background?: boolean }
        ) => string;
        getSvgElement?: (
          shapes?: unknown[],
          opts?: { padding?: number; background?: boolean }
        ) => SVGElement | Promise<SVGElement>;
        exportAs?: (format: string, opts?: unknown) => Promise<Blob>;
        getShapePageBounds?: (
          shape: unknown
        ) => { x: number; y: number; w: number; h: number } | undefined;
      };

      // Get current page shapes for export (use actual shape objects, not just IDs)
      const shapes = editorInstance.getCurrentPageShapes?.() || [];
      const opts = { padding: 16, background: true };

      // Try getSvgElement first to convert to PNG
      if (typeof editorInstance.getSvgElement === "function") {
        let svgElement: SVGElement;
        let exportWidth: number | undefined;
        let exportHeight: number | undefined;

        // Try different parameter combinations for different TLDraw versions
        let rawResult: unknown;
        try {
          // Try without any parameters (exports entire page)
          rawResult = await editorInstance.getSvgElement();
        } catch {
          try {
            // Try with just options
            rawResult = await editorInstance.getSvgElement(undefined, opts);
          } catch {
            try {
              // Try with shapes array
              rawResult = await editorInstance.getSvgElement(shapes, opts);
            } catch {
              throw new Error(
                "All getSvgElement parameter combinations failed"
              );
            }
          }
        }

        // Validate that we got a proper SVGElement or string
        if (!rawResult) {
          throw new Error("getSvgElement returned null/undefined");
        }

        // Handle different return types from getSvgElement
        if (typeof rawResult === "string") {
          // Parse the SVG string to create an actual SVGElement
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(rawResult, "image/svg+xml");
          const parsedSvg = svgDoc.querySelector("svg");
          if (!parsedSvg) {
            throw new Error("Failed to parse SVG string from getSvgElement");
          }
          svgElement = parsedSvg;
        } else if (
          rawResult instanceof Element &&
          (rawResult as Element).tagName.toLowerCase() === "svg"
        ) {
          svgElement = rawResult as SVGElement;
        } else if (
          typeof rawResult === "object" &&
          rawResult !== null &&
          "svg" in rawResult
        ) {
          // Handle TLDraw's object format: { svg: SVGElement, width: number, height: number }
          const result = rawResult as {
            svg: SVGElement;
            width: number;
            height: number;
          };
          if (
            result.svg instanceof Element &&
            result.svg.tagName.toLowerCase() === "svg"
          ) {
            svgElement = result.svg;
            exportWidth = result.width;
            exportHeight = result.height;
            console.log(
              `📐 TLDraw export dimensions: ${result.width} x ${result.height}`
            );
          } else {
            throw new Error(
              "Object returned by getSvgElement does not contain valid SVG"
            );
          }
        } else {
          console.error("Unexpected getSvgElement result:", rawResult);
          throw new Error(
            `getSvgElement returned unexpected type: ${typeof rawResult} (constructor: ${rawResult.constructor?.name})`
          );
        }

        // Convert SVG to PNG using canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Set canvas size to match TLDraw dimensions or fallback to image/default size
            canvas.width = exportWidth || img.width || 800;
            canvas.height = exportHeight || img.height || 600;

            // Fill with white background
            if (ctx) {
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Draw the SVG image
              ctx.drawImage(img, 0, 0);
            }

            // Convert to PNG and download
            canvas.toBlob(
              blob => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `tldraw-drawing-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  console.log("✅ Drawing PNG exported successfully");
                  resolve();
                } else {
                  reject(new Error("Failed to create blob from canvas"));
                }
              },
              "image/png",
              0.95
            );
          };

          img.onerror = () => reject(new Error("Failed to load SVG"));

          // Convert SVG element to data URL
          const svgString = new XMLSerializer().serializeToString(
            svgElement as SVGElement
          );
          const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
          const svgUrl = URL.createObjectURL(svgBlob);
          img.src = svgUrl;
        });
      }

      // Try getSvgString as fallback
      if (typeof editorInstance.getSvgString === "function") {
        // Try different parameter combinations for different TLDraw versions
        let rawStringResult: unknown;
        try {
          // Try without any parameters (exports entire page)
          rawStringResult = editorInstance.getSvgString();
        } catch {
          try {
            // Try with just options
            rawStringResult = editorInstance.getSvgString(undefined, opts);
          } catch {
            try {
              // Try with shapes array
              rawStringResult = editorInstance.getSvgString(shapes, opts);
            } catch {
              throw new Error("All getSvgString parameter combinations failed");
            }
          }
        }

        // Validate that we got a proper string
        if (!rawStringResult || typeof rawStringResult !== "string") {
          console.error("Unexpected getSvgString result:", rawStringResult);
          throw new Error(
            `getSvgString returned unexpected type: ${typeof rawStringResult}`
          );
        }

        const svgString = rawStringResult;

        // Convert SVG string to PNG using canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            // Set canvas size to match image
            canvas.width = img.width || 800;
            canvas.height = img.height || 600;

            // Fill with white background
            if (ctx) {
              ctx.fillStyle = "white";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Draw the SVG image
              ctx.drawImage(img, 0, 0);
            }

            // Convert to PNG and download
            canvas.toBlob(
              blob => {
                if (blob) {
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `tldraw-drawing-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  console.log("✅ Drawing PNG exported successfully");
                  resolve();
                } else {
                  reject(new Error("Failed to create blob from canvas"));
                }
              },
              "image/png",
              0.95
            );
          };

          img.onerror = () => reject(new Error("Failed to load SVG"));

          // Convert SVG string to data URL
          const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
          const svgUrl = URL.createObjectURL(svgBlob);
          img.src = svgUrl;
        });
      }

      // Fallback: Use html2canvas to capture the TLDraw canvas element
      const { default: html2canvas } = await import("html2canvas-pro");
      const tldrawContainer = document.querySelector(
        ".tl-container"
      ) as HTMLElement;

      if (tldrawContainer) {
        const canvas = await html2canvas(tldrawContainer, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          logging: false,
        });

        canvas.toBlob(
          blob => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `tldraw-drawing-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              console.log(
                "✅ Drawing PNG exported successfully via html2canvas"
              );
            }
          },
          "image/png",
          0.95
        );
        return;
      }

      throw new Error("No compatible TLDraw export method available");
    } catch (error) {
      console.error("Export drawing PNG failed:", error);
    }
  }, [tldrawEditorRef]);

  return (
    <div className={`annotated-editor ${className}`}>
      {/* header with status and controls */}
      <div className='flex items-center justify-between'>
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
        </div>

        {/* Action buttons */}
        <div className='flex gap-2'>
          <button
            onClick={handleExportPng}
            className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded transition-colors'
            aria-label='Export editor as PNG'
            title='Export editor as PNG'
            disabled={modeState.isTransitioning}
          >
            📷 Export PNG
          </button>
          <button
            onClick={handleExportDrawingPng}
            className='px-3 py-1 text-sm bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white rounded transition-colors'
            aria-label='Export drawing as PNG'
            title='Export drawing as PNG'
            disabled={modeState.isTransitioning}
          >
            🖼️ Export Drawing PNG
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div
        ref={containerRef}
        className='relative w-full bg-white rounded-lg shadow-lg border border-gray-200 h-[600px] overflow-hidden'
      >
        <div
          ref={scrollContainerRef}
          className='relative w-full h-full overflow-auto'
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#cbd5e1 transparent",
          }}
        >
          {/* scrollable content */}
          <div className='relative min-h-full'>
            <div
              className={`
                simple-editor-wrapper relative w-full min-h-full p-4 bg-white
                ${isTextMode ? "z-20" : "z-10"}
                ${isTextMode ? "pointer-events-auto" : "pointer-events-none"}
              `}
            >
              <TiptapEditor onEditorReady={handleTiptapEditorReady} />
            </div>

            <div
              ref={tldrawContainerRef}
              className={`
                absolute inset-0 bg-transparent pointer-events-none
                ${isDrawingMode ? "z-20" : "z-10"}
              `}
            >
              <div
                className={`
                  w-full h-full min-h-full
                  ${isTextMode ? "tldraw-disabled" : ""}
                  ${isDrawingMode ? "pointer-events-auto" : "pointer-events-none"}
                `}
                style={{ minHeight: "600px" }}
              >
                <LazyTldrawCanvas
                  onMount={handleTldrawMount}
                  isDrawingMode={isDrawingMode}
                  isTextMode={isTextMode}
                />
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default AnnotatedTextEditor;
