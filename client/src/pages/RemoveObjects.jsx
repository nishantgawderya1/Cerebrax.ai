import { Scissors, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObjects = () => {
  const [input, setInput] = useState(null); // Store File object, initial null
  const [object, setObject] = useState(''); // Description of object to remove
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate file input
    if (!input) {
      toast.error('Please upload an image to proceed');
      return;
    }

    // Validate object description: require non-empty and single object only
    if (!object.trim()) {
      toast.error('Please describe the object you want to remove');
      return;
    }
    if (object.trim().split(' ').length > 1) {
      toast.error('Please enter only 1 object name');
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

      const formData = new FormData();
      formData.append('image', input);
      formData.append('object', object.trim());

      const { data } = await axios.post('/api/ai/remove-image-object', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setContent(data.content); // Assume content is a URL to processed image
        toast.success('Object removed successfully!');
      } else {
        toast.error(data.message || 'Failed to remove object. Please try again.');
        setContent('');
      }
    } catch (error) {
      toast.error('Failed to remove object. Please try again.');
      setContent('');
      console.error('Remove object error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column: form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Object Remover</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          type="file"
          onChange={(e) => setInput(e.target.files[0])} // Set File object
          accept="image/*"
          className="w-full px-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
          required
          disabled={loading}
        />

        <p className="mt-4 text-sm font-medium">Describe Object to Remove</p>
        <textarea
          onChange={(e) => setObject(e.target.value)}
          value={object}
          rows={4}
          placeholder="Describe the object you want to remove from the image (e.g. person, car)"
          className="w-full px-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
          required
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-[#FFA345] transition-colors disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Scissors className="w-5" />
          )}
          Remove Object
        </button>
      </form>

      {/* Right column: processed image display */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
        <div className="flex items-center gap-3">
          <Scissors className="w-5 h-5 text-[#FF4938]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-500">
              <Scissors className="w-9 h-9" />
              <p className="text-center">
                Upload an image, and click "Remove Object" to get started!
              </p>
            </div>
          </div>
        ) : (
          <img
            src={content}
            alt="Processed image"
            className="mt-3 w-full h-full object-contain rounded-md"
          />
        )}
      </div>
    </div>
  );
};

export default RemoveObjects;
