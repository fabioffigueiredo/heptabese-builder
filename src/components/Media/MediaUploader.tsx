import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link, FileText, Video, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { DrawingElement } from "@/types/whiteboard";

interface MediaUploaderProps {
  onMediaAdd: (element: DrawingElement) => void;
  position: { x: number; y: number };
}

export default function MediaUploader({ onMediaAdd, position }: MediaUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        let type: 'image' | 'video' | 'pdf';
        
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        } else if (file.type === 'application/pdf') {
          type = 'pdf';
        } else {
          toast.error("Unsupported file type");
          return;
        }

        const element: DrawingElement = {
          id: `${type}-${Date.now()}`,
          type,
          position,
          size: type === 'image' ? { width: 300, height: 200 } : { width: 400, height: 300 },
          properties: {
            src: result,
            alt: file.name,
            title: file.name,
          },
          layer: 1,
        };

        onMediaAdd(element);
        toast.success(`${type} uploaded successfully`);
        setIsOpen(false);
      };

      reader.readAsDataURL(file);
    });
  }, [onMediaAdd, position]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  const handleLinkAdd = () => {
    if (!linkUrl) {
      toast.error("Please enter a URL");
      return;
    }

    const element: DrawingElement = {
      id: `link-${Date.now()}`,
      type: 'link',
      position,
      size: { width: 300, height: 100 },
      properties: {
        url: linkUrl,
        title: linkTitle || linkUrl,
        description: linkDescription,
      },
      layer: 1,
    };

    onMediaAdd(element);
    toast.success("Link added successfully");
    setIsOpen(false);
    setLinkUrl("");
    setLinkTitle("");
    setLinkDescription("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Add Media
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Media to Whiteboard</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label className="text-sm font-medium">Upload Files</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <div className="flex gap-2">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <Video className="h-6 w-6 text-muted-foreground" />
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop files or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: Images, Videos, PDFs
                </p>
              </div>
            </div>
          </div>

          {/* Link Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Or Add a Link</Label>
            <div className="space-y-2">
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Input
                placeholder="Link title (optional)"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
              />
              <Textarea
                placeholder="Description (optional)"
                value={linkDescription}
                onChange={(e) => setLinkDescription(e.target.value)}
                rows={2}
              />
              <Button 
                onClick={handleLinkAdd}
                disabled={!linkUrl}
                className="w-full"
              >
                <Link className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}