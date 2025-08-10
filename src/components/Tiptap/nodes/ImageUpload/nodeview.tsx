"use client";

import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { UploadCloud, X } from "lucide-react";
import * as React from "react";

export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  url?: string;
  abortController?: AbortController;
}

export interface UploadOptions {
  maxSize: number;
  limit: number;
  accept: string;
  upload: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    signal: AbortSignal
  ) => Promise<string>;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

function useFileUpload(options: UploadOptions) {
  const [fileItem, setFileItem] = React.useState<FileItem | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    if (file.size > options.maxSize) {
      const error = new Error(
        `File size exceeds maximum allowed (${options.maxSize / 1024 / 1024}MB)`
      );
      options.onError?.(error);
      return null;
    }

    const abortController = new AbortController();
    const nextItem: FileItem = {
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "uploading",
      abortController,
    };
    setFileItem(nextItem);

    try {
      const url = await options.upload(
        file,
        ({ progress }) =>
          setFileItem(prev => (prev ? { ...prev, progress } : prev)),
        abortController.signal
      );

      if (!abortController.signal.aborted) {
        setFileItem(prev =>
          prev ? { ...prev, status: "success", url, progress: 100 } : prev
        );
        options.onSuccess?.(url);
      }
      return url;
    } catch (e) {
      if (!abortController.signal.aborted) {
        setFileItem(prev =>
          prev ? { ...prev, status: "error", progress: 0 } : prev
        );
        options.onError?.(e instanceof Error ? e : new Error("Upload failed"));
      }
      return null;
    }
  };

  const uploadFiles = async (files: File[]): Promise<string | null> => {
    if (!files?.length) {
      options.onError?.(new Error("No files to upload"));
      return null;
    }
    if (options.limit && files.length > options.limit) {
      options.onError?.(
        new Error(
          `Maximum ${options.limit} file${options.limit === 1 ? "" : "s"} allowed`
        )
      );
      return null;
    }
    return uploadFile(files[0]!);
  };

  const clearFileItem = () => {
    if (!fileItem) return;
    fileItem.abortController?.abort();
    if (fileItem.url) URL.revokeObjectURL(fileItem.url);
    setFileItem(null);
  };

  return { fileItem, uploadFiles, clearFileItem };
}

export const ImageUploadNodeView: React.FC<NodeViewProps> = props => {
  const { accept, limit, maxSize } = props.node.attrs;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const extension = props.extension;

  const uploadOptions: UploadOptions = {
    maxSize,
    limit,
    accept,
    upload: extension.options.upload,
    onSuccess: extension.options.onSuccess,
    onError: extension.options.onError,
  };

  const { fileItem, uploadFiles, clearFileItem } = useFileUpload(uploadOptions);

  const handleUpload = async (files: File[]) => {
    const url = await uploadFiles(files);
    if (url) {
      const pos = props.getPos();
      const filename = files[0]?.name.replace(/\.[^/.]+$/, "") || "image";
      if (typeof pos === "number" && pos >= 0) {
        props.editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + 1 })
          .insertContentAt(pos, [
            {
              type: "image",
              attrs: { src: url, alt: filename, title: filename },
            },
          ])
          .run();
      }
    }
  };

  const handleClick = () => {
    if (inputRef.current && !fileItem) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  return (
    <NodeViewWrapper
      className='outline-none'
      tabIndex={0}
      onClick={handleClick}
    >
      {!fileItem ? (
        <div className='flex items-center justify-center rounded-md border-2 border-dashed border-slate-300 p-6 text-slate-600 hover:border-slate-400 cursor-pointer select-none'>
          <div className='flex items-center gap-3'>
            <div className='rounded-md bg-slate-100 p-2 text-slate-700'>
              <UploadCloud className='h-5 w-5' />
            </div>
            <div className='text-sm'>
              <p>
                <span className='font-medium'>Click to upload</span> or drag &
                drop
              </p>
              <p className='text-xs text-slate-500'>
                Max size {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative rounded-md border border-slate-200 p-3'>
          {fileItem.status === "uploading" && (
            <div className='absolute left-0 top-0 h-1 w-full overflow-hidden rounded-t-md bg-slate-200'>
              <div
                className='h-full bg-blue-500 transition-[width]'
                style={{ width: `${fileItem.progress}%` }}
              />
            </div>
          )}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='rounded-md bg-slate-100 p-2 text-slate-700'>
                <UploadCloud className='h-5 w-5' />
              </div>
              <div className='text-sm'>
                <p className='font-medium'>{fileItem.file.name}</p>
                <p className='text-xs text-slate-500'>
                  {(fileItem.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type='button'
              className='inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 text-slate-600'
              onClick={e => {
                e.stopPropagation();
                clearFileItem();
              }}
              aria-label='Remove'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        name='file'
        accept={accept}
        type='file'
        className='hidden'
        onChange={e => {
          const files = e.target.files;
          if (!files?.length) {
            extension.options.onError?.(new Error("No file selected"));
            return;
          }
          handleUpload(Array.from(files));
        }}
        onClick={e => e.stopPropagation()}
      />
    </NodeViewWrapper>
  );
};

export default ImageUploadNodeView;
