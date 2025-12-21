import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Search, User, UserPlus, Trash2 } from 'lucide-react';

const UserSidebar = () => {
    const [query, setQuery] = useState('');
    const [error, setError] = useState('');
    const { searchUser, selectUser, selectedUser, user: currentUser, unreadSenders, contacts, removeContact, onlineUsers } = useChat();
    // In a real app we'd have a list of active chats. For now we can maybe track locally or just use search.
    // Let's implement a simple "Recent Chats" list using a local state or context if we had it.
    // For this strictly requested feature "search bar where i search... if it exists... show option to start chat", 
    // we will focus on the search interaction.

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        if (!query.trim()) return;

        if (query === currentUser) {
            setError("You can't chat with yourself!");
            return;
        }

        try {
            const user = await searchUser(query);
            if (user) {
                selectUser(user.username);
                setQuery('');
            } else {
                setError('User not found');
            }
        } catch (err) {
            console.error(err);
            setError('Connection timeout. Try again.');
        }
    };

    return (
        <div className="w-80 glass-panel border-r border-white/10 flex flex-col h-full bg-slate-900/50">
            <div className="p-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search username..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                    <button
                        type="submit"
                        className="absolute left-3 top-2.5 text-gray-400 hover:text-white transition-colors"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </form>
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {/* Unread Messages Section */}
                {unreadSenders && unreadSenders.length > 0 && (
                    <div className="mb-4">
                        <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider px-2 mb-2">New Messages</h3>
                        {unreadSenders.map(sender => (
                            <div key={sender} className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3 mb-2 animate-fade-in">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="bg-indigo-500 rounded-full p-1.5">
                                        <User className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-white font-medium">{sender}</span>
                                </div>
                                <p className="text-gray-300 text-sm mb-2">Sent you a message</p>
                                <button
                                    onClick={() => selectUser(sender)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    Start Chatting
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Active Chat Indicator (if selected user not in contacts yet, or just to show top active) */}
                {selectedUser && !contacts.includes(selectedUser) && (
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors">
                        <div className="bg-gray-600 rounded-full p-2">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-white font-medium">{selectedUser}</div>
                            <div className="text-indigo-200 text-xs">Active Conversation</div>
                        </div>
                    </div>
                )}

                {/* Recent Chats List */}
                {contacts.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">Recent Chats</h3>
                        <div className="space-y-2">
                            {contacts.filter(c => !unreadSenders.includes(c)).map(contact => (
                                <div
                                    key={contact}
                                    onClick={() => selectUser(contact)}
                                    className={`rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${selectedUser === contact
                                        ? 'bg-indigo-600 shadow-lg shadow-indigo-900/20 ring-1 ring-indigo-400/30'
                                        : 'bg-white/5 hover:bg-white/10 border border-white/5'
                                        }`}
                                >
                                    <div className={`rounded-full p-2 relative ${selectedUser === contact ? 'bg-white/20' : 'bg-gray-700/50'}`}>
                                        <User className="w-4 h-4 text-white" />
                                        {onlineUsers.includes(contact) && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{contact}</div>
                                        {selectedUser === contact && (
                                            <div className="text-indigo-200 text-xs">Active</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeContact(contact);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                                        title="Remove from recent"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!selectedUser && unreadSenders.length === 0 && contacts.length === 0 && (
                    <div className="text-center text-gray-400 mt-10 p-4">
                        <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Search for a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserSidebar;
