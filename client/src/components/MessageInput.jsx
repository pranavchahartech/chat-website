import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Send } from 'lucide-react';

const MessageInput = () => {
    const [text, setText] = useState('');
    const { sendMessage } = useChat();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            sendMessage(text);
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 glass-panel border-t border-white/10">
            <div className="flex gap-2 max-w-4xl mx-auto">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-gray-400 transition-all"
                />
                <button
                    type="submit"
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
                >
                    <Send size={20} />
                </button>
            </div>
        </form>
    );
};

export default MessageInput;
