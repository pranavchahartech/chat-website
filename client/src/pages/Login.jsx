import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import { motion } from 'framer-motion';
import { MessageSquare, User, ArrowRight } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const { login } = useChat();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (username.trim()) {
            login(username);
            navigate('/chat');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-2xl shadow-xl"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-500/20 p-4 rounded-full mb-4 ring-1 ring-indigo-500/50">
                        <MessageSquare className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
                    <p className="text-indigo-200/80 mt-2">Join the chat to connect with others</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-200/50 w-5 h-5" />
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 text-white placeholder-indigo-200/30 pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all hover:bg-white/10"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
                    >
                        Start Chatting
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
