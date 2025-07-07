import { Application, Graphics } from "pixi.js";
import React, { useEffect, useRef, useState } from "react";

const SimpleDrawingCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const currentStrokeGraphicsRef = useRef<Graphics | null>(null);
  const persistentGraphicsRef = useRef<Graphics | null>(null);
  const renderCountRef = useRef(0);

  const [isInitialized, setIsInitialized] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Increment render count
  renderCountRef.current += 1;
  console.log(`🔄 [SIMPLE-RENDER] Render #${renderCountRef.current}`);

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const { clientWidth, clientHeight } = containerRef.current;
      const newDimensions = {
        width: clientWidth || 800,
        height: clientHeight || 600,
      };

      console.log("📏 [DIMENSIONS] Container size:", newDimensions);
      setDimensions(newDimensions);

      // Update canvas size if app exists
      if (appRef.current) {
        appRef.current.renderer.resize(
          newDimensions.width,
          newDimensions.height
        );
      }
    };

    // Initial measurement
    updateDimensions();

    // Listen for resize
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Initialize PixiJS - following working pattern
  useEffect(() => {
    console.log("🚀 [PIXI-INIT] Starting PixiJS initialization");

    const initializePixi = async () => {
      try {
        if (!containerRef.current) {
          console.error("❌ [PIXI-INIT] Container ref is null");
          return;
        }

        // Get container dimensions
        const containerWidth = containerRef.current.clientWidth || 800;
        const containerHeight = containerRef.current.clientHeight || 600;

        console.log(
          "🚀 [PIXI-INIT] Container dimensions:",
          containerWidth,
          "x",
          containerHeight
        );

        // Create PixiJS application
        const app = new Application();
        await app.init({
          width: containerWidth,
          height: containerHeight,
          backgroundColor: 0xffffff,
          resolution: 1,
          antialias: true,
        });

        console.log("✅ [PIXI-INIT] PixiJS app initialized");
        appRef.current = app;

        // Create graphics objects
        const persistentGraphics = new Graphics();
        persistentGraphicsRef.current = persistentGraphics;
        app.stage.addChild(persistentGraphics);

        const currentStrokeGraphics = new Graphics();
        currentStrokeGraphicsRef.current = currentStrokeGraphics;
        app.stage.addChild(currentStrokeGraphics);

        console.log("✅ [PIXI-INIT] Graphics objects created");

        // Append canvas to container
        containerRef.current.appendChild(app.canvas);

        // Style the canvas
        app.canvas.style.position = "absolute";
        app.canvas.style.top = "0";
        app.canvas.style.left = "0";
        app.canvas.style.width = `${containerWidth}px`;
        app.canvas.style.height = `${containerHeight}px`;
        app.canvas.style.touchAction = "none";
        app.canvas.style.cursor = "crosshair";

        console.log("✅ [PIXI-INIT] Canvas appended to DOM");

        // Drawing state
        let isDrawing = false;
        let currentStroke: { x: number; y: number; pressure: number }[] = [];

        // Event handlers - following working pattern
        const startDrawing = (event: PointerEvent) => {
          const x = event.offsetX;
          const y = event.offsetY;

          console.log("🖱️ [DRAWING] Pointer down at:", x, y);

          isDrawing = true;
          currentStroke = [];
          const pressure = event.pressure !== undefined ? event.pressure : 1;
          currentStroke.push({ x, y, pressure });

          // Clear current stroke graphics
          currentStrokeGraphics.clear();
        };

        const draw = (event: PointerEvent) => {
          if (!isDrawing) return;

          const x = event.offsetX;
          const y = event.offsetY;
          const pressure = event.pressure !== undefined ? event.pressure : 1;
          currentStroke.push({ x, y, pressure });

          if (currentStroke.length < 2) return;

          // Clear and redraw current stroke
          currentStrokeGraphics.clear();
          currentStrokeGraphics.setStrokeStyle({
            width: 4,
            color: 0x000000,
            alpha: 1,
          });

          currentStrokeGraphics.moveTo(currentStroke[0].x, currentStroke[0].y);
          for (let i = 1; i < currentStroke.length; i++) {
            currentStrokeGraphics.lineTo(
              currentStroke[i].x,
              currentStroke[i].y
            );
          }
          currentStrokeGraphics.stroke();
        };

        const stopDrawing = () => {
          if (isDrawing && currentStroke.length > 0) {
            console.log(
              "🖱️ [DRAWING] Stopping drawing, stroke points:",
              currentStroke.length
            );

            // Transfer current stroke to persistent graphics
            persistentGraphics.setStrokeStyle({
              width: 4,
              color: 0x000000,
              alpha: 1,
            });

            persistentGraphics.moveTo(currentStroke[0].x, currentStroke[0].y);
            for (let i = 1; i < currentStroke.length; i++) {
              persistentGraphics.lineTo(currentStroke[i].x, currentStroke[i].y);
            }
            persistentGraphics.stroke();

            // Clear current stroke graphics
            currentStrokeGraphics.clear();

            // Update stroke count
            setStrokeCount(prev => prev + 1);

            isDrawing = false;
          }
        };

        // Add event listeners to canvas
        app.canvas.addEventListener("pointerdown", startDrawing);
        app.canvas.addEventListener("pointermove", draw);
        app.canvas.addEventListener("pointerup", stopDrawing);
        app.canvas.addEventListener("pointerleave", stopDrawing);

        console.log("✅ [PIXI-INIT] Event listeners added");
        setIsInitialized(true);
      } catch (error) {
        console.error("❌ [PIXI-INIT] Error initializing PixiJS:", error);
      }
    };

    initializePixi();

    return () => {
      console.log("🧹 [CLEANUP] Cleaning up PixiJS app");
      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [dimensions]); // Re-initialize when dimensions change

  // Clear canvas handler
  const handleClearCanvas = () => {
    if (persistentGraphicsRef.current && currentStrokeGraphicsRef.current) {
      persistentGraphicsRef.current.clear();
      currentStrokeGraphicsRef.current.clear();
      setStrokeCount(0);
      console.log("🧹 [CLEAR] Canvas cleared");
    }
  };

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
        ref={containerRef}
        style={{
          position: "relative",
          width: "800px",
          height: "600px",
          border: "2px solid #374151",
          borderRadius: "8px",
          backgroundColor: "#ffffff",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
        }}
      >
        {/* Canvas will be appended here */}
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
              zIndex: 10,
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
        Status: {isInitialized ? "✅ Ready" : "⏳ Loading"} | Strokes:{" "}
        {strokeCount} | Renders: {renderCountRef.current}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
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
        <p>✨ Draw with your mouse or touch device</p>
        <p>📊 Following the working pattern from your example</p>
      </div>
    </div>
  );
};

export default SimpleDrawingCanvas;
