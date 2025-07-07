import React, { useState } from "react";
import DebugCanvas from "./components/DebugCanvas";
import EnhancedDrawingCanvas from "./components/EnhancedDrawingCanvas";
import SimpleDrawingCanvas from "./components/SimpleDrawingCanvas";

type ComponentType = "simple" | "enhanced" | "debug";

const App: React.FC = () => {
  const [activeComponent, setActiveComponent] =
    useState<ComponentType>("debug"); // Start with debug to isolate issue

  console.log("🚀 App rendering with activeComponent:", activeComponent);

  const handleSaveSuccess = (drawingId: string) => {
    console.log("Drawing saved successfully with ID:", drawingId);
  };

  const handleError = (error: string) => {
    console.error("Drawing canvas error:", error);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      {/* Navigation */}
      <nav
        style={{
          backgroundColor: "#ffffff",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: "700",
              color: "#1f2937",
              margin: 0,
            }}
          >
            🎨 Notely Drawing Canvas Debug
          </h1>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={() => setActiveComponent("debug")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: "500",
                transition: "all 200ms ease-in-out",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeComponent === "debug" ? "#dc2626" : "#e5e7eb",
                color: activeComponent === "debug" ? "white" : "#6b7280",
              }}
            >
              🔴 Debug Canvas
            </button>
            <button
              onClick={() => setActiveComponent("simple")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: "500",
                transition: "all 200ms ease-in-out",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeComponent === "simple" ? "#3b82f6" : "#e5e7eb",
                color: activeComponent === "simple" ? "white" : "#6b7280",
              }}
            >
              Simple Canvas
            </button>
            <button
              onClick={() => setActiveComponent("enhanced")}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                fontWeight: "500",
                transition: "all 200ms ease-in-out",
                border: "none",
                cursor: "pointer",
                backgroundColor:
                  activeComponent === "enhanced" ? "#3b82f6" : "#e5e7eb",
                color: activeComponent === "enhanced" ? "white" : "#6b7280",
              }}
            >
              Enhanced Canvas
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1.5rem",
        }}
      >
        {activeComponent === "debug" ? (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                🔴 Debug Canvas - Basic Test
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1rem",
                }}
              >
                Testing basic canvas functionality without services or complex
                logic
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <DebugCanvas />
            </div>
          </div>
        ) : activeComponent === "simple" ? (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Simple Drawing Canvas
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1rem",
                }}
              >
                Basic drawing functionality with stroke collection and auto-save
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <SimpleDrawingCanvas />
            </div>
          </div>
        ) : (
          <div>
            <div
              style={{
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Enhanced Drawing Canvas
              </h2>
              <p
                style={{
                  color: "#6b7280",
                  fontSize: "1rem",
                }}
              >
                Advanced drawing canvas with custom hook, better UI, and
                comprehensive features
              </p>
            </div>
            <EnhancedDrawingCanvas
              width={800}
              height={600}
              backgroundColor='#ffffff'
              autoSaveEnabled={true}
              autoSaveInterval={5000}
              maxStrokesBeforeAutoSave={3}
              userId='demo_user'
              onSaveSuccess={handleSaveSuccess}
              onError={handleError}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#374151",
          color: "white",
          padding: "1.5rem",
          marginTop: "3rem",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", textAlign: "center" }}
        >
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#9ca3af" }}>
            🔍 Check browser console for detailed debug information
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
