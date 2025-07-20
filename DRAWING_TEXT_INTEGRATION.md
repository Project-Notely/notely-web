# 🎨 Drawing Canvas + Text Editor Integration

## Overview

Integrating drawing capabilities directly over a text editor to enable annotation, markup, and creative note-taking. Based on research of existing Tiptap extensions and drawing overlay patterns.

## 🔍 Research Findings

### Existing Solutions

- **[tiptap-annotation-magic](https://github.com/luccalb/tiptap-annotation-magic)**: Overlapping text annotations as decorations
- **[tldraw x tiptap](https://gist.github.com/steveruizok/0a2466ad3c5adeb998756f5386c3267a)**: Drawing library embedded as Tiptap node
- **[tiptap-drawio-extension](https://github.com/radans/tiptap-drawio-extension)**: Diagram editor integration

### Conclusion

✅ **Hybrid Approach is Best**: Keep Tiptap + overlay PixiJS canvas
❌ **ProseMirror Direct**: Too complex, lose Tiptap benefits
❌ **Tiptap Node**: Limits drawing to specific areas, not full overlay

## 🏗️ Architecture Decision

```
┌─────────────────────────────────────┐
│           Drawing Layer             │ <- PixiJS Canvas (absolute position)
│  (z-index: 10, pointer-events: *)  │
├─────────────────────────────────────┤
│            Text Layer               │ <- Tiptap Editor
│    (z-index: 1, pointer-events: *) │
└─────────────────────────────────────┘
```

### Key Components

1. **Mode Toggle**: Switch between text editing and drawing modes
2. **Canvas Overlay**: PixiJS canvas positioned absolutely over editor
3. **Event Management**: Route pointer events to appropriate layer
4. **Data Sync**: Combine text content + drawing strokes
5. **Coordinate System**: Align drawing with text layout

## 📋 Implementation Steps

### Step 1: Research & Analysis ✅

- ✅ Analyze Tiptap extensibility
- ✅ Research existing drawing overlays
- ✅ Choose hybrid approach

### Step 2: Create Mode Toggle System ✅

- ✅ Add drawing/text mode state (`useEditorMode` hook)
- ✅ Create UI toggle button (`EditorModeToggle` component)
- ✅ Implement mode switching logic with transitions
- ✅ Create test page (`/annotated`) with debug info

### Step 3: Canvas Overlay Implementation ✅

- ✅ Position PixiJS canvas over Tiptap (`AnnotatedTextEditor` component)
- ✅ Sync canvas size with editor (ResizeObserver + responsive)
- ✅ Handle responsive layout and positioning
- ✅ Event routing based on mode (text vs drawing)
- ✅ Visual transitions and z-index management

### Step 4: Event Management System ✅

- ✅ Route pointer events by mode (handled in AnnotatedTextEditor)
- ✅ Prevent event conflicts (preventDefault/stopPropagation)
- ✅ Handle focus management (pointer-events CSS + disabled states)

### Step 5: Data Integration

- [ ] Create combined document format
- [ ] Sync drawing + text data
- [ ] Implement save/load system

### Step 6: Coordinate System Alignment

- [ ] Map drawing coordinates to text layout
- [ ] Handle text reflow with drawings
- [ ] Maintain drawing positions

### Step 7: UI/UX Polish

- [ ] Smooth mode transitions
- [ ] Visual feedback
- [ ] Performance optimization

## 🎯 Technical Approach

### Data Structure

```typescript
interface AnnotatedDocument {
  content: JSONContent; // Tiptap document
  drawings: DrawingData; // PixiJS strokes
  metadata: {
    version: string;
    created: number;
    modified: number;
  };
}
```

### Mode Management

```typescript
type EditorMode = "text" | "drawing";

interface ModeState {
  current: EditorMode;
  isTransitioning: boolean;
  canvasVisible: boolean;
  textEditable: boolean;
}
```

## 🔧 Benefits of This Approach

✅ **Preserves Tiptap functionality**: All existing features remain
✅ **Reuses existing drawing system**: Leverage PixiJS implementation
✅ **Flexible positioning**: Draw anywhere over text
✅ **Performance**: No ProseMirror complexity
✅ **Maintainable**: Clear separation of concerns

## 🚀 Next Steps

Starting with Step 2: Mode Toggle System implementation.
