import { create } from "zustand";
import { collection, addDoc, getDoc, getDocs, doc, updateDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/config/firebase-config";

interface Stroke {
    x: number;
    y: number;
    pressure: number;
}

interface Drawing {
    id: string;
    title: string;
    strokes: Stroke[][];
    createdAt: Date;
}

interface DrawingStore {
    strokes: Stroke[][];
    currentDrawingId: string | null;
    currentDrawingTitle: string;
    isSaving: boolean;
    isLoading: boolean;
    recentDrawings: Drawing[];

    // actions
    addStroke: (stroke: Stroke[]) => void;
    resetCanvas: () => void;
    setDrawingTitle: (title: string) => void;

    // firestore operations
    saveDrawing: () => Promise<string | null>;
    loadDrawing: (id: string) => Promise<boolean>;
    fetchRecentDrawings: () => Promise<void>;
}

export const useDrawingStore = create<DrawingStore>((set, get) => ({
    strokes: [],
    currentDrawingId: null,
    currentDrawingTitle: "Untitled Drawing",
    isSaving: false,
    isLoading: false,
    recentDrawings: [],

    // add a stroke to the current drawing
    addStroke: (stroke) => set((state) => ({
        strokes: [...state.strokes, stroke]
    })),

    // reset canvas
    resetCanvas: () => set({
        strokes: [],
        currentDrawingId: null,
        currentDrawingTitle: "Untitled Drawing"
    }),

    // set drawing title
    setDrawingTitle: (title) => set({
        currentDrawingTitle: title
    }),

    // save the current drawing to Firestore
    saveDrawing: async () => {
        const { strokes, currentDrawingTitle, currentDrawingId } = get();

        // don't save if there are no strokes
        if (strokes.length === 0) {
            console.log("No strokes to save");
            return null;
        }

        set({ isSaving: true });

        try {
            // Convert nested arrays to string to avoid Firestore nested array limitations
            const serializedStrokes = JSON.stringify(strokes);
            
            // create the drawing document
            const drawingData = {
                title: currentDrawingTitle,
                serializedStrokes: serializedStrokes, // Store as string instead of nested array
                createdAt: new Date(),
                updatedAt: new Date()
            };

            let id = currentDrawingId;

            // add new document if no ID exists, otherwise update
            if (!id) {
                const docRef = await addDoc(collection(db, "drawings"), drawingData);
                id = docRef.id;
                set({ currentDrawingId: id });
                console.log("Drawing saved with ID:", id);
            } else {
                // update existing doc
                await updateDoc(doc(db, "drawings", id), {
                    ...drawingData,
                    updatedAt: new Date()
                });
                console.log("Drawing updated with ID:", id);
            }

            // refresh the recent drawings list
            await get().fetchRecentDrawings();

            return id;
        } catch (err) {
            console.error("Error saving drawing: ", err);
            return null;
        } finally {
            set({ isSaving: false });
        }
    }, 

    // load a drawing from firestore
    loadDrawing: async (id) => {
        set({ isLoading: true });

        try {
            const docRef = doc(db, "drawings", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // Parse the serialized strokes back into an array
                let loadedStrokes: Stroke[][] = [];
                if (data.serializedStrokes) {
                    try {
                        loadedStrokes = JSON.parse(data.serializedStrokes);
                    } catch (e) {
                        console.error("Error parsing strokes:", e);
                    }
                } else if (data.strokes) {
                    // For backward compatibility with any existing data
                    loadedStrokes = data.strokes;
                }
                
                set({
                    currentDrawingId: id,
                    currentDrawingTitle: data.title || "Untitled Drawing",
                    strokes: loadedStrokes
                });

                console.log("Drawing loaded:", id);
                return true;
            } else { 
                console.error("Drawing not found:", id);
                return false;
            }
        } catch (err) {
            console.error("Error loading drawing:", err)
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchRecentDrawings: async () => {
        set({ isLoading: true });
        
        try {
            const q = query(
                collection(db, "drawings"),
                orderBy("createdAt", "desc"),
                limit(10)
            );
            
            const querySnapshot = await getDocs(q);
            const drawings: Drawing[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // Parse serialized strokes
                let strokes: Stroke[][] = [];
                if (data.serializedStrokes) {
                    try {
                        strokes = JSON.parse(data.serializedStrokes);
                    } catch (e) {
                        console.error("Error parsing strokes for drawing", doc.id, e);
                    }
                } else if (data.strokes) {
                    // For backward compatibility with any existing data
                    strokes = data.strokes;
                }
                
                drawings.push({
                    id: doc.id,
                    title: data.title || "Untitled Drawing",
                    strokes: strokes,
                    createdAt: data.createdAt?.toDate() || new Date()
                });
            });
            
            set({ recentDrawings: drawings });
            console.log("Fetched recent drawings:", drawings.length);
        } catch (error) {
            console.error("Error fetching recent drawings:", error);
        } finally {
            set({ isLoading: false });
        }
    }
}));
