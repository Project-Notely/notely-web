import type { Editor } from "@tldraw/tldraw";

/**
 * TLDraw Helper Functions
 *
 * These functions demonstrate how to access stroke history, save drawings,
 * and perform other operations that the user specifically requested.
 */

/**
 * Get complete stroke history from TLDraw editor
 */
export const getStrokeHistory = (editor: Editor) => {
  if (!editor) return null;

  // Get all shapes (including strokes)
  const shapes = editor.getCurrentPageShapes();

  // Filter for drawing strokes specifically
  const strokes = shapes.filter(shape => shape.type === "draw");

  // Get the complete drawing history with timestamps
  const strokeHistory = strokes.map(stroke => ({
    id: stroke.id,
    type: stroke.type,
    // @ts-expect-error - TLDraw shape properties
    points: stroke.props?.segments || [],
    // @ts-expect-error - TLDraw shape properties
    color: stroke.props?.color || "black",
    // @ts-expect-error - TLDraw shape properties
    size: stroke.props?.size || "m",
    timestamp: stroke.meta?.timestamp || Date.now(),
    isComplete: stroke.props?.isComplete || false,
  }));

  return {
    totalStrokes: strokes.length,
    totalShapes: shapes.length,
    strokes: strokeHistory,
    canUndo: editor.getCanUndo(),
    canRedo: editor.getCanRedo(),
  };
};

/**
 * Save complete drawing data including metadata
 */
export const saveDrawingData = (editor: Editor) => {
  if (!editor) return null;

  // Get complete store snapshot (includes everything)
  const snapshot = editor.store.getSnapshot();

  // Get shapes for analysis
  const shapes = editor.getCurrentPageShapes();
  const strokes = shapes.filter(shape => shape.type === "draw");

  const drawingData = {
    // Complete TLDraw state
    snapshot,

    // Metadata for easy access
    metadata: {
      totalShapes: shapes.length,
      totalStrokes: strokes.length,
      savedAt: new Date().toISOString(),
      version: "1.0",
    },

    // Quick access to stroke data
    strokes: getStrokeHistory(editor)?.strokes || [],
  };

  console.log("💾 [TLDRAW-SAVE] Drawing data saved:", drawingData);
  return drawingData;
};

/**
 * Load drawing data back into TLDraw editor
 */
export const loadDrawingData = (editor: Editor, drawingData: any) => {
  if (!editor || !drawingData?.snapshot) {
    console.error("❌ [TLDRAW-LOAD] Invalid editor or drawing data");
    return false;
  }

  try {
    // Load the complete snapshot
    editor.store.loadSnapshot(drawingData.snapshot);

    console.log("📂 [TLDRAW-LOAD] Drawing data loaded:", {
      shapes: drawingData.metadata?.totalShapes || 0,
      strokes: drawingData.metadata?.totalStrokes || 0,
      version: drawingData.metadata?.version,
    });

    return true;
  } catch (error) {
    console.error("❌ [TLDRAW-LOAD] Failed to load drawing data:", error);
    return false;
  }
};

/**
 * Export drawing to different formats
 */
export const exportDrawing = async (
  editor: Editor,
  format: "png" | "svg" | "json" = "png",
  options: { padding?: number; background?: boolean } = {}
) => {
  if (!editor) return null;

  const { padding = 16, background = false } = options;
  const shapes = editor.getCurrentPageShapes();

  try {
    switch (format) {
      case "png":
        const pngBlob = await editor.getSvgAsImage(shapes, {
          format: "png",
          padding,
          background,
        });
        console.log("🖼️ [TLDRAW-EXPORT] PNG exported");
        return pngBlob;

      case "svg":
        const svgElement = await editor.getSvgElement(shapes, {
          padding,
          background,
        });
        console.log("🖼️ [TLDRAW-EXPORT] SVG exported");
        return svgElement;

      case "json":
        const jsonData = saveDrawingData(editor);
        console.log("📄 [TLDRAW-EXPORT] JSON exported");
        return jsonData;

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    console.error(`❌ [TLDRAW-EXPORT] Failed to export as ${format}:`, error);
    return null;
  }
};

/**
 * Get drawing statistics and analytics
 */
export const getDrawingAnalytics = (editor: Editor) => {
  if (!editor) return null;

  const shapes = editor.getCurrentPageShapes();
  const strokes = shapes.filter(shape => shape.type === "draw");
  const otherShapes = shapes.filter(shape => shape.type !== "draw");

  // Count shape types
  const shapeTypes = shapes.reduce(
    (acc, shape) => {
      acc[shape.type] = (acc[shape.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Calculate drawing area
  const bounds = editor.getSelectionPageBounds() || { width: 0, height: 0 };

  return {
    totalShapes: shapes.length,
    strokeCount: strokes.length,
    shapeCount: otherShapes.length,
    shapeTypes,
    drawingArea: {
      width: bounds.width,
      height: bounds.height,
    },
    canUndo: editor.getCanUndo(),
    canRedo: editor.getCanRedo(),
    hasUnsavedChanges: editor.getInstanceState().isChangingStyle,
  };
};

/**
 * Download drawing as file
 */
export const downloadDrawing = async (
  editor: Editor,
  filename: string = "drawing",
  format: "png" | "svg" | "json" = "png"
) => {
  const exportedData = await exportDrawing(editor, format);

  if (!exportedData) {
    console.error("❌ [DOWNLOAD] Failed to export drawing");
    return false;
  }

  try {
    let blob: Blob;
    let mimeType: string;
    let extension: string;

    switch (format) {
      case "png":
        blob = exportedData as Blob;
        mimeType = "image/png";
        extension = "png";
        break;

      case "svg":
        const svgString = new XMLSerializer().serializeToString(
          exportedData as SVGElement
        );
        blob = new Blob([svgString], { type: "image/svg+xml" });
        mimeType = "image/svg+xml";
        extension = "svg";
        break;

      case "json":
        const jsonString = JSON.stringify(exportedData, null, 2);
        blob = new Blob([jsonString], { type: "application/json" });
        mimeType = "application/json";
        extension = "json";
        break;

      default:
        throw new Error(`Unsupported download format: ${format}`);
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${extension}`;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);

    console.log(
      `📥 [DOWNLOAD] ${filename}.${extension} downloaded successfully`
    );
    return true;
  } catch (error) {
    console.error("❌ [DOWNLOAD] Failed to download drawing:", error);
    return false;
  }
};
