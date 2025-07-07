import React, { useEffect, useRef } from "react";

const DebugCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderCount = useRef(0);

  renderCount.current += 1;
  console.log(`🔴 [DEBUG-CANVAS] Render #${renderCount.current}`);

  useEffect(() => {
    console.log("🔴 [DEBUG-CANVAS] useEffect triggered");

    if (!canvasRef.current) {
      console.error("🔴 [DEBUG-CANVAS] No canvas ref");
      return;
    }

    const canvas = canvasRef.current;
    console.log("🔴 [DEBUG-CANVAS] Canvas properties:", {
      width: canvas.width,
      height: canvas.height,
      offsetWidth: canvas.offsetWidth,
      offsetHeight: canvas.offsetHeight,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
    });

    // Simple 2D drawing test
    const ctx = canvas.getContext("2d");
    if (ctx) {
      console.log("🔴 [DEBUG-CANVAS] Got 2D context");

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw test shapes
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(50, 50, 100, 100);

      ctx.fillStyle = "#00ff00";
      ctx.beginPath();
      ctx.arc(250, 100, 50, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#0000ff";
      ctx.fillRect(350, 50, 100, 100);

      console.log("🔴 [DEBUG-CANVAS] Drew test shapes");
    } else {
      console.error("🔴 [DEBUG-CANVAS] Failed to get 2D context");
    }
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        border: "3px solid #ff0000",
        backgroundColor: "#ffe6e6",
        textAlign: "center",
      }}
    >
      <h2>DEBUG: Simple Canvas Test</h2>
      <p>This should show red, green, and blue shapes</p>
      <canvas
        ref={canvasRef}
        width={500}
        height={200}
        style={{
          border: "2px solid #000000",
          backgroundColor: "#ffffff",
          display: "block",
          margin: "10px auto",
        }}
      />
      <p>Render count: {renderCount.current}</p>
    </div>
  );
};

export default DebugCanvas;
