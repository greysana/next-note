import { Editor } from "@tiptap/react";
import { TextFormattingGroup } from "./TextFormattingGroup";
import { HeadingGroup } from "./HeadingGroup";
import { ListGroup } from "./ListGroup";
import { TextAlignGroup } from "./TextAlignGroup";
import { BlockElementsGroup } from "./BlockElementsGroup";
import { LinkGroup } from "./LinkGroup";
import { MediaTableGroup } from "./MediaTableGroup";
import { HistoryGroup } from "./HistoryGroup";

type EditorToolbarProps = {
  editor: Editor;
  onImageClick: () => void;
  onFileUploadClick: () => void;
  onLinkClick: () => void;
  onTableClick: () => void;
  onTableControlsClick: () => void;
  showImageInput: boolean;
  showTableControls: boolean;
  isInTable: boolean;
};

export const EditorToolbar = ({
  editor,
  onImageClick,
  onFileUploadClick,
  onLinkClick,
  onTableClick,
  onTableControlsClick,
  showImageInput,
  showTableControls,
  isInTable,
}: EditorToolbarProps) => {
  return (
    <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
      <TextFormattingGroup editor={editor} />
      <HeadingGroup editor={editor} />
      <ListGroup editor={editor} />
      <TextAlignGroup editor={editor} />
      <BlockElementsGroup editor={editor} />
      <LinkGroup editor={editor} onLinkClick={onLinkClick} />
      <MediaTableGroup
        editor={editor}
        onImageClick={onImageClick}
        onFileUploadClick={onFileUploadClick}
        onTableClick={onTableClick}
        onTableControlsClick={onTableControlsClick}
        showImageInput={showImageInput}
        showTableControls={showTableControls}
        isInTable={isInTable}
      />
      <HistoryGroup editor={editor} />
    </div>
  );
};