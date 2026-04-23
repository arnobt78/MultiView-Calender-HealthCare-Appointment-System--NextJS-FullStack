/**
 * FilePreview Component
 * 
 * Universal file preview with zoom for images, PDF embed, and download links.
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText, Image as ImageIcon, File } from "lucide-react";

interface FilePreviewProps {
  url: string;
  filename: string;
  /** Optional, auto-detected if not provided */
  fileType?: string;
}

function getFileType(filename: string): "image" | "pdf" | "other" {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext))
    return "image";
  if (ext === "pdf") return "pdf";
  return "other";
}

function getFileIcon(type: "image" | "pdf" | "other") {
  switch (type) {
    case "image":
      return <ImageIcon className="h-4 w-4" />;
    case "pdf":
      return <FileText className="h-4 w-4" />;
    default:
      return <File className="h-4 w-4" />;
  }
}

export default function FilePreview({ url, filename, fileType }: FilePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const type = fileType ? (fileType as "image" | "pdf" | "other") : getFileType(filename);
  const zoomClass = `file-preview-zoom-${Math.round(zoom * 100)}`;
  const ext = filename.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div className="flex items-center gap-2 p-2 rounded-2xl border hover:bg-muted/50 transition-colors group">
      {getFileIcon(type)}
      <span className="text-sm truncate flex-1">{filename}</span>
      <Badge variant="outline" className="text-[10px]">{ext}</Badge>

      {/* Preview button */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium flex items-center gap-2">
              {getFileIcon(type)} {filename}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {type === "image" && (
              <>
                <div className="overflow-auto max-h-[70vh] w-full flex items-center justify-center bg-muted/20 rounded-lg">
                  <div
                    className={`${zoomClass} max-w-full cursor-zoom-in`}
                    onClick={() => setZoom((z) => (z >= 3 ? 1 : z + 0.5))}
                  >
                    <Image
                      src={url}
                      alt={filename}
                      width={800}
                      height={600}
                      className="max-w-full object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.max(0.5, z - 0.5))}>-</Button>
                  <span>{Math.round(zoom * 100)}%</span>
                  <Button variant="outline" size="sm" onClick={() => setZoom((z) => Math.min(3, z + 0.5))}>+</Button>
                  <Button variant="outline" size="sm" onClick={() => setZoom(1)}>Reset</Button>
                </div>
              </>
            )}
            {type === "pdf" && (
              <iframe
                src={url}
                className="w-full h-[70vh] border rounded-lg"
                title={filename}
              />
            )}
            {type === "other" && (
              <div className="text-center py-8 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Preview not available for this file type.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Download button */}
      <a href={url} download={filename} target="_blank" rel="noopener noreferrer" title={`Download ${filename}`}>
        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
          <Download className="h-3.5 w-3.5" />
        </Button>
      </a>
    </div>
  );
}
