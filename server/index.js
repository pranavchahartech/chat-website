const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Persistence Helpers
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Load data helpers
const loadData = (file, defaultData) => {
    try {
        if (!fs.existsSync(file)) return defaultData;
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        console.error(`Error loading ${file}:`, e);
        return defaultData;
    }
};

const saveData = (file, data) => {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(`Error saving ${file}:`, e);
    }
};

// State
let users = loadData(USERS_FILE, {});
let messages = loadData(MESSAGES_FILE, []);

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.onAny((event, ...args) => {
        console.log(`[${socket.id}] Event: ${event}`, args);
    });

    socket.on('join', (username) => {
        socket.username = username;

        // Update user status (key by lowercase for case-insensitivity)
        users[username.toLowerCase()] = {
            id: socket.id,
            username,
            online: true,
            lastSeen: new Date().toISOString()
        };
        saveData(USERS_FILE, users);

        console.log(`${username} joined via socket ${socket.id}`);
        console.log('Current Users:', Object.keys(users));

        // Broadcast user joined (optional, maybe just update user list)
        io.emit('user_status', { username, online: true });

        // Send list of active users to the joining user
        const activeUsers = Object.values(users)
            .filter(u => u.online)
            .map(u => u.username);
        socket.emit('active_users', activeUsers);
    });

    socket.on('search_user', (query, callback) => {
        console.log(`Searching for: ${query}`);
        // Direct lookup by lowercase
        const result = users[query.toLowerCase()];
        // callback is a function on the client side to receive the response
        if (callback) callback(result || null);
    });

    socket.on('get_history', ({ partner }, callback) => {
        const myUser = socket.username.toLowerCase();
        const otherUser = partner.toLowerCase();

        const history = messages.filter(msg =>
            (msg.from.toLowerCase() === myUser && msg.to.toLowerCase() === otherUser) ||
            (msg.from.toLowerCase() === otherUser && msg.to.toLowerCase() === myUser)
        );
        if (callback) callback(history);
    });

    socket.on('get_contacts', (callback) => {
        // Find all unique users this user has interacted with
        const contacts = new Set();
        const myUser = socket.username.toLowerCase();

        messages.forEach(msg => {
            if (msg.from.toLowerCase() === myUser) contacts.add(msg.to);
            if (msg.to.toLowerCase() === myUser) contacts.add(msg.from);
        });

        console.log(`[get_contacts] for ${socket.username} found:`, Array.from(contacts));
        if (callback) callback(Array.from(contacts));
    });

    socket.on('delete_message', ({ messageId, partner }) => {
        const myUser = socket.username.toLowerCase();
        const otherUser = partner.toLowerCase();

        // Check if message exists and belongs to conversation
        const msgIndex = messages.findIndex(msg => msg.id === messageId);

        if (msgIndex !== -1) {
            const msg = messages[msgIndex];
            // Only allow if the requester is the sender or recipient (usually sender deletes their own)
            // Ideally only sender can delete for everyone, or both can delete for themselves. 
            // Requirement implies "delete particular chat" -> remove for both usually? 
            // Let's assume sender deletes for everyone.
            if (msg.from === socket.username) {
                messages.splice(msgIndex, 1);
                saveData(MESSAGES_FILE, messages);

                // Notify sender
                socket.emit('message_deleted', { messageId, partner });

                // Notify recipient
                const recipient = users[otherUser];
                if (recipient && recipient.online) {
                    io.to(recipient.id).emit('message_deleted', { messageId, partner: socket.username });
                }
            }
        }
    });

    socket.on('delete_conversation', ({ partner }) => {
        const myUser = socket.username.toLowerCase();
        const otherUser = partner.toLowerCase();

        const initialCount = messages.length;
        messages = messages.filter(msg => {
            const from = msg.from.toLowerCase();
            const to = msg.to.toLowerCase();
            const isMatch = (from === myUser && to === otherUser) || (from === otherUser && to === myUser);
            return !isMatch;
        });

        if (messages.length !== initialCount) {
            saveData(MESSAGES_FILE, messages);
            console.log(`Deleted conversation between ${socket.username} and ${partner}`);
        }
    });

    socket.on('mark_seen', ({ partner }) => {
        const myUser = socket.username.toLowerCase();
        const otherUser = partner.toLowerCase();
        let updated = false;

        // Mark messages SENT BY partner TO me as seen
        messages.forEach(msg => {
            if (msg.from.toLowerCase() === otherUser &&
                msg.to.toLowerCase() === myUser &&
                !msg.seen) {
                msg.seen = true;
                updated = true;
            }
        });

        if (updated) {
            saveData(MESSAGES_FILE, messages);

            // Notify the partner (sender) that I (viewer) have seen their messages
            // We need to find the partner's socket
            const partnerUser = users[otherUser];

            if (partnerUser && partnerUser.online) {
                io.to(partnerUser.id).emit('messages_seen', { viewer: socket.username });
            }
        }
    });

    socket.on('private_message', ({ to, text }) => {
        console.log(`Message from ${socket.username} to ${to}: ${text}`);
        const message = {
            id: Date.now(),
            from: socket.username,
            to,
            text,
            timestamp: new Date().toISOString(),
            seen: false // Initialize as unseen
        };

        messages.push(message);
        saveData(MESSAGES_FILE, messages);

        // Send to recipient if online
        // Look up recipient by lowercase key to find their socket ID
        const recipient = users[to.toLowerCase()];
        if (recipient && recipient.online) {
            io.to(recipient.id).emit('private_message', message);
        }

        // Send back to sender for confirmation/UI update
        socket.emit('private_message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
        if (socket.username) {
            const lowerUser = socket.username.toLowerCase();
            if (users[lowerUser]) {
                users[lowerUser].online = false;
                users[lowerUser].lastSeen = new Date().toISOString();
                saveData(USERS_FILE, users);
                io.emit('user_status', { username: socket.username, online: false });
            }
        }
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('--- SERVER RESTARTED WITH SEEN FEATURE & ACTIVE STATUS ---');
});
