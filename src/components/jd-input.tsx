"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";

interface JDInputProps {
  onJDTextChange: (text: string) => void;
  onJDFileChange: (file: File | null) => void;
}

export function JDInput({ onJDTextChange, onJDFileChange }: JDInputProps) {
  const [mode, setMode] = useState<"paste" | "upload">("paste");
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (value: string) => {
    setJdText(value);
    onJDTextChange(value);
  };

  const handleFileSelect = (file: File | null) => {
    setJdFile(file);
    onJDFileChange(file);
  };

  return (
    <Card className="surface-lavender border-lavender-wash">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded border border-chalk bg-paper text-sm font-semibold text-iris">
            1
          </span>
          <div>
            <CardTitle>Job description</CardTitle>
            <CardDescription>Paste the JD text or upload a file</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex gap-1 rounded border border-chalk bg-paper p-1">
          <button
            type="button"
            onClick={() => setMode("paste")}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "paste"
                ? "bg-mist text-ink"
                : "text-pencil hover:text-ink"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === "upload"
                ? "bg-mist text-ink"
                : "text-pencil hover:text-ink"
            }`}
          >
            Upload file
          </button>
        </div>

        {mode === "paste" ? (
          <textarea
            className="min-h-[200px] w-full rounded border border-chalk bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-fog focus:border-signal-blue focus:outline-none focus:ring-2 focus:ring-signal-blue/20"
            placeholder="Paste job description text here..."
            value={jdText}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        ) : (
          <div
            className={`flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed p-8 text-center transition-colors ${
              isDragOver
                ? "border-signal-blue bg-lavender-wash"
                : "border-chalk hover:border-signal-blue/50 hover:bg-mist"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
            />
            {jdFile ? (
              <div className="space-y-2">
                <p className="font-medium text-ink">{jdFile.name}</p>
                <p className="text-sm text-pencil">
                  {(jdFile.size / 1024).toFixed(0)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileSelect(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <>
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
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <p className="mb-1 text-sm font-medium text-ink">Upload JD file</p>
                <p className="text-xs text-pencil">PDF, DOCX, or TXT · Max 10 MB</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
