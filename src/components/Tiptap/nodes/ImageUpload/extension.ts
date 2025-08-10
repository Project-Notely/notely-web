import { ImageUploadNodeView } from "@/components/Tiptap/nodes/ImageUpload/nodeview";
import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/react";

export type UploadFunction = (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
) => Promise<string>;

export interface ImageUploadNodeOptions {
  accept?: string;
  limit?: number;
  maxSize?: number;
  upload?: UploadFunction;
  onError?: (error: Error) => void;
  onSuccess?: (url: string) => void;
}

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUploadNode: (options?: ImageUploadNodeOptions) => ReturnType;
    };
  }
}

export const ImageUploadNode = Node.create<ImageUploadNodeOptions>({
  name: "imageUpload",
  group: "block",
  draggable: true,
  atom: true,
  addOptions() {
    return {
      accept: "image/*",
      limit: 1,
      maxSize: 0,
      upload: undefined,
      onError: undefined,
      onSuccess: undefined,
    };
  },
  addAttributes() {
    return {
      accept: { default: this.options.accept },
      limit: { default: this.options.limit },
      maxSize: { default: this.options.maxSize },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="image-upload"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ "data-type": "image-upload" }, HTMLAttributes),
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeView);
  },
  addCommands() {
    return {
      setImageUploadNode:
        (options = {}) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: options }),
    };
  },
});

export default ImageUploadNode;
