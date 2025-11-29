/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";

interface CustomImageAttributes {
  ID?: string;
  src?: string;
  alt?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
  "data-align"?: "left" | "center" | "right" | "none";
  "data-style-border"?: string;
  linkHref?: string;
  rotation?: number;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImage: {
      setCustomImage: (options: CustomImageAttributes) => ReturnType;
      updateCustomImageAttributes: (
        attributes: Partial<CustomImageAttributes>
      ) => ReturnType;
    };
  }
}

interface ResizableImageViewProps extends NodeViewProps {
  node: NodeViewProps["node"] & {
    attrs: CustomImageAttributes;
  };
}

type ResizeDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export const ResizableImage: React.FC<ResizableImageViewProps> = ({
  node,
  updateAttributes,
  selected,
  deleteNode,
  editor,
}) => {
  const { attrs } = node;
  const initialWidth = attrs.width || "auto";
  const initialHeight = attrs.height || "auto";

  const [currentDimensions, setCurrentDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });
  const [isCropMode, setIsCropMode] = useState(false);
  const [cropArea, setCropArea] = useState(
    attrs.cropData || { x: 0, y: 0, width: 100, height: 100 }
  );
  const [rotation, setRotation] = useState(attrs.rotation || 0);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Synchronize local state if node attributes change externally
  useEffect(() => {
    const newWidth = attrs.width || "auto";
    const newHeight = attrs.height || "auto";
    if (
      newWidth !== currentDimensions.width ||
      newHeight !== currentDimensions.height
    ) {
      setCurrentDimensions({ width: newWidth, height: newHeight });
    }
    if (attrs.rotation !== undefined && attrs.rotation !== rotation) {
      setRotation(attrs.rotation);
    }
    if (attrs.cropData) {
      setCropArea(attrs.cropData);
    }
  }, [
    attrs.width,
    attrs.height,
    attrs.rotation,
    attrs.cropData,
    currentDimensions.width,
    currentDimensions.height,
    rotation,
  ]);

  const handleMouseDownResize = useCallback(
    (direction: ResizeDirection) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!imgRef.current || !editor) return;

      editor.view.dom.style.userSelect = "none";

      const startX = e.clientX;
      const startY = e.clientY;
      const rect = imgRef.current.getBoundingClientRect();
      const initialRenderedWidth = rect.width;
      const initialRenderedHeight = rect.height;
      const maintainAspectRatio = e.shiftKey || direction.includes("-");
      const originalAspectRatio = initialRenderedWidth / initialRenderedHeight;

      const lastComputedDims = {
        width: `${initialRenderedWidth}px`,
        height: `${initialRenderedHeight}px`,
      };

      const handleMouseMoveResize = (event: MouseEvent) => {
        event.preventDefault();

        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        let newWidth = initialRenderedWidth;
        let newHeight = initialRenderedHeight;

        switch (direction) {
          case "right":
            newWidth = initialRenderedWidth + deltaX;
            if (maintainAspectRatio) {
              newHeight = newWidth / originalAspectRatio;
            }
            break;
          case "left":
            newWidth = initialRenderedWidth - deltaX;
            if (maintainAspectRatio) {
              newHeight = newWidth / originalAspectRatio;
            }
            break;
          case "bottom":
            newHeight = initialRenderedHeight + deltaY;
            if (maintainAspectRatio) {
              newWidth = newHeight * originalAspectRatio;
            }
            break;
          case "top":
            newHeight = initialRenderedHeight - deltaY;
            if (maintainAspectRatio) {
              newWidth = newHeight * originalAspectRatio;
            }
            break;
          case "bottom-right":
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = initialRenderedWidth + deltaX;
              newHeight = newWidth / originalAspectRatio;
            } else {
              newHeight = initialRenderedHeight + deltaY;
              newWidth = newHeight * originalAspectRatio;
            }
            break;
          case "bottom-left":
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = initialRenderedWidth - deltaX;
              newHeight = newWidth / originalAspectRatio;
            } else {
              newHeight = initialRenderedHeight + deltaY;
              newWidth = newHeight * originalAspectRatio;
            }
            break;
          case "top-right":
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = initialRenderedWidth + deltaX;
              newHeight = newWidth / originalAspectRatio;
            } else {
              newHeight = initialRenderedHeight - deltaY;
              newWidth = newHeight * originalAspectRatio;
            }
            break;
          case "top-left":
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
              newWidth = initialRenderedWidth - deltaX;
              newHeight = newWidth / originalAspectRatio;
            } else {
              newHeight = initialRenderedHeight - deltaY;
              newWidth = newHeight * originalAspectRatio;
            }
            break;
        }

        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        lastComputedDims.width = `${Math.round(newWidth)}px`;
        lastComputedDims.height = `${Math.round(newHeight)}px`;

        setCurrentDimensions({
          width: lastComputedDims.width,
          height: lastComputedDims.height,
        });
      };

      const handleMouseUpResize = () => {
        if (editor) {
          editor.view.dom.style.userSelect = "";
        }

        updateAttributes({
          width: lastComputedDims.width,
          height: lastComputedDims.height,
        });

        document.removeEventListener("mousemove", handleMouseMoveResize);
        document.removeEventListener("mouseup", handleMouseUpResize);
      };

      document.addEventListener("mousemove", handleMouseMoveResize);
      document.addEventListener("mouseup", handleMouseUpResize);
    },
    [updateAttributes, editor]
  );

  const handleRotate = useCallback(
    (degrees: number) => (e: React.MouseEvent) => {
      // <-- Change this line
      e.preventDefault();
      e.stopPropagation();
      const newRotation = (rotation + degrees) % 360;
      setRotation(newRotation);
      updateAttributes({ rotation: newRotation });
    },
    [rotation, updateAttributes]
  );
  const handleCropStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCropMode(true);
  }, []);

  const handleCropCancel = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsCropMode(false);
      setCropArea(attrs.cropData || { x: 0, y: 0, width: 100, height: 100 });
    },
    [attrs.cropData]
  );

  const handleCropApply = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!imgRef.current || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      // Create a new image element
      const sourceImg = new Image();

      // Handle both data URLs and regular URLs
      const imgSrc = attrs.src || "";

      sourceImg.onload = () => {
        try {
          const scaleX = sourceImg.naturalWidth / 100;
          const scaleY = sourceImg.naturalHeight / 100;

          const cropX = cropArea.x * scaleX;
          const cropY = cropArea.y * scaleY;
          const cropWidth = cropArea.width * scaleX;
          const cropHeight = cropArea.height * scaleY;

          canvas.width = cropWidth;
          canvas.height = cropHeight;

          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the cropped portion
          ctx.drawImage(
            sourceImg,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
          );

          const croppedDataUrl = canvas.toDataURL("image/png");
          updateAttributes({
            src: croppedDataUrl, // Reset cropData to reflect the new, fully-cropped image
            cropData: { x: 0, y: 0, width: 100, height: 100 },
          }); // Also reset the local state to match
          setCropArea({ x: 0, y: 0, width: 100, height: 100 });
          setIsCropMode(false);
        } catch (error) {
          console.error("Crop error:", error);
          alert("Could not crop image. This may be due to CORS restrictions.");
          setIsCropMode(false);
        }
      };

      sourceImg.onerror = () => {
        console.error("Failed to load image for cropping");
        alert("Could not load image for cropping.");
        setIsCropMode(false);
      };

      // Set crossOrigin before src for external images
      if (!imgSrc.startsWith("data:")) {
        sourceImg.crossOrigin = "anonymous";
      }
      sourceImg.src = imgSrc;
    },
    [cropArea, attrs.src, updateAttributes]
  );

  const handleCropResize = useCallback(
    (corner: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startY = e.clientY;
      const startCrop = { ...cropArea };

      const handleMouseMove = (event: MouseEvent) => {
        if (!imgRef.current) return;

        const rect = imgRef.current.getBoundingClientRect();
        const deltaXPercent = ((event.clientX - startX) / rect.width) * 100;
        const deltaYPercent = ((event.clientY - startY) / rect.height) * 100;

        const newCrop = { ...startCrop };

        switch (corner) {
          case "top-left":
            newCrop.x = Math.max(
              0,
              Math.min(
                startCrop.x + deltaXPercent,
                startCrop.x + startCrop.width - 10
              )
            );
            newCrop.y = Math.max(
              0,
              Math.min(
                startCrop.y + deltaYPercent,
                startCrop.y + startCrop.height - 10
              )
            );
            newCrop.width = startCrop.width - (newCrop.x - startCrop.x);
            newCrop.height = startCrop.height - (newCrop.y - startCrop.y);
            break;
          case "top-right":
            newCrop.y = Math.max(
              0,
              Math.min(
                startCrop.y + deltaYPercent,
                startCrop.y + startCrop.height - 10
              )
            );
            newCrop.width = Math.max(
              10,
              Math.min(startCrop.width + deltaXPercent, 100 - startCrop.x)
            );
            newCrop.height = startCrop.height - (newCrop.y - startCrop.y);
            break;
          case "bottom-left":
            newCrop.x = Math.max(
              0,
              Math.min(
                startCrop.x + deltaXPercent,
                startCrop.x + startCrop.width - 10
              )
            );
            newCrop.width = startCrop.width - (newCrop.x - startCrop.x);
            newCrop.height = Math.max(
              10,
              Math.min(startCrop.height + deltaYPercent, 100 - startCrop.y)
            );
            break;
          case "bottom-right":
            newCrop.width = Math.max(
              10,
              Math.min(startCrop.width + deltaXPercent, 100 - startCrop.x)
            );
            newCrop.height = Math.max(
              10,
              Math.min(startCrop.height + deltaYPercent, 100 - startCrop.y)
            );
            break;
        }

        setCropArea(newCrop);
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [cropArea]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      deleteNode();
    },
    [deleteNode]
  );

  const imgStyle: React.CSSProperties = {
    width: currentDimensions.width,
    height: currentDimensions.height,
    objectFit: "contain",
    border: attrs["data-style-border"] || undefined,
    display: "block",
    transform: `rotate(${rotation}deg)`,
    transition: "transform 0.2s ease",
  };

  let wrapperAlignmentClass = "";
  const wrapperStyle: React.CSSProperties = {};

  switch (attrs["data-align"]) {
    case "left":
      wrapperAlignmentClass = "flex justify-start";
      wrapperStyle.marginRight = "auto";
      break;
    case "right":
      wrapperAlignmentClass = "flex justify-end";
      wrapperStyle.marginLeft = "auto";
      break;
    case "center":
      wrapperAlignmentClass = "flex justify-center";
      wrapperStyle.marginLeft = "auto";
      wrapperStyle.marginRight = "auto";
      break;
    default:
      break;
  }

  const imageElement = (
    <img
      ref={imgRef}
      src={attrs.src || undefined}
      alt={attrs.alt || ""}
      title={attrs.title || undefined}
      style={imgStyle}
      className={`custom-image ${
        !attrs["data-style-border"]
          ? "border-2 border-transparent group-hover:border-blue-300"
          : ""
      } transition-colors duration-150 ease-in-out`}
      crossOrigin="anonymous"
      draggable="false"
      contentEditable="false"
    />
  );

  const finalRenderedImage = attrs.linkHref ? (
    <a
      href={attrs.linkHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.preventDefault()}
      className="image-link-wrapper block"
      style={{
        width: currentDimensions.width,
        height: currentDimensions.height,
      }}
    >
      {imageElement}
    </a>
  ) : (
    imageElement
  );

  return (
    <NodeViewWrapper
      className={`custom-image-node-view group ${wrapperAlignmentClass} ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      style={wrapperStyle}
      data-drag-handle
    >
      <div
        ref={containerRef}
        className="relative inline-block"
        style={{ lineHeight: 0 }}
      >
        {finalRenderedImage}

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {/* Crop overlay */}
        {isCropMode && imgRef.current && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              width: currentDimensions.width,
              height: currentDimensions.height,
              background: "transparent", // <- ensure overlay itself is transparent
            }}
          >
            <div
              className="absolute border-2 border-white pointer-events-auto"
              style={{
                left: `${cropArea.x}%`,
                top: `${cropArea.y}%`,
                width: `${cropArea.width}%`,
                height: `${cropArea.height}%`,
                // darken everything OUTSIDE the crop area while keeping the area transparent
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                background: "transparent",
                zIndex: 40,
              }}
            >
              {/* Crop handles (unchanged) */}
              <div
                className="absolute -top-2 -left-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize hover:bg-blue-100"
                onMouseDown={handleCropResize("top-left")}
              />
              <div
                className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize hover:bg-blue-100"
                onMouseDown={handleCropResize("top-right")}
              />
              <div
                className="absolute -bottom-2 -left-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize hover:bg-blue-100"
                onMouseDown={handleCropResize("bottom-left")}
              />
              <div
                className="absolute -bottom-2 -right-2 w-5 h-5 bg-white border-2 border-blue-500 rounded-full cursor-se-resize hover:bg-blue-100"
                onMouseDown={handleCropResize("bottom-right")}
              />
            </div>
          </div>
        )}

        {/* Control buttons - show on hover or when selected */}
        {!isCropMode && (
          <>
            {/* Resize handles - visible on selection */}
            {selected && (
              <>
                {/* Corner handles */}
                <div
                  className="absolute -top-2 -left-2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("top-left")}
                  title="Resize (maintains aspect ratio)"
                />
                <div
                  className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("top-right")}
                  title="Resize (maintains aspect ratio)"
                />
                <div
                  className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("bottom-left")}
                  title="Resize (maintains aspect ratio)"
                />
                <div
                  className="absolute -bottom-2 -right-2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-se-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("bottom-right")}
                  title="Resize (maintains aspect ratio)"
                />

                {/* Edge handles */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-n-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("top")}
                  title="Resize (Hold Shift for aspect ratio)"
                />
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-s-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("bottom")}
                  title="Resize (Hold Shift for aspect ratio)"
                />
                <div
                  className="absolute top-1/2 -left-2 -translate-y-1/2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-w-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("left")}
                  title="Resize (Hold Shift for aspect ratio)"
                />
                <div
                  className="absolute top-1/2 -right-2 -translate-y-1/2 w-5 h-5 bg-blue-500 border-2 border-white rounded-full cursor-e-resize hover:bg-blue-600 shadow-lg z-20"
                  onMouseDown={handleMouseDownResize("right")}
                  title="Resize (Hold Shift for aspect ratio)"
                />
              </>
            )}

            {/* Toolbar - visible on hover or selection */}
            <div
              className={`absolute -top-14 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-xl p-2 z-30 transition-opacity duration-200 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              <button
                className="w-9 h-9 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center text-lg font-bold shadow-md"
                onClick={handleRotate(-90)}
                title="Rotate left 90°"
                type="button"
              >
                ↺
              </button>
              <button
                className="w-9 h-9 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center text-lg font-bold shadow-md"
                onClick={handleRotate(90)}
                title="Rotate right 90°"
                type="button"
              >
                ↻
              </button>
              <button
                className="w-9 h-9 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center text-lg shadow-md"
                onClick={handleCropStart}
                title="Crop image"
                type="button"
              >
                ✂
              </button>
              <button
                className="w-9 h-9 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center text-lg shadow-md"
                onClick={handleDelete}
                title="Delete image"
                type="button"
              >
                ✕
              </button>
            </div>
          </>
        )}

        {/* Crop mode controls */}
        {isCropMode && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex gap-2 bg-white rounded-lg shadow-xl p-2 z-30">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium shadow-md"
              onClick={handleCropApply}
              type="button"
            >
              Apply Crop
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm font-medium shadow-md"
              onClick={handleCropCancel}
              type="button"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
