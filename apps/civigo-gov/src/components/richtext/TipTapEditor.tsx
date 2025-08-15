"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Type,
  Info,
  Link as LinkIcon
} from "lucide-react";


export function TipTapEditor({
  value,
  onChange,
}: {
  value: any;
  onChange: (json: any) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Link.configure({ openOnClick: true, autolink: true }),
    ],
    content: value ?? { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[160px] p-3 border-0 border-t border-gray-200",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(value ?? { type: "doc", content: [{ type: "paragraph" }] }, false);
  }, [value, editor]);

  if (!editor) {
    return <div className="min-h-[160px] p-3 border rounded-md bg-gray-50 animate-pulse" />;
  }

  return (
    <div className="border border-gray-200 rounded-md">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={editor.isActive("bold") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className="h-8 w-8 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive("italic") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className="h-8 w-8 p-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-2" />

        {/* Lists */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={editor.isActive("bulletList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive("orderedList") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            variant={editor.isActive("blockquote") ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className="h-8 w-8 p-0"
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-2" />

        {/* Headings */}
        <div className="flex items-center gap-1 mr-2">
          <Button
            variant={editor.isActive("heading", { level: 2 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className="h-8 px-2 text-xs font-medium"
            title="Heading 2"
          >
            H2
          </Button>

          <Button
            variant={editor.isActive("heading", { level: 3 }) ? "default" : "ghost"}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className="h-8 px-2 text-xs font-medium"
            title="Heading 3"
          >
            H3
          </Button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-300 mr-2" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 mr-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-8 w-8 p-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-8 w-8 p-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Help Button */}
        <div className="relative group">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            title="Formatting Help"
          >
            <Info className="h-4 w-4" />
          </Button>
          {/* Tooltip on hover */}
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-black text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
            <div className="space-y-2">
              <p className="font-medium">Text Formatting Tips:</p>
              <ul className="space-y-1">
                <li>• <strong>Bold:</strong> Ctrl+B or click Bold button</li>
                <li>• <strong>Italic:</strong> Ctrl+I or click Italic button</li>
                <li>• <strong>Lists:</strong> Use bullet or numbered list buttons</li>
                <li>• <strong>Headings:</strong> Use H2/H3 for section titles</li>
                <li>• <strong>Links:</strong> Select text and type a URL</li>
                <li>• <strong>Quote:</strong> Use for important notes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}



