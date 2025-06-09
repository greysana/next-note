export const EditorStyles = () => (
  <style jsx>{`
    .link-card {
      transition: all 0.2s ease;
    }
    .link-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .ProseMirror table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;
    }

    .ProseMirror table td,
    .ProseMirror table th {
      min-width: 1em;
      border: 2px solid #ced4da;
      padding: 3px 5px;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;
    }

    .ProseMirror table th {
      font-weight: bold;
      text-align: left;
      background-color: #f8f9fa;
    }

    .ProseMirror table .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: "";
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .ProseMirror table .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: #adf;
      pointer-events: none;
    }

    .ProseMirror table p {
      margin: 0;
    }
    ul li {
      list-style: circle;
    }
    .image-wrapper.selected {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
      border-radius: 4px;
    }

    .image-wrapper {
      display: inline-block;
      line-height: 0;
      margin: 4px;
    }

    .ProseMirror img {
      max-width: 100%;
      height: auto;
      display: block;
    }

    .ProseMirror .ProseMirror-selectednode {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
    }

    .ProseMirror [data-drag-handle] {
      cursor: grab;
    }

    .ProseMirror [data-drag-handle]:active {
      cursor: grabbing;
    }
    .ProseMirror ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin: 0.5rem 0;
    }

    .ProseMirror ol {
      list-style-type: decimal;
      padding-left: 1.5rem;
      margin: 0.5rem 0;
    }

    .ProseMirror li {
      margin: 0.25rem 0;
    }

    .ProseMirror ul ul {
      list-style-type: circle;
    }

    .ProseMirror ul ul ul {
      list-style-type: square;
    }
  `}</style>
);
