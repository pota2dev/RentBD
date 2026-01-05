"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle, Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useRef, useEffect, useState } from "react";

interface ImageUploadProps {
  images: string[];
  onUpload: (files: File[]) => Promise<void>;
  onRemove: (url: string) => void;
  uploading: boolean;
}

export default function FileUpload01({ images, onUpload, onRemove, uploading }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
        onUpload(imageFiles);
    }
  };

  const handleBoxClick = () => {
    if (!uploading) {
        fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        if (e.clipboardData?.files.length) {
            const pastedFiles = Array.from(e.clipboardData.files).filter(f => f.type.startsWith('image/'));
            if (pastedFiles.length > 0) {
                e.preventDefault();
                onUpload(pastedFiles);
            }
        }
    }; 
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpload]);

  return (
    <Card className="w-full bg-background rounded-lg border-0 shadow-none">
      <CardContent className="p-0 space-y-4">
        
        {/* Dropzone */}
        <div
          className={cn(
            "border-2 border-dashed border-border rounded-md p-8 flex flex-col items-center justify-center text-center transition-colors",
            isDragOver ? "border-primary bg-primary/5" : "hover:bg-muted/50",
            uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          )}
          onClick={handleBoxClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploading ? (
             <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
          ) : (
            <div className="mb-2 bg-muted rounded-full p-3">
               <Upload className="h-5 w-5 text-muted-foreground" />
             </div>
          )}
          
          <p className="text-sm font-medium text-foreground">
            {uploading ? "Uploading images..." : "Upload property images"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag and drop, paste from clipboard, or <span className="text-primary font-medium hover:underline">browse</span>
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={(e) => {
                handleFileSelect(e.target.files);
                // Reset input so same file can be selected again if needed (though tricky with strict React state, usually fine)
                e.target.value = ''; 
            }}
          />
        </div>

        {/* Local/Existing File List */}
        {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {images.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative group border rounded-lg overflow-hidden h-24 bg-muted">
                        <img 
                            src={url} 
                            alt={`Property image ${index + 1}`} 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onRemove(url)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        <div className="flex justify-between items-center pt-2">
             <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HelpCircle className="h-3 w-3" />
                <span>Supported: JPG, PNG, WEBP (Max 5MB)</span>
             </div>
             <div className="text-xs text-muted-foreground">
                 {images.length} images uploaded
             </div>
        </div>

      </CardContent>
    </Card>
  );
}
