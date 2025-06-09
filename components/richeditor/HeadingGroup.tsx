import { Editor } from "@tiptap/react";
import { IconButton } from "./IconButton";
import { FaHeading } from "react-icons/fa";

type HeadingGroupProps = {
  editor: Editor;
};

export const HeadingGroup = ({ editor }: HeadingGroupProps) => {
  const toggleHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (editor.isActive("heading", { level })) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <div className="flex gap-1 mr-3 items-center">
      <div className="relative group">
        <IconButton
          onClick={() => toggleHeading(2)}
          isActive={editor.isActive("heading")}
          icon={FaHeading}
          title="Headings"  
        />
        {/* Dropdown for different heading levels */}
        <div className="absolute bottom-0 left-0 mt-1 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <button
              key={level}
              onClick={() => toggleHeading(level as 1 | 2 | 3 | 4 | 5 | 6)}
              className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                editor.isActive("heading", { level }) ? "bg-blue-50" : ""
              }`}
              type="button"
            >
              <span style={{ fontSize: `${2.5 - level * 0.2}rem` }}>
                Heading {level}
              </span>
            </button>
          ))}
          <button
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
              !editor.isActive("heading") ? "bg-blue-50" : ""
            }`}
            type="button"
          >
            Normal text
          </button>
        </div>
      </div>
    </div>
  );
};
