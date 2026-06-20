import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, List, ListOrdered, Code, Quote } from 'lucide-react';
import { useEffect } from 'react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-zinc-700 bg-zinc-800/50 rounded-t-md">
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run(); }}
        className={`p-1.5 rounded hover:bg-zinc-700 transition-colors ${editor.isActive('bold') ? 'bg-zinc-700 text-blue-400' : 'text-zinc-400'}`}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run(); }}
        className={`p-1.5 rounded hover:bg-zinc-700 transition-colors ${editor.isActive('italic') ? 'bg-zinc-700 text-blue-400' : 'text-zinc-400'}`}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-700 mx-1" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run(); }}
        className={`p-1.5 rounded hover:bg-zinc-700 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-700 text-blue-400' : 'text-zinc-400'}`}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run(); }}
        className={`p-1.5 rounded hover:bg-zinc-700 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-700 text-blue-400' : 'text-zinc-400'}`}
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
      <div className="w-px h-4 bg-zinc-700 mx-1" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run(); }}
        className={`p-1.5 rounded hover:bg-zinc-700 transition-colors ${editor.isActive('codeBlock') ? 'bg-zinc-700 text-blue-400' : 'text-zinc-400'}`}
        title="Code Block"
      >
        <Code size={16} />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run(); }}
        className={`p-1.5 rounded hover:bg-zinc-700 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-700 text-blue-400' : 'text-zinc-400'}`}
        title="Quote"
      >
        <Quote size={16} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder = "Write something..." }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[100px] p-3 focus:outline-none focus:ring-0',
      },
    },
  });

  // Keep content synced if it changes externally (e.g. loading a new task)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // only update if content is completely different
      if (!content && editor.getHTML() === '<p></p>') return;
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  return (
    <div className="border border-zinc-700 rounded-md bg-zinc-900/50 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
      <MenuBar editor={editor} />
      <div className="bg-zinc-900/30">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
