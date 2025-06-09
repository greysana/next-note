import React, { useState, useRef } from 'react';
import { Editor } from '@tiptap/react';

interface ColorFormattingGroupProps {
  editor: Editor;
  showTextColors: boolean;
  showHighlightColors: boolean;
  onTextColorClick: () => void;
  onHighlightColorClick: () => void;
}

const textColors = [
  '#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f5f5f5', '#ffffff',
  '#ff0000', '#ff4d4d', '#ff8080', '#ffb3b3', '#ff6600', '#ff9933', '#ffb366', '#ffcc99',
  '#ffcc00', '#ffdd33', '#ffe666', '#fff199', '#00ff00', '#33ff33', '#66ff66', '#99ff99',
  '#0066ff', '#3385ff', '#66a3ff', '#99c2ff', '#6600ff', '#8533ff', '#a366ff', '#c199ff',
  '#ff0066', '#ff3385', '#ff66a3', '#ff99c2', '#ff3399', '#ff66b3', '#ff99cc', '#ffcce6'
];

const highlightColors = [
  '#ffff00', '#ffeb3b', '#fff176', '#fff59d',
  '#00ff00', '#4caf50', '#81c784', '#a5d6a7',
  '#ff6600', '#ff9800', '#ffb74d', '#ffcc80',
  '#ff0066', '#e91e63', '#f06292', '#f8bbd9',
  '#66ccff', '#2196f3', '#64b5f6', '#90caf9',
  '#cc99ff', '#9c27b0', '#ba68c8', '#ce93d8',
  '#ffcc99', '#ff8a65', '#ffab91', '#ffccbc',
  '#99ffcc', '#26a69a', '#4db6ac', '#80cbc4'
];

interface ColorPickerProps {
  colors: string[];
  onColorChange: (color: string) => void;
  onClear: () => void;
  onCustomColor: (color: string) => void;
  type: 'text' | 'highlight';
}

const ColorPicker: React.FC<ColorPickerProps> = ({ 
  colors, 
  onColorChange, 
  onClear, 
  onCustomColor, 
  type 
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
  const [customColor, setCustomColor] = useState('#000000');
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onCustomColor(color);
  };

  const triggerColorPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    colorInputRef.current?.click();
  };

  // Only prevent event bubbling on the main container, not on interactive elements
  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Handle tab switching with event stopping
  const handleTabSwitch = (tab: 'preset' | 'custom') => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveTab(tab);
    };
  };

  // Wrapper for color actions that shouldn't close the picker
  const withEventStop = (callback: () => void) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      callback();
    };
  };

  return (
    <div 
      className="absolute bottom-0 left-0 mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-3 min-w-[280px]"
      onClick={handleContainerClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          {type === 'text' ? 'Text Color' : 'Highlight Color'}
        </h3>
        <button
          onClick={withEventStop(() => onClear())}
          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
        >
          Clear
        </button>
      </div>

      {/* Tabs */}
      <div className="flex mb-3 bg-gray-100 rounded-md p-1">
        <button
          onClick={handleTabSwitch('preset')}
          className={`flex-1 text-xs py-1.5 px-3 rounded cursor-pointer transition-colors ${
            activeTab === 'preset' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Preset Colors
        </button>
        <button
          onClick={handleTabSwitch('custom')}
          className={`flex-1 text-xs py-1.5 px-3 rounded cursor-pointer transition-colors ${
            activeTab === 'custom' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Custom Color
        </button>
      </div>

      {/* Content */}
      {activeTab === 'preset' ? (
        <div className="grid grid-cols-12 gap-1.5">
          {colors.map((color, index) => (
            <button
              key={`${color}-${index}`}
              className="w-5 h-5 rounded border border-gray-300 hover:border-gray-500 hover:scale-110 transition-all duration-150 shadow-sm"
              style={{ backgroundColor: color }}
              onClick={withEventStop(() => onColorChange(color))}
              title={color}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Color Preview */}
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-8 rounded border border-gray-300 shadow-inner"
              style={{ backgroundColor: customColor }}
            />
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Color Preview</div>
              <div className="text-xs font-mono text-gray-800">{customColor}</div>
            </div>
          </div>

          {/* Color Input */}
          <div className="space-y-2">
            <button
              onClick={triggerColorPicker}
              className="w-full py-2 px-3 border border-gray-300 rounded-md hover:border-gray-400 transition-colors text-sm text-gray-700 bg-gray-50 hover:bg-gray-100"
            >
              Choose Custom Color
            </button>
            <input
              ref={colorInputRef}
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="sr-only"
            />
          </div>

          {/* Hex Input */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Hex Code</label>
            <input
              type="text"
              value={customColor}
              onChange={(e) => {
                e.stopPropagation();
                const value = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                  setCustomColor(value);
                  if (value.length === 7) {
                    onCustomColor(value);
                  }
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="#000000"
            />
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600 mb-2">Quick Colors</div>
            <div className="flex gap-1">
              {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00'].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:border-gray-500 hover:scale-105 transition-all"
                  style={{ backgroundColor: color }}
                  onClick={withEventStop(() => onColorChange(color))}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ColorFormattingGroup: React.FC<ColorFormattingGroupProps> = ({
  editor,
  showTextColors,
  showHighlightColors,
  onTextColorClick,
  onHighlightColorClick,
}) => {
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentHighlightColor, setCurrentHighlightColor] = useState('#ffff00');
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightColorRef = useRef<HTMLDivElement>(null);

  const handleTextColorChange = (color: string) => {
    setCurrentTextColor(color);
    editor?.chain().focus().setColor(color).run();
  };

  const handleHighlightColorChange = (color: string) => {
    setCurrentHighlightColor(color);
    editor?.chain().focus().setHighlight({ color }).run();
  };

  const handleTextColorPick = (color: string) => {
    handleTextColorChange(color);
    onTextColorClick(); // Close the picker
  };

  const handleHighlightColorPick = (color: string) => {
    handleHighlightColorChange(color);
    onHighlightColorClick(); // Close the picker
  };

  const clearTextColor = () => {
    editor?.chain().focus().unsetColor().run();
    onTextColorClick(); // Close the picker
  };

  const clearHighlight = () => {
    editor?.chain().focus().unsetHighlight().run();
    onHighlightColorClick(); // Close the picker
  };

  // Handle click outside to close picker
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside text color picker
      if (showTextColors && textColorRef.current && !textColorRef.current.contains(target)) {
        onTextColorClick();
      }
      
      // Check if click is outside highlight color picker
      if (showHighlightColors && highlightColorRef.current && !highlightColorRef.current.contains(target)) {
        onHighlightColorClick();
      }
    };

    if (showTextColors || showHighlightColors) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showTextColors, showHighlightColors, onTextColorClick, onHighlightColorClick]);

  return (
    <>
      {/* Text Color */}
      <div className="relative" ref={textColorRef}>
        <button
          onClick={onTextColorClick}
          className={`p-2 rounded hover:bg-gray-100 relative transition-colors ${
            showTextColors ? 'bg-gray-100' : ''
          }`}
          title="Text Color"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.93 13.5h4.14L12 7.98zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-4.05 16.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09z"/>
          </svg>
          <div 
            className="absolute bottom-1 left-2 right-2 h-0.5 rounded"
            style={{ backgroundColor: currentTextColor }}
          ></div>
        </button>
        {showTextColors && (
          <ColorPicker
            colors={textColors}
            onColorChange={handleTextColorPick}
            onClear={clearTextColor}
            onCustomColor={handleTextColorChange}
            type="text"
          />
        )}
      </div>

      {/* Highlight Color */}
      <div className="relative" ref={highlightColorRef}>
        <button
          onClick={onHighlightColorClick}
          className={`p-2 rounded hover:bg-gray-100 relative transition-colors ${
            showHighlightColors ? 'bg-gray-100' : ''
          }`}
          title="Highlight Color"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 14l3 3-3 3-3-3 3-3zm10.5-9.5L9 12l3 3 7.5-7.5-3-3zm2.5-2.5l3 3-1.5 1.5-3-3L18.5 2z"/>
          </svg>
          <div 
            className="absolute bottom-1 left-2 right-2 h-1 rounded opacity-80"
            style={{ backgroundColor: currentHighlightColor }}
          ></div>
        </button>
        {showHighlightColors && (
          <ColorPicker
            colors={highlightColors}
            onColorChange={handleHighlightColorPick}
            onClear={clearHighlight}
            onCustomColor={handleHighlightColorChange}
            type="highlight"
          />
        )}
      </div>
    </>
  );
};