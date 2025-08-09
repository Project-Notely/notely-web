import type {
  AnalyzeDocumentRequest,
  AnalyzeDocumentResponse,
  LoadAnnotatedDocumentResponse,
  SaveAnnotatedDocumentRequest,
  SaveAnnotatedDocumentResponse,
} from "@/models/types";
import { axiosInstance } from "./axiosInstance";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class TextApiService {
  private static instance: TextApiService;

  private constructor() {}

  public static getInstance(): TextApiService {
    if (!TextApiService.instance) {
      TextApiService.instance = new TextApiService();
    }
    return TextApiService.instance;
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
   * Save an annotated document to the backend
   */
  public async saveDocument(
    request: SaveAnnotatedDocumentRequest
  ): Promise<ApiResponse<SaveAnnotatedDocumentResponse>> {
    try {
      console.log("🚀 Saving document to backend...", {
        textContentLength: JSON.stringify(request.document.textContent).length,
        hasDrawing: !!request.document.drawingContent,
        userId: request.userId,
        title: request.title,
      });

      const response = await axiosInstance.post("/documents", request);

      const apiResponse: ApiResponse<SaveAnnotatedDocumentResponse> = {
        success: true,
        data: response.data,
        message: "Document saved successfully",
      };

      console.log("✅ Document saved successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to save document:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Load a document from the backend
   */
  public async loadDocument(
    documentId: string
  ): Promise<ApiResponse<LoadAnnotatedDocumentResponse>> {
    try {
      console.log("🚀 Loading document from backend...", { documentId });

      const response = await axiosInstance.get(`/documents/${documentId}`);

      const apiResponse: ApiResponse<LoadAnnotatedDocumentResponse> = {
        success: true,
        data: response.data,
        message: "Document loaded successfully",
      };

      console.log("✅ Document loaded successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to load document:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Delete a document from the backend
   */
  public async deleteDocument(
    documentId: string
  ): Promise<ApiResponse<{ deletedId: string }>> {
    try {
      console.log("🚀 Deleting document from backend...", { documentId });

      const response = await axiosInstance.delete(`/documents/${documentId}`);

      const apiResponse: ApiResponse<{ deletedId: string }> = {
        success: true,
        data: response.data,
        message: "Document deleted successfully",
      };

      console.log("✅ Document deleted successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to delete document:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get user's documents with pagination
   */
  public async getUserDocuments(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<
    ApiResponse<{
      documents: Array<{
        id: string;
        title: string;
        createdAt: string;
        preview?: string;
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
      console.log("🚀 Loading user documents from backend...", {
        userId,
        page,
        limit,
      });

      const response = await axiosInstance.get(`/users/${userId}/documents`, {
        params: { page, limit },
      });

      const apiResponse: ApiResponse<{
        documents: Array<{
          id: string;
          title: string;
          createdAt: string;
          preview?: string;
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
        message: "User documents loaded successfully",
      };

      console.log("✅ User documents loaded successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to load user documents:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Update document metadata
   */
  public async updateDocument(
    documentId: string,
    updates: {
      title?: string;
      description?: string;
      isPublic?: boolean;
    }
  ): Promise<ApiResponse<{ updatedId: string }>> {
    try {
      console.log("🚀 Updating document metadata...", { documentId, updates });

      const response = await axiosInstance.patch(
        `/documents/${documentId}`,
        updates
      );

      const apiResponse: ApiResponse<{ updatedId: string }> = {
        success: true,
        data: response.data,
        message: "Document updated successfully",
      };

      console.log("✅ Document updated successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to update document:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Get public documents (explore/browse)
   */
  public async getPublicDocuments(
    page: number = 1,
    limit: number = 20
  ): Promise<
    ApiResponse<{
      documents: Array<{
        id: string;
        title: string;
        createdAt: string;
        preview?: string;
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
      console.log("🚀 Loading public documents...", { page, limit });

      const response = await axiosInstance.get("/documents/public", {
        params: { page, limit },
      });

      const apiResponse: ApiResponse<{
        documents: Array<{
          id: string;
          title: string;
          createdAt: string;
          preview?: string;
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
        message: "Public documents loaded successfully",
      };

      console.log("✅ Public documents loaded successfully:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to load public documents:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * Analyze document with raw data instead of screenshots
   */
  public async analyzeDocumentWithRawData(
    request: AnalyzeDocumentRequest
  ): Promise<ApiResponse<AnalyzeDocumentResponse>> {
    try {
      console.log("🚀 Sending document raw data for analysis...", {
        hasTextContent: !!request.textContent,
        hasDrawingContent: !!request.drawingContent,
        layoutInfo: request.layoutInfo,
        userId: request.userId,
        options: request.options,
      });

      const response = await axiosInstance.post(
        "/documents/analyze-raw",
        request
      );

      const apiResponse: ApiResponse<AnalyzeDocumentResponse> = {
        success: true,
        data: response.data,
        message: "Document analysis started successfully",
      };

      console.log(
        "✅ Document raw data analysis request sent:",
        apiResponse.data
      );
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to analyze document with raw data:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }

  /**
   * @deprecated Use analyzeDocumentWithRawData instead
   * Analyze document with screenshot (legacy method)
   */
  public async analyzeDocument(
    screenshots: {
      textCanvas?: string; // base64 image data
      drawingCanvas?: string; // base64 image data
      combinedCanvas?: string; // base64 image data
    },
    userId?: string,
    options?: {
      analysisType?: string;
      includeText?: boolean;
      includeDrawing?: boolean;
    }
  ): Promise<ApiResponse<{ analysisId: string; result?: any }>> {
    try {
      console.log("🚀 Sending document for analysis (legacy)...", {
        hasTextCanvas: !!screenshots.textCanvas,
        hasDrawingCanvas: !!screenshots.drawingCanvas,
        hasCombinedCanvas: !!screenshots.combinedCanvas,
        userId,
        options,
      });

      const response = await axiosInstance.post("/documents/analyze", {
        screenshots,
        userId,
        options,
      });

      const apiResponse: ApiResponse<{ analysisId: string; result?: any }> = {
        success: true,
        data: response.data,
        message: "Document analysis started successfully",
      };

      console.log("✅ Document analysis request sent:", apiResponse.data);
      return apiResponse;
    } catch (error: unknown) {
      console.error("❌ Failed to analyze document:", error);
      return {
        success: false,
        error: this.handleError(error),
      };
    }
  }
}

// Export singleton instance
export const textApiService = TextApiService.getInstance();
