import { useSaveDrawing } from "@/hooks/useDrawingQueries";
import type { Point, StrokeStyle } from "@/models/types";
import { PixiDrawingService } from "@/services/pixiDrawingService";
import { StrokeCollectionService } from "@/services/strokeCollectionService";
import { useCallback, useEffect, useRef, useState } from "react";

export interface DrawingCanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  maxStrokesBeforeAutoSave?: number;
  userId?: string;
}

export interface DrawingStatistics {
  totalStrokes: number;
  totalPoints: number;
  unsavedStrokes: number;
  drawingDuration: number;
  averageStrokeLength: number;
}

export const useDrawingCanvas = (config: DrawingCanvasConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiServiceRef = useRef<PixiDrawingService | null>(null);
  const strokeCollectionRef = useRef<StrokeCollectionService | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeIdRef = useRef<string | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const [statistics, setStatistics] = useState<DrawingStatistics>({
    totalStrokes: 0,
    totalPoints: 0,
    unsavedStrokes: 0,
    drawingDuration: 0,
    averageStrokeLength: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // React Query hooks
  const saveDrawingMutation = useSaveDrawing();

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      console.log(
        "🚀 [HOOK-INIT] Starting drawing canvas services initialization - ENTRY"
      );
      console.log("🚀 [HOOK-INIT] Canvas ref exists:", !!canvasRef.current);
      console.log("🚀 [HOOK-INIT] Config:", config);
      console.log("🚀 [HOOK-INIT] Existing services:", {
        pixiService: !!pixiServiceRef.current,
        strokeService: !!strokeCollectionRef.current,
      });

      // Small delay to ensure canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!canvasRef.current) {
        console.error("❌ [HOOK-INIT] Canvas element not found - ABORTING");
        setError("Canvas element not found");
        return;
      }

      console.log("🚀 [HOOK-INIT] Canvas element found:", canvasRef.current);
      console.log("🚀 [HOOK-INIT] Canvas actual size:", {
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        offsetWidth: canvasRef.current.offsetWidth,
        offsetHeight: canvasRef.current.offsetHeight,
        clientWidth: canvasRef.current.clientWidth,
        clientHeight: canvasRef.current.clientHeight,
      });

      if (pixiServiceRef.current || strokeCollectionRef.current) {
        console.warn("⚠️ [HOOK-INIT] Services already initialized - SKIPPING");
        return;
      }

      try {
        // Initialize stroke collection service
        console.log("🚀 [HOOK-INIT] Creating stroke collection service...");
        strokeCollectionRef.current = new StrokeCollectionService({
          autoSaveEnabled: config.autoSaveEnabled,
          autoSaveInterval: config.autoSaveInterval,
          maxStrokesBeforeAutoSave: config.maxStrokesBeforeAutoSave,
          userId: config.userId,
        });
        console.log("✅ [HOOK-INIT] Stroke collection service created");

        // Initialize PixiJS service
        console.log("🚀 [HOOK-INIT] Creating PixiJS service...");
        const pixiService = new PixiDrawingService({
          width: config.width,
          height: config.height,
          backgroundColor: config.backgroundColor || "#ffffff",
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });
        console.log("✅ [HOOK-INIT] PixiJS service created");

        console.log("🚀 [HOOK-INIT] Initializing PixiJS service...");
        await pixiService.initialize(canvasRef.current);
        console.log("✅ [HOOK-INIT] PixiJS service initialized");

        console.log("🚀 [HOOK-INIT] Setting refs and state...");
        pixiServiceRef.current = pixiService;
        setIsInitialized(true);
        setError(null);

        console.log(
          "✅ [HOOK-INIT] Drawing canvas services initialized successfully - COMPLETE"
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(
          "❌ [HOOK-INIT] Failed to initialize drawing canvas services:",
          error
        );
        setError(errorMessage);
      }
    };

    console.log("🔄 [HOOK-EFFECT] useEffect triggered - useDrawingCanvas");
    console.log(
      "🔄 [HOOK-EFFECT] Config dependencies:",
      JSON.stringify(config, null, 2)
    );
    initializeServices();

    return () => {
      console.log("🧹 [HOOK-CLEANUP] Cleaning up services...");
      if (pixiServiceRef.current) {
        pixiServiceRef.current.destroy();
        pixiServiceRef.current = null;
        console.log("✅ [HOOK-CLEANUP] PixiJS service destroyed");
      }
      if (strokeCollectionRef.current) {
        strokeCollectionRef.current.destroy();
        strokeCollectionRef.current = null;
        console.log("✅ [HOOK-CLEANUP] Stroke collection service destroyed");
      }
    };
  }, [config]); // WATCHING CONFIG OBJECT - potential infinite loop source!

  // Update statistics
  const updateStatistics = useCallback(() => {
    if (!strokeCollectionRef.current) return;

    const stats = strokeCollectionRef.current.getDrawingStatistics();
    setStatistics(stats);
  }, []);

  // Get point from event
  const getPointFromEvent = useCallback(
    (event: React.MouseEvent | React.TouchEvent): Point => {
      if (!pixiServiceRef.current) return { x: 0, y: 0, timestamp: Date.now() };

      let clientX: number, clientY: number;

      if ("touches" in event) {
        const touch = event.touches[0] || event.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      return pixiServiceRef.current.getCanvasPoint(clientX, clientY);
    },
    []
  );

  // Start drawing
  const startDrawing = useCallback(
    (event: React.MouseEvent | React.TouchEvent, style: StrokeStyle) => {
      if (
        !isInitialized ||
        !pixiServiceRef.current ||
        !strokeCollectionRef.current
      ) {
        return;
      }

      const point = getPointFromEvent(event);

      isDrawingRef.current = true;
      pixiServiceRef.current.startStroke(point, style);
      currentStrokeIdRef.current = strokeCollectionRef.current.startStroke(
        point,
        style
      );
    },
    [isInitialized, getPointFromEvent]
  );

  // Continue drawing
  const continueDrawing = useCallback(
    (event: React.MouseEvent | React.TouchEvent, style: StrokeStyle) => {
      if (
        !isDrawingRef.current ||
        !isInitialized ||
        !pixiServiceRef.current ||
        !strokeCollectionRef.current
      ) {
        return;
      }

      const point = getPointFromEvent(event);

      pixiServiceRef.current.continueStroke(point, style);
      strokeCollectionRef.current.addPointToCurrentStroke(point);
    },
    [isInitialized, getPointFromEvent]
  );

  // End drawing
  const endDrawing = useCallback(() => {
    if (
      !isDrawingRef.current ||
      !pixiServiceRef.current ||
      !strokeCollectionRef.current
    ) {
      return;
    }

    isDrawingRef.current = false;

    if (currentStrokeIdRef.current) {
      pixiServiceRef.current.endStroke(currentStrokeIdRef.current);
      strokeCollectionRef.current.completeCurrentStroke();
      currentStrokeIdRef.current = null;
    }

    updateStatistics();
  }, [updateStatistics]);

  // Save drawing
  const saveDrawing = useCallback(
    async (title?: string, description?: string): Promise<boolean> => {
      if (!strokeCollectionRef.current) return false;

      setError(null);

      try {
        const drawingData = strokeCollectionRef.current.exportAsDrawingData({
          width: config.width,
          height: config.height,
        });
        const result = await saveDrawingMutation.mutateAsync({
          drawing: drawingData,
          userId: config.userId,
          title,
          description,
        });

        if (result.success) {
          updateStatistics();
          return true;
        } else {
          setError(result.error || "Failed to save drawing");
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        return false;
      }
    },
    [
      config.width,
      config.height,
      config.userId,
      updateStatistics,
      saveDrawingMutation,
    ]
  );

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!pixiServiceRef.current || !strokeCollectionRef.current) return;

    pixiServiceRef.current.clearCanvas();
    strokeCollectionRef.current.clearAllStrokes();
    updateStatistics();
  }, [updateStatistics]);

  // Load drawing
  const loadDrawing = useCallback(
    async (drawingId: string): Promise<boolean> => {
      if (!strokeCollectionRef.current || !pixiServiceRef.current) return false;

      setError(null);

      try {
        // This would load from your API service
        // For now, we'll just simulate loading
        console.log("📂 Loading drawing:", drawingId);

        // You would implement the actual loading logic here
        // const response = await drawingApiService.loadDrawing(drawingId);
        // if (response.success) {
        //   strokeCollectionRef.current.loadDrawingData(response.data.drawing);
        //   pixiServiceRef.current.drawAllStrokes(response.data.drawing.strokes);
        //   updateStatistics();
        //   return true;
        // }

        return false;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setError(errorMessage);
        return false;
      }
    },
    []
  );

  return {
    // Refs
    canvasRef,

    // State
    isInitialized,
    statistics,
    isSaving: saveDrawingMutation.isPending,
    error,
    isDrawing: isDrawingRef.current,

    // Drawing methods
    startDrawing,
    continueDrawing,
    endDrawing,

    // Canvas methods
    saveDrawing,
    clearCanvas,
    loadDrawing,

    // Utility methods
    getPointFromEvent,
    updateStatistics,
  };
};
