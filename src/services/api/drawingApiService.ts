import type { DrawingData, Stroke } from "@/models/types";

// Mock API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Simulate network delay for realistic API behavior
const simulateNetworkDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface SaveDrawingRequest {
  drawing: DrawingData;
  userId?: string;
  title?: string;
  description?: string;
}

export interface SaveDrawingResponse {
  drawingId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoadDrawingResponse {
  drawing: DrawingData;
  metadata: {
    id: string;
    userId: string;
    title: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
}

export class DrawingApiService {
  private static instance: DrawingApiService;

  private constructor() {}

  public static getInstance(): DrawingApiService {
    if (!DrawingApiService.instance) {
      DrawingApiService.instance = new DrawingApiService();
    }
    return DrawingApiService.instance;
  }

  /**
   * Save a complete drawing to the backend
   */
  public async saveDrawing(
    request: SaveDrawingRequest
  ): Promise<ApiResponse<SaveDrawingResponse>> {
    try {
      console.log("🚀 Saving drawing to backend...", {
        strokeCount: request.drawing.strokes.length,
        dimensions: request.drawing.dimensions,
        userId: request.userId,
        title: request.title,
      });

      // Simulate network delay
      await simulateNetworkDelay(800);

      // Mock API response
      const mockResponse: ApiResponse<SaveDrawingResponse> = {
        success: true,
        data: {
          drawingId: `drawing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        message: "Drawing saved successfully",
      };

      console.log("✅ Drawing saved successfully:", mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error("❌ Failed to save drawing:", error);
      return {
        success: false,
        error: "Failed to save drawing",
      };
    }
  }

  /**
   * Save individual strokes incrementally
   */
  public async saveStrokes(
    strokes: Stroke[],
    drawingId?: string
  ): Promise<ApiResponse<{ savedStrokeIds: string[] }>> {
    try {
      console.log("🚀 Saving strokes to backend...", {
        strokeCount: strokes.length,
        drawingId,
      });

      // Simulate network delay
      await simulateNetworkDelay(300);

      // Mock API response
      const mockResponse: ApiResponse<{ savedStrokeIds: string[] }> = {
        success: true,
        data: {
          savedStrokeIds: strokes.map(stroke => stroke.id),
        },
        message: `${strokes.length} strokes saved successfully`,
      };

      console.log("✅ Strokes saved successfully:", mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error("❌ Failed to save strokes:", error);
      return {
        success: false,
        error: "Failed to save strokes",
      };
    }
  }

  /**
   * Load a drawing from the backend
   */
  public async loadDrawing(
    drawingId: string
  ): Promise<ApiResponse<LoadDrawingResponse>> {
    try {
      console.log("🚀 Loading drawing from backend...", { drawingId });

      // Simulate network delay
      await simulateNetworkDelay(600);

      // Mock drawing data
      const mockDrawing: DrawingData = {
        strokes: [
          {
            id: "mock_stroke_1",
            points: [
              { x: 100, y: 100, timestamp: Date.now() },
              { x: 150, y: 150, timestamp: Date.now() + 100 },
              { x: 200, y: 100, timestamp: Date.now() + 200 },
            ],
            style: {
              color: "#000000",
              thickness: 3,
              opacity: 1,
              lineCap: "round",
              lineJoin: "round",
            },
            timestamp: Date.now(),
            completed: true,
          },
        ],
        dimensions: { width: 800, height: 600 },
        metadata: {
          created: Date.now(),
          modified: Date.now(),
          version: "2.0",
        },
      };

      const mockResponse: ApiResponse<LoadDrawingResponse> = {
        success: true,
        data: {
          drawing: mockDrawing,
          metadata: {
            id: drawingId,
            userId: "user_123",
            title: "My Drawing",
            description: "A sample drawing",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        },
        message: "Drawing loaded successfully",
      };

      console.log("✅ Drawing loaded successfully:", mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error("❌ Failed to load drawing:", error);
      return {
        success: false,
        error: "Failed to load drawing",
      };
    }
  }

  /**
   * Delete a drawing from the backend
   */
  public async deleteDrawing(
    drawingId: string
  ): Promise<ApiResponse<{ deletedId: string }>> {
    try {
      console.log("🚀 Deleting drawing from backend...", { drawingId });

      // Simulate network delay
      await simulateNetworkDelay(400);

      const mockResponse: ApiResponse<{ deletedId: string }> = {
        success: true,
        data: {
          deletedId: drawingId,
        },
        message: "Drawing deleted successfully",
      };

      console.log("✅ Drawing deleted successfully:", mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error("❌ Failed to delete drawing:", error);
      return {
        success: false,
        error: "Failed to delete drawing",
      };
    }
  }

  /**
   * Get list of user's drawings
   */
  public async getUserDrawings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<
    ApiResponse<{
      drawings: Array<{
        id: string;
        title: string;
        createdAt: string;
        thumbnail?: string;
      }>;
    }>
  > {
    try {
      console.log("🚀 Loading user drawings...", { userId, page, limit });

      // Simulate network delay
      await simulateNetworkDelay(500);

      const mockResponse: ApiResponse<{
        drawings: Array<{
          id: string;
          title: string;
          createdAt: string;
          thumbnail?: string;
        }>;
      }> = {
        success: true,
        data: {
          drawings: [
            {
              id: "drawing_1",
              title: "My First Drawing",
              createdAt: new Date().toISOString(),
              thumbnail:
                "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZjlmOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGh1bWJuYWlsPC90ZXh0Pjwvc3ZnPg==",
            },
            {
              id: "drawing_2",
              title: "Sketch #2",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ],
        },
        message: "User drawings loaded successfully",
      };

      console.log("✅ User drawings loaded successfully:", mockResponse.data);
      return mockResponse;
    } catch (error) {
      console.error("❌ Failed to load user drawings:", error);
      return {
        success: false,
        error: "Failed to load user drawings",
      };
    }
  }
}

// Export singleton instance
export const drawingApiService = DrawingApiService.getInstance();
