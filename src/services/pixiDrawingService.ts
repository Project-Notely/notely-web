import {
  Application,
  Container,
  Graphics,
  type ColorSource,
  type LineCap,
  type LineJoin,
} from "pixi.js";
import type {
  PixiDrawingServiceConfig,
  Point,
  Stroke,
  StrokeStyle,
} from "../utils/types";

export class PixiDrawingService {
  private app: Application;
  private drawingContainer: Container;
  private currentStrokeGraphics: Graphics | null = null;
  private strokeGraphics: Map<string, Graphics> = new Map();
  private isInitialized = false;
  private config: PixiDrawingServiceConfig;

  constructor(config: PixiDrawingServiceConfig) {
    this.config = config;
    this.app = new Application();
    this.drawingContainer = new Container();
  }

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (this.isInitialized) return;

    console.log("Initializing PixiJS Application...");

    try {
      // PixiJS v8 initialization
      await this.app.init({
        canvas,
        width: this.config.width,
        height: this.config.height,
        backgroundColor: this.config.backgroundColor,
        antialias: this.config.antialias,
        resolution: this.config.resolution,
        autoDensity: true,
        powerPreference: "high-performance",
      });

      console.log("PixiJS Application initialized");
      console.log("App canvas:", this.app.canvas);
      console.log("App renderer:", this.app.renderer);

      // Add main drawing container
      this.app.stage.addChild(this.drawingContainer);

      // Enable interactive events
      this.app.stage.eventMode = "static";
      this.app.stage.hitArea = this.app.screen;

      this.isInitialized = true;
      console.log("PixiJS Drawing Service fully initialized");
    } catch (error) {
      console.error("Error during PixiJS initialization:", error);
      throw error;
    }
  }

  startStroke(point: Point, _style: StrokeStyle): Graphics {
    if (!this.isInitialized)
      throw new Error("PixiDrawingService not initialized");

    // Create new graphics for this stroke
    const graphics = new Graphics();
    this.currentStrokeGraphics = graphics;

    // Start path
    graphics.moveTo(point.x, point.y);

    // Add to stage
    this.drawingContainer.addChild(graphics);

    return graphics;
  }

  continueStroke(point: Point, style: StrokeStyle): void {
    if (!this.currentStrokeGraphics) return;

    // Add the line to the path
    this.currentStrokeGraphics.lineTo(point.x, point.y);

    // Apply stroke style and render to show progress
    this.currentStrokeGraphics.stroke(this.convertStrokeStyle(style));
  }

  endStroke(strokeId: string): void {
    if (!this.currentStrokeGraphics) return;

    // Store the graphics for this stroke
    this.strokeGraphics.set(strokeId, this.currentStrokeGraphics);
    this.currentStrokeGraphics = null;
  }

  drawStroke(stroke: Stroke): Graphics {
    if (!this.isInitialized)
      throw new Error("PixiDrawingService not initialized");

    // Check if we already have graphics for this stroke
    let graphics = this.strokeGraphics.get(stroke.id);

    if (!graphics) {
      graphics = new Graphics();
      this.strokeGraphics.set(stroke.id, graphics);
      this.drawingContainer.addChild(graphics);
    }

    // Clear previous drawing
    graphics.clear();

    if (stroke.points.length < 1) return graphics;

    if (stroke.points.length === 1) {
      // Single point - draw a small circle
      const point = stroke.points[0];
      graphics.circle(point.x, point.y, stroke.style.thickness / 2);
      graphics.fill(this.convertStrokeStyle(stroke.style));
      return graphics;
    }

    // Draw the stroke path
    const firstPoint = stroke.points[0];
    graphics.moveTo(firstPoint.x, firstPoint.y);

    // Draw lines to each point
    for (let i = 1; i < stroke.points.length; i++) {
      const point = stroke.points[i];
      graphics.lineTo(point.x, point.y);
    }

    // Apply stroke with style
    graphics.stroke(this.convertStrokeStyle(stroke.style));
    return graphics;
  }

  private convertStrokeStyle(style: StrokeStyle): {
    color: number;
    width: number;
    alpha: number;
    cap: LineCap;
    join: LineJoin;
  } {
    return {
      color: this.hexToNumber(style.color),
      width: style.thickness,
      alpha: style.opacity,
      cap: style.lineCap as LineCap,
      join: style.lineJoin as LineJoin,
    };
  }

  drawAllStrokes(strokes: Stroke[]): void {
    if (!this.isInitialized) return;

    // Clear existing strokes
    this.clearCanvas();

    // Draw each stroke
    strokes.forEach(stroke => {
      this.drawStroke(stroke);
    });
  }

  removeStroke(strokeId: string): void {
    const graphics = this.strokeGraphics.get(strokeId);
    if (graphics) {
      this.drawingContainer.removeChild(graphics);
      graphics.destroy();
      this.strokeGraphics.delete(strokeId);
    }
  }

  clearCanvas(): void {
    if (!this.isInitialized) return;

    // Remove all stroke graphics
    this.strokeGraphics.forEach(graphics => {
      this.drawingContainer.removeChild(graphics);
      graphics.destroy();
    });

    this.strokeGraphics.clear();
    this.currentStrokeGraphics = null;
  }

  setBackgroundColor(color: ColorSource): void {
    if (!this.isInitialized) return;
    this.app.renderer.background.color = color;
  }

  resize(width: number, height: number): void {
    if (!this.isInitialized) return;
    this.app.renderer.resize(width, height);
    this.config.width = width;
    this.config.height = height;
  }

  private hexToNumber(hex: string): number {
    // Remove # if present
    hex = hex.replace("#", "");
    return parseInt(hex, 16);
  }

  // Export methods
  async exportAsDataURL(
    format: "png" | "jpeg" = "png",
    quality = 1
  ): Promise<string> {
    if (!this.isInitialized)
      throw new Error("PixiDrawingService not initialized");

    const canvas = this.app.canvas as HTMLCanvasElement;
    return canvas.toDataURL(`image/${format}`, quality);
  }

  async exportAsBlob(
    format: "png" | "jpeg" = "png",
    quality = 1
  ): Promise<Blob | null> {
    if (!this.isInitialized)
      throw new Error("PixiDrawingService not initialized");

    return new Promise(resolve => {
      const canvas = this.app.canvas as HTMLCanvasElement;
      canvas.toBlob(resolve, `image/${format}`, quality);
    });
  }

  // Utility methods
  getCanvasPoint(clientX: number, clientY: number): Point {
    if (!this.isInitialized)
      throw new Error("PixiDrawingService not initialized");

    const rect = (this.app.canvas as HTMLCanvasElement).getBoundingClientRect();

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      timestamp: Date.now(),
    };
  }

  // Performance optimization
  enableBatchMode(): void {
    if (!this.isInitialized) return;
    // PixiJS v8 doesn't have this API - removed
  }

  disableBatchMode(): void {
    if (!this.isInitialized) return;
    // PixiJS v8 doesn't have this API - removed
  }

  // Get renderer info for debugging
  getRendererInfo(): object {
    if (!this.isInitialized) return {};

    const renderer = this.app.renderer;
    return {
      type: renderer.type,
      resolution: renderer.resolution,
      width: renderer.width,
      height: renderer.height,
    };
  }

  // Cleanup
  destroy(): void {
    this.clearCanvas();
    if (this.app) {
      this.app.destroy(true, true);
    }
    this.isInitialized = false;
  }

  // Getters
  get application(): Application {
    return this.app;
  }

  get container(): Container {
    return this.drawingContainer;
  }

  get initialized(): boolean {
    return this.isInitialized;
  }
}
