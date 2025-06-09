import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaTable, FaImage, FaUpload, FaPlus, FaVideo, FaMusic, FaFileVideo, FaMicrophone } from "react-icons/fa";

type MediaTableGroupProps = {
  editor: Editor;
  onImageClick?: () => void;
  onFileUploadClick?: () => void;
  onTableClick?: () => void;
  onTableControlsClick?: () => void;
  onVideoClick?: () => void; // New prop
  onAudioClick?: () => void; // New prop
  onAudioRecordClick?: () => void; // New prop for recording
  onMediaFileUploadClick?: () => void; // New prop
  showImageInput?: boolean;
  showTableControls?: boolean;
  isInTable?: boolean;
};

export const MediaTableGroup = ({
  onImageClick,
  onFileUploadClick,
  onTableClick,
  onTableControlsClick,
  onVideoClick,
  onAudioClick,
  onAudioRecordClick,
  onMediaFileUploadClick,
  showImageInput,
  showTableControls,
  isInTable,
}: MediaTableGroupProps) => (
  <div className="flex gap-1 mr-3 items-center">
    {/* Image buttons */}
    <IconButton
      onClick={onImageClick}
      isActive={showImageInput}
      icon={FaImage}
      title="Insert Image"
    />
    <IconButton
      onClick={onFileUploadClick}
      isActive={false}
      icon={FaUpload}
      title="Upload Image"
    />
    
    {/* Video buttons */}
    <IconButton
      onClick={onVideoClick}
      isActive={false}
      icon={FaVideo}
      title="Add Video from URL"
    />
    
    {/* Audio buttons */}
    <IconButton
      onClick={onAudioClick}
      isActive={false}
      icon={FaMusic}
      title="Add Audio from URL"
    />
    
    <IconButton
      onClick={onAudioRecordClick}
      isActive={false}
      icon={FaMicrophone}
      title="Record Audio"
    />
    
    {/* Media file upload */}
    <IconButton
      onClick={onMediaFileUploadClick}
      isActive={false}
      icon={FaFileVideo}
      title="Upload Video/Audio File"
    />
    
    {/* Table buttons */}
    <IconButton
      onClick={onTableClick}
      isActive={false}
      icon={FaTable}
      title="Insert Table"
    />
    {isInTable && (
      <IconButton
        onClick={onTableControlsClick}
        isActive={showTableControls}
        icon={FaPlus}
        title="Table Controls"
      />
    )}
  </div>
);