import React, { useState } from 'react';
import { Roommate, ChatMessage } from '../types';
import { EditIcon, DeleteIcon } from './icons/Icons';

// --- RoommateForm ---
const RoommateForm: React.FC<{
    // FIX: Made onSave optional as it's not needed when editing.
    onSave?: (roommate: Omit<Roommate, 'id'>) => void;
    onEditSave?: (roommate: Roommate) => void;
    existingRoommate?: Roommate | null;
    title: string;
}> = ({ onSave, onEditSave, existingRoommate, title }) => {
    const [name, setName] = useState(existingRoommate?.name || '');
    const [avatarUrl, setAvatarUrl] = useState(existingRoommate?.avatarUrl || '');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => setAvatarUrl(event.target?.result as string);
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !avatarUrl) return;
        if (existingRoommate && onEditSave) {
            onEditSave({ ...existingRoommate, name, avatarUrl });
        } else if (onSave) {
            // FIX: Added a check for onSave before calling it.
            onSave({ name, avatarUrl });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Roommate Name" value={name} onChange={e => setName(e.target.value)} required className="w-full input-std" />
            <label className="w-full text-left text-sm text-stardust/70">Avatar:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-sm text-stardust file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-cyan/20 file:text-neon-cyan hover:file:bg-neon-cyan/30" />
            {avatarUrl && <img src={avatarUrl} alt="Avatar Preview" className="w-20 h-20 rounded-full border-2 border-neon-cyan" />}
            <button type="submit" className="w-full btn-primary">{existingRoommate ? 'Save Changes' : 'Add Roommate'}</button>
            <style>{`.input-std { background-color: #334155; padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid #475569; } .btn-primary { background-color: #fb923c; color: #0f172a; font-weight: bold; padding: 0.75rem 1rem; border-radius: 0.375rem; width: 100%; }`}</style>
        </form>
    );
};

// --- Main Roommates Component ---
interface RoommatesProps {
  roommates: Roommate[];
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentUser: Roommate;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  onAddRoommate: (roommate: Omit<Roommate, 'id'>) => void;
  onEditRoommate: (roommate: Roommate) => void;
  onDeleteRoommate: (id: string) => void;
}

const Roommates: React.FC<RoommatesProps> = ({ roommates, chatMessages, setChatMessages, currentUser, openModal, closeModal, onAddRoommate, onEditRoommate, onDeleteRoommate }) => {
    const [newMessage, setNewMessage] = useState('');

    const handleAddClick = () => {
        openModal(<RoommateForm onSave={onAddRoommate} title="Add New Crew Member" />);
    };
    
    const handleEditClick = (roommate: Roommate) => {
        openModal(<RoommateForm onEditSave={onEditRoommate} existingRoommate={roommate} title="Edit Crew Member" />);
    };

    const getRoommate = (id: string) => roommates.find(r => r.id === id);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        const newMsg: ChatMessage = {
            id: `msg${Date.now()}`,
            roommateId: currentUser.id,
            message: newMessage,
            timestamp: new Date().toISOString()
        };
        setChatMessages([...chatMessages, newMsg]);
        setNewMessage('');
    }

    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold font-orbitron text-stardust">Crew & Comms</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-space-light/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold font-orbitron text-neon-orange">Crew Members</h3>
                        <button onClick={handleAddClick} className="bg-neon-orange text-space-dark font-bold text-xs py-1 px-3 rounded-md shadow-neon-orange hover:brightness-110 transition-all">Invite</button>
                    </div>
                    <ul className="space-y-4">
                        {roommates.map(roommate => (
                            <li key={roommate.id} className="flex items-center p-3 bg-space-light/20 rounded-md group">
                                <img src={roommate.avatarUrl} alt={roommate.name} className="w-12 h-12 rounded-full border-2 border-neon-cyan" />
                                <div className="ml-4 flex-grow">
                                    <p className="font-bold text-lg text-stardust">{roommate.name}</p>
                                    <p className="text-sm text-stardust/60">{roommate.id === currentUser.id ? 'You (Admin)' : 'Crew Member'}</p>
                                </div>
                                {roommate.id !== currentUser.id && (
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleEditClick(roommate)} className="text-stardust/60 hover:text-neon-cyan"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeleteRoommate(roommate.id)} className="text-stardust/60 hover:text-neon-orange"><DeleteIcon className="w-5 h-5"/></button>
                                </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="lg:col-span-2 bg-space-medium/50 backdrop-blur-md rounded-lg border border-space-light/30 flex flex-col h-[60vh]">
                    <h3 className="text-xl font-bold font-orbitron text-neon-orange p-4 border-b border-space-light/30">Group Comms</h3>
                    <div className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {chatMessages.map(msg => {
                            const roommate = getRoommate(msg.roommateId);
                            const isCurrentUserMsg = msg.roommateId === currentUser.id;
                            return (
                                <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUserMsg ? 'flex-row-reverse' : ''}`}>
                                    <img src={roommate?.avatarUrl} alt={roommate?.name} className="w-8 h-8 rounded-full"/>
                                    <div className={`p-3 rounded-lg max-w-xs ${isCurrentUserMsg ? 'bg-neon-cyan/80 text-space-dark' : 'bg-space-light'}`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <p className={`text-xs mt-1 opacity-70 ${isCurrentUserMsg ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-space-light/30 flex items-center">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow bg-space-light/50 px-4 py-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-neon-orange"
                        />
                        <button type="submit" className="bg-neon-orange text-space-dark font-bold px-4 py-2 rounded-r-md">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Roommates;