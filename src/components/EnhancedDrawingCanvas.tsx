import { useDrawingCanvas } from "@/hooks/useDrawingCanvas";
import type { StrokeStyle } from "@/models/types";
import React, { useCallback, useMemo, useRef, useState } from "react";

export interface EnhancedDrawingCanvasProps {
  width?: number;
  height?: number;
  backgroundColor?: string;
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  maxStrokesBeforeAutoSave?: number;
  userId?: string;
  onSaveSuccess?: (drawingId: string) => void;
  onError?: (error: string) => void;
}

const EnhancedDrawingCanvas: React.FC<EnhancedDrawingCanvasProps> = ({
  width = 800,
  height = 600,
  backgroundColor = "#ffffff",
  autoSaveEnabled = true,
  autoSaveInterval = 5000,
  maxStrokesBeforeAutoSave = 3,
  userId = "user_123",
  onSaveSuccess,
  onError,
}) => {
  const [drawingTitle, setDrawingTitle] = useState("My Drawing");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const renderCountRef = useRef(0);

  // Increment render count
  renderCountRef.current += 1;
  console.log(`🔄 [ENHANCED-RENDER] Render #${renderCountRef.current}`);
  console.log("🔄 [ENHANCED-RENDER] Props:", {
    width,
    height,
    userId,
    autoSaveEnabled,
  });

  // CRITICAL: Memoize the config object to prevent infinite useEffect loops
  const config = useMemo(() => {
    const configObj = {
      width,
      height,
      backgroundColor,
      autoSaveEnabled,
      autoSaveInterval,
      maxStrokesBeforeAutoSave,
      userId,
    };
    console.log("🔧 [CONFIG] Creating config object:", configObj);
    return configObj;
  }, [
    width,
    height,
    backgroundColor,
    autoSaveEnabled,
    autoSaveInterval,
    maxStrokesBeforeAutoSave,
    userId,
  ]);

  // Drawing style
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

  // Use the custom hook
  const {
    canvasRef,
    isInitialized,
    statistics,
    isSaving,
    error,
    startDrawing,
    continueDrawing,
    endDrawing,
    saveDrawing,
    clearCanvas,
  } = useDrawingCanvas(config);

  console.log("🎨 [ENHANCED-STATE] Canvas state:", {
    isInitialized,
    error,
    canvasRef: !!canvasRef.current,
  });

  // Handle errors
  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      console.log("🖱️ Mouse down");
      startDrawing(event, drawingStyle);
    },
    [startDrawing, drawingStyle]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      continueDrawing(event, drawingStyle);
    },
    [continueDrawing, drawingStyle]
  );

  const handleMouseUp = useCallback(() => {
    console.log("🖱️ Mouse up");
    endDrawing();
  }, [endDrawing]);

  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      console.log("👆 Touch start");
      startDrawing(event, drawingStyle);
    },
    [startDrawing, drawingStyle]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      continueDrawing(event, drawingStyle);
    },
    [continueDrawing, drawingStyle]
  );

  const handleTouchEnd = useCallback(() => {
    console.log("👆 Touch end");
    endDrawing();
  }, [endDrawing]);

  // Save handlers
  const handleSaveClick = useCallback(() => {
    if (statistics.totalStrokes === 0) {
      alert("Nothing to save! Please draw something first.");
      return;
    }
    setShowSaveDialog(true);
  }, [statistics.totalStrokes]);

  const handleSaveConfirm = useCallback(async () => {
    const success = await saveDrawing(
      drawingTitle,
      "Created with Enhanced Drawing Canvas"
    );

    if (success) {
      setShowSaveDialog(false);
      if (onSaveSuccess) {
        onSaveSuccess("mock_drawing_id");
      }
      alert("Drawing saved successfully! 🎉");
    } else {
      alert("Failed to save drawing. Please try again.");
    }
  }, [saveDrawing, drawingTitle, onSaveSuccess]);

  const handleClearClick = useCallback(() => {
    if (statistics.totalStrokes === 0) {
      return;
    }

    if (
      window.confirm(
        "Are you sure you want to clear the canvas? This action cannot be undone."
      )
    ) {
      clearCanvas();
    }
  }, [clearCanvas, statistics.totalStrokes]);

  // Format duration
  const formatDuration = useCallback((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
        padding: "1.5rem",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          padding: "1.5rem",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        <h1 className='text-2xl font-bold'>Enhanced Drawing Canvas</h1>

        {/* Debug Info */}
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.5rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontFamily: "monospace",
          }}
        >
          Debug: isInitialized={String(isInitialized)}, error={error || "none"},
          canvasRef={canvasRef.current ? "attached" : "not attached"}
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem",
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              color: "#991b1b",
              borderRadius: "6px",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Canvas Container */}
        <div
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "1.5rem",
            border: "3px solid #ef4444", // Red border to make it visible
            backgroundColor: "#fef2f2", // Light red background to see the container
            width: "100%",
            height: "100%",
            // SAFETY: Ensure container doesn't exceed canvas size
            maxWidth: `${width}px`,
            maxHeight: `${height}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            style={{
              display: "block",
              border: "2px solid #d1d5db",
              borderRadius: "8px",
              cursor: isInitialized ? "crosshair" : "default",
              backgroundColor: "#ffffff",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              // SAFETY: Ensure canvas displays at correct size
              width: `${width}px`,
              height: `${height}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
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
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "8px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    border: "2px solid #3b82f6",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    margin: "0 auto 0.5rem",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
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
            </div>
          )}
        </div>

        {/* Statistics Panel */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "0.75rem",
              textAlign: "center",
            }}
          >
            📊 Drawing Statistics
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "0.75rem",
              fontSize: "0.875rem",
            }}
          >
            <div
              style={{
                backgroundColor: "#dbeafe",
                padding: "0.75rem",
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
                {statistics.totalStrokes}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#dcfce7",
                padding: "0.75rem",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "500",
                  color: "#166534",
                  marginBottom: "0.25rem",
                }}
              >
                Total Points
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#16a34a",
                }}
              >
                {statistics.totalPoints}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#fed7aa",
                padding: "0.75rem",
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
                {statistics.unsavedStrokes}
              </div>
            </div>
            <div
              style={{
                backgroundColor: "#f3e8ff",
                padding: "0.75rem",
                borderRadius: "6px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontWeight: "500",
                  color: "#7c3aed",
                  marginBottom: "0.25rem",
                }}
              >
                Drawing Time
              </div>
              <div
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "700",
                  color: "#8b5cf6",
                }}
              >
                {formatDuration(statistics.drawingDuration)}
              </div>
            </div>
          </div>
          {statistics.totalStrokes > 0 && (
            <div
              style={{
                marginTop: "0.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "#6b7280",
              }}
            >
              Average stroke length: {statistics.averageStrokeLength.toFixed(1)}{" "}
              points
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <button
            onClick={handleSaveClick}
            disabled={isSaving || statistics.totalStrokes === 0}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                isSaving || statistics.totalStrokes === 0
                  ? "#9ca3af"
                  : "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor:
                isSaving || statistics.totalStrokes === 0
                  ? "not-allowed"
                  : "pointer",
              fontWeight: "500",
              transition: "background-color 200ms ease-in-out",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {isSaving ? (
              <>
                <div
                  style={{
                    width: "1rem",
                    height: "1rem",
                    border: "2px solid white",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Saving...
              </>
            ) : (
              <>💾 Save Drawing</>
            )}
          </button>

          <button
            onClick={handleClearClick}
            disabled={statistics.totalStrokes === 0}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor:
                statistics.totalStrokes === 0 ? "#9ca3af" : "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: statistics.totalStrokes === 0 ? "not-allowed" : "pointer",
              fontWeight: "500",
              transition: "background-color 200ms ease-in-out",
            }}
          >
            🗑️ Clear Canvas
          </button>
        </div>

        {/* Auto-save Info */}
        {autoSaveEnabled && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              textAlign: "center",
              backgroundColor: "#eff6ff",
              padding: "0.5rem",
              borderRadius: "6px",
            }}
          >
            <p>
              ✨ Auto-save enabled: Strokes are automatically saved every{" "}
              {autoSaveInterval / 1000}s
            </p>
            <p>
              🔄 Auto-save triggers after {maxStrokesBeforeAutoSave} strokes!!!
            </p>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              padding: "1.5rem",
              maxWidth: "400px",
              width: "100%",
              margin: "1rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Save Drawing
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label
                htmlFor='drawingTitle'
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "0.5rem",
                }}
              >
                Drawing Title
              </label>
              <input
                id='drawingTitle'
                type='text'
                value={drawingTitle}
                onChange={e => setDrawingTitle(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 200ms ease-in-out",
                }}
                placeholder='Enter drawing title...'
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={() => setShowSaveDialog(false)}
                style={{
                  padding: "0.5rem 1rem",
                  color: "#6b7280",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "color 200ms ease-in-out",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                disabled={isSaving || !drawingTitle.trim()}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor:
                    isSaving || !drawingTitle.trim() ? "#9ca3af" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    isSaving || !drawingTitle.trim()
                      ? "not-allowed"
                      : "pointer",
                  transition: "background-color 200ms ease-in-out",
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add CSS keyframes for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EnhancedDrawingCanvas;
