import { Link } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import socket from '../services/socket';

const Header = () => {
    const { user, isConnected } = useChat();

    return (
        <header className="glass-panel text-white p-4 flex justify-between items-center z-10 relative">
            <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-white">Chat App</h1>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} title={isConnected ? "Connected" : "Disconnected"} />
                <span className="text-xs text-slate-400">
                    {isConnected ? 'Online' : 'Offline'} ({socket?.id || 'No ID'})
                </span>
            </div>
            <nav>
                {user ? (
                    <span className="font-semibold text-indigo-100">Hello, {user}</span>
                ) : (
                    <Link to="/" className="hover:text-indigo-200 transition-colors">Login</Link>
                )}
            </nav>
        </header>
    );
};

export default Header;
