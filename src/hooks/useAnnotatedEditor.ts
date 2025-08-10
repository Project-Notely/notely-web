import { Editor as TiptapEditor } from "@tiptap/react";
import type { Editor as TldrawEditor } from "@tldraw/tldraw";
import { useCallback, useRef } from "react";

export const useAnnotatedEditor = () => {
  const tiptapEditorRef = useRef<TiptapEditor | null>(null);
  const tldrawEditorRef = useRef<TldrawEditor | null>(null);

  const setTiptapEditor = useCallback((editor: TiptapEditor | null) => {
    tiptapEditorRef.current = editor;
  }, []);

  const setTldrawEditor = useCallback((editor: TldrawEditor | null) => {
    tldrawEditorRef.current = editor;
  }, []);

  const downloadScreenshot = useCallback(
    (dataUrl: string, filename: string) => {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    []
  );

  return {
    tiptapEditorRef,
    tldrawEditorRef,
    setTiptapEditor,
    setTldrawEditor,
    downloadScreenshot,
  };
};
