import type { Point, StrokeStyle } from "@/models/types";
import { PixiDrawingService } from "@/services/pixiDrawingService";
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
  const isDrawingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initialize PixiJS
  useEffect(() => {
    const initializePixi = async () => {
      console.log("Starting PixiJS initialization...");

      // Small delay to ensure canvas is fully rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!canvasRef.current) {
        console.log("Canvas ref is null");
        return;
      }

      console.log("Canvas element found:", canvasRef.current);
      console.log(
        "Canvas dimensions:",
        canvasRef.current.width,
        "x",
        canvasRef.current.height
      );

      if (pixiServiceRef.current) {
        console.log("PixiJS service already exists");
        return;
      }

      try {
        console.log("Creating PixiJS service...");
        const pixiService = new PixiDrawingService({
          width: 800,
          height: 600,
          backgroundColor: "#ffffff",
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });

        console.log("Initializing PixiJS service...");
        await pixiService.initialize(canvasRef.current);

        console.log("PixiJS service initialized successfully");
        pixiServiceRef.current = pixiService;
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize PixiJS:", error);
        console.error("Error details:", (error as Error).message);
        console.error("Stack trace:", (error as Error).stack);
      }
    };

    initializePixi();

    return () => {
      if (pixiServiceRef.current) {
        pixiServiceRef.current.destroy();
        pixiServiceRef.current = null;
      }
    };
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

      if (!isInitialized || !pixiServiceRef.current) {
        return;
      }

      const point = getPointFromEvent(event);

      isDrawingRef.current = true;
      pixiServiceRef.current.startStroke(point, drawingStyle);
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !isInitialized || !pixiServiceRef.current)
        return;

      const point = getPointFromEvent(event);

      pixiServiceRef.current.continueStroke(point, drawingStyle);
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current || !pixiServiceRef.current) return;

    isDrawingRef.current = false;
    pixiServiceRef.current.endStroke(`stroke_${Date.now()}`);
  }, []);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      if (!isInitialized || !pixiServiceRef.current) {
        return;
      }

      const point = getPointFromEvent(event);

      isDrawingRef.current = true;
      pixiServiceRef.current.startStroke(point, drawingStyle);
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      if (!isDrawingRef.current || !isInitialized || !pixiServiceRef.current)
        return;

      const point = getPointFromEvent(event);

      pixiServiceRef.current.continueStroke(point, drawingStyle);
    },
    [isInitialized, getPointFromEvent, drawingStyle]
  );

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          display: "block",
          border: "3px solid #333",
          borderRadius: "8px",
          cursor: isInitialized ? "crosshair" : "default",
          backgroundColor: "#ffffff",
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
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            borderRadius: "8px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
          }}
        >
          Loading canvas...
        </div>
      )}
    </div>
  );
};

export default SimpleDrawingCanvas;
