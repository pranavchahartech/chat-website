import io from 'socket.io-client';

// Use the environment variable for production, otherwise fallback to local development URL
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3001`;

const socket = io(BACKEND_URL);

export default socket;
