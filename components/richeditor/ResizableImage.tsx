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
// Extend NodeViewProps with your specific node attribute types
interface ResizableImageViewProps extends NodeViewProps {
  node: NodeViewProps["node"] & {
    attrs: CustomImageAttributes;
  };
  // deleteNode and updateAttributes are part of NodeViewProps
  // editor is also available
}

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
  // const [isResizing, setIsResizing] = useState(false); // To potentially change cursor style
  const imgRef = useRef<HTMLImageElement>(null);
  const nodeId = node.attrs.ID || "";
  // Synchronize local state if node attributes change externally (e.g., undo/redo)
  useEffect(() => {
    const newWidth = attrs.width || "auto";
    const newHeight = attrs.height || "auto";
    if (
      newWidth !== currentDimensions.width ||
      newHeight !== currentDimensions.height
    ) {
      setCurrentDimensions({ width: newWidth, height: newHeight });
    }
  }, [
    attrs.width,
    attrs.height,
    currentDimensions.width,
    currentDimensions.height,
  ]);

  const handleMouseDownResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!imgRef.current || !editor) return;

      // setIsResizing(true);
      editor.view.dom.style.userSelect = "none";

      const startX = e.clientX;
      const startY = e.clientY;
      const rect = imgRef.current.getBoundingClientRect();
      const initialRenderedWidth = rect.width;
      const initialRenderedHeight = rect.height;
      const maintainAspectRatio = e.shiftKey;
      const originalAspectRatio = initialRenderedWidth / initialRenderedHeight;

      // Store the last computed dimensions in a ref to avoid closure issues with state in event handlers
      const lastComputedDims = {
        width: `${initialRenderedWidth}px`,
        height: `${initialRenderedHeight}px`,
      };

      const handleMouseMoveResize = (event: MouseEvent) => {
        event.preventDefault();
        let newWidth = initialRenderedWidth + (event.clientX - startX);
        let newHeight = initialRenderedHeight + (event.clientY - startY);

        if (maintainAspectRatio) {
          // Adjust based on the larger change (width or height) to feel more natural
          if (
            Math.abs(event.clientX - startX) > Math.abs(event.clientY - startY)
          ) {
            newHeight = newWidth / originalAspectRatio;
          } else {
            newWidth = newHeight * originalAspectRatio;
          }
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
        // setIsResizing(false);
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

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      deleteNode();
    },
    [deleteNode]
  );

  // Prepare image styles
  const imgStyle: React.CSSProperties = {
    width: currentDimensions.width,
    height: currentDimensions.height,
    objectFit: "contain",
    border: attrs["data-style-border"] || undefined,
    display: "block",
  };

  // Determine wrapper class for alignment (using Tailwind-like classes as example)
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

  // If the image itself is styled as display:block for margin:auto to work for center
  // the NodeViewWrapper or an inner div might need to handle this.
  // For `inline: true` nodes, `text-align` on a parent block is the standard way.
  // Here, we assume the NodeViewWrapper is effectively block-like or can be styled.

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
      draggable="false" // Important: let Tiptap handle node dragging
      contentEditable="false"
    />
  );

  const finalRenderedImage = attrs.linkHref ? (
    <a
      href={attrs.linkHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.preventDefault()} // Prevent navigation in editor, Tiptap link extension might handle this
      className="image-link-wrapper block" // Ensure link wrapper is block for consistency
      style={{
        width: currentDimensions.width,
        height: currentDimensions.height,
      }} // Link wrapper should also take dimensions
    >
      {imageElement}
    </a>
  ) : (
    imageElement
  );

  return (
    <NodeViewWrapper
      className={`custom-image-node-view group relative ${wrapperAlignmentClass} ${
        selected ? "ProseMirror-selectednode" : ""
      }`}
      style={wrapperStyle}
      data-drag-handle // Makes the entire node view draggable by Tiptap
    >
      {/* The main content: image possibly wrapped in a link */}
      <div className="inline-block" style={{ lineHeight: 0 }}>
        {" "}
        {/* inline-block to shrink-wrap content; line-height 0 for potential space under img */}
        {finalRenderedImage}
      </div>

      {/* Controls shown when selected */}
      {selected && (
        <>
          {/* Resize Handle (Bottom-Right) */}
          <div
            className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-500 border border-white rounded-full cursor-se-resize hover:bg-blue-600 shadow-md"
            onMouseDown={handleMouseDownResize}
            title="Resize image (Hold Shift for aspect ratio)"
          />
          {/* Add more resize handles (e.g., edges, other corners) for finer control if desired */}

          {/* Delete Button */}
          <button
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 shadow-md focus:outline-none"
            onClick={handleDelete}
            title="Delete image"
            type="button"
          >
            &#x2715; {/* Multiplication X, a common symbol for close/delete */}
          </button>
        </>
      )}

      {/* Simple inline attribute editor when selected */}
      {selected && (
        <div className="image-attributes-editor p-2 mt-1 border rounded-md bg-gray-50 text-xs w-full clear-both">
          <div className="mb-1">
            <label
              htmlFor={`alt-${nodeId}`}
              className="block text-xs font-medium text-gray-700 mb-0.5"
            >
              Alt Text:
            </label>
            <input
              id={`alt-${nodeId}`}
              type="text"
              value={attrs.alt || ""}
              onChange={(e) => updateAttributes({ alt: e.target.value })}
              className="w-full p-1 border border-gray-300 rounded-sm text-xs"
              placeholder="Describe the image"
            />
          </div>
          <div>
            <label
              htmlFor={`title-${nodeId}`}
              className="block text-xs font-medium text-gray-700 mb-0.5"
            >
              Tooltip (Title):
            </label>
            <input
              id={`title-${nodeId}`}
              type="text"
              value={attrs.title || ""}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              className="w-full p-1 border border-gray-300 rounded-sm text-xs"
              placeholder="Image title attribute"
            />
          </div>
          {/* TODO: Add inputs for linkHref, data-style-border, and a select for data-align */}
          {/* Example for linkHref:
           <div className="mt-1">
            <label htmlFor={`link-${node.ID}`} className="block text-xs font-medium text-gray-700 mb-0.5">Link URL:</label>
            <input
              id={`link-${node.ID}`}
              type="url"
              value={attrs.linkHref || ""}
              onChange={(e) => updateAttributes({ linkHref: e.target.value || null })}
              className="w-full p-1 border border-gray-300 rounded-sm text-xs"
              placeholder="https://example.com"
            />
          </div> */}
        </div>
      )}
    </NodeViewWrapper>
  );
};
