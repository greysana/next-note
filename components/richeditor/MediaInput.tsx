import React, { useState } from 'react';
import { Editor } from '@tiptap/react';

interface MediaInputProps {
  editor: Editor;
  mediaType: 'video' | 'audio';
  isVisible: boolean;
  onCancel: () => void;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  editor,
  mediaType,
  isVisible,
  onCancel,
}) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('auto');

  const handleAddMedia = () => {
    if (!mediaUrl) return;

    // Add media to the editor based on type
    if (mediaType === 'video') {
      editor.chain().focus().insertContent({
        type: 'video',
        attrs: {
          src: mediaUrl,
          width: width,
          height: height,
        },
      }).run();
    } else {
      editor.chain().focus().insertContent({
        type: 'audio',
        attrs: {
          src: mediaUrl,
          width: width,
        },
      }).run();
    }

    // Reset form and close
    setMediaUrl('');
    setWidth('100%');
    setHeight('auto');
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="sticky bottom-[130px] left-1/2 -translate-x-1/2 max-w-[400px] p-4 bg-gray-50 rounded-lg border border-gray-300 shadow-sm">
      <h3 className="text-lg font-medium mb-3">
        Add {mediaType === 'video' ? 'Video' : 'Audio'}
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">
            {mediaType === 'video' ? 'Video' : 'Audio'} URL:
          </label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`Enter ${mediaType} URL...`}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Width:</label>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="100%, 400px, etc."
            />
          </div>
          
          {mediaType === 'video' && (
            <div>
              <label className="block text-sm font-medium mb-1">Height:</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="auto, 300px, etc."
              />
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleAddMedia}
            disabled={!mediaUrl}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add {mediaType === 'video' ? 'Video' : 'Audio'}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};