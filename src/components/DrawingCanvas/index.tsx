import { useEffect, useRef, useState } from 'react';
import { Application, Graphics } from 'pixi.js';
import { useDrawingStore } from '@/store/drawingStore';

const DrawingCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<Application | null>(null);
    const graphicsRef = useRef<Graphics | null>(null);
    const { addStroke } = useDrawingStore();
    
    // Track container dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Update dimensions when window resizes
    useEffect(() => {
        const updateDimensions = () => {
            if (canvasRef.current) {
                const { clientWidth, clientHeight } = canvasRef.current;
                setDimensions({ 
                    width: clientWidth, 
                    height: clientHeight 
                });
                
                // Also update canvas size if it exists
                if (appRef.current) {
                    appRef.current.renderer.resize(clientWidth, clientHeight);
                }
            }
        };

        // Initial measurement
        updateDimensions();
        
        // Listen for resize
        window.addEventListener('resize', updateDimensions);
        
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    useEffect(() => {
        console.log('Initializing DrawingCanvas');
        const initializePixi = async () => {
            try {
                // Get container dimensions
                const containerWidth = canvasRef.current?.clientWidth || window.innerWidth;
                const containerHeight = canvasRef.current?.clientHeight || window.innerHeight;
                
                // Create app with container dimensions
                const app = new Application();
                await app.init({
                    width: containerWidth,
                    height: containerHeight,
                    background: 0xffffff,
                    resolution: 1, // Use 1 for exact pixel mapping
                    antialias: true,
                });

                console.log('PIXI app initialized with size:', containerWidth, 'x', containerHeight);
                appRef.current = app;
                
                // Create graphics object
                const graphics = new Graphics();
                graphicsRef.current = graphics;
                app.stage.addChild(graphics);
                
                if (canvasRef.current) {
                    console.log('Appending canvas to DOM');
                    canvasRef.current.appendChild(app.canvas);
                    
                    // Make the canvas fill the container - maintain exact 1:1 pixel mapping
                    app.canvas.style.position = 'absolute';
                    app.canvas.style.top = '0';
                    app.canvas.style.left = '0';
                    app.canvas.style.width = `${containerWidth}px`;
                    app.canvas.style.height = `${containerHeight}px`;
                    app.canvas.style.touchAction = 'none'; // Prevent default touch actions
                } else {
                    console.error('Canvas ref is null');
                }

                let isDrawing = false;
                let currentStroke: { x: number; y: number; pressure: number }[] = [];

                const startDrawing = (event: PointerEvent) => {
                    // Get pointer position directly from the event - relative to canvas
                    const x = event.offsetX;
                    const y = event.offsetY;
                    
                    console.log('Pointer down at:', x, y);
                    
                    isDrawing = true;
                    currentStroke = [];
                    const pressure = event.pressure !== undefined ? event.pressure : 1;
                    currentStroke.push({ x, y, pressure });
                    
                    // Clear previous drawing
                    graphics.clear();
                    
                    // Draw a dot to mark the start point
                    graphics.circle(x, y, 5);
                    graphics.fill({ color: 0x0000ff });
                };

                const draw = (event: PointerEvent) => {
                    if (!isDrawing || !graphicsRef.current) return;
                    
                    // Get pointer position directly from the event
                    const x = event.offsetX;
                    const y = event.offsetY;
                    
                    const pressure = event.pressure !== undefined ? event.pressure : 1;
                    currentStroke.push({ x, y, pressure });
                    
                    if (currentStroke.length < 2) return;
                    
                    const lastPoint = currentStroke[currentStroke.length - 2];
                    
                    // Draw line from last point to current point
                    graphics.setStrokeStyle({
                        width: 4,
                        color: 0x000000,
                        alpha: 1
                    });
                    
                    graphics.moveTo(lastPoint.x, lastPoint.y);
                    graphics.lineTo(x, y);
                    graphics.stroke();
                };

                const stopDrawing = () => {
                    if (isDrawing) {
                        console.log('Stopping drawing, stroke points:', currentStroke.length);
                        if (currentStroke.length > 0) {
                            addStroke([...currentStroke]);
                        }
                        isDrawing = false;
                    }
                };

                // Use direct canvas events for more accurate coordinates
                app.canvas.addEventListener('pointerdown', startDrawing);
                app.canvas.addEventListener('pointermove', draw);
                app.canvas.addEventListener('pointerup', stopDrawing);
                app.canvas.addEventListener('pointerleave', stopDrawing);

            } catch (error) {
                console.error('Error initializing PIXI application:', error);
            }
        };

        initializePixi();

        return () => {
            if (appRef.current) {
                console.log('Cleaning up PIXI app');
                appRef.current.destroy(true);
            }
        };
    }, [addStroke, dimensions]);

    return (
        <div 
            ref={canvasRef} 
            style={{ 
                width: '100vw', 
                height: '100vh',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Canvas will be appended here */}
        </div>
    );
};

export default DrawingCanvas;
