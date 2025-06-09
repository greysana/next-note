// import {
//   useEditor,
//   EditorContent,
//   NodeViewWrapper,
//   ReactNodeViewRenderer,
// } from "@tiptap/react";
// import { Node } from "@tiptap/core";
// import StarterKit from "@tiptap/starter-kit";
// import Underline from "@tiptap/extension-underline";
// import Table from "@tiptap/extension-table";
// import TableRow from "@tiptap/extension-table-row";
// import TableCell from "@tiptap/extension-table-cell";
// import TableHeader from "@tiptap/extension-table-header";
// import Link from "@tiptap/extension-link";
// import TextAlign from "@tiptap/extension-text-align";
// import { useState, useCallback, useRef, useEffect } from "react";
// import {
//   FaBold,
//   FaItalic,
//   FaUnderline,
//   FaListUl,
//   FaListOl,
//   FaAlignLeft,
//   FaAlignCenter,
//   FaAlignRight,
//   FaTable,
//   FaImage,
//   FaHeading,
//   FaQuoteRight,
//   FaCode,
//   FaUndo,
//   FaRedo,
//   FaLink,
//   FaUnlink,
//   FaPlus,
//   FaMinus,
//   FaUpload,
//   FaPalette,
// } from "react-icons/fa";

// type RichTextEditorProps = {
//   content?: string;
//   onChange?: (content: string) => void;
// };

// // ResizableImage component
// const ResizableImage = ({
//   node,
//   updateAttributes,
//   selected,
//   deleteNode,
// }: any) => {
//   const [isResizing, setIsResizing] = useState(false);
//   const [dimensions, setDimensions] = useState({
//     width: node.attrs.width || "auto",
//     height: node.attrs.height || "auto",
//   });

//   const handleMouseDown = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsResizing(true);

//     const startX = e.clientX;
//     const startY = e.clientY;
//     const startWidth = parseInt(dimensions.width) || 200;
//     const startHeight = parseInt(dimensions.height) || 150;

//     const handleMouseMove = (e: MouseEvent) => {
//       const newWidth = startWidth + (e.clientX - startX);
//       const newHeight = startHeight + (e.clientY - startY);

//       const updatedDimensions = {
//         width: `${Math.max(50, newWidth)}px`,
//         height: `${Math.max(50, newHeight)}px`,
//       };

//       setDimensions(updatedDimensions);
//     };

//     const handleMouseUp = () => {
//       setIsResizing(false);
//       updateAttributes({
//         width: dimensions.width,
//         height: dimensions.height,
//       });
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };

//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);
//   };

//   const handleDelete = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     deleteNode();
//   };

//   return (
//     <NodeViewWrapper className={`image-wrapper ${selected ? "selected" : ""}`}>
//       <div className="relative inline-block group">
//         <img
//           src={node.attrs.src}
//           alt={node.attrs.alt || ""}
//           style={{
//             width: dimensions.width,
//             height: dimensions.height,
//             objectFit: "contain",
//           }}
//           className="rounded border-2 border-transparent group-hover:border-blue-300 transition-all"
//           draggable={true}
//         />

//         {/* Resize handle */}
//         <div
//           className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-600"
//           onMouseDown={handleMouseDown}
//           style={{ transform: "translate(50%, 50%)" }}
//           title="Resize image"
//         />

//         {/* Delete button */}
//         <button
//           className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
//           onClick={handleDelete}
//           style={{ transform: "translate(50%, -50%)" }}
//           title="Delete image"
//           type="button"
//         >
//           ×
//         </button>

//         {/* Move indicator */}
//         <div
//           className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 pointer-events-none transition-opacity"
//           title="Drag to move"
//         >
//           <svg
//             width="24"
//             height="24"
//             fill="currentColor"
//             className="text-blue-500"
//           >
//             <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zM16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z" />
//           </svg>
//         </div>
//       </div>
//     </NodeViewWrapper>
//   );
// };

// // Custom Image extension
// const CustomImage = Node.create({
//   name: "customImage",
//   group: "inline",
//   inline: true,
//   draggable: true,

//   addAttributes() {
//     return {
//       src: {
//         default: null,
//       },
//       alt: {
//         default: null,
//       },
//       title: {
//         default: null,
//       },
//       width: {
//         default: null,
//       },
//       height: {
//         default: null,
//       },
//     };
//   },

//   parseHTML() {
//     return [
//       {
//         tag: "img[src]",
//       },
//     ];
//   },

//   renderHTML({ HTMLAttributes }) {
//     return ["img", HTMLAttributes];
//   },

//   addNodeView() {
//     return ReactNodeViewRenderer(ResizableImage);
//   },

//   addCommands() {
//     return {
//       setCustomImage:
//         (options) =>
//         ({ commands }) => {
//           return commands.insertContent({
//             type: this.name,
//             attrs: options,
//           });
//         },
//     };
//   },
// });

// export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
//   // State hooks - always at the top level
//   const [imageUrl, setImageUrl] = useState("");
//   const [showImageInput, setShowImageInput] = useState(false);
//   const [linkUrl, setLinkUrl] = useState("");
//   const [showLinkInput, setShowLinkInput] = useState(false);
//   const [showTableControls, setShowTableControls] = useState(false);
//   const [showCellColorPicker, setShowCellColorPicker] = useState(false);
//   const [selectedCellColor, setSelectedCellColor] = useState("#ffffff");
//   const [selectedBorderColor, setSelectedBorderColor] = useState("#000000");
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const editor = useEditor({
//     extensions: [
//       StarterKit,
//       Underline,
//       Table.configure({
//         resizable: true,
//         HTMLAttributes: {
//           class: "table-auto border-collapse border border-gray-400 w-full",
//         },
//       }),
//       TableRow.configure({
//         HTMLAttributes: {
//           class: "border border-gray-400",
//         },
//       }),
//       TableCell.configure({
//         HTMLAttributes: {
//           class: "border border-gray-400 p-2 min-w-24",
//         },
//       }),
//       TableHeader.configure({
//         HTMLAttributes: {
//           class: "border border-gray-400 p-2 bg-gray-100 font-bold min-w-24",
//         },
//       }),
//       CustomImage, // Use the custom image extension instead of the default one
//       Link.configure({
//         openOnClick: false,
//         HTMLAttributes: {
//           class: "text-blue-500 underline",
//         },
//       }),
//       TextAlign.configure({
//         types: ["heading", "paragraph"],
//       }),
//     ],
//     content: content || "<p>Start typing here...</p>",
//     onUpdate: ({ editor }) => {
//       onChange?.(editor.getHTML());
//     },
//   });
//   // Update editor content when content prop changes
//   useEffect(() => {
//     if (editor && content !== editor.getHTML()) {
//       editor.commands.setContent(content || "<p></p>");
//     }
//   }, [content, editor]);

//   // File upload handler
//   const handleFileUpload = useCallback(
//     (event: React.ChangeEvent<HTMLInputElement>) => {
//       const file = event.target.files?.[0];
//       if (!file || !editor) return;

//       // Check if it's an image
//       if (!file.type.startsWith("image/")) {
//         alert("Please select an image file");
//         return;
//       }

//       // Create a local URL for the image
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         const imageUrl = e.target?.result as string;
//         // Use the custom image command
//         editor
//           .chain()
//           .focus()
//           .setCustomImage({
//             src: imageUrl,
//             width: "300px",
//             height: "auto",
//           })
//           .run();
//       };
//       reader.readAsDataURL(file);

//       // Reset the input
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     },
//     [editor]
//   );

//   // Define all action functions with useCallback at the top level
//   const addImage = useCallback(() => {
//     if (!editor || !imageUrl) return;

//     // Use the custom image command
//     editor
//       .chain()
//       .focus()
//       .setCustomImage({
//         src: imageUrl,
//         width: "300px",
//         height: "auto",
//       })
//       .run();

//     setImageUrl("");
//     setShowImageInput(false);
//   }, [imageUrl, editor]);

//   const addLink = useCallback(() => {
//     if (!editor || !linkUrl) return;

//     // Check if text is selected
//     if (editor.state.selection.empty) {
//       alert("Please select some text first");
//       return;
//     }

//     editor
//       .chain()
//       .focus()
//       .extendMarkRange("link")
//       .setLink({ href: linkUrl })
//       .run();

//     setLinkUrl("");
//     setShowLinkInput(false);
//   }, [linkUrl, editor]);

//   const removeLink = useCallback(() => {
//     if (!editor) return;

//     editor.chain().focus().extendMarkRange("link").unsetLink().run();
//   }, [editor]);

//   const addTable = useCallback(() => {
//     if (!editor) return;

//     editor
//       .chain()
//       .focus()
//       .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
//       .run();
//   }, [editor]);

//   // Table manipulation functions
//   const addColumnBefore = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().addColumnBefore().run();
//   }, [editor]);

//   const addColumnAfter = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().addColumnAfter().run();
//   }, [editor]);

//   const deleteColumn = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().deleteColumn().run();
//   }, [editor]);

//   const addRowBefore = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().addRowBefore().run();
//   }, [editor]);

//   const addRowAfter = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().addRowAfter().run();
//   }, [editor]);

//   const deleteRow = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().deleteRow().run();
//   }, [editor]);

//   const deleteTable = useCallback(() => {
//     if (!editor) return;
//     editor.chain().focus().deleteTable().run();
//   }, [editor]);

//   // Cell styling functions
//   const setCellBackgroundColor = useCallback(() => {
//     if (!editor) return;

//     const { from, to } = editor.state.selection;
//     const { doc } = editor.state;

//     editor.view.dispatch(
//       editor.view.state.tr.setNodeMarkup(from, undefined, {
//         style: `background-color: ${selectedCellColor}; border: 1px solid ${selectedBorderColor};`,
//       })
//     );

//     setShowCellColorPicker(false);
//   }, [editor, selectedCellColor, selectedBorderColor]);

//   // Early return pattern - after all hooks
//   if (!editor) {
//     return null;
//   }

//   // Reusable button component
//   const IconButton = ({
//     onClick,
//     isActive = false,
//     icon: Icon,
//     title,
//     className = "",
//   }: {
//     onClick: () => void;
//     isActive?: boolean;
//     icon: any;
//     title: string;
//     className?: string;
//   }) => (
//     <button
//       onClick={onClick}
//       className={`p-2 rounded hover:bg-gray-100 ${
//         isActive ? "bg-gray-200" : ""
//       } ${className}`}
//       title={title}
//       type="button"
//     >
//       <Icon size={16} />
//     </button>
//   );

//   const isInTable = editor.isActive("table");

//   return (
//     <div className="border rounded-md p-4">
//       <div className="flex flex-wrap gap-1 mb-4 border-b pb-2">
//         {/* Text formatting */}
//         <div className="flex gap-1 mr-3 items-center">
//           <IconButton
//             onClick={() => editor.chain().focus().toggleBold().run()}
//             isActive={editor.isActive("bold")}
//             icon={FaBold}
//             title="Bold"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().toggleItalic().run()}
//             isActive={editor.isActive("italic")}
//             icon={FaItalic}
//             title="Italic"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().toggleUnderline().run()}
//             isActive={editor.isActive("underline")}
//             icon={FaUnderline}
//             title="Underline"
//           />
//         </div>

//         {/* Text structure */}
//         <div className="flex gap-1 mr-3 items-center">
//           <IconButton
//             onClick={() =>
//               editor.chain().focus().toggleHeading({ level: 2 }).run()
//             }
//             isActive={editor.isActive("heading", { level: 2 })}
//             icon={FaHeading}
//             title="Heading"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().toggleBulletList().run()}
//             isActive={editor.isActive("bulletList")}
//             icon={FaListUl}
//             title="Bullet List"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().toggleOrderedList().run()}
//             isActive={editor.isActive("orderedList")}
//             icon={FaListOl}
//             title="Ordered List"
//           />
//         </div>

//         {/* Text alignment */}
//         <div className="flex gap-1 mr-3 items-center">
//           <IconButton
//             onClick={() => editor.chain().focus().setTextAlign("left").run()}
//             isActive={editor.isActive({ textAlign: "left" })}
//             icon={FaAlignLeft}
//             title="Align Left"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().setTextAlign("center").run()}
//             isActive={editor.isActive({ textAlign: "center" })}
//             icon={FaAlignCenter}
//             title="Align Center"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().setTextAlign("right").run()}
//             isActive={editor.isActive({ textAlign: "right" })}
//             icon={FaAlignRight}
//             title="Align Right"
//           />
//         </div>

//         {/* Block elements */}
//         <div className="flex gap-1 mr-3 items-center">
//           <IconButton
//             onClick={() => editor.chain().focus().toggleBlockquote().run()}
//             isActive={editor.isActive("blockquote")}
//             icon={FaQuoteRight}
//             title="Quote"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().toggleCodeBlock().run()}
//             isActive={editor.isActive("codeBlock")}
//             icon={FaCode}
//             title="Code Block"
//           />
//         </div>

//         {/* Links */}
//         <div className="flex gap-1 mr-3 items-center">
//           <IconButton
//             onClick={() => setShowLinkInput(!showLinkInput)}
//             isActive={editor.isActive("link")}
//             icon={FaLink}
//             title="Insert Link"
//           />
//           <IconButton
//             onClick={removeLink}
//             isActive={false}
//             icon={FaUnlink}
//             title="Remove Link"
//           />
//         </div>

//         {/* Media and tables */}
//         <div className="flex gap-1 mr-3 items-center">
//           <IconButton
//             onClick={() => setShowImageInput(!showImageInput)}
//             isActive={false}
//             icon={FaImage}
//             title="Insert Image"
//           />
//           <IconButton
//             onClick={() => fileInputRef.current?.click()}
//             isActive={false}
//             icon={FaUpload}
//             title="Upload Image"
//           />
//           <IconButton
//             onClick={addTable}
//             isActive={false}
//             icon={FaTable}
//             title="Insert Table"
//           />
//           {isInTable && (
//             <IconButton
//               onClick={() => setShowTableControls(!showTableControls)}
//               isActive={showTableControls}
//               icon={FaPlus}
//               title="Table Controls"
//             />
//           )}
//         </div>

//         {/* History */}
//         <div className="flex gap-1 items-center">
//           <IconButton
//             onClick={() => editor.chain().focus().undo().run()}
//             isActive={false}
//             icon={FaUndo}
//             title="Undo"
//           />
//           <IconButton
//             onClick={() => editor.chain().focus().redo().run()}
//             isActive={false}
//             icon={FaRedo}
//             title="Redo"
//           />
//         </div>
//       </div>

//       {/* Hidden file input */}
//       <input
//         ref={fileInputRef}
//         type="file"
//         accept="image/*"
//         onChange={handleFileUpload}
//         style={{ display: "none" }}
//       />

//       {/* Image URL input */}
//       {showImageInput && (
//         <div className="mb-2 flex gap-2 items-center">
//           <input
//             type="text"
//             value={imageUrl}
//             onChange={(e) => setImageUrl(e.target.value)}
//             placeholder="Enter image URL"
//             className="flex-1 p-2 border rounded"
//           />
//           <button
//             onClick={addImage}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//             type="button"
//           >
//             Add Image
//           </button>
//           <button
//             onClick={() => setShowImageInput(false)}
//             className="bg-gray-300 px-4 py-2 rounded"
//             type="button"
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* Link URL input */}
//       {showLinkInput && (
//         <div className="mb-2 flex gap-2 items-center">
//           <input
//             type="text"
//             value={linkUrl}
//             onChange={(e) => setLinkUrl(e.target.value)}
//             placeholder="Enter URL (include https://)"
//             className="flex-1 p-2 border rounded"
//           />
//           <button
//             onClick={addLink}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//             type="button"
//           >
//             Set Link
//           </button>
//           <button
//             onClick={() => setShowLinkInput(false)}
//             className="bg-gray-300 px-4 py-2 rounded"
//             type="button"
//           >
//             Cancel
//           </button>
//         </div>
//       )}

//       {/* Table controls */}
//       {showTableControls && isInTable && (
//         <div className="mb-2 p-3 bg-gray-50 rounded border">
//           <div className="flex flex-wrap gap-2 mb-2">
//             <button
//               onClick={addColumnBefore}
//               className="bg-green-500 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               + Column Before
//             </button>
//             <button
//               onClick={addColumnAfter}
//               className="bg-green-500 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               + Column After
//             </button>
//             <button
//               onClick={deleteColumn}
//               className="bg-red-500 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               - Delete Column
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2 mb-2">
//             <button
//               onClick={addRowBefore}
//               className="bg-green-500 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               + Row Before
//             </button>
//             <button
//               onClick={addRowAfter}
//               className="bg-green-500 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               + Row After
//             </button>
//             <button
//               onClick={deleteRow}
//               className="bg-red-500 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               - Delete Row
//             </button>
//           </div>
//           <div className="flex flex-wrap gap-2 mb-2">
//             <button
//               onClick={() => setShowCellColorPicker(!showCellColorPicker)}
//               className="bg-purple-500 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
//               type="button"
//             >
//               <FaPalette size={12} />
//               Cell Colors
//             </button>
//             <button
//               onClick={deleteTable}
//               className="bg-red-600 text-white px-3 py-1 rounded text-sm"
//               type="button"
//             >
//               Delete Table
//             </button>
//           </div>

//           {showCellColorPicker && (
//             <div className="flex flex-wrap gap-2 items-center p-2 bg-white rounded border">
//               <label className="text-sm">Background:</label>
//               <input
//                 type="color"
//                 value={selectedCellColor}
//                 onChange={(e) => setSelectedCellColor(e.target.value)}
//                 className="w-8 h-8 rounded border"
//               />
//               <label className="text-sm">Border:</label>
//               <input
//                 type="color"
//                 value={selectedBorderColor}
//                 onChange={(e) => setSelectedBorderColor(e.target.value)}
//                 className="w-8 h-8 rounded border"
//               />
//               <button
//                 onClick={setCellBackgroundColor}
//                 className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
//                 type="button"
//               >
//                 Apply
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Editor content area */}
//       <EditorContent
//         editor={editor}
//         className="min-h-[600px] prose max-w-none focus:outline-none border rounded-md p-2 overflow-x-scroll"
//       />

//       {/* Helper tips */}
//       <div className="mt-4 text-sm text-gray-500">
//         <p>Tip: Select text before applying formatting or creating links.</p>
//         <p>
//           For tables: Use tab to navigate between cells. Click the table
//           controls button when inside a table.
//         </p>
//         <p>
//           Images: You can upload files or enter URLs. Hover over images to
//           resize, move, or delete them.
//         </p>
//       </div>

//       {/* Custom styles for tables and images */}
//       <style jsx>{`
//         .ProseMirror table {
//           border-collapse: collapse;
//           table-layout: fixed;
//           width: 100%;
//           margin: 0;
//           overflow: hidden;
//         }

//         .ProseMirror table td,
//         .ProseMirror table th {
//           min-width: 1em;
//           border: 2px solid #ced4da;
//           padding: 3px 5px;
//           vertical-align: top;
//           box-sizing: border-box;
//           position: relative;
//         }

//         .ProseMirror table th {
//           font-weight: bold;
//           text-align: left;
//           background-color: #f8f9fa;
//         }

//         .ProseMirror table .selectedCell:after {
//           z-index: 2;
//           position: absolute;
//           content: "";
//           left: 0;
//           right: 0;
//           top: 0;
//           bottom: 0;
//           background: rgba(200, 200, 255, 0.4);
//           pointer-events: none;
//         }

//         .ProseMirror table .column-resize-handle {
//           position: absolute;
//           right: -2px;
//           top: 0;
//           bottom: -2px;
//           width: 4px;
//           background-color: #adf;
//           pointer-events: none;
//         }

//         .ProseMirror table p {
//           margin: 0;
//         }
//         ul li {
//           list-style: circle;
//         }
//         .image-wrapper.selected {
//           outline: 2px solid #3b82f6;
//           outline-offset: 2px;
//           border-radius: 4px;
//         }

//         .image-wrapper {
//           display: inline-block;
//           line-height: 0;
//           margin: 4px;
//         }

//         .ProseMirror img {
//           max-width: 100%;
//           height: auto;
//           display: block;
//         }

//         .ProseMirror .ProseMirror-selectednode {
//           outline: 2px solid #3b82f6;
//           outline-offset: 2px;
//         }

//         .ProseMirror [data-drag-handle] {
//           cursor: grab;
//         }

//         .ProseMirror [data-drag-handle]:active {
//           cursor: grabbing;
//         }
//       `}</style>
//     </div>
//   );
// };
