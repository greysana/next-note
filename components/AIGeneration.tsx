"use client";
import { useState } from 'react';
import { 
  FaRobot,
  FaTimes,
  FaFile,
  FaList,
  FaLightbulb,
  FaComments,
  FaSpinner,
  FaCopy,
  FaCheck
} from 'react-icons/fa';

interface AIGenerationProps {
  content: string;
  onContentChange: (newContent: string) => void;
  className?: string;
}

interface Preset {
  id: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
  prompt: string;
}

type ContextOption = 'none' | 'selected' | 'full';

const AIGeneration: React.FC<AIGenerationProps> = ({ 
  content, 
  onContentChange, 
  className = "" 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [contextOption, setContextOption] = useState<ContextOption>('selected');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const presets: Preset[] = [
    {
      id: 'summarize',
      label: 'Summarize',
      icon: FaFile,
      prompt: 'Please summarize the following content in a concise and clear manner'
    },
    {
      id: 'elaborate',
      label: 'Elaborate',
      icon: FaList,
      prompt: 'Please elaborate and expand on the following content with more details and examples'
    },
    {
      id: 'improve',
      label: 'Improve Writing',
      icon: FaLightbulb,
      prompt: 'Please improve the writing quality, grammar, and clarity of the following content'
    },
    {
      id: 'bullet_points',
      label: 'Convert to Bullet Points',
      icon: FaList,
      prompt: 'Please convert the following content into well-organized bullet points'
    },
    {
      id: 'explain',
      label: 'Explain Simply',
      icon: FaComments,
      prompt: 'Please explain the following content in simple, easy-to-understand terms'
    }
  ];

  const getSelectedText = (): string => {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
  };

  const handleAIButtonClick = () => {
    const selected = getSelectedText();
    setSelectedText(selected);
    setContextOption(selected ? 'selected' : 'full');
    setIsModalOpen(true);
    setGeneratedContent('');
    setCopySuccess(false);
  };

  const buildFinalPrompt = (basePrompt: string): string => {
    let contextContent = '';
    
    switch (contextOption) {
      case 'selected':
        if (selectedText) {
          contextContent = `:\n\n${selectedText}`;
        } else {
          contextContent = '. No text was selected, so please create comprehensive content as needed.';
        }
        break;
      case 'full':
        contextContent = content 
          ? `:\n\nFull document content:\n${content}` 
          : '. The document is empty, so please create comprehensive content as needed.';
        break;
      case 'none':
        contextContent = '. Please create comprehensive content without any existing context.';
        break;
    }
    
    return `${basePrompt}${contextContent}

IMPORTANT: Please format your response using proper HTML syntax that is compatible. Use the following HTML elements for styling:
- <h1>, <h2>, <h3> for headings
- <p> for paragraphs
- <strong> for bold text
- <em> for italic text
- <ul> and <li> for bullet points
- <ol> and <li> for numbered lists
- <blockquote> for quotes
- <br> for line breaks when needed
- and others if needed.

Ensure the HTML is well-structured and beautifully styled. 

IMPORTANT: Please do not add other words except the output HTML content. Strictly do not include any additional explanations or text outside of the HTML tags. ONLY the expected output`;
  };

  const handleGenerate = async () => {
    const prompt = selectedPreset 
      ? presets.find(p => p.id === selectedPreset)?.prompt 
      : customPrompt;

    if (!prompt?.trim()) {
      alert('Please select a preset or enter a custom prompt');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');

    try {
      const finalPrompt = buildFinalPrompt(prompt);
      
      const response = await fetch('/api/ai_generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          selectedText: contextOption === 'selected' ? selectedText : '',
          preset: selectedPreset,
          fullContent: contextOption === 'full' ? content : '',
          contextOption: contextOption
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedContent(data.content || data.result || '');
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyContent = async () => {
    if (generatedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error('Failed to copy content:', error);
        const textArea = document.createElement('textarea');
        textArea.value = generatedContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    }
  };

  const handleInsertContent = () => {
    if (generatedContent) {
      // Insert at the end of content
      const newContent = content + '\n' + generatedContent;
      onContentChange(newContent);
      closeModal();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPreset('');
    setCustomPrompt('');
    setGeneratedContent('');
    setSelectedText('');
    setContextOption('selected');
    setCopySuccess(false);
  };

  const resetModal = () => {
    setSelectedPreset('');
    setCustomPrompt('');
    setGeneratedContent('');
    setCopySuccess(false);
  };

  const getContextDescription = () => {
    switch (contextOption) {
      case 'none':
        return 'No context will be included in the prompt';
      case 'selected':
        return selectedText 
          ? `Selected text will be included (${selectedText.length} characters)`
          : 'No text selected - will work without context';
      case 'full':
        return `Full document content will be included (${content.length} characters)`;
      default:
        return '';
    }
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={handleAIButtonClick}
        className={`fixed top-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 ${className}`}
        title="AI Content Generation"
      >
        <FaRobot className="text-lg" />
        <span className="hidden sm:inline">AI Generate</span>
      </button>

      {/* AI Generation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FaRobot className="text-2xl text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">AI Content Generation</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Context Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Context to include in prompt:
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="context-none"
                      name="context"
                      value="none"
                      checked={contextOption === 'none'}
                      onChange={(e) => setContextOption(e.target.value as ContextOption)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="context-none" className="ml-3 block text-sm text-gray-700">
                      <span className="font-medium">None</span> - Generate content without any context
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="context-selected"
                      name="context"
                      value="selected"
                      checked={contextOption === 'selected'}
                      onChange={(e) => setContextOption(e.target.value as ContextOption)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="context-selected" className="ml-3 block text-sm text-gray-700">
                      <span className="font-medium">Selected Text</span> - Use only the text you selected
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="context-full"
                      name="context"
                      value="full"
                      checked={contextOption === 'full'}
                      onChange={(e) => setContextOption(e.target.value as ContextOption)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="context-full" className="ml-3 block text-sm text-gray-700">
                      <span className="font-medium">Full Document</span> - Include entire document content
                    </label>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500">{getContextDescription()}</p>
              </div>

              {/* Selected Text Display */}
              {selectedText && contextOption === 'selected' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selected Text Preview:
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedText}</p>
                  </div>
                </div>
              )}

              {/* Preset Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose a preset or enter custom prompt:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                  {presets.map((preset) => {
                    const IconComponent = preset.icon;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedPreset(preset.id);
                          setCustomPrompt('');
                        }}
                        className={`p-3 border rounded-lg text-left transition-all hover:shadow-md ${
                          selectedPreset === preset.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="text-sm flex-shrink-0" />
                          <span className="font-medium text-sm">{preset.label}</span>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{preset.prompt}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Prompt */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or enter custom prompt:
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => {
                    setCustomPrompt(e.target.value);
                    setSelectedPreset('');
                  }}
                  placeholder="Enter your custom prompt here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Generated Content */}
              {generatedContent && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Generated Content:
                    </label>
                    <button
                      onClick={handleCopyContent}
                      className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-all ${
                        copySuccess 
                          ? 'bg-green-100 text-green-700 border border-green-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      }`}
                      title={copySuccess ? 'Copied!' : 'Copy to clipboard'}
                    >
                      {copySuccess ? (
                        <>
                          <FaCheck className="text-xs" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <FaCopy className="text-xs" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: generatedContent }}
                    />
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3">
                    <FaSpinner className="animate-spin text-blue-600 text-xl" />
                    <span className="text-gray-600">Generating content...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={resetModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Reset
              </button>
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                {!generatedContent ? (
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || (!selectedPreset && !customPrompt.trim())}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleInsertContent}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Insert Content
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIGeneration;