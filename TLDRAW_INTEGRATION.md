# 🎨 TLDraw Integration Guide

## Overview

This guide shows you exactly how to access **stroke history**, **save/load drawings**, and **"stuff like that"** using TLDraw in the annotated text editor.

## ✅ **Your Requirements SOLVED**

### 📝 **1. Access Stroke History**

TLDraw provides complete stroke history out of the box:

```typescript
import { getStrokeHistory } from "@/utils/tldrawHelpers";

// Get complete stroke history
const history = getStrokeHistory(editor);
console.log(history);
/*
{
  totalStrokes: 5,
  totalShapes: 8,
  strokes: [
    {
      id: "shape:abc123",
      type: "draw",
      points: [...], // All stroke points
      color: "red",
      size: "m",
      timestamp: 1673123456789,
      isComplete: true
    }
  ],
  canUndo: true,
  canRedo: false
}
*/
```

### 💾 **2. Save Drawing Data**

Complete persistence with metadata:

```typescript
import { saveDrawingData } from "@/utils/tldrawHelpers";

// Save complete drawing state
const savedData = saveDrawingData(editor);
/*
{
  snapshot: { ... }, // Complete TLDraw state
  metadata: {
    totalShapes: 8,
    totalStrokes: 5,
    savedAt: "2024-01-15T10:30:00Z",
    version: "1.0"
  },
  strokes: [...] // Quick access to stroke data
}
*/

// Store to localStorage, database, etc.
localStorage.setItem("my-drawing", JSON.stringify(savedData));
```

### 📂 **3. Load Drawing Data**

Restore complete drawing state:

```typescript
import { loadDrawingData } from "@/utils/tldrawHelpers";

// Load from storage
const savedData = JSON.parse(localStorage.getItem("my-drawing"));

// Restore to editor
const success = loadDrawingData(editor, savedData);
if (success) {
  console.log("Drawing restored!");
}
```

### 🖼️ **4. Export Capabilities**

Multiple export formats:

```typescript
import { exportDrawing, downloadDrawing } from "@/utils/tldrawHelpers";

// Export as PNG
const pngBlob = await exportDrawing(editor, "png");

// Export as SVG
const svgElement = await exportDrawing(editor, "svg");

// Export as JSON
const jsonData = await exportDrawing(editor, "json");

// Download directly to user's computer
await downloadDrawing(editor, "my-annotation", "png");
```

## 🎯 **Built-in Features**

### Unlimited Undo/Redo

```typescript
// Check if undo/redo is available
const canUndo = editor.getCanUndo();
const canRedo = editor.getCanRedo();

// Perform undo/redo
editor.undo();
editor.redo();
```

### Real-time Change Tracking

```typescript
// Listen for any changes
editor.store.listen(() => {
  const snapshot = editor.store.getSnapshot();
  console.log("Drawing changed:", snapshot);
});
```

### Shape Management

```typescript
// Get all shapes
const shapes = editor.getCurrentPageShapes();

// Get only drawing strokes
const strokes = shapes.filter(shape => shape.type === "draw");

// Delete all shapes
editor.selectAll();
editor.deleteShapes(editor.getSelectedShapeIds());
```

## 🚀 **Quick Start Example**

Here's a complete example showing how to use all features:

```typescript
import { useRef, useCallback } from 'react';
import { Tldraw, Editor } from '@tldraw/tldraw';
import {
  getStrokeHistory,
  saveDrawingData,
  loadDrawingData,
  downloadDrawing
} from '@/utils/tldrawHelpers';

function MyAnnotatedEditor() {
  const editorRef = useRef<Editor>();

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    // Listen for changes
    editor.store.listen(() => {
      const history = getStrokeHistory(editor);
      console.log('Current strokes:', history?.totalStrokes);
    });
  }, []);

  const handleSave = useCallback(() => {
    if (!editorRef.current) return;

    const data = saveDrawingData(editorRef.current);
    localStorage.setItem('drawing', JSON.stringify(data));
    console.log('Drawing saved!');
  }, []);

  const handleLoad = useCallback(() => {
    if (!editorRef.current) return;

    const saved = localStorage.getItem('drawing');
    if (saved) {
      const data = JSON.parse(saved);
      loadDrawingData(editorRef.current, data);
      console.log('Drawing loaded!');
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!editorRef.current) return;

    await downloadDrawing(editorRef.current, 'my-drawing', 'png');
  }, []);

  return (
    <div>
      <Tldraw onMount={handleMount} />

      <div>
        <button onClick={handleSave}>💾 Save</button>
        <button onClick={handleLoad}>📂 Load</button>
        <button onClick={handleExport}>📥 Export PNG</button>
      </div>
    </div>
  );
}
```

## 📊 **Advanced Analytics**

Get detailed drawing analytics:

```typescript
import { getDrawingAnalytics } from "@/utils/tldrawHelpers";

const analytics = getDrawingAnalytics(editor);
/*
{
  totalShapes: 10,
  strokeCount: 7,
  shapeCount: 3,
  shapeTypes: {
    "draw": 7,
    "geo": 2,
    "arrow": 1
  },
  drawingArea: { width: 500, height: 300 },
  canUndo: true,
  canRedo: false,
  hasUnsavedChanges: false
}
*/
```

## 🎨 **Available Drawing Tools**

TLDraw includes professional drawing tools:

- ✏️ **Draw tool** - Free-form drawing
- 📐 **Shapes** - Rectangles, circles, triangles
- ➡️ **Arrows** - Directional arrows with labels
- 📝 **Text** - Rich text annotations
- 🖱️ **Select** - Move and resize elements
- ✂️ **Eraser** - Remove parts of drawings

## 💡 **Best Practices**

### 1. Save Regularly

```typescript
// Auto-save every 30 seconds
setInterval(() => {
  if (editorRef.current) {
    const data = saveDrawingData(editorRef.current);
    localStorage.setItem("autosave", JSON.stringify(data));
  }
}, 30000);
```

### 2. Version Control

```typescript
const saveWithVersion = (editor: Editor, version: string) => {
  const data = saveDrawingData(editor);
  const versioned = {
    ...data,
    version,
    timestamp: Date.now(),
  };

  localStorage.setItem(`drawing-v${version}`, JSON.stringify(versioned));
};
```

### 3. Error Handling

```typescript
const safeSave = (editor: Editor) => {
  try {
    const data = saveDrawingData(editor);
    localStorage.setItem("drawing", JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Save failed:", error);
    return false;
  }
};
```

## 🔧 **Integration with Text Editor**

Combine TLDraw with Tiptap content:

```typescript
const saveCombinedDocument = (tiptapEditor: any, tldrawEditor: Editor) => {
  const textContent = tiptapEditor.getJSON();
  const drawingData = saveDrawingData(tldrawEditor);

  const document = {
    text: textContent,
    drawing: drawingData,
    created: new Date().toISOString(),
  };

  return document;
};
```

## 🎉 **Conclusion**

**TLDraw gives you EVERYTHING you asked for:**

✅ **Stroke History** - Complete access via `getStrokeHistory()`
✅ **Save Functionality** - Full persistence with `saveDrawingData()`
✅ **Export Options** - PNG, SVG, JSON formats
✅ **Professional Tools** - Shapes, arrows, text, etc.
✅ **Unlimited Undo/Redo** - Built-in history management
✅ **Real-time Tracking** - Listen for all changes

**No custom implementation needed - it's all built-in! 🚀**
