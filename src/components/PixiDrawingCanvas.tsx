import {
  Brush as BrushIcon,
  Delete as ClearIcon,
  Download as DownloadIcon,
  Clear as EraserIcon,
  VisibilityOff as HideIcon,
  Highlight as HighlighterIcon,
  Edit as PenIcon,
  FlashOn as PerformanceIcon,
  Redo as RedoIcon,
  SaveAlt as SaveIcon,
  Visibility as ShowIcon,
  Undo as UndoIcon,
} from "@mui/icons-material";
import { Button, CircularProgress, Tooltip, Typography } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { PixiDrawingService } from "../services/pixiDrawingService";
import { useDrawingSelectors } from "../stores/drawingStore";
import type { DrawingCanvasProps, DrawingTool, Point } from "../utils/types";
import {
  ActionButton,
  ActionSection,
  CanvasContainer,
  CanvasWrapper,
  ColorButton,
  ColorPalette,
  DrawingCanvas,
  LoadingOverlay,
  PerformanceIndicator,
  ResponsiveWrapper,
  StatusBar,
  StatusContent,
  ThicknessSection,
  ThicknessSlider,
  ToggleToolbarButton,
  ToolbarContent,
  ToolButtonGroup,
  ToolInfoSection,
  ToolInfoText,
  ToolSection,
  TopToolbar,
} from "./styled/DrawingCanvasStyles";

interface PixiDrawingCanvasProps extends DrawingCanvasProps {
  showPerformanceInfo?: boolean;
}

const PixiDrawingCanvas: React.FC<PixiDrawingCanvasProps> = ({
  width = 800,
  height = 600,
  backgroundColor = "#ffffff",
  onStrokeComplete,
  initialDrawing,
  showPerformanceInfo = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixiServiceRef = useRef<PixiDrawingService | null>(null);
  const isDrawingRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [performanceInfo, setPerformanceInfo] = useState<{
    type?: string;
    resolution?: number;
    width?: number;
    height?: number;
  }>({});

  // Zustand store
  const {
    strokes,
    currentStroke,
    isDrawing,
    currentTool,
    availableColors,
    canUndo,
    canRedo,
    strokeCount,
    isToolbarVisible,
    startDrawing,
    continueDrawing,
    endDrawing,
    clearCanvas,
    undo,
    redo,
    setTool,
    setToolbarVisibility,
    setCanvasSize,
    loadDrawing,
    exportDrawing,
  } = useDrawingSelectors();

  // Initialize PixiJS service
  useEffect(() => {
    const initializePixi = async () => {
      if (!canvasRef.current || pixiServiceRef.current) return;

      try {
        const pixiService = new PixiDrawingService({
          width,
          height,
          backgroundColor,
          antialias: true,
          resolution: window.devicePixelRatio || 1,
        });

        await pixiService.initialize(canvasRef.current);
        pixiServiceRef.current = pixiService;

        // Set performance info
        if (showPerformanceInfo) {
          setPerformanceInfo(pixiService.getRendererInfo());
        }

        setIsInitialized(true);
        setCanvasSize({ width, height });
      } catch (error) {
        console.error("Failed to initialize PixiJS:", error);
      }
    };

    initializePixi();

    return () => {
      if (pixiServiceRef.current) {
        pixiServiceRef.current.destroy();
        pixiServiceRef.current = null;
      }
    };
  }, [width, height, backgroundColor, showPerformanceInfo, setCanvasSize]);

  // Load initial drawing
  useEffect(() => {
    if (initialDrawing && isInitialized) {
      loadDrawing(initialDrawing);
    }
  }, [initialDrawing, isInitialized, loadDrawing]);

  // Sync strokes with PixiJS
  useEffect(() => {
    if (pixiServiceRef.current && isInitialized) {
      pixiServiceRef.current.drawAllStrokes(strokes);
    }
  }, [strokes, isInitialized]);

  // Get point from event
  const getPointFromEvent = useCallback(
    (event: React.MouseEvent | React.TouchEvent): Point => {
      if (!pixiServiceRef.current) return { x: 0, y: 0, timestamp: Date.now() };

      let clientX: number, clientY: number;

      if ("touches" in event) {
        const touch = event.touches[0] || event.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = event.clientX;
        clientY = event.clientY;
      }

      return pixiServiceRef.current.getCanvasPoint(clientX, clientY);
    },
    []
  );

  // Mouse event handlers
  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      event.preventDefault();

      // Simple test to see if mouse events work
      alert("Mouse click detected on canvas!");

      console.log("Mouse down detected!", {
        isInitialized,
        pixiService: !!pixiServiceRef.current,
      });

      if (!isInitialized) {
        console.log("Canvas not initialized yet");
        return;
      }

      const point = getPointFromEvent(event);
      console.log("Point from event:", point);

      isDrawingRef.current = true;

      startDrawing(point);
      console.log("Started drawing in store");

      if (pixiServiceRef.current) {
        console.log("Starting stroke with PixiJS");
        pixiServiceRef.current.startStroke(point, currentTool.style);
      } else {
        console.log("PixiJS service not available");
      }
    },
    [isInitialized, getPointFromEvent, startDrawing, currentTool]
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current || !isInitialized) return;

      const point = getPointFromEvent(event);
      console.log("Mouse move:", point);

      continueDrawing(point);

      if (pixiServiceRef.current) {
        pixiServiceRef.current.continueStroke(point, currentTool.style);
      }
    },
    [isInitialized, getPointFromEvent, continueDrawing, currentTool]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawingRef.current) return;

    console.log("Mouse up detected");
    isDrawingRef.current = false;
    endDrawing();

    if (pixiServiceRef.current && currentStroke) {
      pixiServiceRef.current.endStroke(currentStroke.id);
      onStrokeComplete?.(currentStroke);
    }
  }, [endDrawing, currentStroke, onStrokeComplete]);

  // Touch event handlers
  const handleTouchStart = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      handleMouseDown(event as unknown as React.MouseEvent<HTMLCanvasElement>);
    },
    [handleMouseDown]
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      handleMouseMove(event as unknown as React.MouseEvent<HTMLCanvasElement>);
    },
    [handleMouseMove]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      event.preventDefault();
      handleMouseUp();
    },
    [handleMouseUp]
  );

  // Tool handlers
  const handleToolChange = useCallback(
    (toolType: "pen" | "brush" | "eraser" | "highlighter") => {
      const newTool: DrawingTool = {
        type: toolType,
        style: {
          ...currentTool.style,
          color:
            toolType === "eraser" ? backgroundColor : currentTool.style.color,
          opacity: toolType === "highlighter" ? 0.5 : 1,
        },
      };
      setTool(newTool);
    },
    [currentTool, backgroundColor, setTool]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      const newTool: DrawingTool = {
        ...currentTool,
        style: { ...currentTool.style, color },
      };
      setTool(newTool);
    },
    [currentTool, setTool]
  );

  const handleThicknessChange = useCallback(
    (thickness: number) => {
      const newTool: DrawingTool = {
        ...currentTool,
        style: { ...currentTool.style, thickness },
      };
      setTool(newTool);
    },
    [currentTool, setTool]
  );

  // Export handlers
  const handleExportImage = useCallback(async () => {
    if (!pixiServiceRef.current) return;

    try {
      const dataUrl = await pixiServiceRef.current.exportAsDataURL();
      const link = document.createElement("a");
      link.download = "drawing.png";
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to export image:", error);
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    const drawingData = exportDrawing();
    const blob = new Blob([JSON.stringify(drawingData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "drawing.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }, [exportDrawing]);

  const handleClear = useCallback(() => {
    clearCanvas();
    if (pixiServiceRef.current) {
      pixiServiceRef.current.clearCanvas();
    }
  }, [clearCanvas]);

  const handleUndo = useCallback(() => {
    undo();
  }, [undo]);

  const handleRedo = useCallback(() => {
    redo();
  }, [redo]);

  if (!isInitialized) {
    return (
      <CanvasContainer>
        <LoadingOverlay>
          <CircularProgress />
          <Typography variant='body2' sx={{ ml: 2 }}>
            Initializing WebGL Canvas...
          </Typography>
        </LoadingOverlay>
      </CanvasContainer>
    );
  }

  return (
    <ResponsiveWrapper>
      <CanvasContainer>
        {/* Performance Info */}
        {showPerformanceInfo && (
          <PerformanceIndicator>
            <PerformanceIcon sx={{ fontSize: 12, mr: 0.5 }} />
            WebGL {performanceInfo.type} | {performanceInfo.resolution}x
          </PerformanceIndicator>
        )}

        {/* Toggle Toolbar Button */}
        <ToggleToolbarButton
          onClick={() => setToolbarVisibility(!isToolbarVisible)}
          size='small'
        >
          {isToolbarVisible ? <HideIcon /> : <ShowIcon />}
        </ToggleToolbarButton>

        {/* Top Toolbar */}
        <TopToolbar className={isToolbarVisible ? "" : "hidden"}>
          <ToolbarContent>
            {/* Tool Selection */}
            <ToolSection>
              <ToolButtonGroup variant='contained' size='small'>
                <Button
                  className={currentTool.type === "pen" ? "active" : ""}
                  onClick={() => handleToolChange("pen")}
                >
                  <PenIcon />
                </Button>
                <Button
                  className={currentTool.type === "brush" ? "active" : ""}
                  onClick={() => handleToolChange("brush")}
                >
                  <BrushIcon />
                </Button>
                <Button
                  className={currentTool.type === "eraser" ? "active" : ""}
                  onClick={() => handleToolChange("eraser")}
                >
                  <EraserIcon />
                </Button>
                <Button
                  className={currentTool.type === "highlighter" ? "active" : ""}
                  onClick={() => handleToolChange("highlighter")}
                >
                  <HighlighterIcon />
                </Button>
              </ToolButtonGroup>

              {/* Tool Info */}
              <ToolInfoSection>
                <ToolInfoText>
                  {currentTool.type.charAt(0).toUpperCase() +
                    currentTool.type.slice(1)}
                </ToolInfoText>
              </ToolInfoSection>
            </ToolSection>

            {/* Color Palette */}
            <ToolSection>
              <ColorPalette>
                {availableColors.map(color => (
                  <Tooltip key={color} title={color}>
                    <ColorButton
                      colorValue={color}
                      selected={currentTool.style.color === color}
                      onClick={() => handleColorChange(color)}
                    />
                  </Tooltip>
                ))}
              </ColorPalette>
            </ToolSection>

            {/* Thickness Control */}
            <ToolSection>
              <ThicknessSection>
                <ToolInfoText>Size:</ToolInfoText>
                <ThicknessSlider
                  value={currentTool.style.thickness}
                  onChange={(_, value) =>
                    handleThicknessChange(value as number)
                  }
                  min={1}
                  max={24}
                  step={1}
                  size='small'
                />
                <ToolInfoText>{currentTool.style.thickness}px</ToolInfoText>
              </ThicknessSection>
            </ToolSection>

            {/* Actions */}
            <ActionSection>
              <Tooltip title='Undo'>
                <ActionButton onClick={handleUndo} disabled={!canUndo}>
                  <UndoIcon />
                </ActionButton>
              </Tooltip>
              <Tooltip title='Redo'>
                <ActionButton onClick={handleRedo} disabled={!canRedo}>
                  <RedoIcon />
                </ActionButton>
              </Tooltip>
              <Tooltip title='Clear Canvas'>
                <ActionButton onClick={handleClear} className='danger'>
                  <ClearIcon />
                </ActionButton>
              </Tooltip>
              <Tooltip title='Export Image'>
                <ActionButton onClick={handleExportImage} className='success'>
                  <DownloadIcon />
                </ActionButton>
              </Tooltip>
              <Tooltip title='Export JSON'>
                <ActionButton onClick={handleExportJSON} className='success'>
                  <SaveIcon />
                </ActionButton>
              </Tooltip>
            </ActionSection>
          </ToolbarContent>
        </TopToolbar>

        {/* Canvas */}
        <CanvasWrapper>
          <DrawingCanvas
            ref={canvasRef}
            width={width}
            height={height}
            className={`${isDrawing ? "drawing" : ""} ${currentTool.type === "eraser" ? "eraser" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onContextMenu={e => e.preventDefault()}
            style={{
              width: `${width}px`,
              height: `${height}px`,
            }}
          />
        </CanvasWrapper>

        {/* Status Bar */}
        <StatusBar>
          <StatusContent>
            <Typography variant='body2'>
              Tool: {currentTool.type} | Color: {currentTool.style.color} |
              Size: {currentTool.style.thickness}px
            </Typography>
            <Typography variant='body2'>
              Strokes: {strokeCount} | {isDrawing ? "Drawing..." : "Ready"}
            </Typography>
          </StatusContent>
        </StatusBar>
      </CanvasContainer>
    </ResponsiveWrapper>
  );
};

export default PixiDrawingCanvas;
