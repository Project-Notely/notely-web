import React, { useState } from "react";
import { useDrawingStore } from "@/store/drawingStore";

const DrawingToolbar: React.FC = () => {
  const {
    resetCanvas,
    saveDrawing,
    loadDrawing,
    fetchRecentDrawings,
    setDrawingTitle,
    currentDrawingTitle,
    isSaving,
    isLoading,
    recentDrawings,
  } = useDrawingStore();

  const [showRecent, setShowRecent] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDrawingTitle(e.target.value);
  };

  const handleSave = async () => {
    const id = await saveDrawing();
    if (id) {
      console.log("Drawing saved successfully!");
    }
  };

  const handleLoad = async (id: string) => {
    const success = await loadDrawing(id);
    if (success) {
      setShowRecent(false);
    }
  };

  const handleShowRecent = () => {
    fetchRecentDrawings();
    setShowRecent(true);
  };

  return (
    <div className="drawing-toolbar">
      <div className="toolbar-main">
        <input
          type="text"
          value={currentDrawingTitle}
          onChange={handleTitleChange}
          placeholder="Untitled Drawing"
          className="title-input"
        />

        <button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Drawing"}
        </button>

        <button onClick={handleShowRecent}>Open Drawing</button>

        <button onClick={resetCanvas} className="danger">
          New Drawing
        </button>
      </div>

      {showRecent && (
        <div className="recent-drawings">
          <div className="recent-header">
            <h3>Recent Drawings</h3>
            <button
              onClick={() => setShowRecent(false)}
              className="close-button"
            >
              ×
            </button>
          </div>

          {isLoading ? (
            <p>Loading drawings...</p>
          ) : recentDrawings.length > 0 ? (
            <ul className="drawings-list">
              {recentDrawings.map((drawing) => (
                <li key={drawing.id} onClick={() => handleLoad(drawing.id)}>
                  <span className="drawing-title">{drawing.title}</span>
                  <span className="drawing-date">
                    {drawing.createdAt.toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent drawings found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default DrawingToolbar;
