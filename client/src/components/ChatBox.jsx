import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import Message from './Message';
import MessageInput from './MessageInput';
import { User, Trash2 } from 'lucide-react';

const ChatBox = () => {
    const { messages, user, selectedUser, removeContact, deleteMessage } = useChat();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    if (!user) return null;

    if (!selectedUser) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <h3 className="text-xl font-medium text-white mb-2">No Chat Selected</h3>
                    <p>Select a user from the sidebar to start messaging</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full p-2 text-white shadow-lg">
                        <User className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-white">{selectedUser}</span>
                </div>
                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to delete this chat history?')) {
                            removeContact(selectedUser);
                        }
                    }}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"
                    title="Delete Conversation"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.map((msg, index) => (
                    <Message
                        key={index}
                        message={msg}
                        isOwnMessage={msg.from === user}
                        deleteMessage={deleteMessage}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>
            <MessageInput />
        </div>
    );
};

export default ChatBox;
