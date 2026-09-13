import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Sofa, Sparkles, Download, ShieldCheck } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../context/AppContext';
import { downloadImage } from '../utils/downloadImage';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const styles = [
  { value: 'scandinavian', label: 'Scandinavian' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'rustic', label: 'Rustic' },
  { value: 'minimal', label: 'Minimal Studio' },
];

const ProductListing = () => {
  const [input, setInput] = useState(null);
  const [style, setStyle] = useState('scandinavian');
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);

  const { getToken } = useAuth();
  const { fetchUsage } = useAppContext();

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!input) {
      toast.error('Please upload a product photo');
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
      formData.append('style', style);
      formData.append('category', 'furniture');

      const { data } = await axios.post('/api/ai/generate-listing', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        setAssets(data.assets);
        toast.success('Listing pack generated!');
        fetchUsage();
      } else {
        toast.error(data.message || 'Failed to generate listing');
        setAssets([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to generate listing');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  // Stagger downloads so the browser doesn't drop concurrent saves
  const downloadAll = () => {
    assets.forEach((a, i) => {
      setTimeout(() => downloadImage(a.url, `cerebrax-listing-${i + 1}.jpg`), i * 500);
    });
  };

  return (
    <div className="h-full overflow-y-scroll p-6 text-slate-700">
      <div className="flex items-start flex-wrap gap-4">
        {/* Configuration */}
        <form
          onSubmit={onSubmitHandler}
          className="w-full max-w-md p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-3">
            <Sofa className="w-6 text-[#3A4DE0]" />
            <h1 className="text-xl font-semibold">Product Listing Studio</h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">Furniture · one photo → a marketplace-ready pack</p>

          <p className="mt-6 text-sm font-medium">Upload product photo</p>
          <input
            type="file"
            onChange={(e) => setInput(e.target.files[0])}
            accept="image/*"
            className="w-full mt-2 px-3 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3A4DE0]"
            required
            disabled={loading}
          />

          <p className="mt-4 text-sm font-medium">Scene style</p>
          <div className="mt-3 flex gap-2 flex-wrap">
            {styles.map((s) => (
              <span
                key={s.value}
                onClick={() => !loading && setStyle(s.value)}
                className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${
                  style === s.value
                    ? 'bg-[#3A4DE0] text-white border-transparent'
                    : 'text-gray-500 border-gray-300'
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Generates a compliant white-background hero plus 2 lifestyle scenes. Your product is
            preserved — only the scene around it changes.
          </p>

          <button
            disabled={loading}
            type="submit"
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[#3A4DE0] text-white px-4 py-2 rounded-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
            ) : (
              <Sparkles className="w-5" />
            )}
            Generate Listing Pack
          </button>
        </form>

        {/* Results */}
        <div className="flex-1 min-w-[280px] p-4 bg-white rounded-lg border border-gray-200 min-h-96">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">Listing Pack</h1>
            {assets.length > 0 && (
              <button
                onClick={downloadAll}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-[#3A4DE0] transition-colors"
              >
                <Download className="w-4 h-4" /> Download all
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-80">
              <div className="text-sm text-gray-500 flex flex-col items-center gap-3 text-center px-6">
                <span className="w-8 h-8 rounded-full border-2 border-[#3A4DE0] border-t-transparent animate-spin"></span>
                Generating your pack — lifestyle scenes can take a few seconds to render.
              </div>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex justify-center items-center h-80 text-sm text-gray-500 text-center px-6">
              Upload a furniture photo and generate to see a white-background hero plus lifestyle
              scenes here.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {assets.map((a) => (
                <div key={a.url} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={a.url}
                      alt={a.type}
                      loading="lazy"
                      className="w-full h-48 object-contain bg-white"
                    />
                    {a.role === 'main' && (
                      <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Compliant main
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between p-2.5">
                    <div>
                      <p className="text-sm font-medium">{a.type}</p>
                      <p className="text-[11px] text-gray-500">{a.marketplace}</p>
                    </div>
                    <button
                      onClick={() => downloadImage(a.url, `cerebrax-${a.type.replace(/\s+/g, '-').toLowerCase()}.jpg`)}
                      title="Download"
                      aria-label={`Download ${a.type}`}
                      className="p-1.5 rounded-md text-gray-400 hover:text-[#3A4DE0] hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
