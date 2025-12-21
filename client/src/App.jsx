import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './context/ChatContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import NotFound from './pages/NotFound';
import Sparkles from './components/Sparkles';

function App() {
  return (
    <Router>
      <ChatProvider>
        <div className="min-h-screen text-white bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 animate-gradient relative">
          <Sparkles />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </ChatProvider>
    </Router>
  );
}

export default App;
