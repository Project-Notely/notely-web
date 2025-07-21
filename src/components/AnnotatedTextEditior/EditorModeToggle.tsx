import type { EditorMode } from "@/hooks/useEditorMode";
import React from "react";

interface EditorModeToggleProps {
  mode: EditorMode;
  isTransitioning: boolean;
  onTextMode: () => void;
  onDrawingMode: () => void;
  onToggle: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "buttons" | "switch";
}

const EditorModeToggle: React.FC<EditorModeToggleProps> = ({
  mode,
  isTransitioning,
  onTextMode,
  onDrawingMode,
  onToggle,
  size = "md",
  variant = "buttons",
}) => {
  const sizeClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-2",
    lg: "text-lg px-4 py-3",
  };

  if (variant === "switch") {
    return (
      <div className='inline-flex items-center space-x-3'>
        <span
          className={`text-gray-600 ${mode === "text" ? "font-semibold text-blue-600" : ""}`}
        >
          ✏️ Text
        </span>
        <button
          onClick={onToggle}
          disabled={isTransitioning}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${mode === "drawing" ? "bg-blue-600" : "bg-gray-200"}
            ${isTransitioning ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
          `}
          aria-label={`Switch to ${mode === "text" ? "drawing" : "text"} mode`}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${mode === "drawing" ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
        <span
          className={`text-gray-600 ${mode === "drawing" ? "font-semibold text-blue-600" : ""}`}
        >
          🎨 Draw
        </span>
      </div>
    );
  }

  return (
    <div className='inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm'>
      <button
        onClick={onTextMode}
        disabled={isTransitioning}
        className={`
          ${sizeClasses[size]} rounded-md font-medium transition-all duration-200
          flex items-center gap-2 min-w-[80px] justify-center
          ${
            mode === "text"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }
          ${isTransitioning ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label='Switch to text editing mode'
      >
        <span className='text-base'>✏️</span>
        <span>Text</span>
        {isTransitioning && mode === "text" && (
          <div className='ml-1 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent' />
        )}
      </button>

      <button
        onClick={onDrawingMode}
        disabled={isTransitioning}
        className={`
          ${sizeClasses[size]} rounded-md font-medium transition-all duration-200
          flex items-center gap-2 min-w-[80px] justify-center
          ${
            mode === "drawing"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }
          ${isTransitioning ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}
        `}
        aria-label='Switch to drawing mode'
      >
        <span className='text-base'>🎨</span>
        <span>Draw</span>
        {isTransitioning && mode === "drawing" && (
          <div className='ml-1 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent' />
        )}
      </button>
    </div>
  );
};

export default EditorModeToggle;
