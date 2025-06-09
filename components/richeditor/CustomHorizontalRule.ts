import { Node, mergeAttributes } from '@tiptap/core';

export const CustomHorizontalRule = Node.create({
  name: 'customHorizontalRule',
  group: 'block',
  parseHTML() {
    return [{ tag: 'hr' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['hr', mergeAttributes(HTMLAttributes, {
      class: 'my-8 mx-12 border-0 h-px bg-gradient-to-r text-grey-400 from-transparent via-gray-400 to-transparent'
    })];
  },
  addCommands() {
    return {
      setHorizontalRule: () => ({ commands }) => {
        return commands.insertContent('<hr>');
      },
    };
  },
});