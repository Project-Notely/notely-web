# Drawing Canvas with Stroke Saving

A comprehensive drawing canvas implementation with stroke collection, auto-save functionality, and mock API integration.

## 🚀 Features

### Backend Integration

- **Mock API Service**: Realistic API calls with network delays
- **Stroke Collection**: Proper data structure for stroke management
- **Auto-Save**: Automatic saving of strokes at configurable intervals
- **Manual Save**: Save complete drawings with custom titles
- **Error Handling**: Comprehensive error handling with user feedback

### Drawing Features

- **High Performance**: PixiJS-powered rendering for smooth drawing experience
- **Stroke Data Structure**: Proper TypeScript types for stroke objects
- **Real-time Statistics**: Live tracking of strokes, points, and drawing time
- **Touch Support**: Full support for both mouse and touch input
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

### Code Architecture

- **Custom React Hooks**: Clean separation of concerns with `useDrawingCanvas`
- **TypeScript**: Comprehensive type definitions for all data structures
- **Service Layer**: Modular architecture with separate services
- **Reusable Components**: Two canvas implementations (Simple and Enhanced)

## 📁 File Structure

```
src/
├── components/
│   ├── SimpleDrawingCanvas.tsx      # Basic canvas with stroke saving
│   └── EnhancedDrawingCanvas.tsx    # Advanced canvas with better UX
├── hooks/
│   └── useDrawingCanvas.ts          # Custom hook for canvas management
├── services/
│   ├── api/
│   │   └── drawingApiService.ts     # Mock API service
│   ├── pixiDrawingService.ts        # PixiJS drawing service
│   ├── strokeCollectionService.ts   # Stroke collection and auto-save
│   └── index.ts                     # Service exports
├── models/
│   └── types.ts                     # TypeScript type definitions
└── App.tsx                          # Main application component
```

## 🔧 Core Components

### 1. DrawingApiService (`src/services/api/drawingApiService.ts`)

Mock API service that simulates backend operations:

```typescript
interface SaveDrawingRequest {
  drawing: DrawingData;
  userId?: string;
  title?: string;
  description?: string;
}

class DrawingApiService {
  // Save complete drawing
  async saveDrawing(
    request: SaveDrawingRequest
  ): Promise<ApiResponse<SaveDrawingResponse>>;

  // Save individual strokes
  async saveStrokes(
    strokes: Stroke[],
    drawingId?: string
  ): Promise<ApiResponse<{ savedStrokeIds: string[] }>>;

  // Load drawing by ID
  async loadDrawing(
    drawingId: string
  ): Promise<ApiResponse<LoadDrawingResponse>>;

  // Delete drawing
  async deleteDrawing(
    drawingId: string
  ): Promise<ApiResponse<{ deletedId: string }>>;

  // Get user's drawings
  async getUserDrawings(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<DrawingList>>;
}
```

### 2. StrokeCollectionService (`src/services/strokeCollectionService.ts`)

Manages stroke collection and auto-saving:

```typescript
interface StrokeCollectionConfig {
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  maxStrokesBeforeAutoSave?: number;
  userId?: string;
  drawingId?: string;
}

class StrokeCollectionService {
  // Stroke management
  startStroke(point: Point, style: StrokeStyle): string;
  addPointToCurrentStroke(point: Point): void;
  completeCurrentStroke(): Stroke | null;

  // Auto-save functionality
  private async saveUnsavedStrokes(): Promise<void>;
  async saveCompleteDrawing(
    dimensions: Dimensions,
    title?: string,
    description?: string
  ): Promise<boolean>;

  // Data management
  getAllStrokes(): Stroke[];
  getUnsavedStrokes(): Stroke[];
  clearAllStrokes(): void;
  removeStroke(strokeId: string): boolean;

  // Statistics
  getDrawingStatistics(): DrawingStatistics;
}
```

### 3. useDrawingCanvas Hook (`src/hooks/useDrawingCanvas.ts`)

Custom React hook for canvas management:

```typescript
interface DrawingCanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number;
  maxStrokesBeforeAutoSave?: number;
  userId?: string;
}

export const useDrawingCanvas = (config: DrawingCanvasConfig) => {
  // Returns drawing methods, state, and statistics
  return {
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
    loadDrawing,
  };
};
```

## 💾 Data Structures

### Stroke Object

```typescript
interface Stroke {
  id: string;
  points: Point[];
  style: StrokeStyle;
  timestamp: number;
  completed: boolean;
  pixiGraphics?: Graphics;
}
```

### Point Object

```typescript
interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}
```

### Drawing Data

```typescript
interface DrawingData {
  strokes: Stroke[];
  dimensions: { width: number; height: number };
  metadata: {
    created: number;
    modified: number;
    version: string;
  };
}
```

## 🎯 Usage Examples

### Basic Usage

```typescript
import { SimpleDrawingCanvas } from "./components/SimpleDrawingCanvas";

function App() {
  return <SimpleDrawingCanvas />;
}
```

### Advanced Usage

```typescript
import { EnhancedDrawingCanvas } from "./components/EnhancedDrawingCanvas";

function App() {
  const handleSaveSuccess = (drawingId: string) => {
    console.log("Drawing saved:", drawingId);
  };

  const handleError = (error: string) => {
    console.error("Canvas error:", error);
  };

  return (
    <EnhancedDrawingCanvas
      width={800}
      height={600}
      autoSaveEnabled={true}
      autoSaveInterval={5000}
      maxStrokesBeforeAutoSave={3}
      userId="user_123"
      onSaveSuccess={handleSaveSuccess}
      onError={handleError}
    />
  );
}
```

### Using the Custom Hook

```typescript
import { useDrawingCanvas } from "./hooks/useDrawingCanvas";

function CustomCanvas() {
  const {
    canvasRef,
    isInitialized,
    statistics,
    startDrawing,
    continueDrawing,
    endDrawing,
    saveDrawing,
  } = useDrawingCanvas({
    width: 800,
    height: 600,
    autoSaveEnabled: true,
    autoSaveInterval: 5000,
    maxStrokesBeforeAutoSave: 3,
    userId: "user_123",
  });

  // Your custom canvas implementation
}
```

## 🔄 Auto-Save Mechanism

The auto-save system works on two triggers:

1. **Time-based**: Saves unsaved strokes every `autoSaveInterval` milliseconds
2. **Count-based**: Saves when `maxStrokesBeforeAutoSave` unsaved strokes accumulate

Configuration example:

```typescript
{
  autoSaveEnabled: true,
  autoSaveInterval: 5000,        // Save every 5 seconds
  maxStrokesBeforeAutoSave: 3,   // Or after 3 strokes
}
```

## 📊 Statistics Tracking

Real-time statistics include:

- **Total Strokes**: Number of completed strokes
- **Total Points**: Total number of points across all strokes
- **Unsaved Strokes**: Number of strokes not yet saved to backend
- **Drawing Duration**: Time elapsed since first stroke
- **Average Stroke Length**: Average points per stroke

## 🔍 Mock API Behavior

The mock API service simulates realistic backend behavior:

- **Network Delays**: Configurable delays (300-800ms) for different operations
- **Success/Error Responses**: Proper response structure with error handling
- **Console Logging**: Detailed logging with emojis for easy debugging
- **Data Persistence**: Mock data generation for testing

## 🛠️ Development

### Running the Demo

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## 🎨 UI/UX Features

### Loading States

- Canvas initialization with spinner
- Save operation loading states
- Proper disabled states for buttons

### Error Handling

- Visual error messages
- Console error logging
- Graceful failure handling

### Responsive Design

- Mobile-friendly touch support
- Responsive grid layouts
- Adaptive button sizes

### User Feedback

- Success notifications
- Confirmation dialogs
- Real-time statistics updates

## 🔧 Customization

### Styling

The components use Tailwind CSS for styling. You can customize:

- Colors and themes
- Layout and spacing
- Button styles
- Modal designs

### Functionality

Extend the system by:

- Adding new stroke styles
- Implementing different drawing tools
- Adding collaborative features
- Integrating with real backend APIs

## 📝 Best Practices

1. **Type Safety**: Comprehensive TypeScript usage throughout
2. **Error Handling**: Proper error boundaries and user feedback
3. **Performance**: Efficient PixiJS rendering and React optimizations
4. **Code Organization**: Clean separation of concerns with services and hooks
5. **Testing**: Structured for easy unit and integration testing

## 🚀 Future Enhancements

Potential improvements:

- Real backend integration
- User authentication
- Drawing collaboration
- Advanced drawing tools
- Export functionality
- Undo/redo system
- Drawing layers
- Custom brush styles

## 🐛 Troubleshooting

Common issues and solutions:

1. **Canvas not initializing**: Check console for PixiJS errors
2. **Auto-save not working**: Verify configuration and network connectivity
3. **Performance issues**: Check browser developer tools for memory usage
4. **Touch events**: Ensure proper touch event handling on mobile devices

---

This implementation provides a solid foundation for a drawing application with proper stroke saving, auto-save functionality, and a clean, maintainable codebase following React and TypeScript best practices.
