import { Check, CheckCheck, Trash2 } from 'lucide-react';

const Message = ({ message, isOwnMessage, deleteMessage }) => {
    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 animate-message-pop group`}>
            <div className={`max-w-[80%] md:max-w-md px-5 py-3 rounded-2xl shadow-md relative ${isOwnMessage
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-bl-sm'
                }`}>

                {isOwnMessage && (
                    <button
                        onClick={() => deleteMessage(message.id)}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete message"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}

                {!isOwnMessage && <div className="text-xs text-indigo-300 mb-1 font-medium">{message.from}</div>}
                <p className="leading-relaxed">{message.text}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? 'text-indigo-200' : 'text-gray-400'} opacity-70`}>
                    <span className="text-[10px]">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {isOwnMessage && (
                        message.seen ? (
                            <CheckCheck className="w-3 h-3 text-blue-300" />
                        ) : (
                            <Check className="w-3 h-3" />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default Message;
