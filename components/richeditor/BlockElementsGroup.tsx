import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaQuoteRight, FaCode, FaMinus } from "react-icons/fa";

type BlockElementsGroupProps = {
  editor: Editor;
};

export const BlockElementsGroup = ({ editor }: BlockElementsGroupProps) => {
  const toggleBlockquote = () => {
    if (editor.isActive("blockquote")) {
      editor.chain().focus().lift("blockquote").run();
    } else {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  const toggleCodeBlock = () => {
    if (editor.isActive("codeBlock")) {
      editor.chain().focus().toggleCodeBlock().run();
    } else {
      // Clear formatting before applying code block
      editor.chain().focus().clearNodes().toggleCodeBlock().run();
    }
  };
  const addHorizontalRule = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <div className="flex gap-1 mr-3 items-center">
      <IconButton
        onClick={toggleBlockquote}
        isActive={editor.isActive("blockquote")}
        icon={FaQuoteRight}
        title="Quote Block"
      />
      <IconButton
        onClick={toggleCodeBlock}
        isActive={editor.isActive("codeBlock")}
        icon={FaCode}
        title="Code Block"
      />
       <IconButton
        onClick={addHorizontalRule}
        isActive={false}
        icon={FaMinus}
        title="Insert Horizontal Line"
      />
    </div>
  );
};
