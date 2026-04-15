/**
 * Helper to get the full URL for an uploaded file
 * @param {string} filename - The filename from the database
 * @returns {string|null} - The full URL to the file or null if no filename
 */
export const getFileUrl = (filename) => {
  if (!filename) return null;
  
  // Determine backend URL
  const baseURL = import.meta.env.VITE_API_URL || 
                  (window.location.hostname === 'localhost' 
                    ? 'http://localhost:5000' 
                    : 'https://wechat-1-vt2t.onrender.com');
  
  // Ensure we point to the root /uploads directory, not /api/uploads
  const cleanBaseURL = baseURL.replace(/\/api$/, '');
  
  return `${cleanBaseURL}/uploads/${filename}`;
};
