import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { Copy } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../context/AppContext';
import { getTextTool } from '../config/textTools';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const buildDefaults = (config) =>
  Object.fromEntries((config?.options || []).map((o) => [o.name, o.default]));

const TextTool = () => {
  const { tool } = useParams();
  const config = getTextTool(tool);

  const [input, setInput] = useState('');
  const [options, setOptions] = useState(() => buildDefaults(config));
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();
  const { fetchUsage } = useAppContext();

  // Reset state when navigating between tools (the same component is reused)
  useEffect(() => {
    setInput('');
    setContent('');
    setOptions(buildDefaults(config));
  }, [config]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input.trim()) {
      toast.error('Please enter some input');
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const { data } = await axios.post(
        '/api/ai/generate-text',
        { tool, input, options },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        setContent(data.content);
        toast.success('Done!');
        fetchUsage();
      } else {
        toast.error(data.message || 'Failed to generate');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Tool not found.
      </div>
    );
  }

  const { Icon, accent } = config;

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left: configuration form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6" style={{ color: accent }} />
          <h1 className="text-xl font-semibold">{config.title}</h1>
        </div>
        <p className="mt-1 text-sm text-gray-500">{config.subtitle}</p>

        <p className="mt-6 text-sm font-medium">{config.input.label}</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={config.input.rows || 6}
          placeholder={config.input.placeholder}
          className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
          disabled={loading}
        />

        {config.options.map((opt) => (
          <div key={opt.name}>
            <p className="mt-4 text-sm font-medium">{opt.label}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {opt.choices.map((choice) => {
                const active = options[opt.name] === choice;
                return (
                  <span
                    key={choice}
                    onClick={() => !loading && setOptions((prev) => ({ ...prev, [opt.name]: choice }))}
                    className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                      active ? 'text-white border-transparent' : 'text-gray-500 border-gray-300'
                    }`}
                    style={active ? { backgroundColor: accent } : {}}
                  >
                    {choice}
                  </span>
                );
              })}
            </div>
          </div>
        ))}

        <button
          disabled={loading}
          type="submit"
          className="mt-6 w-full flex items-center justify-center gap-2 text-white px-4 py-2 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: accent }}
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Icon className="w-5" />
          )}
          {config.submitLabel}
        </button>
      </form>

      {/* Right: result */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" style={{ color: accent }} />
            <h1 className="text-xl font-semibold">Result</h1>
          </div>
          {content && (
            <button
              onClick={handleCopy}
              title="Copy to clipboard"
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          )}
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-500">
              <Icon className="w-9 h-9" />
              <p className="text-center">Enter your input and click {config.submitLabel} to get started.</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600">
            <div className="reset-tw">
              <Markdown>{content}</Markdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextTool;
