import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaUndo, FaRedo } from "react-icons/fa";

type HistoryGroupProps = {
  editor: Editor;
};

export const HistoryGroup = ({ editor }: HistoryGroupProps) => (
  <div className="flex gap-1 items-center">
    <IconButton
      onClick={() => editor.chain().focus().undo().run()}
      isActive={false}
      icon={FaUndo}
      title="Undo (Ctrl+Z)"
      className={!editor.can().undo() ? "opacity-50 cursor-not-allowed" : ""}
    />
    <IconButton
      onClick={() => editor.chain().focus().redo().run()}
      isActive={false}
      icon={FaRedo}
      title="Redo (Ctrl+Y)"
      className={!editor.can().redo() ? "opacity-50 cursor-not-allowed" : ""}
    />
  </div>
);
