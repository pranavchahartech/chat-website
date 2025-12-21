import { createContext, useState, useEffect, useContext } from 'react';
import socket from '../services/socket';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState({}); // { username: [msg1, msg2] }
    const [selectedUser, setSelectedUser] = useState(null);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [unreadSenders, setUnreadSenders] = useState(new Set());
    const [contacts, setContacts] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const fetchContacts = () => {
        socket.emit('get_contacts', (contactList) => {
            console.log('Fetched contacts:', contactList);
            setContacts(contactList);
        });
    };

    useEffect(() => {
        console.log('ChatProvider mounted, setting up socket listener');

        const onConnect = () => {
            setIsConnected(true);
            console.log("Socket connected/reconnected");
            if (user) {
                console.log("Re-joining as", user);
                socket.emit('join', user);
                fetchContacts();
            }
        };
        const onDisconnect = () => setIsConnected(false);

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on('message_deleted', ({ messageId, partner }) => {
            setMessages(prev => {
                const partnerMessages = prev[partner] || [];
                return {
                    ...prev,
                    [partner]: partnerMessages.filter(msg => msg.id !== messageId)
                };
            });
        });

        socket.on('active_users', (usersList) => {
            setOnlineUsers(new Set(usersList));
        });

        socket.on('user_status', ({ username, online }) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (online) {
                    newSet.add(username);
                } else {
                    newSet.delete(username);
                }
                return newSet;
            });
        });

        socket.on('messages_seen', ({ viewer }) => {
            console.log(`User ${viewer} saw your messages`);
            setMessages(prev => {
                const userMessages = prev[viewer] || [];
                // Update specific conversation messages
                const updatedMessages = userMessages.map(msg => {
                    if (msg.to === viewer && !msg.seen) {
                        return { ...msg, seen: true };
                    }
                    return msg;
                });

                return {
                    ...prev,
                    [viewer]: updatedMessages
                };
            });
        });

        socket.on('private_message', (message) => {
            console.log('ChatContext received message:', message);
            const otherUser = message.from === user ? message.to : message.from;

            // If message is from someone else, and we are not currently chatting with them
            if (message.from !== user && message.from !== selectedUser) {
                setUnreadSenders(prev => new Set(prev).add(message.from));
            } else if (message.from !== user && message.from === selectedUser) {
                // If we ARE chatting with them, mark as seen immediately
                socket.emit('mark_seen', { partner: message.from });
            }

            // Update contacts list if new interaction
            setContacts(prev => {
                if (!prev.includes(otherUser)) return [...prev, otherUser];
                return prev;
            });

            setMessages((prev) => ({
                ...prev,
                [otherUser]: [...(prev[otherUser] || []), message]
            }));
        });

        if (socket.connected && user) {
            fetchContacts();
        }

        return () => {
            console.log('ChatProvider unmounting, removing listener');
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('private_message');
            socket.off('messages_seen');
            socket.off('active_users');
            socket.off('message_deleted');
            socket.off('user_status');
        };
    }, [user, selectedUser]); // Add selectedUser to dependency to check against it

    const login = (username) => {
        setUser(username);
        socket.emit('join', username);
    };

    const searchUser = (query) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Search timed out'));
            }, 5000);

            socket.emit('search_user', query, (result) => {
                clearTimeout(timeout);
                resolve(result);
            });
        });
    };

    const selectUser = (username) => {
        setSelectedUser(username);

        // Add to contacts if not already there
        setContacts(prev => {
            if (!prev.includes(username)) return [...prev, username];
            return prev;
        });

        // Clear from unread when selected
        if (unreadSenders.has(username)) {
            setUnreadSenders(prev => {
                const next = new Set(prev);
                next.delete(username);
                return next;
            });
        }

        // ALWAYS fetch history to ensure we have the full conversation
        // This fixes the issue where clicking "Start Chatting" on a notification only showed the new message
        socket.emit('get_history', { partner: username }, (history) => {
            setMessages(prev => ({
                ...prev,
                [username]: history
            }));

            // Also mark as seen since we just opened the chat
            socket.emit('mark_seen', { partner: username });
        });
    };

    const removeContact = (contactToRemove) => {
        // Optimistically remove from UI
        setContacts(prev => prev.filter(c => c !== contactToRemove));
        if (selectedUser === contactToRemove) {
            setSelectedUser(null);
        }

        // Tell server to delete the conversation permanently
        socket.emit('delete_conversation', { partner: contactToRemove });
    };

    const sendMessage = (text) => {
        if (user && selectedUser) {
            socket.emit('private_message', { to: selectedUser, text });
            // The server sends back 'private_message' to sender too, logic above handles adding it to state
        }
    };

    const deleteMessage = (messageId) => {
        if (selectedUser) {
            socket.emit('delete_message', { messageId, partner: selectedUser });
            // Optimistic update
            setMessages(prev => ({
                ...prev,
                [selectedUser]: (prev[selectedUser] || []).filter(msg => msg.id !== messageId)
            }));
        }
    };

    return (
        <ChatContext.Provider value={{
            user,
            selectedUser,
            messages: messages[selectedUser] || [],
            isConnected,
            unreadSenders: Array.from(unreadSenders),
            contacts,
            onlineUsers: Array.from(onlineUsers),
            removeContact,
            login,
            searchUser,
            selectUser,
            searchUser,
            selectUser,
            sendMessage,
            deleteMessage
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};
