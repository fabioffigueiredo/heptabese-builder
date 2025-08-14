import { useState, useRef, useEffect } from "react";
import { DrawingElement } from "@/types/whiteboard";

interface StickyNoteProps {
  element: DrawingElement;
  onUpdate: (id: string, updates: Partial<DrawingElement>) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

export default function StickyNote({ element, onUpdate, onDelete, isSelected }: StickyNoteProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.properties.stickyText || "New note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const stickyColor = element.properties.stickyColor || "#fbbf24"; // Default yellow

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(element.id, {
      properties: {
        ...element.properties,
        stickyText: text,
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleBlur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setText(element.properties.stickyText || "New note");
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(element.id);
  };

  return (
    <div
      className={`absolute cursor-pointer select-none group ${
        isSelected ? "ring-2 ring-blue-500" : ""
      }`}
      style={{
        left: element.position.x,
        top: element.position.y,
        width: element.size?.width || 200,
        height: element.size?.height || 150,
        zIndex: element.layer + 10,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600 z-10"
      >
        ×
      </button>

      {/* Sticky note body */}
      <div
        className="w-full h-full rounded-lg shadow-lg relative"
        style={{
          backgroundColor: stickyColor,
          transform: "rotate(-1deg)",
        }}
      >
        {/* Sticky note header/tab */}
        <div
          className="absolute -top-2 left-4 w-8 h-4 rounded-t opacity-60"
          style={{
            backgroundColor: stickyColor,
            filter: "brightness(0.9)",
          }}
        />

        {/* Content area */}
        <div className="p-4 w-full h-full">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full bg-transparent border-none outline-none resize-none text-gray-800 text-sm font-handwriting"
              style={{
                fontFamily: "Comic Sans MS, cursive",
                lineHeight: "1.4",
              }}
              placeholder="Write your note..."
            />
          ) : (
            <div
              className="w-full h-full text-gray-800 text-sm whitespace-pre-wrap break-words overflow-hidden"
              style={{
                fontFamily: "Comic Sans MS, cursive",
                lineHeight: "1.4",
              }}
            >
              {text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}