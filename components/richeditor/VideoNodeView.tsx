import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';

export const VideoNodeView: React.FC<NodeViewProps> = ({ node, updateAttributes, deleteNode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSrc, setTempSrc] = useState(node.attrs.src || '');
  const [tempWidth, setTempWidth] = useState(node.attrs.width || '100%');
  const [tempHeight, setTempHeight] = useState(node.attrs.height || 'auto');

  const handleSave = () => {
    updateAttributes({
      src: tempSrc,
      width: tempWidth,
      height: tempHeight,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSrc(node.attrs.src || '');
    setTempWidth(node.attrs.width || '100%');
    setTempHeight(node.attrs.height || 'auto');
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="video-wrapper relative group my-4">
      {isEditing ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Video URL:</label>
              <input
                type="url"
                value={tempSrc}
                onChange={(e) => setTempSrc(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter video URL..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Width:</label>
                <input
                  type="text"
                  value={tempWidth}
                  onChange={(e) => setTempWidth(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="100%, 400px, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height:</label>
                <input
                  type="text"
                  value={tempHeight}
                  onChange={(e) => setTempHeight(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="auto, 300px, etc."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {node.attrs.src ? (
            <video
              src={node.attrs.src}
              controls={node.attrs.controls}
              style={{
                width: node.attrs.width,
                height: node.attrs.height,
                maxWidth: '100%',
              }}
              className="rounded"
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
              <p className="text-gray-500">No video source provided</p>
            </div>
          )}
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                title="Edit video"
              >
                Edit
              </button>
              <button
                onClick={deleteNode}
                className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                title="Delete video"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};
