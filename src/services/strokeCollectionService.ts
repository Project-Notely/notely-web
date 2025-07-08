import type { DrawingData, Point, Stroke, StrokeStyle } from "@/models/types";
import { drawingApiService } from "./api/drawingApiService";

export interface StrokeCollectionConfig {
  autoSaveEnabled?: boolean;
  autoSaveInterval?: number; // in milliseconds
  maxStrokesBeforeAutoSave?: number;
  userId?: string;
  drawingId?: string;
}

export class StrokeCollectionService {
  private strokes: Stroke[] = [];
  private currentStroke: Stroke | null = null;
  private config: StrokeCollectionConfig;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private unsavedStrokes: Stroke[] = [];

  constructor(config: StrokeCollectionConfig = {}) {
    this.config = {
      autoSaveEnabled: true,
      autoSaveInterval: 5000, // 5 seconds
      maxStrokesBeforeAutoSave: 5,
      ...config,
    };

    // Start auto-save if enabled
    if (this.config.autoSaveEnabled) {
      this.startAutoSave();
    }
  }

  /**
   * Generate a unique stroke ID
   */
  private generateStrokeId(): string {
    return `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Start a new stroke
   */
  public startStroke(point: Point, style: StrokeStyle): string {
    const strokeId = this.generateStrokeId();

    this.currentStroke = {
      id: strokeId,
      points: [{ ...point, timestamp: Date.now() }],
      style: { ...style },
      timestamp: Date.now(),
      completed: false,
    };

    console.log("📝 Started new stroke:", strokeId);
    return strokeId;
  }

  /**
   * Add a point to the current stroke
   */
  public addPointToCurrentStroke(point: Point): void {
    if (!this.currentStroke) {
      console.warn("⚠️ No current stroke to add point to");
      return;
    }

    const pointWithTimestamp = { ...point, timestamp: Date.now() };
    this.currentStroke.points.push(pointWithTimestamp);
  }

  /**
   * Complete the current stroke
   */
  public completeCurrentStroke(): Stroke | null {
    if (!this.currentStroke) {
      console.warn("⚠️ No current stroke to complete");
      return null;
    }

    // Mark as completed
    this.currentStroke.completed = true;

    // Add to strokes collection
    this.strokes.push(this.currentStroke);
    this.unsavedStrokes.push(this.currentStroke);

    const completedStroke = this.currentStroke;
    this.currentStroke = null;

    console.log("✅ Completed stroke:", completedStroke.id, {
      pointCount: completedStroke.points.length,
      duration:
        completedStroke.points.length > 0
          ? (completedStroke.points[completedStroke.points.length - 1]
              .timestamp || Date.now()) - completedStroke.timestamp
          : 0,
    });

    // Check if we need to auto-save
    if (this.config.autoSaveEnabled && this.config.maxStrokesBeforeAutoSave) {
      if (this.unsavedStrokes.length >= this.config.maxStrokesBeforeAutoSave) {
        this.saveUnsavedStrokes();
      }
    }

    return completedStroke;
  }

  /**
   * Get all strokes
   */
  public getAllStrokes(): Stroke[] {
    return [...this.strokes];
  }

  /**
   * Get current stroke in progress
   */
  public getCurrentStroke(): Stroke | null {
    return this.currentStroke ? { ...this.currentStroke } : null;
  }

  /**
   * Get unsaved strokes
   */
  public getUnsavedStrokes(): Stroke[] {
    return [...this.unsavedStrokes];
  }

  /**
   * Clear all strokes
   */
  public clearAllStrokes(): void {
    this.strokes = [];
    this.currentStroke = null;
    this.unsavedStrokes = [];
    console.log("🗑️ Cleared all strokes");
  }

  /**
   * Remove a specific stroke
   */
  public removeStroke(strokeId: string): boolean {
    const index = this.strokes.findIndex(stroke => stroke.id === strokeId);
    if (index >= 0) {
      this.strokes.splice(index, 1);

      // Also remove from unsaved strokes if present
      const unsavedIndex = this.unsavedStrokes.findIndex(
        stroke => stroke.id === strokeId
      );
      if (unsavedIndex >= 0) {
        this.unsavedStrokes.splice(unsavedIndex, 1);
      }

      console.log("🗑️ Removed stroke:", strokeId);
      return true;
    }
    return false;
  }

  /**
   * Export as DrawingData
   */
  public exportAsDrawingData(dimensions: {
    width: number;
    height: number;
  }): DrawingData {
    return {
      strokes: this.getAllStrokes(),
      dimensions,
      metadata: {
        created: Date.now(),
        modified: Date.now(),
        version: "2.0",
      },
    };
  }

  /**
   * Load drawing data
   */
  public loadDrawingData(drawingData: DrawingData): void {
    this.strokes = [...drawingData.strokes];
    this.currentStroke = null;
    this.unsavedStrokes = []; // Assume loaded data is already saved
    console.log("📂 Loaded drawing data:", {
      strokeCount: this.strokes.length,
      dimensions: drawingData.dimensions,
    });
  }

  /**
   * Save unsaved strokes to backend
   */
  private async saveUnsavedStrokes(): Promise<void> {
    if (this.unsavedStrokes.length === 0) {
      return;
    }

    try {
      const response = await drawingApiService.saveStrokes(
        this.unsavedStrokes,
        this.config.drawingId
      );

      if (response.success) {
        // Clear unsaved strokes after successful save
        this.unsavedStrokes = [];
        console.log("💾 Auto-saved strokes successfully");
      } else {
        console.error("❌ Failed to auto-save strokes:", response.error);
      }
    } catch (error) {
      console.error("❌ Error during auto-save:", error);
    }
  }

  /**
   * Manually save all strokes as a complete drawing
   */
  public async saveCompleteDrawing(
    dimensions: { width: number; height: number },
    title?: string,
    description?: string
  ): Promise<boolean> {
    try {
      const drawingData = this.exportAsDrawingData(dimensions);

      const response = await drawingApiService.saveDrawing({
        drawing: drawingData,
        userId: this.config.userId,
        title,
        description,
      });

      if (response.success) {
        // Clear unsaved strokes after successful save
        this.unsavedStrokes = [];
        console.log("💾 Saved complete drawing successfully:", response.data);
        return true;
      } else {
        console.error("❌ Failed to save complete drawing:", response.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Error saving complete drawing:", error);
      return false;
    }
  }

  /**
   * Start auto-save timer
   */
  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(() => {
      if (this.unsavedStrokes.length > 0) {
        this.saveUnsavedStrokes();
      }
    }, this.config.autoSaveInterval);

    console.log(
      "⏰ Auto-save started with interval:",
      this.config.autoSaveInterval
    );
  }

  /**
   * Stop auto-save timer
   */
  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
      console.log("⏹️ Auto-save stopped");
    }
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<StrokeCollectionConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart auto-save if settings changed
    if (this.config.autoSaveEnabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
  }

  /**
   * Get statistics about the drawing
   */
  public getDrawingStatistics(): {
    totalStrokes: number;
    totalPoints: number;
    unsavedStrokes: number;
    drawingDuration: number;
    averageStrokeLength: number;
  } {
    const totalPoints = this.strokes.reduce(
      (sum, stroke) => sum + stroke.points.length,
      0
    );
    const oldestStroke =
      this.strokes.length > 0
        ? Math.min(...this.strokes.map(s => s.timestamp))
        : Date.now();
    const newestStroke =
      this.strokes.length > 0
        ? Math.max(...this.strokes.map(s => s.timestamp))
        : Date.now();

    return {
      totalStrokes: this.strokes.length,
      totalPoints,
      unsavedStrokes: this.unsavedStrokes.length,
      drawingDuration: newestStroke - oldestStroke,
      averageStrokeLength:
        this.strokes.length > 0 ? totalPoints / this.strokes.length : 0,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.stopAutoSave();
    this.strokes = [];
    this.currentStroke = null;
    this.unsavedStrokes = [];
    console.log("🧹 StrokeCollectionService destroyed");
  }
}
