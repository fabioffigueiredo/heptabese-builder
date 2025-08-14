import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Image as ImageIcon,
  Save,
  X,
  Hash
} from "lucide-react";

interface InlineEditorProps {
  title: string;
  content: string;
  tags: string[];
  onSave: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}

export default function InlineEditor({
  title,
  content,
  tags,
  onSave,
  onCancel
}: InlineEditorProps) {
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [editTags, setEditTags] = useState(tags.join(", "));
  const [selectedText, setSelectedText] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onSave({
      title: editTitle,
      content: editContent,
      tags: editTags.split(",").map(tag => tag.trim()).filter(tag => tag),
    });
  };

  const handleTextFormat = (format: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    
    let formattedText = "";
    let newContent = "";
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'ordered-list':
        formattedText = `\n1. ${selectedText}`;
        break;
      case 'quote':
        formattedText = `\n> ${selectedText}`;
        break;
      case 'link':
        formattedText = `[${selectedText || 'Link text'}](url)`;
        break;
    }
    
    newContent = editContent.substring(0, start) + formattedText + editContent.substring(end);
    setEditContent(newContent);
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const handleImageInsert = () => {
    const imageMarkdown = `\n![Image description](image-url)\n`;
    const textarea = contentRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const newContent = editContent.substring(0, start) + imageMarkdown + editContent.substring(start);
      setEditContent(newContent);
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Title */}
      <Input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="text-lg font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0"
        placeholder="Card title..."
      />

      <Separator />

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted/30 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('underline')}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('list')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('ordered-list')}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('quote')}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleTextFormat('link')}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleImageInsert}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <Textarea
        ref={contentRef}
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        className="flex-1 bg-transparent border-border/50 resize-none focus-visible:ring-1"
        placeholder="Write your thoughts here... Use markdown formatting!"
      />

      {/* Tags */}
      <div className="space-y-2">
        <Input
          value={editTags}
          onChange={(e) => setEditTags(e.target.value)}
          placeholder="tag1, tag2, tag3..."
          className="text-sm bg-transparent border-border/50"
        />
        
        {/* Tag Preview */}
        {editTags && (
          <div className="flex flex-wrap gap-1">
            {editTags.split(",").map((tag, index) => {
              const trimmedTag = tag.trim();
              if (!trimmedTag) return null;
              return (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  <Hash className="h-2.5 w-2.5 mr-1" />
                  {trimmedTag}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleSave} variant="default">
          <Save className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button size="sm" onClick={onCancel} variant="ghost">
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}