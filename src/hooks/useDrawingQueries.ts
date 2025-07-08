import type { DrawingData, Stroke } from "@/models/types";
import { DrawingApiService } from "@/services/api/drawingApiService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const drawingApiService = DrawingApiService.getInstance();

// Query keys
export const DRAWING_QUERY_KEYS = {
  drawings: ["drawings"] as const,
  drawing: (id: string) => ["drawings", id] as const,
  userDrawings: (userId: string) => ["drawings", "user", userId] as const,
};

// Hook to load a specific drawing
export const useDrawing = (drawingId: string) => {
  return useQuery({
    queryKey: DRAWING_QUERY_KEYS.drawing(drawingId),
    queryFn: () => drawingApiService.loadDrawing(drawingId),
    enabled: !!drawingId,
  });
};

// Hook to get user's drawings
export const useUserDrawings = (userId: string) => {
  return useQuery({
    queryKey: DRAWING_QUERY_KEYS.userDrawings(userId),
    queryFn: () => drawingApiService.getUserDrawings(userId),
    enabled: !!userId,
  });
};

// Hook to save a drawing
export const useSaveDrawing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: {
      drawing: DrawingData;
      userId?: string;
      title?: string;
      description?: string;
    }) => drawingApiService.saveDrawing(request),
    onSuccess: (data, variables) => {
      // Invalidate user drawings to refetch the list
      if (variables.userId) {
        queryClient.invalidateQueries({
          queryKey: DRAWING_QUERY_KEYS.userDrawings(variables.userId),
        });
      }
    },
  });
};

// Hook to delete a drawing
export const useDeleteDrawing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (drawingId: string) =>
      drawingApiService.deleteDrawing(drawingId),
    onSuccess: () => {
      // Invalidate all drawing queries
      queryClient.invalidateQueries({
        queryKey: DRAWING_QUERY_KEYS.drawings,
      });
    },
  });
};

// Hook to save strokes incrementally
export const useSaveStrokes = () => {
  return useMutation({
    mutationFn: (params: { strokes: Stroke[]; drawingId?: string }) =>
      drawingApiService.saveStrokes(params.strokes, params.drawingId),
  });
};
