import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaExternalLinkSquareAlt } from "react-icons/fa";

type LinkCardGroupProps = {
  editor: Editor;
  onLinkCardClick: () => void;
};

export const LinkCardGroup = ({  onLinkCardClick }: LinkCardGroupProps) => {
  return (
    <div className="flex gap-1 mr-3 items-center">
      <IconButton
        onClick={onLinkCardClick}
        isActive={false}
        icon={FaExternalLinkSquareAlt}
        title="Insert Link Card"
      />
    </div>
  );
};