import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaListUl, FaListOl, FaIndent, FaOutdent } from "react-icons/fa";

type ListGroupProps = {
  editor: Editor;
};

export const ListGroup = ({ editor }: ListGroupProps) => {
  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const handleIndent = () => {
    if (editor.can().sinkListItem("listItem")) {
      editor.chain().focus().sinkListItem("listItem").run();
    }
  };

  const handleOutdent = () => {
    if (editor.can().liftListItem("listItem")) {
      editor.chain().focus().liftListItem("listItem").run();
    }
  };

  const canIndent = editor.can().sinkListItem("listItem");
  const canOutdent = editor.can().liftListItem("listItem");
  const isInList = editor.isActive("bulletList") || editor.isActive("orderedList");

  return (
    <div className="flex gap-1 mr-3 items-center">
      <IconButton
        onClick={toggleBulletList}
        isActive={editor.isActive("bulletList")}
        icon={FaListUl}
        title="Bullet List"
      />
      <IconButton
        onClick={toggleOrderedList}
        isActive={editor.isActive("orderedList")}
        icon={FaListOl}
        title="Numbered List"
      />
      {isInList && (
        <>
          <IconButton
            onClick={handleIndent}
            isActive={false}
            icon={FaIndent}
            title="Increase Indent"
            disabled={!canIndent}
            className={!canIndent ? "opacity-50 cursor-not-allowed" : ""}
          />
          <IconButton
            onClick={handleOutdent}
            isActive={false}
            icon={FaOutdent}
            title="Decrease Indent"
            disabled={!canOutdent}
            className={!canOutdent ? "opacity-50 cursor-not-allowed" : ""}
          />
        </>
      )}
    </div>
  );
};