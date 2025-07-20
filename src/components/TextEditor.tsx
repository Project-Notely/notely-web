import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import "@/components/tiptap-templates/simple/simple-editor.scss";
import React from "react";

interface TextEditorProps {
  className?: string;
  placeholder?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  className = "",
  placeholder = "Start writing...",
}) => {
  return (
    <div className={`tiptap-editor-wrapper ${className}`}>
      <SimpleEditor />
    </div>
  );
};

export default TextEditor;
