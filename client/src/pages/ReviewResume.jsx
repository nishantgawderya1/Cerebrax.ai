import React, { useState } from 'react';
import axios from 'axios';
import { File, FileTerminal } from 'lucide-react';
import toast from 'react-hot-toast';
import Markdown from 'react-markdown';
import { useAuth } from '@clerk/clerk-react';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [input, setInput] = useState(null); // Store File object, initial null
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate file input
    if (!input) {
      toast.error('Please upload a PDF resume to proceed');
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
      formData.append('resume', input); // Changed key to 'resume' for clarity, adjust per backend

      const { data } = await axios.post('/api/ai/review-resume', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (data.success) {
        setContent(data.content); // Assuming content is markdown text review
        toast.success('Resume reviewed successfully!');
      } else {
        toast.error(data.message || 'Failed to review resume. Please try again.');
        setContent('');
      }
    } catch (error) {
      toast.error('Failed to review resume. Please try again.');
      setContent('');
      console.error('Review resume error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* Left column: Upload and submit form */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <FileTerminal className="w-6 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Review Resume</h1>
        </div>

        <p className="mt-6 text-sm font-medium">Upload Resume</p>
        <input
          type="file"
          onChange={(e) => setInput(e.target.files[0])} // Set File object
          accept="application/pdf"
          className="w-full px-3 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A7AFF]"
          required
          disabled={loading}
        />

        <p className="mt-4 text-sm font-medium">Supports PDF resume only.</p>

        <button
          type="submit"
          className="mt-4 w-full flex items-center justify-center gap-2 bg-[#00DA83] text-white px-4 py-2 rounded-md hover:bg-[#009BB3] transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <FileTerminal className="w-5" />
          )}
          Review Resume
        </button>
      </form>

      {/* Right column: Analysis results display */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <FileTerminal className="w-5 h-5 text-[#00DA83]" />
          <h1 className="text-xl font-semibold">Analysis Results</h1>
        </div>

        {!content ? (
          <div className="flex-1 flex justify-center items-center">
            <div className="text-sm flex flex-col items-center gap-5 text-gray-500">
              <File className="w-9 h-9" />
              <p className="text-center">
                Upload your Resume, Click "Review Resume" to get started !!
              </p>
            </div>
          </div>
        ) : (
          <div className="reser-tw mt-3 overflow-y-auto prose">
            <Markdown>{content}</Markdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewResume;
