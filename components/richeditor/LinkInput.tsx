import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";

type LinkInputProps = {
  editor: Editor;
  isVisible: boolean;
  onCancel: () => void;
};

export const LinkInput = ({ editor, isVisible, onCancel }: LinkInputProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const { selection } = editor.state;
      const selectedText = editor.state.doc.textBetween(
        selection.from,
        selection.to
      );

      // Check if we're editing an existing link
      if (editor.isActive("link")) {
        const { href } = editor.getAttributes("link");
        setLinkUrl(href || "");
        setLinkText(selectedText || "");
        setIsEditingLink(true);
      } else {
        setLinkUrl("");
        setLinkText(selectedText || "");
        setIsEditingLink(false);
      }
    }
  }, [isVisible, editor]);

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    // Ensure URL has protocol
    const url =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
        ? linkUrl
        : `https://${linkUrl}`;

    if (editor.state.selection.empty && !isEditingLink) {
      // No text selected and not editing existing link - insert new link with text
      if (!linkText.trim()) {
        alert("Please enter link text or select some text first");
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${url}">${linkText}</a>`)
        .run();
    } else {
      // Text is selected or editing existing link
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }

    handleCancel();
  };

  const handleCancel = () => {
    setLinkUrl("");
    setLinkText("");
    setIsEditingLink(false);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLink();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isVisible) return null;

  const hasSelection = !editor.state.selection.empty;

  return (
    <div className="mb-2 p-3 bg-gray-50 rounded border">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Enter URL (e.g., https://example.com)"
            className="flex-1 p-2 border rounded"
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>

        {!hasSelection && !isEditingLink && (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Enter link text"
              className="flex-1 p-2 border rounded"
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        <div className="flex gap-2 items-center">
          <button
            onClick={handleAddLink}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            type="button"
            disabled={
              !linkUrl.trim() ||
              (!hasSelection && !isEditingLink && !linkText.trim())
            }
          >
            {isEditingLink ? "Update Link" : "Add Link"}
          </button>
          <button
            onClick={handleCancel}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            type="button"
          >
            Cancel
          </button>
        </div>

        <div className="text-xs text-gray-500">
          {hasSelection
            ? "Adding link to selected text"
            : isEditingLink
            ? "Editing existing link"
            : "Enter both URL and text to create a new link"}
        </div>
      </div>
    </div>
  );
};
