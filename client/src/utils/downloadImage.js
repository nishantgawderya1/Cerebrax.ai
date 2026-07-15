import toast from 'react-hot-toast';

// Fetch a (possibly cross-origin) image URL as a blob and trigger a browser download.
// Cloudinary delivery URLs send permissive CORS headers, so the blob fetch works client-side.
export const downloadImage = async (url, filename = 'cerebrax-image.png') => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    console.error('Download failed:', error);
    toast.error('Download failed. Try right-click → Save image.');
  }
};
