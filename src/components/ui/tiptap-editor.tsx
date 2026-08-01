"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TipTapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export function TipTapEditor({
  content = "",
  onChange,
  placeholder = "اكتب المحتوى هنا...",
  className,
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-right dir-rtl",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className={cn("border border-border rounded-xl overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/40 dir-rtl">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("bold") && "bg-accent text-accent-foreground font-bold"
          )}
          title="عريض"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("italic") && "bg-accent text-accent-foreground"
          )}
          title="مائل"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("heading", { level: 1 }) && "bg-accent text-accent-foreground font-bold"
          )}
          title="عنوان رئيسي"
        >
          <Heading1 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("heading", { level: 2 }) && "bg-accent text-accent-foreground font-bold"
          )}
          title="عنوان فرعي"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("bulletList") && "bg-accent text-accent-foreground"
          )}
          title="قائمة نقطية"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("orderedList") && "bg-accent text-accent-foreground"
          )}
          title="قائمة رقمية"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "p-2 rounded-lg text-xs hover:bg-accent transition-colors",
            editor.isActive("blockquote") && "bg-accent text-accent-foreground"
          )}
          title="اقتباس"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg text-xs hover:bg-accent transition-colors disabled:opacity-50"
          disabled={!editor.can().undo()}
          title="تراجع"
        >
          <Undo className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg text-xs hover:bg-accent transition-colors disabled:opacity-50"
          disabled={!editor.can().redo()}
          title="إعادة"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Content Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
