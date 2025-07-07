import type { Point, StrokeStyle } from "@/models/types";
import { PixiDrawingService } from "@/services/pixiDrawingService";
import { StrokeCollectionService } from "@/services/strokeCollectionService";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const SimpleDrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiServiceRef = useRef<PixiDrawingService | null>(null);
  const strokeCollectionRef = useRef<StrokeCollectionService | null>(null);
  const isDrawingRef = useRef(false);
  const currentStrokeIdRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [unsavedCount, setUnsavedCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Increment render count
  renderCountRef.current += 1;
  console.log(`🔄 [SIMPLE-RENDER] Render #${renderCountRef.current}`);

  // Add a simple canvas test
  useEffect(() => {
    console.log("🧪 [CANVAS-TEST] Testing basic canvas element...");
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      console.log("🧪 [CANVAS-TEST] Canvas element properties:", {
        width: canvas.width,
        height: canvas.height,
        offsetWidth: canvas.offsetWidth,
        offsetHeight: canvas.offsetHeight,
        clientWidth: canvas.clientWidth,
        clientHeight: canvas.clientHeight,
        style: canvas.style.cssText,
        computed: {
          width: getComputedStyle(canvas).width,
          height: getComputedStyle(canvas).height,
          display: getComputedStyle(canvas).display,
        },
      });

      // Try to get 2D context as a basic test
      const ctx = canvas.getContext("2d");
      if (ctx) {
        console.log("✅ [CANVAS-TEST] 2D context available");
        // Draw a simple test rectangle
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(10, 10, 100, 100);
        console.log("✅ [CANVAS-TEST] Drew test rectangle");
      } else {
        console.error("❌ [CANVAS-TEST] Failed to get 2D context");
      }
    }
  }, []);

  console.log("🎨 [SIMPLE-RENDER] Component state:", {
    isInitialized,
    strokeCount,
    unsavedCount,
    canvasRef: !!canvasRef.current,
  });

  // Simple drawing style
  const drawingStyle: StrokeStyle = useMemo(
    () => ({
      color: "#000000",
      thickness: 3,
      opacity: 1,
      lineCap: "round",
      lineJoin: "round",
    }),
    []
  );

  // Initialize services
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeServices = async () => {
      console.log("🚀 [INIT] Starting services initialization - ENTRY");
      console.log("🚀 [INIT] Canvas ref exists:", !!canvasRef.current);
      console.log(
        "🚀 [INIT] Canvas dimensions:",
        canvasRef.current?.width,
        "x",
        canvasRef.current?.height
      );
      console.log(
        "🚀 [INIT] Canvas computed style:",
        canvasRef.current
          ? window.getComputedStyle(canvasRef.current)
          : "no canvas"
      );
      console.log("🚀 [INIT] Existing services:", {
        pixiService: !!pixiServiceRef.current,
        strokeService: !!strokeCollectionRef.current,
      });

      // SAFETY: Set timeout to prevent infinite hanging
      timeoutId = setTimeout(() => {
        console.error("🚨 [TIMEOUT] Initialization taking too long - ABORTING");
        throw new Error("Initialization timeout");
      }, 10000); // 10 second timeout

      // Small delay to ensure canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!canvasRef.current) {
        console.error("❌ [INIT] Canvas ref is null - ABORTING");
        clearTimeout(timeoutId);
        return;
      }

      console.log("🚀 [INIT] Canvas element found:", canvasRef.current);
      console.log("🚀 [INIT] Canvas actual size:", {
        width: canvasRef.current.width,
        height: canvasRef.current.height,
        offsetWidth: canvasRef.current.offsetWidth,
        offsetHeight: canvasRef.current.offsetHeight,
        clientWidth: canvasRef.current.clientWidth,
        clientHeight: canvasRef.current.clientHeight,
      });

      if (pixiServiceRef.current || strokeCollectionRef.current) {
        console.warn("⚠️ [INIT] Services already exist - SKIPPING");
        clearTimeout(timeoutId);
        return;
      }

      try {
        console.log("🚀 [INIT] Creating stroke collection service...");
        strokeCollectionRef.current = new StrokeCollectionService({
          autoSaveEnabled: true,
          autoSaveInterval: 5000, // 5 seconds
          maxStrokesBeforeAutoSave: 3, // Save after 3 strokes
          userId: "user_123", // Mock user ID
        });
        console.log("✅ [INIT] Stroke collection service created");

        console.log("🚀 [INIT] Creating PixiJS service...");
        const pixiService = new PixiDrawingService({
          width: 800,
          height: 600,
          backgroundColor: "#ffffff",
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });
        console.log("✅ [INIT] PixiJS service created");

        console.log("🚀 [INIT] Initializing PixiJS service...");
        await pixiService.initialize(canvasRef.current);
        console.log("✅ [INIT] PixiJS service initialized");

        console.log("🚀 [INIT] Setting refs...");
        pixiServiceRef.current = pixiService;
        setIsInitialized(true);
        console.log("✅ [INIT] Services initialized successfully - COMPLETE");

        clearTimeout(timeoutId);
      } catch (error) {
        console.error("❌ [INIT] Failed to initialize services:", error);
        clearTimeout(timeoutId);
      }
    };

    console.log("🔄 [EFFECT] useEffect triggered - SimpleDrawingCanvas");

    // Wrap in try-catch to prevent crashes
    try {
      initializeServices();
    } catch (error) {
      console.error("🚨 [FATAL] Initialization crashed:", error);
    }

    return () => {
      console.log("🧹 [CLEANUP] Cleaning up services...");
      if (timeoutId) clearTimeout(timeoutId);
      if (pixiServiceRef.current) {
        pixiServiceRef.current.destroy();
        pixiServiceRef.current = null;
        console.log("✅ [CLEANUP] PixiJS service destroyed");
      }
      if (strokeCollectionRef.current) {
        strokeCollectionRef.current.destroy();
        strokeCollectionRef.current = null;
        console.log("✅ [CLEANUP] Stroke collection service destroyed");
      }
    };
  }, []); // EMPTY DEPENDENCY ARRAY - should only run once

  // Update stroke statistics
  const updateStrokeStatistics = useCallback(() => {
    if (!strokeCollectionRef.current) return;

    const stats = strokeCollectionRef.current.getDrawingStatistics();
    setStrokeCount(stats.totalStrokes);
    setUnsavedCount(stats.unsavedStrokes);
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

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      console.log("🖱️ Mouse down - Simple Canvas");

      if (
        !isInitialized ||
        !pixiServiceRef.current ||
        !strokeCollectionRef.current
      ) {
        console.log("Not ready for drawing:", {
          isInitialized,
          pixiServiceRef: !!pixiServiceRef.current,
          strokeCollectionRef: !!strokeCollectionRef.current,
        });
        return;
      }

      const point = getPointFromEvent(event);

      isDrawingRef.current = true;

      // Start stroke in both services
      pixiServiceRef.current.startStroke(point, drawingStyle);
      currentStrokeIdRef.current = strokeCollectionRef.current.startStroke(
        point,
        drawingStyle
      );
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (
        !isDrawingRef.current ||
        !isInitialized ||
        !pixiServiceRef.current ||
        !strokeCollectionRef.current
      )
        return;

      const point = getPointFromEvent(event);

      // Continue stroke in both services
      pixiServiceRef.current.continueStroke(point, drawingStyle);
      strokeCollectionRef.current.addPointToCurrentStroke(point);
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  const handleMouseUp = useCallback(() => {
    if (
      !isDrawingRef.current ||
      !pixiServiceRef.current ||
      !strokeCollectionRef.current
    )
      return;

    console.log("🖱️ Mouse up - Simple Canvas");
    isDrawingRef.current = false;

    // End stroke in both services
    if (currentStrokeIdRef.current) {
      pixiServiceRef.current.endStroke(currentStrokeIdRef.current);
      strokeCollectionRef.current.completeCurrentStroke();
      currentStrokeIdRef.current = null;
    }

    // Update statistics
    updateStrokeStatistics();
  }, [updateStrokeStatistics]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      console.log("👆 Touch start - Simple Canvas");

      if (
        !isInitialized ||
        !pixiServiceRef.current ||
        !strokeCollectionRef.current
      ) {
        return;
      }

      const point = getPointFromEvent(event);

      isDrawingRef.current = true;

      // Start stroke in both services
      pixiServiceRef.current.startStroke(point, drawingStyle);
      currentStrokeIdRef.current = strokeCollectionRef.current.startStroke(
        point,
        drawingStyle
      );
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      if (
        !isDrawingRef.current ||
        !isInitialized ||
        !pixiServiceRef.current ||
        !strokeCollectionRef.current
      )
        return;

      const point = getPointFromEvent(event);

      // Continue stroke in both services
      pixiServiceRef.current.continueStroke(point, drawingStyle);
      strokeCollectionRef.current.addPointToCurrentStroke(point);
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  // Manual save handler
  const handleManualSave = useCallback(async () => {
    if (!strokeCollectionRef.current) return;

    setIsSaving(true);
    try {
      const success = await strokeCollectionRef.current.saveCompleteDrawing(
        { width: 800, height: 600 },
        "My Drawing",
        "Created with SimpleDrawingCanvas"
      );

      if (success) {
        updateStrokeStatistics();
        alert("Drawing saved successfully! 🎉");
      } else {
        alert("Failed to save drawing. Please try again.");
      }
    } catch (error) {
      console.error("Error saving drawing:", error);
      alert("An error occurred while saving the drawing.");
    } finally {
      setIsSaving(false);
    }
  }, [updateStrokeStatistics]);

  // Clear canvas handler
  const handleClearCanvas = useCallback(() => {
    if (!pixiServiceRef.current || !strokeCollectionRef.current) return;

    pixiServiceRef.current.clearCanvas();
    strokeCollectionRef.current.clearAllStrokes();
    updateStrokeStatistics();
  }, [updateStrokeStatistics]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {/* Canvas Container */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          border: "3px solid #ef4444", // Red border to make it visible
          backgroundColor: "#fef2f2", // Light red background to see the container
        }}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            display: "block",
            border: "2px solid #374151",
            borderRadius: "8px",
            cursor: isInitialized ? "crosshair" : "default",
            backgroundColor: "#ffffff",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          onContextMenu={e => e.preventDefault()}
        />

        {!isInitialized && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                color: "#6b7280",
              }}
            >
              Loading canvas...
            </div>
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div
        style={{
          padding: "0.5rem",
          backgroundColor: "#f3f4f6",
          borderRadius: "4px",
          fontSize: "0.875rem",
          fontFamily: "monospace",
          textAlign: "center",
        }}
      >
        Debug: isInitialized={String(isInitialized)}, canvasRef=
        {canvasRef.current ? "attached" : "not attached"}
      </div>

      {/* Controls and Statistics */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          minWidth: "300px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "0.5rem",
            }}
          >
            Drawing Statistics
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              fontSize: "0.875rem",
            }}
          >
            <div
              style={{
                backgroundColor: "#dbeafe",
                padding: "0.5rem",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "500",
                  color: "#1e40af",
                  marginBottom: "0.25rem",
                }}
              >
                Total Strokes
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#2563eb",
                }}
              >
                {strokeCount}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#fed7aa",
                padding: "0.5rem",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "500",
                  color: "#c2410c",
                  marginBottom: "0.25rem",
                }}
              >
                Unsaved Strokes
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#ea580c",
                }}
              >
                {unsavedCount}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={handleManualSave}
            disabled={isSaving || strokeCount === 0}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor:
                isSaving || strokeCount === 0 ? "#9ca3af" : "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isSaving || strokeCount === 0 ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "background-color 200ms ease-in-out",
            }}
          >
            {isSaving ? "Saving..." : "💾 Save Drawing"}
          </button>

          <button
            onClick={handleClearCanvas}
            disabled={strokeCount === 0}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: strokeCount === 0 ? "#9ca3af" : "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: strokeCount === 0 ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "background-color 200ms ease-in-out",
            }}
          >
            🗑️ Clear Canvas
          </button>
        </div>

        <div
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            textAlign: "center",
            padding: "0.5rem",
            backgroundColor: "#eff6ff",
            borderRadius: "6px",
          }}
        >
          <p>
            ✨ Auto-save enabled: Strokes are automatically saved every 5
            seconds
          </p>
          <p>📊 Manual save will save the complete drawing to your backend</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleDrawingCanvas;
