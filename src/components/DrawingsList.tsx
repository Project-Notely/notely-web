import { useDeleteDrawing, useUserDrawings } from "@/hooks/useDrawingQueries";
import React from "react";

interface DrawingsListProps {
  userId: string;
}

const DrawingsList: React.FC<DrawingsListProps> = ({ userId }) => {
  const { data: drawingsResponse, isLoading, error } = useUserDrawings(userId);
  const deleteDrawingMutation = useDeleteDrawing();

  const handleDeleteDrawing = (drawingId: string) => {
    deleteDrawingMutation.mutate(drawingId);
  };

  if (isLoading) {
    return <div className='p-4'>Loading drawings...</div>;
  }

  if (error) {
    return <div className='p-4 text-red-500'>Error loading drawings</div>;
  }

  const drawings = drawingsResponse?.data?.drawings || [];

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-4'>Your Drawings</h2>
      {drawings.length === 0 ? (
        <p className='text-gray-500'>No drawings found</p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {drawings.map(drawing => (
            <div
              key={drawing.id}
              className='border rounded-lg p-4 bg-white shadow'
            >
              <h3 className='font-semibold mb-2'>{drawing.title}</h3>
              <p className='text-sm text-gray-600 mb-2'>
                Created: {new Date(drawing.createdAt).toLocaleDateString()}
              </p>
              <div className='flex justify-between items-center'>
                <button
                  className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm'
                  onClick={() => console.log("Load drawing:", drawing.id)}
                >
                  Load
                </button>
                <button
                  className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm'
                  onClick={() => handleDeleteDrawing(drawing.id)}
                  disabled={deleteDrawingMutation.isPending}
                >
                  {deleteDrawingMutation.isPending ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DrawingsList;
