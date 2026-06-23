"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

interface CVMultiUploadProps {
  onCVFilesChange: (files: File[]) => void;
}

export function CVMultiUpload({ onCVFilesChange }: CVMultiUploadProps) {
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);
    const allFiles = [...cvFiles, ...newFiles];
    setCvFiles(allFiles);
    onCVFilesChange(allFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = cvFiles.filter((_, i) => i !== index);
    setCvFiles(newFiles);
    onCVFilesChange(newFiles);
  };

  return (
    <Card className="surface-mint border-mint-whisper">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-chalk bg-paper text-sm font-semibold text-success">
            2
          </span>
          <div>
            <CardTitle>Candidate CVs</CardTitle>
            <CardDescription>Upload one or multiple CV files</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div
          className={`flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed p-8 text-center transition-colors ${
            isDragOver
              ? "border-signal-blue bg-mint-whisper"
              : "border-chalk hover:border-signal-blue/50 hover:bg-paper"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded border border-chalk bg-paper">
            <svg
              className="h-5 w-5 text-iris"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 21V7.5m0 0L3 12m4.5-4.5L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
          </div>
          <p className="mb-1 text-sm font-medium text-ink">Upload CV files</p>
          <p className="text-xs text-pencil">
            PDF, DOCX, or TXT · Drag multiple files or click to browse
          </p>
        </div>

        {cvFiles.length > 0 && (
          <div className="space-y-2">
            <p className="eyebrow">
              {cvFiles.length} file{cvFiles.length !== 1 ? "s" : ""} selected
            </p>
            {cvFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="animate-fade-in flex items-center justify-between rounded border border-chalk bg-paper px-3 py-2.5 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <svg
                    className="size-4 shrink-0 text-fog"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <span className="truncate font-medium text-ink">{file.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-fog">
                    {(file.size / 1024).toFixed(0)} KB
                  </span>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-xs text-pencil underline hover:text-signal-blue"
                  onClick={() => removeFile(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
