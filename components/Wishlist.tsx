import React, { useState } from 'react';
import { WishlistItem, Roommate } from '../types';
import { DeleteIcon } from './icons/Icons';

// --- WishlistForms ---
const WishlistForm: React.FC<{ onSave: (item: Omit<WishlistItem, 'id'|'currentAmount'|'contributors'>) => void; title: string; }> = ({ onSave, title }) => {
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, targetAmount: parseFloat(targetAmount) });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Item Name (e.g., Holo-Deck)" value={name} onChange={e => setName(e.target.value)} required className="w-full input-std" />
            <input type="number" placeholder="Target Amount" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} required className="w-full input-std" />
            <button type="submit" className="w-full btn-primary">Add Item</button>
             <style>{`.input-std { background-color: #334155; padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid #475569; } .btn-primary { background-color: #fb923c; color: #0f172a; font-weight: bold; padding: 0.75rem 1rem; border-radius: 0.375rem; width: 100%; }`}</style>
        </form>
    );
}

const ContributeForm: React.FC<{ onSave: (amount: number) => void; title: string; currentAmount: number, targetAmount: number }> = ({ onSave, title, currentAmount, targetAmount }) => {
    const [amount, setAmount] = useState('');
    const remaining = targetAmount - currentAmount;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const contribution = parseFloat(amount);
        if (contribution > remaining) {
            alert(`Contribution cannot exceed the remaining amount of $${remaining.toFixed(2)}`);
            return;
        }
        onSave(contribution);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-stardust/80">Amount remaining: <span className="font-bold text-neon-cyan">${remaining.toFixed(2)}</span></p>
            <input type="number" placeholder="Contribution Amount" value={amount} onChange={e => setAmount(e.target.value)} required max={remaining} step="0.01" className="w-full input-std" />
            <button type="submit" className="w-full btn-primary bg-neon-cyan shadow-neon-cyan">Contribute</button>
             <style>{`.input-std { background-color: #334155; padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid #475569; } .btn-primary { color: #0f172a; font-weight: bold; padding: 0.75rem 1rem; border-radius: 0.375rem; width: 100%; }`}</style>
        </form>
    );
}

// --- Main Wishlist Component ---
interface WishlistProps {
  wishlistItems: WishlistItem[];
  roommates: Roommate[];
  currentUser: Roommate;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  onAddWishlistItem: (item: Omit<WishlistItem, 'id'|'currentAmount'|'contributors'>) => void;
  onContribute: (itemId: string, amount: number) => void;
  onDeleteWishlistItem: (id: string) => void;
}

const Wishlist: React.FC<WishlistProps> = ({ wishlistItems, roommates, openModal, onAddWishlistItem, onContribute, onDeleteWishlistItem }) => {

    const handleAddClick = () => {
        openModal(<WishlistForm onSave={onAddWishlistItem} title="Add Wishlist Item" />);
    };
    
    const handleContributeClick = (item: WishlistItem) => {
        openModal(<ContributeForm onSave={(amount) => onContribute(item.id, amount)} title={`Contribute to ${item.name}`} currentAmount={item.currentAmount} targetAmount={item.targetAmount} />);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold font-orbitron text-stardust">Wishlist Fund</h2>
                 <button onClick={handleAddClick} className="bg-neon-orange text-space-dark font-bold py-2 px-4 rounded-md shadow-neon-orange hover:brightness-110 transition-all">
                    Add Wishlist Item
                </button>
            </div>

            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map(item => {
                        const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
                        return (
                            <div key={item.id} className="bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-space-light/30 space-y-4 flex flex-col relative group">
                                <div className="absolute top-2 right-2">
                                     <button onClick={() => onDeleteWishlistItem(item.id)} className="text-stardust/50 hover:text-neon-orange transition-colors opacity-0 group-hover:opacity-100">
                                        <DeleteIcon className="w-5 h-5" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold font-orbitron text-neon-orange">{item.name}</h3>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="text-stardust/80">Progress</span>
                                        <span>${item.currentAmount.toFixed(2)} / ${item.targetAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="w-full bg-space-light rounded-full h-3">
                                        <div className="bg-gradient-to-r from-neon-orange to-neon-cyan h-3 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                                
                                <div className="flex-grow">
                                    <h4 className="text-sm font-semibold mb-2 text-stardust/70">Contributors</h4>
                                    {item.contributors.length > 0 ? (
                                        <div className="flex items-center space-x-2">
                                            {item.contributors.map(({ roommateId }, index) => {
                                                const roommate = roommates.find(r => r.id === roommateId);
                                                return (
                                                    <img key={`${roommateId}-${index}`} src={roommate?.avatarUrl} alt={roommate?.name} title={roommate?.name} className="w-8 h-8 rounded-full border-2 border-neon-cyan"/>
                                                );
                                            })}
                                        </div>
                                    ): (<p className="text-xs text-stardust/50">Be the first to contribute!</p>)}
                                </div>

                                <button onClick={() => handleContributeClick(item)} disabled={item.currentAmount >= item.targetAmount} className="w-full mt-4 bg-neon-cyan text-space-dark font-bold py-2 px-4 rounded-md shadow-neon-cyan hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {item.currentAmount >= item.targetAmount ? 'Funded!' : 'Contribute'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-space-medium/50 backdrop-blur-md rounded-lg border border-dashed border-space-light/30">
                    <p className="text-stardust/80 text-lg">Your wishlist is empty.</p>
                    <p className="text-sm text-stardust/60 mt-2">Add a shared goal like a new couch or TV to start saving together!</p>
                </div>
            )}
        </div>
    );
};

export default Wishlist;
