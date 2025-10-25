import React, { useState, useEffect } from 'react';
import { View, Roommate, Expense, WishlistItem, ChatMessage, ExpenseTag, Contribution } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Expenses from './components/Expenses';
import Wishlist from './components/Wishlist';
import Insights from './components/Insights';
import Roommates from './components/Roommates';
import Modal from './components/Modal';
import { CowboyHatIcon, PlanetIcon, RocketIcon, LassoIcon } from './components/icons/Icons';

// Helper to read from localStorage
const getStoredData = <T,>(key: string, fallback: T): T => {
  const stored = localStorage.getItem(key);
  try {
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage`, error);
    return fallback;
  }
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [roommates, setRoommates] = useState<Roommate[]>(() => getStoredData('cosmo_roommates', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredData('cosmo_expenses', []));
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(() => getStoredData('cosmo_wishlist', []));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => getStoredData('cosmo_chat', []));
  const [currentUser, setCurrentUser] = useState<Roommate | null>(() => getStoredData('cosmo_currentUser', null) || getStoredData('cosmo_roommates', [])[0] || null);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);

  // Persist data to localStorage whenever it changes
  useEffect(() => { localStorage.setItem('cosmo_roommates', JSON.stringify(roommates)); }, [roommates]);
  useEffect(() => { localStorage.setItem('cosmo_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('cosmo_wishlist', JSON.stringify(wishlistItems)); }, [wishlistItems]);
  useEffect(() => { localStorage.setItem('cosmo_chat', JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem('cosmo_currentUser', JSON.stringify(currentUser)); }, [currentUser]);


  // --- CRUD Handlers ---
  const handleAddRoommate = (newRoommate: Omit<Roommate, 'id'>) => {
    const roommateWithId = { ...newRoommate, id: crypto.randomUUID() };
    setRoommates(prev => {
      const updated = [...prev, roommateWithId];
      if (!currentUser) setCurrentUser(updated[0]);
      return updated;
    });
    closeModal();
  };
  
  const handleEditRoommate = (updatedRoommate: Roommate) => {
    setRoommates(prev => prev.map(r => r.id === updatedRoommate.id ? updatedRoommate : r));
    if(currentUser?.id === updatedRoommate.id) setCurrentUser(updatedRoommate);
    closeModal();
  }

  const handleDeleteRoommate = (id: string) => {
    if(confirm('Are you sure you want to remove this crew member? This cannot be undone.')) {
      setRoommates(prev => prev.filter(r => r.id !== id));
      // Add logic to re-assign expenses, etc. or prevent deletion if they have debts.
    }
  }
  
  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...newExpense, id: crypto.randomUUID() }]);
    closeModal();
  };

  const handleEditExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(e => e.id === updatedExpense.id ? updatedExpense : e));
    closeModal();
  }

  const handleDeleteExpense = (id: string) => {
    if(confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  }

  const handleTogglePaidStatus = (expenseId: string, roommateId: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === expenseId) {
        return {
          ...exp,
          contributions: exp.contributions.map(c => {
            if (c.roommateId === roommateId) {
              return { ...c, paid: !c.paid };
            }
            return c;
          })
        };
      }
      return exp;
    }));
  };
  
  const handleAddWishlistItem = (newItem: Omit<WishlistItem, 'id' | 'currentAmount' | 'contributors'>) => {
    setWishlistItems(prev => [...prev, { ...newItem, id: crypto.randomUUID(), currentAmount: 0, contributors: [] }]);
    closeModal();
  };

  const handleContribute = (itemId: string, amount: number) => {
    setWishlistItems(prev => prev.map(item => {
      if (item.id === itemId && currentUser) {
        return {
          ...item,
          currentAmount: item.currentAmount + amount,
          contributors: [...item.contributors, { roommateId: currentUser.id, amount }]
        }
      }
      return item;
    }));
    closeModal();
  }

  const handleDeleteWishlistItem = (id: string) => {
     if(confirm('Are you sure you want to delete this wishlist item?')) {
        setWishlistItems(prev => prev.filter(item => item.id !== id));
     }
  }


  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const renderView = () => {
    if (!currentUser) {
      return <WelcomeScreen onAddFirstRoommate={handleAddRoommate} />;
    }
    switch (view) {
      case 'dashboard':
        return <Dashboard expenses={expenses} wishlistItems={wishlistItems} roommates={roommates} currentUser={currentUser} />;
      case 'expenses':
        return <Expenses expenses={expenses} roommates={roommates} currentUser={currentUser} openModal={openModal} closeModal={closeModal} onAddExpense={handleAddExpense} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} onTogglePaidStatus={handleTogglePaidStatus} />;
      case 'wishlist':
        return <Wishlist wishlistItems={wishlistItems} roommates={roommates} currentUser={currentUser} openModal={openModal} closeModal={closeModal} onAddWishlistItem={handleAddWishlistItem} onContribute={handleContribute} onDeleteWishlistItem={handleDeleteWishlistItem} />;
      case 'insights':
        return <Insights expenses={expenses} />;
      case 'roommates':
        return <Roommates roommates={roommates} chatMessages={chatMessages} setChatMessages={setChatMessages} currentUser={currentUser} openModal={openModal} onAddRoommate={handleAddRoommate} onEditRoommate={handleEditRoommate} onDeleteRoommate={handleDeleteRoommate} closeModal={closeModal} />;
      default:
        return <Dashboard expenses={expenses} wishlistItems={wishlistItems} roommates={roommates} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-space-dark bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="fixed top-0 left-0 w-full h-full bg-gradient-to-br from-space-dark via-transparent to-space-dark opacity-80 z-0"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row">
        {currentUser && <Header currentView={view} setView={setView} currentUser={currentUser} roommates={roommates} setCurrentUser={setCurrentUser} />}
        
        <main className={`flex-1 p-4 md:p-8 ${currentUser ? 'md:ml-64' : ''}`}>
           <PlanetIcon className="absolute top-24 right-16 w-24 h-24 text-neon-cyan opacity-10" />
           <RocketIcon className="absolute bottom-16 left-16 w-16 h-16 text-neon-orange opacity-10 transform -rotate-45" />
           <CowboyHatIcon className="absolute top-1/2 left-1/3 w-20 h-20 text-stardust opacity-5 transform rotate-12" />

          {renderView()}
        </main>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalContent?.['props']?.['title'] || 'Action'}>
        {modalContent}
      </Modal>
    </div>
  );
};


const WelcomeScreen: React.FC<{ onAddFirstRoommate: (roommate: Omit<Roommate, 'id'>) => void }> = ({ onAddFirstRoommate }) => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatar(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !avatar) {
            alert('Please provide your name and an avatar.');
            return;
        }
        onAddFirstRoommate({ name, avatarUrl: avatar });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <LassoIcon className="w-24 h-24 text-neon-orange" />
            <h1 className="text-5xl font-bold font-orbitron text-stardust mt-4">Welcome to CosmoCash</h1>
            <p className="text-stardust/80 mt-2">Your space cowboy guide to shared finances.</p>
            <form onSubmit={handleSubmit} className="mt-8 bg-space-medium/50 backdrop-blur-md p-8 rounded-lg border border-space-light/30 w-full max-w-sm flex flex-col items-center">
                <h2 className="text-2xl font-orbitron text-neon-cyan">Create Your Profile</h2>
                <p className="text-sm text-stardust/60 mb-6">You'll be the admin of this ship.</p>
                <input
                    type="text"
                    placeholder="Your Name (e.g., Spike)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-space-light/50 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-neon-orange mb-4"
                />
                <label className="w-full text-left text-sm text-stardust/70 mb-2">Upload Your Avatar:</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-stardust file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-neon-cyan/20 file:text-neon-cyan hover:file:bg-neon-cyan/30 mb-6"
                />
                {avatar && <img src={avatar} alt="Avatar Preview" className="w-24 h-24 rounded-full mb-6 border-4 border-neon-cyan" />}
                <button type="submit" className="w-full bg-neon-orange text-space-dark font-bold py-3 px-4 rounded-md shadow-neon-orange hover:brightness-110 transition-all">
                    Launch CosmoCash
                </button>
            </form>
        </div>
    );
};


export default App;