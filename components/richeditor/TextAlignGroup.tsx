import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from "react-icons/fa";

type TextAlignGroupProps = {
  editor: Editor;
};

export const TextAlignGroup = ({ editor }: TextAlignGroupProps) => (
  <div className="flex gap-1 mr-3 items-center">
    <IconButton
      onClick={() => editor.chain().focus().setTextAlign("left").run()}
      isActive={editor.isActive({ textAlign: "left" }) || (!editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }) && !editor.isActive({ textAlign: "justify" }))}
      icon={FaAlignLeft}
      title="Align Left"
    />
    <IconButton
      onClick={() => editor.chain().focus().setTextAlign("center").run()}
      isActive={editor.isActive({ textAlign: "center" })}
      icon={FaAlignCenter}
      title="Align Center"
    />
    <IconButton
      onClick={() => editor.chain().focus().setTextAlign("right").run()}
      isActive={editor.isActive({ textAlign: "right" })}
      icon={FaAlignRight}
      title="Align Right"
    />
    <IconButton
      onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      isActive={editor.isActive({ textAlign: "justify" })}
      icon={FaAlignJustify}
      title="Justify"
    />
  </div>
);