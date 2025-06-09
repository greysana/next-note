// extensions/CustomAudio.ts
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { AudioNodeView } from './AudioNodeView';

export interface AudioOptions {
  inline: boolean;
  allowBase64: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customAudio: {
      setAudio: (options: { src: string; width?: string }) => ReturnType; 
    };
  }
}

export const CustomAudio = Node.create<AudioOptions>({
  name: 'customAudio',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    };
  },

  inline() {
    return this.options.inline;
  },

  group() {
    return this.options.inline ? 'inline' : 'block';
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) return {};
          return { src: attributes.src };
        },
      },
      width: { // Added width attribute
        default: '100%',
        parseHTML: element => element.getAttribute('width') || element.style.width,
        renderHTML: attributes => {
          if (!attributes.width) return {};
          // Apply as style for better flexibility (e.g., "100%", "400px")
          return { style: `width: ${attributes.width}; max-width: 100%;` };
        },
      },
      controls: {
        default: true,
        parseHTML: element => element.hasAttribute('controls'),
        renderHTML: attributes => {
          // Render 'controls=""' if true, or omit if false for standard HTML behavior
          return attributes.controls ? { controls: '' } : {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'audio[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioNodeView);
  },

  addCommands() {
    return {
      setAudio: (options) => ({ commands }) => { // options can include width
        return commands.insertContent({
          type: this.name,
          attrs: options,
        });
      },
    };
  },
});