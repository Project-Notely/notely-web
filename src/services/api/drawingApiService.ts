import type { DrawingData, Stroke } from "@/models/types";
import { axiosInstance } from "./axiosInstance";

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

  private handleError(error: unknown): string {
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      return (
        axiosError.response?.data?.message ||
        axiosError.message ||
        "An error occurred"
      );
    }
    return error instanceof Error ? error.message : "An unknown error occurred";
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

      const response = await axiosInstance.post("/drawings", request);

      const apiResponse: ApiResponse<SaveDrawingResponse> = {
        success: true,
        data: response.data,
        message: "Drawing saved successfully",
      };

      console.log("✅ Drawing saved successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to save drawing:", error);
      return {
        success: false,
        error: this.handleError(error),
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

      const response = await axiosInstance.post("/drawings/strokes", {
        strokes,
        drawingId,
      });

      const apiResponse: ApiResponse<{ savedStrokeIds: string[] }> = {
        success: true,
        data: response.data,
        message: `${strokes.length} strokes saved successfully`,
      };

      console.log("✅ Strokes saved successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to save strokes:", error);
      return {
        success: false,
        error: this.handleError(error),
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

      const response = await axiosInstance.get(`/drawings/${drawingId}`);

      const apiResponse: ApiResponse<LoadDrawingResponse> = {
        success: true,
        data: response.data,
        message: "Drawing loaded successfully",
      };

      console.log("✅ Drawing loaded successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to load drawing:", error);
      return {
        success: false,
        error: this.handleError(error),
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

      const response = await axiosInstance.delete(`/drawings/${drawingId}`);

      const apiResponse: ApiResponse<{ deletedId: string }> = {
        success: true,
        data: response.data,
        message: "Drawing deleted successfully",
      };

      console.log("✅ Drawing deleted successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to delete drawing:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get user's drawings with pagination
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
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    try {
      console.log("🚀 Loading user drawings from backend...", {
        userId,
        page,
        limit,
      });

      const response = await axiosInstance.get(`/users/${userId}/drawings`, {
        params: { page, limit },
      });

      const apiResponse: ApiResponse<{
        drawings: Array<{
          id: string;
          title: string;
          createdAt: string;
          thumbnail?: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }> = {
        success: true,
        data: response.data,
        message: "User drawings loaded successfully",
      };

      console.log("✅ User drawings loaded successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to load user drawings:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Update drawing metadata
   */
  public async updateDrawing(
    drawingId: string,
    updates: {
      title?: string;
      description?: string;
      isPublic?: boolean;
    }
  ): Promise<ApiResponse<{ updatedId: string }>> {
    try {
      console.log("🚀 Updating drawing metadata...", { drawingId, updates });

      const response = await axiosInstance.patch(
        `/drawings/${drawingId}`,
        updates
      );

      const apiResponse: ApiResponse<{ updatedId: string }> = {
        success: true,
        data: response.data,
        message: "Drawing updated successfully",
      };

      console.log("✅ Drawing updated successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to update drawing:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get public drawings (explore/browse)
   */
  public async getPublicDrawings(
    page: number = 1,
    limit: number = 20
  ): Promise<
    ApiResponse<{
      drawings: Array<{
        id: string;
        title: string;
        createdAt: string;
        thumbnail?: string;
        userId: string;
        username: string;
      }>;
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    try {
      console.log("🚀 Loading public drawings...", { page, limit });

      const response = await axiosInstance.get("/drawings/public", {
        params: { page, limit },
      });

      const apiResponse: ApiResponse<{
        drawings: Array<{
          id: string;
          title: string;
          createdAt: string;
          thumbnail?: string;
          userId: string;
          username: string;
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }> = {
        success: true,
        data: response.data,
        message: "Public drawings loaded successfully",
      };

      console.log("✅ Public drawings loaded successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to load public drawings:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }
}

// Export singleton instance
export const drawingApiService = DrawingApiService.getInstance();
