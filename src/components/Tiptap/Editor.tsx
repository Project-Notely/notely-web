import type { Editor } from "@tiptap/react";
import { EditorContent, EditorContext, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import * as React from "react";

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Selection } from "@tiptap/extensions";
import { StarterKit } from "@tiptap/starter-kit";

// --- Local Extensions / Nodes ---
import { TailwindBlockquote } from "@/components/Tiptap/extensions/Blockquote";
import { TailwindCodeBlock } from "@/components/Tiptap/extensions/CodeBlock";
import { TailwindHeading } from "@/components/Tiptap/extensions/Heading";
import { HorizontalRule } from "@/components/Tiptap/extensions/HorizontalRule";
import { ImageUploadNode } from "@/components/Tiptap/nodes/ImageUpload/extension";

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

// --- Content ---
import content from "@/components/Tiptap/content.json";

interface TiptapEditorProps {
  onEditorReady?: (editor: Editor | null) => void;
  onChange?: () => void;
}

export function TiptapEditor({
  onEditorReady,
  onChange,
}: TiptapEditorProps = {}) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TailwindHeading,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      TailwindBlockquote,
      TailwindCodeBlock,
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: error => console.error("Upload failed:", error),
      }),
    ],
    content,
    onUpdate: () => {
      onChange?.();
    },
  });

  React.useEffect(() => {
    onEditorReady?.(editor);
  }, [editor, onEditorReady]);

  const providerValue = React.useMemo(() => ({ editor }), [editor]);

  return (
    <EditorContext.Provider value={providerValue}>
      <div className='content-wrapper h-full overflow-auto'>
        {editor && (
          <>
            <EditorContent
              editor={editor}
              role='presentation'
              className='simple-editor-content w-full mx-auto px-12 py-12 md:px-6 md:py-6'
            />
            <BubbleMenu editor={editor}>
              <div className='flex items-center gap-1 rounded-md bg-black/80 p-1 text-white shadow-md'>
                <button
                  className='px-2 py-1 rounded hover:bg-white/10'
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  aria-label='Toggle bold'
                >
                  B
                </button>
                <button
                  className='px-2 py-1 rounded hover:bg-white/10'
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  aria-label='Toggle italic'
                >
                  I
                </button>
                <button
                  className='px-2 py-1 rounded hover:bg-white/10'
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                  aria-label='Toggle strike'
                >
                  S
                </button>
              </div>
            </BubbleMenu>
          </>
        )}
      </div>
    </EditorContext.Provider>
  );
}

export default TiptapEditor;
