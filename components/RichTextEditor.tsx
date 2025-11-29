import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import ListItem from "@tiptap/extension-list-item";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";

import { useState, useCallback, useRef, useEffect } from "react";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { RichTextEditorProps } from "../types/editor";
import { CustomImage } from "./richeditor/CustomImage";
import { CustomVideo } from "./richeditor/CustomVideo";
import { CustomAudio } from "./richeditor/CustomAudio";
import { TextFormattingGroup } from "./richeditor/TextFormattingGroup";
import { HeadingGroup } from "./richeditor/HeadingGroup";
import { ListGroup } from "./richeditor/ListGroup";
import { TextAlignGroup } from "./richeditor/TextAlignGroup";
import { BlockElementsGroup } from "./richeditor/BlockElementsGroup";
import { MediaTableGroup } from "./richeditor/MediaTableGroup";
import { HistoryGroup } from "./richeditor/HistoryGroup";
import { ImageInput } from "./richeditor/ImageInput";
import { LinkInput } from "./richeditor/LinkInput";
import { LinkGroup } from "./richeditor/LinkGroup";
import { LinkCard } from "./richeditor/LinkCard";
import { LinkCardInput } from "./richeditor/LinkCardInput";
import { TableControls } from "./richeditor/TableControls";
import { MediaInput } from "./richeditor/MediaInput";
import { AudioRecorder } from "./richeditor/AudioRecorder";
import { EditorStyles } from "./richeditor/EditorStyles";
// import { CustomHorizontalRule } from "./richeditor/CustomHorizontalRule";
import { LinkCardGroup } from "./richeditor/LinkCardGroup";
import { ColorFormattingGroup } from "./richeditor/ColorFormattingGroup";

import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

export const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showLinkCardInput, setShowLinkCardInput] = useState(false);
  const [showTableControls, setShowTableControls] = useState(false);
  const [showMediaInput, setShowMediaInput] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [mediaType, setMediaType] = useState<"video" | "audio">("video");
  const [showTextColors, setShowTextColors] = useState(false);
  const [showHighlightColors, setShowHighlightColors] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaFileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: "bullet-list",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "ordered-list",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "list-item",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "blockquote-custom",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "code-block-custom",
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Write something amazing...",
        // or use a function for dynamic placeholders
        // placeholder: ({ node }) => {
        //   if (node.type.name === 'heading') {
        //     return 'What's the title?'
        //   }
        //   return 'Can you add some further context?'
        // },
      }),
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
        HTMLAttributes: {
          class: "heading-custom",
        },
      }).extend({
        renderHTML({ node, HTMLAttributes }) {
          const level = node.attrs.level;
          const classes = {
            1: "text-4xl font-bold mb-4 mt-6",
            2: "text-3xl font-bold mb-3 mt-5",
            3: "text-2xl font-bold mb-3 mt-4",
            4: "text-xl font-bold mb-2 mt-3",
            5: "text-lg font-bold mb-2 mt-2",
            6: "text-base font-bold mb-2 mt-2",
          };

          return [
            `h${level}`,
            {
              ...HTMLAttributes,
              class: `${HTMLAttributes.class || ""} ${
                classes[level as keyof typeof classes]
              }`.trim(),
            },
            0,
          ];
        },
      }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class:
            "table-auto border-collapse border border-gray-400 w-full m-10 p-10",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),

      TableRow.configure({
        HTMLAttributes: {
          class: "border border-gray-400",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),

      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-400 p-2 min-w-24",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),

      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-400 p-2 bg-gray-100 font-bold min-w-24",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: (element) => element.getAttribute("style"),
              renderHTML: (attributes) => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),

      CustomImage,
      CustomVideo,
      CustomAudio,
      LinkCard,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "p-1 rounded",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-5 mx-5 border-0 h-px bg-gray-300",
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "my-bullet-list list-disc pl-5",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "my-ordered-list list-decimal pl-5",
        },
      }),
      ListItem,
      Blockquote.configure({
        HTMLAttributes: {
          class:
            "border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50 rounded-r",
        },
      }),

      CodeBlock.configure({
        HTMLAttributes: {
          class:
            "bg-gray-900 text-gray-100 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto",
        },
      }),
    ],
    content: content || null,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      const { doc } = editor.state;
      const lastNode = doc.lastChild;

      // If the last node is not a paragraph, add one
      if (lastNode && lastNode.type.name !== "paragraph") {
        editor.commands.insertContentAt(doc.content.size, {
          type: "paragraph",
        });
      }
    },
  });

  // useEffect(() => {
  //   if (!editor) return;

  //   const updateActiveBlock = () => {
  //     const { from } = editor.state.selection;
  //     const { doc } = editor.state;

  //     // Remove active class from all blocks
  //     const editorElement = document.querySelector(".ProseMirror");
  //     if (editorElement) {
  //       editorElement.querySelectorAll(".active-block").forEach((el) => {
  //         el.classList.remove("active-block");
  //       });
  //     }

  //     // Find and mark the active block
  //     doc.nodesBetween(from, from, (node, pos) => {
  //       if (node.isBlock && pos < from) {
  //         const domNode = editor.view.nodeDOM(pos);
  //         if (domNode && domNode instanceof Element) {
  //           domNode.classList.add("active-block");
  //         }
  //         return false; // Don't descend into children
  //       }
  //     });
  //   };

  //   editor.on("selectionUpdate", updateActiveBlock);
  //   editor.on("transaction", updateActiveBlock);

  //   return () => {
  //     editor.off("selectionUpdate", updateActiveBlock);
  //     editor.off("transaction", updateActiveBlock);
  //   };
  // }, [editor]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || null);
    }
  }, [content, editor]);
  // useEffect(() => {
  //   const handleClickOutside = () => {
  //     setShowTextColors(false);
  //     setShowHighlightColors(false);
  //   };

  //   if (showTextColors || showHighlightColors) {
  //     document.addEventListener("click", handleClickOutside);
  //     return () => document.removeEventListener("click", handleClickOutside);
  //   }
  // }, [showTextColors, showHighlightColors]);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        editor
          .chain()
          .focus()
          .setCustomImage({
            src: imageUrl,
            width: "300px",
            height: "auto",
          })
          .run();
      };
      reader.readAsDataURL(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [editor]
  );

  const handleMediaFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !editor) return;

      const isVideo = file.type.startsWith("video/");
      const isAudio = file.type.startsWith("audio/");

      if (!isVideo && !isAudio) {
        alert("Please select a video or audio file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaUrl = e.target?.result as string;

        if (isVideo) {
          editor
            .chain()
            .focus()
            .setVideo({
              src: mediaUrl,
              width: "100%",
              height: "auto",
            })
            .run();
        } else if (isAudio) {
          editor
            .chain()
            .focus()
            .setAudio({
              src: mediaUrl,
              width: "100%",
            })
            .run();
        }
      };
      reader.readAsDataURL(file);

      if (mediaFileInputRef.current) {
        mediaFileInputRef.current.value = "";
      }
    },
    [editor]
  );

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;

    editor
      .chain()
      .focus()
      .setCustomImage({
        src: imageUrl,
        width: "300px",
        height: "auto",
      })
      .run();

    setImageUrl("");
    setShowImageInput(false);
  }, [imageUrl, editor]);

  const addTable = useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }, [editor]);

  const showMediaInputModal = useCallback((type: "video" | "audio") => {
    setMediaType(type);
    setShowMediaInput(true);
  }, []);

  const handleAudioRecordClick = useCallback(() => {
    setShowAudioRecorder(true);
  }, []);

  const handleAudioSave = useCallback(
    (audioBlob: Blob, audioUrl: string) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .setAudio({
          src: audioUrl,
          width: "100%",
        })
        .run();

      setShowAudioRecorder(false);
    },
    [editor]
  );

  const handleAudioRecorderCancel = useCallback(() => {
    setShowAudioRecorder(false);
  }, []);

  if (!editor) {
    return null;
  }

  const isInTable = editor.isActive("table");

  return (
    <div>
      <div className=" rounded-md relative">
        <EditorContent
          editor={editor}
          className="my-editor-content min-h-[600px] prose max-w-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus-visible:outline-none border border-gray-300 rounded-md p-2 overflow-x-scroll mb-5"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          style={{ display: "none" }}
        />

        <input
          ref={mediaFileInputRef}
          type="file"
          accept="video/*,audio/*"
          onChange={handleMediaFileUpload}
          style={{ display: "none" }}
        />

        <ImageInput
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          onAddImage={addImage}
          onCancel={() => setShowImageInput(false)}
          isVisible={showImageInput}
        />

        <LinkInput
          editor={editor}
          isVisible={showLinkInput}
          onCancel={() => setShowLinkInput(false)}
        />
        <LinkCardInput
          editor={editor}
          isVisible={showLinkCardInput}
          onCancel={() => setShowLinkCardInput(false)}
        />
        {/* <EnhancedLinkInput
  editor={editor}
  isVisible={showLinkInput}
  onCancel={() => setShowLinkInput(false)}
/> */}
        <TableControls
          editor={editor}
          isVisible={showTableControls}
          isInTable={isInTable}
        />

        <MediaInput
          editor={editor}
          mediaType={mediaType}
          isVisible={showMediaInput}
          onCancel={() => setShowMediaInput(false)}
        />

        {/* Audio Recorder Modal */}
        {showAudioRecorder && (
          <div className="sticky inset-0 bottom-[130px] bg-opacity-50 flex items-center justify-center z-50">
            <div className="max-w-md w-full mx-4">
              <AudioRecorder
                onAudioSave={handleAudioSave}
                onCancel={handleAudioRecorderCancel}
                isVisible={showAudioRecorder}
              />
            </div>
          </div>
        )}

        <EditorStyles />
      </div>

      {/* Floating toolbar */}
      <div className="sticky bottom-4 left-4 right-4 bg-white border border-gray-300 rounded-[50px] p-4 shadow-lg z-50 max-w-4xl mx-5">
        <div className="flex flex-wrap gap-1 items-center justify-center">
          {/* <div className="flex flex-wrap gap-1 mb-4 border-b pb-2"> */}

          <TextFormattingGroup editor={editor} />
          <ColorFormattingGroup
            editor={editor}
            showTextColors={showTextColors}
            showHighlightColors={showHighlightColors}
            onTextColorClick={() => setShowTextColors(!showTextColors)}
            onHighlightColorClick={() =>
              setShowHighlightColors(!showHighlightColors)
            }
          />
          <HeadingGroup editor={editor} />
          <ListGroup editor={editor} />
          <TextAlignGroup editor={editor} />
          <BlockElementsGroup editor={editor} />
          <LinkGroup
            editor={editor}
            onLinkClick={() => setShowLinkInput(!showLinkInput)}
          />
          <LinkCardGroup
            editor={editor}
            onLinkCardClick={() => setShowLinkCardInput(!showLinkCardInput)}
          />

          <MediaTableGroup
            editor={editor}
            onImageClick={() => setShowImageInput(!showImageInput)}
            onFileUploadClick={() => fileInputRef.current?.click()}
            onTableClick={addTable}
            onTableControlsClick={() =>
              setShowTableControls(!showTableControls)
            }
            onVideoClick={() => showMediaInputModal("video")}
            onAudioClick={() => showMediaInputModal("audio")}
            onAudioRecordClick={handleAudioRecordClick}
            onMediaFileUploadClick={() => mediaFileInputRef.current?.click()}
            showImageInput={showImageInput}
            showTableControls={showTableControls}
            isInTable={isInTable}
          />
          <HistoryGroup editor={editor} />
        </div>
      </div>
      <EditorStyles />
    </div>
  );
};
