/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import {
  FaTwitter,
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaYoutube,
  FaInstagram,
  FaLink,
  FaSpinner,
} from "react-icons/fa";

type LinkMetadata = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  domain?: string;
  type?:
    | "twitter"
    | "facebook"
    | "github"
    | "linkedin"
    | "youtube"
    | "instagram"
    | "generic";
};

type EnhancedLinkInputProps = {
  editor: Editor;
  isVisible: boolean;
  onCancel: () => void;
};

export const EnhancedLinkInput = ({
  editor,
  isVisible,
  onCancel,
}: EnhancedLinkInputProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const { selection } = editor.state;
      const selectedText = editor.state.doc.textBetween(
        selection.from,
        selection.to
      );

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
      setMetadata(null);
      setShowPreview(false);
    }
  }, [isVisible, editor]);

  const detectLinkType = (url: string): LinkMetadata["type"] => {
    const domain = new URL(url).hostname.toLowerCase();

    if (domain.includes("twitter.com") || domain.includes("x.com"))
      return "twitter";
    if (domain.includes("facebook.com")) return "facebook";
    if (domain.includes("github.com")) return "github";
    if (domain.includes("linkedin.com")) return "linkedin";
    if (domain.includes("youtube.com") || domain.includes("youtu.be"))
      return "youtube";
    if (domain.includes("instagram.com")) return "instagram";

    return "generic";
  };

  const fetchMetadata = async (url: string): Promise<LinkMetadata> => {
    try {
      // In a real implementation, you'd call your backend API that fetches metadata
      // For demo purposes, we'll simulate metadata based on the URL
      const fullUrl = url.startsWith("http") ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);
      const domain = urlObj.hostname;
      const type = detectLinkType(fullUrl);

      // Simulated metadata - in real app, you'd fetch this from your backend
      const mockMetadata: LinkMetadata = {
        domain,
        type,
        title: `Page Title from ${domain}`,
        description: `This is a preview description for the link from ${domain}`,
        image: `https://via.placeholder.com/400x200?text=${type}`,
        siteName: domain,
      };

      // Add specific metadata for different platforms
      switch (type) {
        case "twitter":
          mockMetadata.title = "Tweet Preview";
          mockMetadata.siteName = "Twitter/X";
          break;
        case "github":
          mockMetadata.title = "GitHub Repository";
          mockMetadata.siteName = "GitHub";
          break;
        case "youtube":
          mockMetadata.title = "YouTube Video";
          mockMetadata.siteName = "YouTube";
          break;
      }

      return mockMetadata;
    } catch (error) {
      console.log("Error fetching metadata:", error);
      return {
        domain: url,
        type: "generic",
        title: url,
      };
    }
  };

  const handleUrlChange = async (url: string) => {
    setLinkUrl(url);

    if (url.trim() && (url.includes(".") || url.startsWith("http"))) {
      setIsLoadingMetadata(true);
      try {
        const meta = await fetchMetadata(url);
        setMetadata(meta);
        setShowPreview(true);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      } finally {
        setIsLoadingMetadata(false);
      }
    } else {
      setShowPreview(false);
      setMetadata(null);
    }
  };

  const getIconForType = (type: LinkMetadata["type"]) => {
    switch (type) {
      case "twitter":
        return FaTwitter;
      case "facebook":
        return FaFacebook;
      case "github":
        return FaGithub;
      case "linkedin":
        return FaLinkedin;
      case "youtube":
        return FaYoutube;
      case "instagram":
        return FaInstagram;
      default:
        return FaLink;
    }
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const url =
      linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
        ? linkUrl
        : `https://${linkUrl}`;

    if (metadata && showPreview) {
      // Insert rich link card
      const linkCard = `
        <div class="link-card border rounded-lg p-4 my-4 bg-gray-50 hover:bg-gray-100 transition-colors">
          <div class="flex items-start gap-3">
            ${
              metadata.image
                ? `<img src="${metadata.image}" alt="" class="w-16 h-16 object-cover rounded" />`
                : ""
            }
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-sm text-gray-500">${
                  metadata.siteName || metadata.domain
                }</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">${
                metadata.title || url
              }</h3>
              ${
                metadata.description
                  ? `<p class="text-sm text-gray-600 line-clamp-2">${metadata.description}</p>`
                  : ""
              }
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block">
                Visit Link →
              </a>
            </div>
          </div>
        </div>
      `;

      editor.chain().focus().insertContent(linkCard).run();
    } else {
      // Regular link insertion
      if (editor.state.selection.empty && !isEditingLink) {
        if (!linkText.trim()) {
          alert("Please enter link text or select some text first");
          return;
        }
        editor
          .chain()
          .focus()
          .insertContent(
            `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
          )
          .run();
      } else {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url, target: "_blank", rel: "noopener noreferrer" })
          .run();
      }
    }

    handleCancel();
  };

  const handleCancel = () => {
    setLinkUrl("");
    setLinkText("");
    setIsEditingLink(false);
    setMetadata(null);
    setShowPreview(false);
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
  const IconComponent = metadata ? getIconForType(metadata.type) : FaLink;

  return (
    <div className="mb-2 p-4 bg-white rounded-lg border shadow-lg">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Enter URL (e.g., https://example.com)"
              className="w-full p-2 pr-8 border rounded"
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {isLoadingMetadata && (
              <FaSpinner className="absolute right-2 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        {!hasSelection && !isEditingLink && (
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Enter link text"
            className="p-2 border rounded"
            onKeyDown={handleKeyDown}
          />
        )}

        {showPreview && metadata && (
          <div className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="text-lg" />
              <span className="text-sm font-medium">Link Preview</span>
            </div>
            <div className="flex items-start gap-3">
              {metadata.image && (
                <img
                  src={metadata.image}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {metadata.title || linkUrl}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {metadata.description || metadata.domain}
                </p>
                <span className="text-xs text-gray-500">
                  {metadata.siteName || metadata.domain}
                </span>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              This will be inserted as a rich link card
            </div>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <button
            onClick={handleAddLink}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            type="button"
            disabled={
              !linkUrl.trim() ||
              (!hasSelection && !isEditingLink && !linkText.trim()) ||
              isLoadingMetadata
            }
          >
            {isEditingLink
              ? "Update Link"
              : showPreview
              ? "Insert Card"
              : "Add Link"}
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
            : showPreview
            ? "Rich card will be inserted"
            : "Enter both URL and text to create a new link"}
        </div>
      </div>
    </div>
  );
};
