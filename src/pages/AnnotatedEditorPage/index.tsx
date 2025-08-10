import AnnotatedTextEditor from "@/components/AnnotatedTextEditor";
import { useRef } from "react";
import html2canvas from "html2canvas-pro";
import { toast } from "sonner";

const AnnotatedEditorPage = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    if (!editorRef.current) {
      console.error("Editor ref not found");
      return;
    }

    try {
      toast("Capturing document...", { duration: 1000 });

      const canvas = await html2canvas(editorRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
        height: editorRef.current.scrollHeight,
        windowHeight: editorRef.current.scrollHeight,
      });

      const link = document.createElement("a");
      link.download = `document-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error capturing document:", error);
    }
  };

  return (
    <div className='' ref={editorRef}>
      <div className='bg-white rounded-lg shadow-lg p-6'>
        <AnnotatedTextEditor
          initialMode='text'
          onSave={handleSave}
          className='min-h-screen'
        />
      </div>
    </div>
  );
};

export default AnnotatedEditorPage;
