import { Editor } from "@tiptap/react";
import { useState } from "react";
import { 
  FaPalette, 
  FaTable, 
  FaRegSquare,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaGripVertical,
  FaGripHorizontal,
  FaMousePointer,
  FaColumns,
  FaBars,
  FaTh
} from "react-icons/fa";
import { Node } from 'prosemirror-model'; 
type TableControlsProps = {
  editor: Editor;
  isVisible: boolean;
  isInTable: boolean;
};

type SelectionMode = 'cell' | 'column' | 'row' | 'table';

export const TableControls = ({
  editor,
  isVisible,
  isInTable,
}: TableControlsProps) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'style' | 'layout'>('structure');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('cell');
  const [selectedCellColor, setSelectedCellColor] = useState("#ffffff");
  const [selectedTextColor, setSelectedTextColor] = useState("#000000");
  const [selectedBorderColor, setSelectedBorderColor] = useState("#374151");
  const [borderWidth, setBorderWidth] = useState("1");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [cellPadding, setCellPadding] = useState("8");
  const [tableWidth, setTableWidth] = useState("100");

  if (!isVisible || !isInTable) return null;

  // Improved helper function to get current cell position and table info
  const getTableInfo = () => {
    const { state } = editor;
    const { $head } = state.selection; // $head is the resolved position of the cursor

    let tableNode: Node | null = null;
    let tableStartPos = -1; // Position *before* the table node
    let cellNode: Node | null = null; // The specific cell node the cursor is in
    let cellStartPos = -1;   // Position *before* the cellNode
    let rowIndex = -1;
    let colIndex = -1;

    // Iterate upwards from the selection's position to find the cell and its table
    for (let d = $head.depth; d > 0; d--) {
        const currentNode = $head.node(d);
        const posBeforeNode = $head.before(d); // Position immediately before currentNode

        if (currentNode.type.name === 'tableCell' || currentNode.type.name === 'tableHeader') {
            // Only capture the innermost cell containing the selection
            if (cellNode === null) {
                cellNode = currentNode;
                cellStartPos = posBeforeNode;
            }
        }
        
        if (currentNode.type.name === 'table') {
            tableNode = currentNode;
            tableStartPos = posBeforeNode;
            // Once the table is found, we assume it's the correct one for any cell found deeper.
            break; 
        }
    }

    // If a table and a cell within that table's hierarchy were found
    if (tableNode && tableStartPos !== -1 && cellStartPos !== -1) {
        // Ensure the found cell is actually a child of the found table
        // (cellStartPos should be greater than tableStartPos and within tableNode's span)
        if (cellStartPos > tableStartPos && cellStartPos < (tableStartPos + tableNode.nodeSize)) {
            let currentIteratedNodePos = tableStartPos + 1; // Position after <table> opening tag
            let foundIndices = false;

            tableNode.content.forEach((rowNode, rIdx) => {
                if (foundIndices) return;
                currentIteratedNodePos += 1; // Account for <tr> opening tag

                rowNode.content.forEach((iteratedCellNode, cIdx) => {
                    if (foundIndices) return;
                    
                    // Check if the start position of the cell we are iterating over
                    // matches the start position of the cell the cursor is in.
                    if (currentIteratedNodePos === cellStartPos) {
                        rowIndex = rIdx;
                        colIndex = cIdx;
                        // Confirm cellNode if it wasn't already perfectly set (should be)
                        if (!cellNode || cellNode !== iteratedCellNode) {
                             cellNode = iteratedCellNode;   
                        }
                        foundIndices = true;
                    }
                    currentIteratedNodePos += iteratedCellNode.nodeSize; // Move past the current cell
                });
                if (foundIndices) return;
                currentIteratedNodePos += 1; // Account for </tr> closing tag
            });
             if (!foundIndices) { // Fallback if cellStartPos was somehow misaligned during iteration
                cellStartPos = -1; cellNode = null; rowIndex = -1; colIndex = -1;
            }

        } else {
            // Cell is not within the identified table, reset cell info
            cellStartPos = -1;
            cellNode = null;
            rowIndex = -1;
            colIndex = -1;
        }
    } else if (tableNode && tableStartPos !== -1) {
        // We are in a table, but maybe not a specific cell (e.g. table selected as a node)
        // rowIndex, colIndex, cellStartPos, cellNode remain as initialised (-1 or null)
    } else {
        // Not in a table at all. Reset all table-related info.
        tableNode = null;
        tableStartPos = -1;
        cellNode = null;
        cellStartPos = -1;
        rowIndex = -1;
        colIndex = -1;
    }

    return { 
        tablePos: tableStartPos, // Position before the <table> tag
        cellPos: cellStartPos,   // Position before the <td> or <th> tag
        rowIndex, 
        colIndex,
        // You might want to return tableNode and cellNode too for direct use if needed
        // _tableNode: tableNode, 
        // _cellNode: cellNode 
    };
};

  // Get target cells based on selection mode
  const getTargetCells = () => {
    const { tablePos, rowIndex, colIndex } = getTableInfo();
    
    if (tablePos < 0) return [];
    
    const tableNode = editor.state.doc.nodeAt(tablePos);
    if (!tableNode) return [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cells: { pos: number; node: any }[] = [];
    let currentPos = tablePos + 1; // Start after table opening tag
    
    tableNode.content.forEach((row, rIdx) => {
      currentPos += 1; // Row opening tag
      
      row.content.forEach((cell, cIdx) => {
        const shouldInclude = 
          selectionMode === 'table' ||
          (selectionMode === 'row' && rIdx === rowIndex) ||
          (selectionMode === 'column' && cIdx === colIndex) ||
          (selectionMode === 'cell' && rIdx === rowIndex && cIdx === colIndex);
        
        if (shouldInclude) {
          cells.push({ pos: currentPos, node: cell });
        }
        
        currentPos += cell.nodeSize;
      });
      
      currentPos += 1; // Row closing tag
    });
    
    return cells;
  };

  // Structure Controls
  const addColumnBefore = () => editor.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor.chain().focus().deleteColumn().run();
  const addRowBefore = () => editor.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor.chain().focus().addRowAfter().run();
  const deleteRow = () => editor.chain().focus().deleteRow().run();
  const deleteTable = () => editor.chain().focus().deleteTable().run();

  // Enhanced Style Controls
  const applyCellStyles = () => {
    const cells = getTargetCells();
    
    if (cells.length === 0) {
      console.log('No cells found to style');
      return;
    }
    
    console.log(`Applying styles to ${cells.length} cells`);
    
    const { tr } = editor.state;
    
    cells.forEach(({ node, pos }) => {
      const currentAttrs = node.attrs || {};
      
      // Build the complete style string
      const styles = [
        `background-color: ${selectedCellColor}`,
        `color: ${selectedTextColor}`,
        `border: ${borderWidth}px ${borderStyle} ${selectedBorderColor}`,
        `padding: ${cellPadding}px`
      ];
      
      const newStyle = styles.join('; ') + ';';
      
      tr.setNodeMarkup(pos, null, {
        ...currentAttrs,
        style: newStyle
      });
    });
    
    if (tr.docChanged) {
      editor.view.dispatch(tr);
    }
  };

  const applyTableStyles = () => {
    const { tablePos } = getTableInfo();
    
    if (tablePos < 0) {
      console.log('No table found');
      return;
    }
    
    const tableNode = editor.state.doc.nodeAt(tablePos);
    if (!tableNode) return;
    
    const currentAttrs = tableNode.attrs || {};
    
    // Build table styles
    const styles = [
      `width: ${tableWidth}%`,
      'border-collapse: collapse',
      'margin: 1rem 0'
    ];
    
    const newStyle = styles.join('; ') + ';';
    
    const tr = editor.state.tr.setNodeMarkup(tablePos, null, {
      ...currentAttrs,
      style: newStyle
    });
    
    editor.view.dispatch(tr);
  };

  // Alignment Controls
  const alignCell = (alignment: 'left' | 'center' | 'right') => {
    const cells = getTargetCells();
    
    if (cells.length === 0) return;
    
    const { tr } = editor.state;
    
    cells.forEach(({ node, pos }) => {
      const currentAttrs = node.attrs || {};
      const currentStyle = currentAttrs.style || '';
      
      // Remove existing text-align and add new one
      let newStyle = currentStyle.replace(/text-align:\s*[^;]+;?/g, '');
      newStyle = newStyle + `; text-align: ${alignment};`;
      
      tr.setNodeMarkup(pos, null, {
        ...currentAttrs,
        style: newStyle.replace(/^;\s*/, '') // Clean up leading semicolon
      });
    });
    
    if (tr.docChanged) {
      editor.view.dispatch(tr);
    }
  };

  // Preset Styles
  const presetStyles = [
    {
      name: 'Default',
      style: {
        background: '#ffffff',
        text: '#000000',
        border: '#374151',
        borderWidth: '1',
        borderStyle: 'solid'
      }
    },
    {
      name: 'Professional',
      style: {
        background: '#f8fafc',
        text: '#1e293b',
        border: '#cbd5e1',
        borderWidth: '1',
        borderStyle: 'solid'
      }
    },
    {
      name: 'Accent',
      style: {
        background: '#dbeafe',
        text: '#1e40af',
        border: '#3b82f6',
        borderWidth: '2',
        borderStyle: 'solid'
      }
    },
    {
      name: 'Minimal',
      style: {
        background: '#ffffff',
        text: '#374151',
        border: '#e5e7eb',
        borderWidth: '1',
        borderStyle: 'solid'
      }
    }
  ];

  const applyPresetStyle = (preset: typeof presetStyles[0]) => {
    setSelectedCellColor(preset.style.background);
    setSelectedTextColor(preset.style.text);
    setSelectedBorderColor(preset.style.border);
    setBorderWidth(preset.style.borderWidth);
    setBorderStyle(preset.style.borderStyle);
    
    // Apply immediately
    setTimeout(() => applyCellStyles(), 0);
  };

  const TabButton = ({ 
    tab, 
    children, 
    icon: Icon 
  }: { 
    tab: typeof activeTab; 
    children: React.ReactNode; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors ${
        activeTab === tab
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      type="button"
    >
      <Icon size={14} />
      {children}
    </button>
  );

  const SelectionModeButton = ({ 
    mode, 
    children, 
    icon: Icon,
    onClick
  }: { 
    mode: SelectionMode; 
    children: React.ReactNode; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>;
    onClick?: () => void;
  }) => (
    <button
      onClick={() => {
        setSelectionMode(mode);
        onClick?.();
      }}
      className={`flex items-center gap-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
        selectionMode === mode
          ? 'bg-green-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      type="button"
    >
      <Icon size={12} />
      {children}
    </button>
  );

  return (
    <div className="sticky bottom-[130px] left-1/2 -translate-x-1/2 max-w-[400px] p-4 bg-gray-50 rounded-lg border border-gray-300 shadow-sm">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4">
        <TabButton tab="structure" icon={FaTable}>Structure</TabButton>
        <TabButton tab="style" icon={FaPalette}>Style</TabButton>
        <TabButton tab="layout" icon={FaRegSquare}>Layout</TabButton>
      </div>

      {/* Selection Mode Controls */}
      <div className="mb-4 p-3 bg-white rounded border border-gray-300">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Selection Target</h4>
        <div className="flex gap-2 flex-wrap">
          <SelectionModeButton mode="cell" icon={FaMousePointer}>
            Current Cell
          </SelectionModeButton>
          <SelectionModeButton mode="column" icon={FaColumns}>
            Entire Column
          </SelectionModeButton>
          <SelectionModeButton mode="row" icon={FaBars}>
            Entire Row
          </SelectionModeButton>
          <SelectionModeButton mode="table" icon={FaTh}>
            Entire Table
          </SelectionModeButton>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {selectionMode === 'cell' && 'Styles will apply to the current cell only'}
          {selectionMode === 'column' && 'Styles will apply to all cells in the current column'}
          {selectionMode === 'row' && 'Styles will apply to all cells in the current row'}
          {selectionMode === 'table' && 'Styles will apply to all cells in the table'}
        </div>
      </div>

      {/* Structure Tab */}
      {activeTab === 'structure' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <h4 className="text-sm font-semibold text-gray-700 w-full mb-2 flex items-center gap-2">
              <FaGripVertical size={12} />
              Columns
            </h4>
            <button onClick={addColumnBefore} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
              + Before
            </button>
            <button onClick={addColumnAfter} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
              + After
            </button>
            <button onClick={deleteColumn} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
              - Delete
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <h4 className="text-sm font-semibold text-gray-700 w-full mb-2 flex items-center gap-2">
              <FaGripHorizontal size={12} />
              Rows
            </h4>
            <button onClick={addRowBefore} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
              + Before
            </button>
            <button onClick={addRowAfter} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
              + After
            </button>
            <button onClick={deleteRow} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors">
              - Delete
            </button>
          </div>

          <div className="pt-2 border-t border-gray-300">
            <button onClick={deleteTable} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition-colors">
              Delete Entire Table
            </button>
          </div>
        </div>
      )}

      {/* Style Tab */}
      {activeTab === 'style' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Preset Styles</h4>
            <div className="grid grid-cols-2 gap-2">
              {presetStyles.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPresetStyle(preset)}
                  className="p-2 border border-gray-300  rounded text-sm text-left hover:bg-gray-100 transition-colors"
                  style={{
                    backgroundColor: preset.style.background,
                    color: preset.style.text,
                    borderColor: preset.style.border
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cell Background</label>
              <input
                type="color"
                value={selectedCellColor}
                onChange={(e) => setSelectedCellColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
              <input
                type="color"
                value={selectedTextColor}
                onChange={(e) => setSelectedTextColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Color</label>
              <input
                type="color"
                value={selectedBorderColor}
                onChange={(e) => setSelectedBorderColor(e.target.value)}
                className="w-full h-10 rounded border border-gray-300 cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Width</label>
              <select
                value={borderWidth}
                onChange={(e) => setBorderWidth(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="0">None</option>
                <option value="1">1px</option>
                <option value="2">2px</option>
                <option value="3">3px</option>
                <option value="4">4px</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Border Style</label>
              <select
                value={borderStyle}
                onChange={(e) => setBorderStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="double">Double</option>
              </select>
            </div>
          </div>

          <button
            onClick={applyCellStyles}
            className={`w-full px-4 py-2 rounded transition-colors text-white ${
              selectionMode === 'cell' ? 'bg-blue-500 hover:bg-blue-600' :
              selectionMode === 'column' ? 'bg-green-500 hover:bg-green-600' :
              selectionMode === 'row' ? 'bg-purple-500 hover:bg-purple-600' :
              'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            Apply to {selectionMode === 'cell' ? 'Current Cell' : 
                     selectionMode === 'column' ? 'Entire Column' :
                     selectionMode === 'row' ? 'Entire Row' : 'Entire Table'}
          </button>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FaAlignCenter size={12} />
              Text Alignment
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => alignCell('left')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                <FaAlignLeft size={12} />
                Left
              </button>
              <button
                onClick={() => alignCell('center')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                <FaAlignCenter size={12} />
                Center
              </button>
              <button
                onClick={() => alignCell('right')}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
              >
                <FaAlignRight size={12} />
                Right
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cell Padding (px)</label>
              <input
                type="range"
                min="0"
                max="20"
                value={cellPadding}
                onChange={(e) => setCellPadding(e.target.value)}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{cellPadding}px</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Table Width (%)</label>
              <input
                type="range"
                min="50"
                max="100"
                value={tableWidth}
                onChange={(e) => setTableWidth(e.target.value)}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">{tableWidth}%</div>
            </div>
          </div>

          <button
            onClick={applyTableStyles}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
          >
            Apply Layout Settings
          </button>
        </div>
      )}
    </div>
  );
};