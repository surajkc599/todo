import { useState } from 'react';

interface DescriptionModalProps {
  isOpen: boolean;
  taskText: string;
  currentDescription: string;
  onSave: (description: string) => void;
  onCancel: () => void;
}

export function DescriptionModal({
  isOpen,
  taskText,
  currentDescription,
  onSave,
  onCancel,
}: DescriptionModalProps) {
  const [description, setDescription] = useState(currentDescription);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(description);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Edit Description</h2>
          <p className="text-sm text-slate-600 mt-1">{taskText}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Editor */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Markdown
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter markdown here... **bold**, *italic*, - list items, etc."
                className="w-full h-full p-3 border border-slate-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-slate-500 mt-2">
                Supports: **bold**, *italic*, `code`, - lists, # headings
              </p>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Preview
              </label>
              <div className="border border-slate-200 rounded p-3 bg-slate-50 h-full overflow-y-auto prose prose-sm max-w-none">
                {description ? (
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                    {description}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm">No description yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-slate-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
