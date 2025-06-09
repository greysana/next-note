/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Editor } from "@tiptap/react";
import { FaTwitter, FaFacebook, FaGithub, FaLinkedin, FaYoutube, FaInstagram, FaLink, FaSpinner, FaTimes } from "react-icons/fa";

type LinkMetadata = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  domain?: string;
  type?: 'twitter' | 'facebook' | 'github' | 'linkedin' | 'youtube' | 'instagram' | 'generic';
};

type LinkCardInputProps = {
  editor: Editor;
  isVisible: boolean;
  onCancel: () => void;
};

export const LinkCardInput = ({ editor, isVisible, onCancel }: LinkCardInputProps) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const detectLinkType = (url: string): LinkMetadata['type'] => {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
      if (domain.includes('facebook.com')) return 'facebook';
      if (domain.includes('github.com')) return 'github';
      if (domain.includes('linkedin.com')) return 'linkedin';
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
      if (domain.includes('instagram.com')) return 'instagram';
      
      return 'generic';
    } catch {
      return 'generic';
    }
  };

  const fetchMetadata = async (url: string): Promise<LinkMetadata> => {
    try {
      // In a real implementation, you'd call your backend API that fetches metadata
      // For demo purposes, we'll simulate metadata based on the URL
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);
      const domain = urlObj.hostname;
      const type = detectLinkType(fullUrl);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulated metadata - in real app, you'd fetch this from your backend
      const mockMetadata: LinkMetadata = {
        domain,
        type,
        title: `Amazing Content from ${domain}`,
        description: `Check out this interesting content from ${domain}. This is a preview description that would normally be fetched from the page's meta tags.`,
        image: `https://picsum.photos/400/200?random=${Math.floor(Math.random() * 1000)}`,
        siteName: domain
      };

      // Add specific metadata for different platforms
      switch (type) {
        case 'twitter':
          mockMetadata.title = "Twitter Post";
          mockMetadata.siteName = "Twitter";
          mockMetadata.description = "Check out this tweet and join the conversation on Twitter.";
          break;
        case 'facebook':
          mockMetadata.title = "Facebook Post";
          mockMetadata.siteName = "Facebook";
          mockMetadata.description = "See what's happening on Facebook and connect with friends.";
          break;
        case 'github':
          mockMetadata.title = "GitHub Repository";
          mockMetadata.siteName = "GitHub";
          mockMetadata.description = "Explore this code repository and contribute to open source.";
          break;
        case 'youtube':
          mockMetadata.title = "YouTube Video";
          mockMetadata.siteName = "YouTube";
          mockMetadata.description = "Watch this video and discover more content on YouTube.";
          break;
        case 'linkedin':
          mockMetadata.title = "LinkedIn Post";
          mockMetadata.siteName = "LinkedIn";
          mockMetadata.description = "Professional insights and networking opportunities.";
          break;
        case 'instagram':
          mockMetadata.title = "Instagram Post";
          mockMetadata.siteName = "Instagram";
          mockMetadata.description = "Beautiful photos and stories from Instagram.";
          break;
      }

      return mockMetadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        domain: url,
        type: 'generic',
        title: url,
        description: 'Click to visit this link'
      };
    }
  };

  const handleUrlChange = async (url: string) => {
    setLinkUrl(url);
    
    if (url.trim() && (url.includes('.') || url.startsWith('http'))) {
      setIsLoadingMetadata(true);
      setShowPreview(false);
      try {
        const meta = await fetchMetadata(url);
        setMetadata(meta);
        setShowPreview(true);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
        setMetadata(null);
        setShowPreview(false);
      } finally {
        setIsLoadingMetadata(false);
      }
    } else {
      setShowPreview(false);
      setMetadata(null);
    }
  };

  const getIconForType = (type: LinkMetadata['type']) => {
    switch (type) {
      case 'twitter': return <FaTwitter className="text-blue-400" />;
      case 'facebook': return <FaFacebook className="text-blue-600" />;
      case 'github': return <FaGithub className="text-gray-800" />;
      case 'linkedin': return <FaLinkedin className="text-blue-700" />;
      case 'youtube': return <FaYoutube className="text-red-600" />;
      case 'instagram': return <FaInstagram className="text-pink-600" />;
      default: return <FaLink className="text-gray-600" />;
    }
  };

  const handleAddLinkCard = () => {
    if (!linkUrl.trim() || !metadata) return;
  
    const url = linkUrl.startsWith("http://") || linkUrl.startsWith("https://")
      ? linkUrl
      : `https://${linkUrl}`;
  
    // Fix: Use the command method instead of insertContent
    editor.chain().focus().setLinkCard({
      href: url,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
      siteName: metadata.siteName,
      domain: metadata.domain,
      type: metadata.type
    }).run();
  
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
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600">
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
                {getIconForType(metadata.type)}
                <span className="text-sm font-medium">Preview</span>
              </div>
              <div className="flex items-start gap-3">
                {metadata.image && (
                  <img 
                    src={metadata.image} 
                    alt="" 
                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-500 mb-1">
                    {metadata.siteName || metadata.domain}
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                    {metadata.title || linkUrl}
                  </h4>
                  {metadata.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {metadata.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleAddLinkCard}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              disabled={!linkUrl.trim() || !showPreview || !metadata || isLoadingMetadata}
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
