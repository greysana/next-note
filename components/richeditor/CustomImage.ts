/* eslint-disable @typescript-eslint/no-explicit-any */
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableImage } from "../richeditor/ResizableImage"; 

export const CustomImage = Node.create({
  name: "customImage",
  group: "inline", 
  inline: true,
  draggable: true,
  atom: true, 

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute("src"),
      },
      alt: {
        default: null,
        parseHTML: element => element.getAttribute("alt"),
      },
      title: {
        default: null,
        parseHTML: element => element.getAttribute("title"),
      },
      // Store width and height as strings (e.g., "300px", "50%", or "auto")
      // The ResizableImage component will update these.
      width: {
        default: "auto",
        parseHTML: element =>
          element.getAttribute("data-custom-width") || // Prefer our custom data attribute
          element.style.width ||
          element.getAttribute("width"),
      },
      height: {
        default: "auto",
        parseHTML: element =>
          element.getAttribute("data-custom-height") ||
          element.style.height ||
          element.getAttribute("height"),
      },
      // Customization: Alignment
      // Values: 'left', 'center', 'right', 'none' (or null)
      // For inline elements, actual display needs CSS or wrapper styling.
      "data-align": {
        default: "none",
        parseHTML: element => element.getAttribute("data-align"),
      },
      // Customization: Border (e.g., "1px solid #000000")
      "data-style-border": {
        default: null,
        parseHTML: element =>
          element.getAttribute("data-style-border") || element.style.border,
      },
      // Customization: Link URL
      linkHref: {
        default: null,
        parseHTML: element => {
          // Check if image is wrapped in an <a> tag
          if (element.parentElement?.tagName.toLowerCase() === "a") {
            return element.parentElement.getAttribute("href");
          }
          return element.getAttribute("data-link-href"); // Fallback to data attribute
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]", // General rule for <img> tags
        getAttrs: domNode => {
          const element = domNode as HTMLElement;
          const attrs: Record<string, unknown> = {
            src: element.getAttribute("src"),
            alt: element.getAttribute("alt"),
            title: element.getAttribute("title"),
            width: element.getAttribute("data-custom-width") || element.style.width || element.getAttribute("width") || "auto",
            height: element.getAttribute("data-custom-height") || element.style.height || element.getAttribute("height") || "auto",
            "data-align": element.getAttribute("data-align"),
            "data-style-border": element.getAttribute("data-style-border") || element.style.border,
            linkHref: element.getAttribute("data-link-href"), 
          };
          if (element.parentElement?.tagName.toLowerCase() === "a") {
            attrs.linkHref = element.parentElement.getAttribute("href");
          }
          return attrs;
        },
      },
      {
        // Handles images wrapped in <a> tags, e.g., <a href="..."><img src="..."></a>
        tag: "a[href]",
        contentElement: "img", 
        getAttrs: domNode => {
          const anchorElement = domNode as HTMLAnchorElement;
          const imgElement = anchorElement.querySelector("img");

          if (!imgElement) {
            return false; 
          }

          return {
            // Attributes from img
            src: imgElement.getAttribute("src"),
            alt: imgElement.getAttribute("alt"),
            title: imgElement.getAttribute("title"),
            width: imgElement.getAttribute("data-custom-width") || imgElement.style.width || imgElement.getAttribute("width") || "auto",
            height: imgElement.getAttribute("data-custom-height") || imgElement.style.height || imgElement.getAttribute("height") || "auto",
            "data-align": imgElement.getAttribute("data-align") || anchorElement.getAttribute("data-align"), 
            "data-style-border": imgElement.getAttribute("data-style-border") || imgElement.style.border,
            // Attribute from anchor
            linkHref: anchorElement.getAttribute("href"),
          };
        },
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    // Prepare styles for the <img> tag
    const styles: React.CSSProperties = {
      width: node.attrs.width || "auto",
      height: node.attrs.height || "auto",
    };
    if (node.attrs["data-style-border"]) {
      styles.border = node.attrs["data-style-border"];
    }

    // Convert style object to string
    const styleString = Object.entries(styles)
      .map(
        ([key, value]) =>
          `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}:${value}`
      )
      .join(";");

    // Base attributes for the <img> tag
    const imgAttributes: Record<string, unknown> = {
      src: node.attrs.src,
      alt: node.attrs.alt,
      title: node.attrs.title,
      style: styleString,
      // Persist custom attributes for easier parsing and node view access
      "data-custom-width": node.attrs.width,
      "data-custom-height": node.attrs.height,
      draggable: "false", // Prevent native image drag, allow Tiptap's drag
      contenteditable: "false",
    };

    if (node.attrs["data-align"] && node.attrs["data-align"] !== "none") {
      imgAttributes["data-align"] = node.attrs["data-align"];
    }
    if (node.attrs.linkHref) {
       imgAttributes["data-link-href"] = node.attrs.linkHref; // keep data attribute for consistency
    }


    // Merge with other HTMLAttributes from Tiptap (like class, data-type)
    const finalImgAttributes = mergeAttributes(HTMLAttributes, imgAttributes);

    // If linkHref is present, wrap the <img> in an <a> tag
    if (node.attrs.linkHref) {
      return [
        "a",
        {
          href: node.attrs.linkHref,
          // Consider adding target="_blank" and rel="noopener noreferrer" for external links
          // target: "_blank",
          // rel: "noopener noreferrer",
        },
        ["img", finalImgAttributes],
      ];
    }

    return ["img", finalImgAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImage);
  },

  addCommands() {
    return {
      setCustomImage:
        (options: { [x: string]: any; src?: any; alt?: any; title?: any; width?: any; height?: any; linkHref?: any; }) => 
        ({ commands }: { commands:any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt,
              title: options.title,
              width: options.width || "auto",
              height: options.height || "auto",
              "data-align": options["data-align"] || "none",
              "data-style-border": options["data-style-border"],
              linkHref: options.linkHref,
            },
          });
        },
      updateCustomImageAttributes:
        (attributes: any) =>
        ({ chain }: { chain:any }) => { 
          return chain().updateAttributes(this.name, attributes).run();
        },
    };
  },
});