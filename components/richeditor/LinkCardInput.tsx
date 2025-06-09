/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
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
  FaTimes,
  FaGlobe,
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
    | "tiktok"
    | "generic";
};

type LinkCardInputProps = {
  editor: Editor;
  isVisible: boolean;
  onCancel: () => void;
};

export const LinkCardInput = ({
  editor,
  isVisible,
  onCancel,
}: LinkCardInputProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const detectLinkType = (url: string): LinkMetadata["type"] => {
    try {
      const domain = new URL(url).hostname.toLowerCase();

      if (domain.includes("twitter.com") || domain.includes("x.com"))
        return "twitter";
      if (domain.includes("facebook.com") || domain.includes("fb.com"))
        return "facebook";
      if (domain.includes("github.com")) return "github";
      if (domain.includes("linkedin.com")) return "linkedin";
      if (domain.includes("youtube.com") || domain.includes("youtu.be"))
        return "youtube";
      if (domain.includes("instagram.com")) return "instagram";
      if (domain.includes("tiktok.com")) return "tiktok";

      return "generic";
    } catch {
      return "generic";
    }
  };

  const normalizeUrl = (url: string): string => {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  const fetchMetadata = async (url: string): Promise<LinkMetadata> => {
    try {
      const normalizedUrl = normalizeUrl(url);
      const urlObj = new URL(normalizedUrl);
      const domain = urlObj.hostname;
      const type = detectLinkType(normalizedUrl);

      // Try multiple free services with fallbacks
      let metadata: LinkMetadata = {
        domain,
        type,
      };

    //   try {
    //     // Try microlink.io free API first (no key required for basic usage)
    //     const microlinkResponse = await fetch(
    //       `https://api.microlink.io?url=${encodeURIComponent(
    //         normalizedUrl
    //       )}&palette=true&audio=false&video=false&iframe=false`
    //     );

    //     if (microlinkResponse.ok) {
    //       const microlinkData = await microlinkResponse.json();

    //       if (microlinkData.status === "success" && microlinkData.data) {
    //         const data = microlinkData.data;
    //         metadata = {
    //           ...metadata,
    //           title: data.title,
    //           description: data.description,
    //           image: data.image?.url,
    //           siteName: data.publisher || data.author,
    //         };
    //       }
    //     }
    //     console.log("Microlink being used:", microlinkResponse.status);
    //   } catch (error) {
    //     console.log("Microlink failed, trying alternative method");
    //   }

      // If microlink failed or didn't return good data, try our own scraping
      if (!metadata.title && !metadata.description) {
        try {
          const response = await fetch("/api/metadata", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ url: normalizedUrl }),
          });

          if (response.ok) {
            const data = await response.json();
            metadata = {
              ...metadata,
              title: data.title,
              description: data.description,
              image: data.image,
              siteName: data.siteName,
            };
          }
        } catch (error) {
          console.log("Custom metadata API failed",error);
        }
      }

      // Apply fallbacks based on your requirements
      if (!metadata.title) {
        metadata.title = domain;
      }

      if (!metadata.description) {
        metadata.description = normalizedUrl;
      }

      if (!metadata.siteName) {
        metadata.siteName = domain;
      }

      return metadata;
    } catch (error) {
      console.error("Failed to fetch metadata:", error);

      // Ultimate fallback
      const urlObj = new URL(normalizeUrl(url));
      return {
        domain: urlObj.hostname,
        type: detectLinkType(url),
        title: urlObj.hostname,
        description: url,
        siteName: urlObj.hostname,
      };
    }
  };

  const handleUrlChange = async (url: string) => {
    setLinkUrl(url);

    if (url.trim() && (url.includes(".") || url.startsWith("http"))) {
      setIsLoadingMetadata(true);
      setShowPreview(false);

      try {
        const meta = await fetchMetadata(url);
        setMetadata(meta);
        setShowPreview(true);
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
        // Still show preview with fallback data
        const urlObj = new URL(normalizeUrl(url));
        setMetadata({
          domain: urlObj.hostname,
          type: detectLinkType(url),
          title: urlObj.hostname,
          description: url,
        });
        setShowPreview(true);
      } finally {
        setIsLoadingMetadata(false);
      }
    } else {
      setShowPreview(false);
      setMetadata(null);
    }
  };

  const getIconForType = (
    type: LinkMetadata["type"],
    hasImage: boolean = false
  ) => {
    // If there's no image, show globe icon for generic sites
    if (!hasImage && type === "generic") {
      return <FaGlobe className="text-blue-500" />;
    }

    // If there's an image but it's generic type, show link icon
    if (hasImage && type === "generic") {
      return <FaLink className="text-gray-600" />;
    }

    // Platform-specific icons
    switch (type) {
      case "twitter":
        return <FaTwitter className="text-blue-400" />;
      case "facebook":
        return <FaFacebook className="text-blue-600" />;
      case "github":
        return <FaGithub className="text-gray-800" />;
      case "linkedin":
        return <FaLinkedin className="text-blue-700" />;
      case "youtube":
        return <FaYoutube className="text-red-600" />;
      case "instagram":
        return <FaInstagram className="text-pink-600" />;
      case "tiktok":
        return (
          <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center text-white text-xs font-bold">
            T
          </div>
        );
      default:
        return hasImage ? (
          <FaLink className="text-gray-600" />
        ) : (
          <FaGlobe className="text-blue-500" />
        );
    }
  };

  const handleAddLinkCard = () => {
    if (!linkUrl.trim() || !metadata) return;

    const url = normalizeUrl(linkUrl);

    editor
      .chain()
      .focus()
      .setLinkCard({
        href: url,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image,
        siteName: metadata.siteName,
        domain: metadata.domain,
        type: metadata.type,
      })
      .run();

    handleCancel();
  };

  const handleCancel = () => {
    setLinkUrl("");
    setMetadata(null);
    setShowPreview(false);
    setIsLoadingMetadata(false);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && showPreview && metadata) {
      e.preventDefault();
      handleAddLinkCard();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Insert Link Card</h3>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Enter URL (e.g., https://example.com)"
              className="w-full p-3 border rounded-lg pr-10"
              onKeyDown={handleKeyDown}
              autoFocus
            />
            {isLoadingMetadata && (
              <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>

          {isLoadingMetadata && (
            <div className="text-center py-4">
              <div className="text-gray-600">Fetching link preview...</div>
            </div>
          )}

          {showPreview && metadata && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                {getIconForType(metadata.type, !!metadata.image)}
                <span className="text-sm font-medium">Preview</span>
                {metadata.siteName && (
                  <span className="text-xs text-gray-500">
                    • {metadata.siteName}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-3">
                {metadata.image && (
                  <div className="flex-shrink-0">
                    <img
                      src={metadata.image}
                      alt=""
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        // Hide image container if it fails to load
                        const container = e.currentTarget.parentElement;
                        if (container) {
                          container.style.display = "none";
                        }
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">
                    {metadata.domain}
                  </div>

                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {metadata.title}
                  </h4>

                  <p className="text-xs text-gray-600 line-clamp-3 break-all">
                    {metadata.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddLinkCard}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={
                !linkUrl.trim() ||
                !showPreview ||
                !metadata ||
                isLoadingMetadata
              }
            >
              Insert Link Card
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              type="button"
            >
              Cancel
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            This will insert a rich preview card for the link
          </div>
        </div>
      </div>
    </div>
  );
};
