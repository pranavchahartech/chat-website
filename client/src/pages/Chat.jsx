import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../context/ChatContext';
import Header from '../components/Header';
import ChatBox from '../components/ChatBox';
import UserSidebar from '../components/UserSidebar';

const Chat = () => {
    const { user } = useChat();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Header />
            <div className="flex flex-1 overflow-hidden">
                <UserSidebar />
                <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
                    <ChatBox />
                </div>
            </div>
        </div>
    );
};

export default Chat;
