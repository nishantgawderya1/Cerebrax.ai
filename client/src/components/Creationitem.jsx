import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { Copy, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Creationitem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const isImage = item.type === 'image';

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.content);
    toast.success('Copied to clipboard');
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Delete this creation? This cannot be undone.')) {
      onDelete?.(item.id);
    }
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2>{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full">
            {item.type}
          </button>
          {!isImage && (
            <button
              onClick={handleCopy}
              title="Copy"
              aria-label="Copy"
              className="p-1.5 rounded-md text-gray-400 hover:text-[#1E40AF] hover:bg-gray-100 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            title="Delete"
            aria-label="Delete"
            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div>
          {isImage ? (
            <div>
              <img src={item.content} alt={item.prompt} className="mt-3 w-full max-w-md" />
            </div>
          ) : (
            <div className="mt-3 h-full max-h-48 overflow-y-auto text-sm text-slate-700">
              <div className='reset-tw'>
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Creationitem;
