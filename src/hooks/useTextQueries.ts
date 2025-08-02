import type { SaveAnnotatedDocumentRequest } from "@/models/types";
import { textApiService } from "@/services/api/textApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys
export const TEXT_QUERY_KEYS = {
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
  userDocuments: (userId: string) => ["documents", "user", userId] as const,
};

// Hook to load a specific document
export const useDocument = (documentId: string) => {
  return useQuery({
    queryKey: TEXT_QUERY_KEYS.document(documentId),
    queryFn: () => textApiService.loadDocument(documentId),
    enabled: !!documentId,
  });
};

// Hook to get user's documents
export const useUserDocuments = (userId: string) => {
  return useQuery({
    queryKey: TEXT_QUERY_KEYS.userDocuments(userId),
    queryFn: () => textApiService.getUserDocuments(userId),
    enabled: !!userId,
  });
};

// Hook to save a document
export const useSaveDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SaveAnnotatedDocumentRequest) =>
      textApiService.saveDocument(request),
    onSuccess: (_, variables) => {
      // Invalidate user documents to refetch the list
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: TEXT_QUERY_KEYS.userDocuments(variables.userId),
        });
      }
    },
  });
};

// Hook to delete a document
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      textApiService.deleteDocument(documentId),
    onSuccess: () => {
      // Invalidate all document queries
      queryClient.invalidateQueries({
        queryKey: TEXT_QUERY_KEYS.documents,
      });
    },
  });
};

// Hook to update document metadata
export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      updates,
    }: {
      documentId: string;
      updates: {
        title?: string;
        description?: string;
        isPublic?: boolean;
      };
    }) => textApiService.updateDocument(documentId, updates),
    onSuccess: (_, variables) => {
      // Invalidate specific document and user documents
      queryClient.invalidateQueries({
        queryKey: TEXT_QUERY_KEYS.document(variables.documentId),
      });
      queryClient.invalidateQueries({
        queryKey: TEXT_QUERY_KEYS.documents,
      });
    },
  });
};

// Hook to analyze document with screenshots
export const useAnalyzeDocument = () => {
  return useMutation({
    mutationFn: ({
      screenshots,
      userId,
      options,
    }: {
      screenshots: {
        textCanvas?: string;
        drawingCanvas?: string;
        combinedCanvas?: string;
      };
      userId?: string;
      options?: {
        analysisType?: string;
        includeText?: boolean;
        includeDrawing?: boolean;
      };
    }) => textApiService.analyzeDocument(screenshots, userId, options),
  });
};
