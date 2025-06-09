import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaBold, FaItalic, FaUnderline } from "react-icons/fa";

type TextFormattingGroupProps = {
  editor: Editor;
};

export const TextFormattingGroup = ({ editor }: TextFormattingGroupProps) => (
  <div className="flex gap-1 mr-3 items-center">
    <IconButton
      onClick={() => editor.chain().focus().toggleBold().run()}
      isActive={editor.isActive("bold")}
      icon={FaBold}
      title="Bold (Ctrl+B)"
    />
    <IconButton
      onClick={() => editor.chain().focus().toggleItalic().run()}
      isActive={editor.isActive("italic")}
      icon={FaItalic}
      title="Italic (Ctrl+I)"
    />
    <IconButton
      onClick={() => editor.chain().focus().toggleUnderline().run()}
      isActive={editor.isActive("underline")}
      icon={FaUnderline}
      title="Underline (Ctrl+U)"
    />
  </div>
);

