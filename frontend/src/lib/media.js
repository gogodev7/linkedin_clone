 // Returns a full URL for media coming from the backend's static uploads.
 // Leaves frontend-local assets (e.g., "/avatar.png") and external URLs unchanged.
 export function getMediaUrl(path) {
   if (!path) return path;
 
   // If it's already an absolute URL, return as is
   if (/^https?:\/\//i.test(path)) return path;
 
   // Only prefix backend for server-hosted uploads
   if (path.startsWith("/uploads") || path.startsWith("\\uploads")) {
     // Derive backend origin from VITE_API_BASE_URL (strip trailing /api[/v1...])
     const api = import.meta.env.VITE_API_BASE_URL || "";
     const backendOrigin = api.replace(/\/?api\b[\s\S]*$/i, "").replace(/\/$/, "");
     return `${api}${path}`;
   }
 
   return path;
 }
