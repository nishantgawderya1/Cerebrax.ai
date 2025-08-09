import { Eraser, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveBackground = () => {
  const [input, setInput] = useState(null); // Store File object, so initial value should be null
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Input validation: check if file is selected
    if (!input) {
      toast.error('Please upload an image to proceed');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', input);

      const token = await getToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const { data } = await axios.post('/api/ai/remove-image-background', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setContent(data.content); // Assume content is the URL of the processed image
        toast.success('Background removed successfully!');
      } else {
        toast.error(data.message || 'Failed to remove background. Please try again.');
        setContent('');
      }
    } catch (error) {
      toast.error('Failed to remove background. Please try again.');
      setContent('');
      console.error('Remove background error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column: Upload form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Image Background Remover</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          type="file"
          onChange={(e) => setInput(e.target.files[0])} // Set input to selected File object
          accept="image/*"
          className="w-full px-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
          required
          disabled={loading}
        />

        <p className="mt-4 text-sm font-medium">Supports JPG, PNG and other image formats</p>

        <button
          disabled={loading}
          type="submit"
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#FFA305] text-white px-4 py-2 rounded-md hover:bg-[#FFD905] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Background
        </button>
      </form>

      {/* Right column: Display processed image */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Eraser className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-500">
              <Eraser className="w-9 h-9" />
              <p className="text-center">
                Upload an image, and click "Remove Background" to get started!
              </p>
            </div>
          </div>
        ) : (
          <img
            src={content}
            alt="Processed image"
            className="w-full h-auto object-cover rounded-md"
          />
        )}
      </div>
    </div>
  );
};

export default RemoveBackground;
