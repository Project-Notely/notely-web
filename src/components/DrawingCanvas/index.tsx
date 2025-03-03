import { useEffect, useRef, useState } from "react";
import { Application, Graphics } from "pixi.js";
import { useDrawingStore } from "@/store/drawingStore";
import DrawingToolbar from "@/components/DrawingToolbar";

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const graphicsRef = useRef<Graphics | null>(null);
  const persistentGraphicsRef = useRef<Graphics | null>(null);
  const { addStroke, strokes } = useDrawingStore();

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // update dimensions when window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (!canvasRef.current) {
        return;
      }
      const { clientWidth, clientHeight } = canvasRef.current;
      setDimensions({
        width: clientWidth,
        height: clientHeight,
      });

      // also update canvas size if it exists
      if (appRef.current) {
        appRef.current.renderer.resize(clientWidth, clientHeight);
      }
    };

    // initial measurement
    updateDimensions();

    // listen for resize
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Render all saved strokes when they change
  useEffect(() => {
    if (!persistentGraphicsRef.current) return;

    const persistentGraphics = persistentGraphicsRef.current;
    persistentGraphics.clear();

    strokes.forEach((stroke) => {
      if (stroke.length < 2) return;

      persistentGraphics.setStrokeStyle({
        width: 4,
        color: 0x000000,
        alpha: 1,
      });

      persistentGraphics.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        persistentGraphics.lineTo(stroke[i].x, stroke[i].y);
      }
      persistentGraphics.stroke();
    });
  }, [strokes]);

  useEffect(() => {
    console.log("Initializing DrawingCanvas");
    const initializePixi = async () => {
      try {
        // get container dimensions
        const containerWidth =
          canvasRef.current?.clientWidth || window.innerWidth;
        const containerHeight =
          canvasRef.current?.clientHeight || window.innerHeight;

        // create app with container dimensions
        const app = new Application();
        await app.init({
          width: containerWidth,
          height: containerHeight,
          background: 0xffffff,
          resolution: 1, //  1 for exact pixel mapping
          antialias: true,
        });

        console.log(
          "PIXI app initialized with size:",
          containerWidth,
          "x",
          containerHeight
        );
        appRef.current = app;

        // create graphics object for persistent strokes
        const persistentGraphics = new Graphics();
        persistentGraphicsRef.current = persistentGraphics;
        app.stage.addChild(persistentGraphics);

        // create graphics object for current stroke
        const currentStrokeGraphics = new Graphics();
        graphicsRef.current = currentStrokeGraphics;
        app.stage.addChild(currentStrokeGraphics);

        if (canvasRef.current) {
          console.log("Appending canvas to DOM");
          canvasRef.current.appendChild(app.canvas);

          // make the canvas fill the container - maintain exact 1:1 pixel mapping
          app.canvas.style.position = "absolute";
          app.canvas.style.top = "0";
          app.canvas.style.left = "0";
          app.canvas.style.width = `${containerWidth}px`;
          app.canvas.style.height = `${containerHeight}px`;
          app.canvas.style.touchAction = "none"; // prevent default touch actions
        } else {
          console.error("Canvas ref is null");
        }

        let isDrawing = false;
        let currentStroke: { x: number; y: number; pressure: number }[] = [];

        const startDrawing = (event: PointerEvent) => {
          // get pointer position directly from the event - relative to canvas
          const x = event.offsetX;
          const y = event.offsetY;

          console.log("Pointer down at:", x, y);

          isDrawing = true;
          currentStroke = [];
          const pressure = event.pressure !== undefined ? event.pressure : 1;
          currentStroke.push({ x, y, pressure });

          // clear only the current stroke graphics, not the persistent strokes
          currentStrokeGraphics.clear();
        };

        const draw = (event: PointerEvent) => {
          if (!isDrawing) return;

          // get pointer position directly from the event
          const x = event.offsetX;
          const y = event.offsetY;

          const pressure = event.pressure !== undefined ? event.pressure : 1;
          currentStroke.push({ x, y, pressure });

          if (currentStroke.length < 2) return;

          // clear and redraw the current stroke
          currentStrokeGraphics.clear();

          // draw the current stroke path
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
              "Stopping drawing, stroke points:",
              currentStroke.length
            );

            // add stroke to store
            addStroke([...currentStroke]);

            // transfer the current stroke to persistent graphics
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

            // Clear the current stroke graphics
            currentStrokeGraphics.clear();

            isDrawing = false;
          }
        };

        // Use direct canvas events for more accurate coordinates
        app.canvas.addEventListener("pointerdown", startDrawing);
        app.canvas.addEventListener("pointermove", draw);
        app.canvas.addEventListener("pointerup", stopDrawing);
        app.canvas.addEventListener("pointerleave", stopDrawing);
      } catch (error) {
        console.error("Error initializing PIXI application:", error);
      }
    };

    initializePixi();

    return () => {
      if (appRef.current) {
        console.log("Cleaning up PIXI app");
        appRef.current.destroy(true);
      }
    };
  }, [addStroke, dimensions]);

  return (
    <>
      <DrawingToolbar />
      <div
        ref={canvasRef}
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
          paddingTop: "64px", // Make space for the toolbar
        }}
      >
        {/* Canvas will be appended here */}
      </div>
    </>
  );
};

export default DrawingCanvas;
