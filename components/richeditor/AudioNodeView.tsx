/* extensions/AudioNodeView.tsx */
import React, { useState, useEffect, useRef } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import WaveSurfer from "wavesurfer.js";

// Helper function to generate a simple unique ID for the waveform container
const generateId = () => `waveform-${Math.random().toString(36).substr(2, 9)}`;

export const AudioNodeView: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  editor,
}) => {
  const [isEditing, setIsEditing] = useState(!node.attrs.src);
  const [tempSrc, setTempSrc] = useState(node.attrs.src || "");
  const [tempWidth, setTempWidth] = useState(node.attrs.width || "100%");

  const waveformContainerId = useRef(generateId());
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const wavesurferInstanceRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingWaveform, setIsLoadingWaveform] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  const { src, width } = node.attrs;

  useEffect(() => {
    if (isEditing || !src || !waveformRef.current) {
      wavesurferInstanceRef.current?.destroy();
      wavesurferInstanceRef.current = null;
      setIsPlaying(false);
      return;
    }

    setIsLoadingWaveform(true);

    // Small delay to ensure container is properly mounted
    const initWavesurfer = () => {
      const containerElement = document.getElementById(
        waveformContainerId.current
      );
      if (!containerElement) {
        console.warn("Container not found");
        setIsLoadingWaveform(false);
        return;
      }

      // Ensure container has dimensions
      if (containerElement.offsetWidth === 0) {
        console.warn("Container has zero width, retrying...");
        // Retry after a short delay
        setTimeout(initWavesurfer, 100);
        return;
      }

      try {
        wavesurferInstanceRef.current = WaveSurfer.create({
          container: containerElement,
          waveColor: "rgb(160, 160, 160)",
          progressColor: "rgb(63, 81, 181)",
          url: src,
          barWidth: 3,
          barGap: 2,
          barRadius: 2,
          height: 80,
          cursorWidth: 2,
          cursorColor: "rgb(255, 0, 0)",
          normalize: true,
        });

        wavesurferInstanceRef.current.on("ready", () => {
          setIsLoadingWaveform(false);
        });
        wavesurferInstanceRef.current.on("play", () => {
          setIsPlaying(true);
          setShowPlayButton(false);
        });
        wavesurferInstanceRef.current.on("pause", () => {
          setIsPlaying(false);
          setShowPlayButton(true);
        });
        wavesurferInstanceRef.current.on("finish", () => {
          setIsPlaying(false);
          setShowPlayButton(true);
        });
        wavesurferInstanceRef.current.on("error", (err) => {
          console.error("Wavesurfer error:", err);
          setIsLoadingWaveform(false);
        });
      } catch (error) {
        console.error("Failed to create WaveSurfer:", error);
        setIsLoadingWaveform(false);
      }
    };

    // Start initialization after a small delay
    const timeout = setTimeout(initWavesurfer, 50);

    return () => {
      clearTimeout(timeout);
      wavesurferInstanceRef.current?.destroy();
      wavesurferInstanceRef.current = null;
    };
  }, [src, isEditing, editor.isEditable]);

  const handleSave = () => {
    wavesurferInstanceRef.current?.destroy();
    wavesurferInstanceRef.current = null;

    updateAttributes({
      src: tempSrc,
      width: tempWidth,
      controls: false,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempSrc(node.attrs.src || "");
    setTempWidth(node.attrs.width || "100%");
    setIsEditing(false);
  };

  const togglePlayPause = () => {
    wavesurferInstanceRef.current?.playPause();
  };

  const handleDoubleClick = () => {
    if (wavesurferInstanceRef.current) {
      wavesurferInstanceRef.current.stop();
      setIsPlaying(false);
      setShowPlayButton(true);
    }
  };

  const isSelected = editor.isActive(node.type.name) && editor.isEditable;

  return (
    <NodeViewWrapper
      className="audio-wrapper relative group my-4 p-2 rounded-lg"
      style={{ width: isEditing ? "100%" : width }}
    >
      {isEditing && editor.isEditable ? (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Audio URL:
              </label>
              <input
                type="url"
                value={tempSrc}
                onChange={(e) => setTempSrc(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter audio URL..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Player Width:
              </label>
              <input
                type="text"
                value={tempWidth}
                onChange={(e) => setTempWidth(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="100%, 400px, etc."
              />
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
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {src ? (
            <>
              <div 
                className="relative cursor-pointer"
                onClick={togglePlayPause}
                onDoubleClick={handleDoubleClick}
              >
                <div
                  id={waveformContainerId.current}
                  ref={waveformRef}
                  className={`waveform-container transition-opacity duration-300 ${
                    isPlaying ? 'opacity-100' : 'opacity-50'
                  }`}
                />
                {isLoadingWaveform && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <div className="text-center text-gray-500">
                      Loading waveform...
                    </div>
                  </div>
                )}
                {!isLoadingWaveform && wavesurferInstanceRef.current && showPlayButton && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-indigo-600 rounded-full p-4 shadow-lg pointer-events-auto">
                      {isPlaying ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1zm5 0a1 1 0 00-1 1v2a1 1 0 102 0V9a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded p-8 text-center cursor-pointer hover:border-gray-400"
              onClick={() => editor.isEditable && setIsEditing(true)}
            >
              <p className="text-gray-500">Click to add an audio source</p>
            </div>
          )}
          {isSelected && !isEditing && editor.isEditable && (
            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/80 backdrop-blur-sm rounded-bl-md shadow">
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  title="Edit audio"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={deleteNode}
                  className="p-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  title="Delete audio"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002 2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
};