// Backend base URL.
// In dev, falls back to localhost. In Vercel, set REACT_APP_API_URL to the
// hosted backend (e.g. https://billing-api.onrender.com).
export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:8080").replace(/\/+$/, "");
