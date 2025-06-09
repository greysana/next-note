/* eslint-disable @typescript-eslint/no-explicit-any */
export type RichTextEditorProps = {
  content?: string;
  onChange?: (content: string) => void;
};

export type IconButtonProps = {
  onClick?: () => void;
  isActive?: boolean;
  icon?: any;
  iconSize?: number;
  title?: string;
  className?: string;
  disabled?: boolean;
};
export type MediaTableGroupProps = {
  editor: any; 
  onImageClick: () => void;
  onFileUploadClick: () => void;
  onTableClick: () => void;
  onTableControlsClick: () => void;
  onVideoClick: () => void;
  onAudioClick: () => void;
  onAudioRecordClick: () => void;
  onMediaFileUploadClick: () => void;
  showImageInput: boolean;
  showTableControls: boolean;
  isInTable: boolean;
};