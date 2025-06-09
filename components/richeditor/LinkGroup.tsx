import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaLink, FaUnlink, FaExternalLinkAlt } from "react-icons/fa";

type LinkGroupProps = {
  editor: Editor;
  onLinkClick: () => void;
};

export const LinkGroup = ({ editor, onLinkClick }: LinkGroupProps) => {
  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
  };

  const openLink = () => {
    const { href } = editor.getAttributes("link");
    if (href) {
      window.open(href, "_blank");
    }
  };

  const hasSelection = !editor.state.selection.empty;
  const isInLink = editor.isActive("link");

  return (
    <div className="flex gap-1 mr-3 items-center">
      <IconButton
        onClick={onLinkClick}
        isActive={isInLink}
        icon={FaLink}
        title={hasSelection ? "Add Link" : "Select text first to add link"}
        className={!hasSelection && !isInLink ? "opacity-50" : ""}
      />
      
      {isInLink && (
        <>
          <IconButton
            onClick={openLink}
            isActive={false}
            icon={FaExternalLinkAlt}
            title="Open Link"
          />
          <IconButton
            onClick={removeLink}
            isActive={false}
            icon={FaUnlink}
            title="Remove Link"
          />
        </>
      )}
    </div>
  );
};
