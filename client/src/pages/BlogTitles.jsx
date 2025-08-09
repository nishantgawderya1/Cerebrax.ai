import React, { useState } from 'react';
import { Hash, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const BlogTitles = () => {
  const blogCategories = [
    'General',
    'Technology',
    'Health',
    'Lifestyle',
    'Travel',
    'Education',
    'Business', // Fixed typo from 'Bussiness'
    'Food',
  ];

  const [selectedCategory, setSelectedCategory] = useState('General');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate keyword input
    if (!input.trim()) {
      toast.error('Please enter a keyword for the blog title');
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

      const prompt = `Generate a blog title for the keyword "${input}" in the category "${selectedCategory}"`;

      const { data } = await axios.post(
        '/api/ai/generate-blog-title',
        { prompt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        // Set the content received from API to state for rendering
        setContent(data.content);
        toast.success('Title generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate title');
        setContent('');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || 'Failed to generate title'
      );
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column: Blog title configuration form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">AI Title Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Keyword</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Enter the keyword for your blog title"
          value={input} // Controlled input
          disabled={loading}
          className="w-full mt-2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
        />

        <p className="mt-4 text-sm font-medium">Category</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {blogCategories.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedCategory === item
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-500 border-gray-300'
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <br />

        <button
          disabled={loading}
          type="submit"
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#C341F6] text-white px-4 py-2 rounded-md hover:bg-[#65ADFF] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Hash className="w-5" />
          )}
          Generate Title
        </button>
      </form>

      {/* Right column: Generated titles display */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Hash className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Titles</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-500">
              <Hash className="w-9 h-9" />
              <p className="text-center">
                Enter keywords and click Generate Title to get started!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center prose w-full">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogTitles;
