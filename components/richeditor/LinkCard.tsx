/* eslint-disable @next/next/no-img-element */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";

export interface LinkCardOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    linkCard: {
      setLinkCard: (options: {
        href: string;
        title?: string;
        description?: string;
        image?: string;
        siteName?: string;
        domain?: string;
        type?: string;
      }) => ReturnType;
    };
  }
}

// React component for the LinkCard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkCardComponent = ({ node, selected }:any) => {
  const { href, title, description, image, siteName, domain } = node.attrs;

  // Safe hostname extraction
  let hostname = "";
  if (href) {
    try {
      hostname = new URL(href).hostname;
    } catch {
      const match = href.match(/^(?:https?:\/\/)?(?:www\.)?([^\/]+)/);
      hostname = match ? match[1] : href;
    }
  }

  const handleClick = () => {
    if (href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <NodeViewWrapper className="link-card-wrapper">
      <div
        className={`link-card border border-gray-300 rounded-lg p-4 my-4 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer ${
          selected ? "ring-2 ring-blue-500" : ""
        }`}
        onClick={handleClick}
        contentEditable={false}
      >
        <div className="flex items-start gap-3">
          {image && (
            <img
              src={image}
              alt={title || "Link preview"}
              className="w-16 h-16 object-cover rounded flex-shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
              loading="lazy"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 truncate">
                {siteName || domain || hostname || "Link"}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {title || href || "Untitled Link"}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {description}
              </p>
            )}
            <div className="flex items-center gap-2 text-blue-500 text-sm mt-2">
              <span>Visit Link</span>
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const LinkCard = Node.create<LinkCardOptions>({
  name: "linkCard",
  group: "block",
  content: "",
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      href: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-href"),
        renderHTML: (attributes) => {
          if (!attributes.href) return {};
          return { "data-href": attributes.href };
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          if (!attributes.title) return {};
          return { "data-title": attributes.title };
        },
      },
      description: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-description"),
        renderHTML: (attributes) => {
          if (!attributes.description) return {};
          return { "data-description": attributes.description };
        },
      },
      image: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-image"),
        renderHTML: (attributes) => {
          if (!attributes.image) return {};
          return { "data-image": attributes.image };
        },
      },
      siteName: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-site-name"),
        renderHTML: (attributes) => {
          if (!attributes.siteName) return {};
          return { "data-site-name": attributes.siteName };
        },
      },
      domain: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-domain"),
        renderHTML: (attributes) => {
          if (!attributes.domain) return {};
          return { "data-domain": attributes.domain };
        },
      },
      type: {
        default: "link-card",
        parseHTML: (element) =>
          element.getAttribute("data-type") || "link-card",
        renderHTML: (attributes) => ({
          "data-type": attributes.type || "link-card",
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="link-card"]',
        getAttrs: (element) => {
          if (typeof element === "string") return false;

          return {
            href: element.getAttribute("data-href"),
            title: element.getAttribute("data-title"),
            description: element.getAttribute("data-description"),
            image: element.getAttribute("data-image"),
            siteName: element.getAttribute("data-site-name"),
            domain: element.getAttribute("data-domain"),
            type: element.getAttribute("data-type") || "link-card",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // This is used for serialization/copying, but the React component handles display
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "link-card",
        class: "link-card",
      }),
      // Empty content - React NodeView will handle the display
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LinkCardComponent);
  },

  addCommands() {
    return {
      setLinkCard:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              href: options.href,
              title: options.title || null,
              description: options.description || null,
              image: options.image || null,
              siteName: options.siteName || null,
              domain: options.domain || null,
              type: "link-card",
            },
          });
        },
    };
  },
});
