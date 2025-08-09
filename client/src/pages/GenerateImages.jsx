import React, { useState } from 'react';
import { Image, ImageIcon, Sparkles } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const GenerateImages = () => {
  const imageStyles = [
    'Realistic',
    'Ghibili Art',
    'Anime Style',
    'Cartoon Style',
    'Fantasy',
    '3D Style',
    'Portrait',
    'Abstract',
  ];

  const [selectedStyle, setSelectedStyle] = useState('Realistic');
  const [input, setInput] = useState('');
  const [publish, setPublish] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Input validation for description
    if (!input.trim()) {
      toast.error('Please describe your idea for the image');
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

      const prompt = `Generate an image with the following description: ${input} in the style of ${selectedStyle}`;

      const { data } = await axios.post(
        '/api/ai/generate-image',
        { prompt, publish },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Correctly call getToken()
            'Content-Type': 'application/json',
          },
        }
      );

      if (data.success) {
        setContent(data.content); // Assuming data.content is a valid image URL
        toast.success('Image generated successfully!');
      } else {
        toast.error(data.message || 'Failed to generate image. Please try again.');
        setContent('');
      }
    } catch (error) {
      toast.error('Failed to generate image. Please try again.');
      setContent('');
      console.error('Generate image error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#00AD25]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Describe your idea</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          placeholder="Enter your idea for the image here (e.g. a cat in space)"
          className="w-full px-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
          required
          disabled={loading}
        />

        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap">
          {imageStyles.map((item) => (
            <span
              key={item}
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                selectedStyle === item ? 'bg-purple-50 text-green-700' : 'text-gray-500 border-gray-300'
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => setPublish(e.target.checked)}
              checked={publish}
              className="sr-only peer"
              disabled={loading}
            />
            <div className="w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition"></div>
            <span className="absolute left-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4"></span>
          </label>
          <p className="text-sm select-none">Make this image Public</p>
        </div>

        <br />
        <button
          disabled={loading}
          type="submit"
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#00AD25] text-white px-4 py-2 rounded-md hover:bg-[#04FF50] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Image className="w-5" />
          )}
          Generate Image
        </button>
      </form>

      {/* Right column */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-5 h-5 text-[#8E37EB]" />
          <h1 className="text-xl font-semibold">Generated Image</h1>
        </div>
        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-500">
              <ImageIcon className="w-9 h-9" />
              <p className="text-center">Describe your idea, Click Generate Image to get started!!</p>
            </div>
          </div>
        ) : (
          <div className="mt-3 h-full">
            {/* Display the generated image */}
            <img src={content} alt="Generated AI" className="w-full h-full object-contain rounded" />
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateImages;
