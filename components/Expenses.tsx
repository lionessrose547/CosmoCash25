import React, { useState, useEffect } from 'react';
import { Expense, Roommate, ExpenseTag, Contribution } from '../types';
import { DeleteIcon, EditIcon } from './icons/Icons';

// --- ExpenseForm Component ---
type SplitMode = 'amount' | 'percentage';

const ExpenseForm: React.FC<{
    onSave: (expense: Omit<Expense, 'id'> | Expense) => void;
    roommates: Roommate[];
    title: string;
    existingExpense?: Expense;
}> = ({ onSave, roommates, title, existingExpense }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [tag, setTag] = useState<ExpenseTag>(ExpenseTag.Shared);
    const [isRecurring, setIsRecurring] = useState(false);
    
    const [splitMode, setSplitMode] = useState<SplitMode>('amount');
    const [splitValues, setSplitValues] = useState<Record<string, string>>({});
    const [paidStatus, setPaidStatus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (existingExpense) {
            setDescription(existingExpense.description);
            setAmount(String(existingExpense.amount));
            setDueDate(existingExpense.dueDate);
            setTag(existingExpense.tag);
            setIsRecurring(existingExpense.isRecurring);
            
            const initialSplits = existingExpense.contributions.reduce((acc, c) => ({...acc, [c.roommateId]: String(c.amount)}), {});
            setSplitValues(initialSplits);
            
            const initialPaidStatus = existingExpense.contributions.reduce((acc, c) => ({...acc, [c.roommateId]: c.paid}), {});
            setPaidStatus(initialPaidStatus);
        }
    }, [existingExpense]);

    const handleSplitEvenly = () => {
        const total = parseFloat(amount) || 0;
        const numRoommates = roommates.length;
        if (total === 0 || numRoommates === 0) return;

        if (splitMode === 'amount') {
            const share = (total / numRoommates).toFixed(2);
            setSplitValues(roommates.reduce((acc, r) => ({ ...acc, [r.id]: share }), {}));
        } else {
            const share = (100 / numRoommates).toFixed(2);
            setSplitValues(roommates.reduce((acc, r) => ({ ...acc, [r.id]: share }), {}));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            alert("Please enter a valid total amount.");
            return;
        }

        let contributions: Contribution[] = [];

        if (tag === ExpenseTag.Shared) {
             const values = Object.values(splitValues).map(parseFloat).filter(v => !isNaN(v));
             const sum = values.reduce((a, b) => a + b, 0);

             if (splitMode === 'amount' && Math.abs(sum - totalAmount) > 0.01) {
                 alert(`Split amounts ($${sum.toFixed(2)}) do not add up to the total amount ($${totalAmount.toFixed(2)}).`);
                 return;
             }
             if (splitMode === 'percentage' && Math.abs(sum - 100) > 0.01) {
                 alert(`Percentages (${sum.toFixed(2)}%) do not add up to 100%.`);
                 return;
             }

            contributions = roommates.map(r => {
                const splitValue = parseFloat(splitValues[r.id]) || 0;
                const contributionAmount = splitMode === 'percentage' ? (totalAmount * splitValue) / 100 : splitValue;
                return {
                    roommateId: r.id,
                    amount: contributionAmount,
                    paid: paidStatus[r.id] || false
                };
            });
        } else {
             // For personal expenses, find who it's for or assign to first roommate. Simplified.
             const personalContributor = roommates[0]?.id;
             if(personalContributor) {
                contributions = [{ roommateId: personalContributor, amount: totalAmount, paid: paidStatus[personalContributor] || false }];
             }
        }
        
        const expenseData = { description, amount: totalAmount, dueDate, tag, isRecurring, contributions };
        if(existingExpense) {
            onSave({ ...expenseData, id: existingExpense.id });
        } else {
            onSave(expenseData);
        }
    };
    
    const totalSplit = Object.values(splitValues).map(v => parseFloat(v) || 0).reduce((sum, v) => sum + v, 0);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} required className="w-full input-std" />
            <div className="flex gap-4">
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required className="w-1/2 input-std" />
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-1/2 input-std" />
            </div>
            <select value={tag} onChange={e => setTag(e.target.value as ExpenseTag)} className="w-full input-std">
                <option value={ExpenseTag.Shared}>Shared</option>
                <option value={ExpenseTag.Personal}>Personal</option>
            </select>
            {tag === ExpenseTag.Shared && (
                <div className="p-3 bg-space-light/20 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-stardust/70">Split between:</h4>
                        <div className="flex items-center gap-2 text-xs">
                            <label><input type="radio" name="splitMode" value="amount" checked={splitMode === 'amount'} onChange={() => setSplitMode('amount')} /> $</label>
                            <label><input type="radio" name="splitMode" value="percentage" checked={splitMode === 'percentage'} onChange={() => setSplitMode('percentage')} /> %</label>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <button type="button" onClick={handleSplitEvenly} className="text-xs bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded">Split Evenly</button>
                        <span className="text-xs text-stardust/60">Total: {totalSplit.toFixed(2)}{splitMode === 'percentage' ? '%' : ''}</span>
                    </div>
                    <div className="max-h-40 overflow-y-auto pr-2">
                        {roommates.map(r => (
                            <div key={r.id} className="grid grid-cols-12 items-center gap-2 mb-2">
                               <img src={r.avatarUrl} className="col-span-1 w-6 h-6 rounded-full" />
                               <span className="col-span-4 text-sm truncate">{r.name}</span>
                               <div className="col-span-4 relative">
                                   <span className="absolute left-2 top-1/2 -translate-y-1/2 text-stardust/50 text-sm">{splitMode === 'amount' ? '$' : '%'}</span>
                                   <input type="number" step="0.01" placeholder="0.00" value={splitValues[r.id] || ''} onChange={e => setSplitValues({...splitValues, [r.id]: e.target.value})} className="w-full input-std pl-6" />
                               </div>
                               <label className="col-span-3 flex items-center justify-center text-xs cursor-pointer">
                                   <input type="checkbox" checked={paidStatus[r.id] || false} onChange={e => setPaidStatus({...paidStatus, [r.id]: e.target.checked})} className="mr-1 accent-neon-cyan" />
                                   Paid
                               </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex items-center gap-2">
                <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} />
                <label htmlFor="recurring" className="text-sm">Is this a recurring monthly expense?</label>
            </div>
            <button type="submit" className="w-full btn-primary">{existingExpense ? 'Save Changes' : 'Add Expense'}</button>
            <style>{`.input-std { background-color: #334155; padding: 0.5rem 1rem; border-radius: 0.375rem; border: 1px solid #475569; } .btn-primary { background-color: #fb923c; color: #0f172a; font-weight: bold; padding: 0.75rem 1rem; border-radius: 0.375rem; width: 100%; }`}</style>
        </form>
    );
};

// --- Main Expenses Component ---
interface ExpensesProps {
  expenses: Expense[];
  roommates: Roommate[];
  currentUser: Roommate;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onTogglePaidStatus: (expenseId: string, roommateId: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, roommates, currentUser, openModal, closeModal, onAddExpense, onEditExpense, onDeleteExpense, onTogglePaidStatus }) => {
    const [filter, setFilter] = useState<'all' | 'shared' | 'personal'>('all');

    const handleSave = (expense: Omit<Expense, 'id'> | Expense) => {
        if ('id' in expense) {
            onEditExpense(expense);
        } else {
            onAddExpense(expense);
        }
        closeModal();
    };

    const handleAddClick = () => {
        openModal(<ExpenseForm onSave={handleSave} roommates={roommates} title="Add New Expense" />);
    };
    
    const handleEditClick = (expense: Expense) => {
        openModal(<ExpenseForm onSave={handleSave} roommates={roommates} title="Edit Expense" existingExpense={expense} />);
    };

    const filteredExpenses = expenses.filter(e => {
        if (filter === 'all') return true;
        if (filter === 'shared') return e.tag === ExpenseTag.Shared;
        if (filter === 'personal') return e.tag === ExpenseTag.Personal && e.contributions.some(c => c.roommateId === currentUser.id);
        return false;
    }).sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

    const getRoommate = (id: string) => roommates.find(r => r.id === id);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold font-orbitron text-stardust">Expenses</h2>
                <button onClick={handleAddClick} className="bg-neon-orange text-space-dark font-bold py-2 px-4 rounded-md shadow-neon-orange hover:brightness-110 transition-all">
                    Add Expense
                </button>
            </div>

            <div className="flex space-x-2 p-1 bg-space-medium rounded-lg max-w-sm">
                <button onClick={() => setFilter('all')} className={`w-full py-2 rounded-md transition ${filter === 'all' ? 'bg-neon-cyan text-space-dark font-bold' : 'text-stardust/70'}`}>All</button>
                <button onClick={() => setFilter('shared')} className={`w-full py-2 rounded-md transition ${filter === 'shared' ? 'bg-neon-cyan text-space-dark font-bold' : 'text-stardust/70'}`}>Shared</button>
                <button onClick={() => setFilter('personal')} className={`w-full py-2 rounded-md transition ${filter === 'personal' ? 'bg-neon-cyan text-space-dark font-bold' : 'text-stardust/70'}`}>Personal</button>
            </div>
            
            <div className="bg-space-medium/50 backdrop-blur-md p-4 rounded-lg border border-space-light/30">
                <div className="overflow-x-auto">
                    {filteredExpenses.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-space-light/30 text-stardust/70 uppercase text-xs">
                                    <th className="p-4">Description</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Due Date</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredExpenses.map(exp => (
                                    <tr key={exp.id} className="border-b border-space-light/20 hover:bg-space-light/20">
                                        <td className="p-4 font-semibold">{exp.description}</td>
                                        <td className="p-4 font-source-code text-lg">${exp.amount.toFixed(2)}</td>
                                        <td className="p-4">{new Date(exp.dueDate).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            {exp.tag === ExpenseTag.Shared ? (
                                                <div className="flex items-center space-x-2">
                                                    {exp.contributions.map(c => {
                                                        const roommate = getRoommate(c.roommateId);
                                                        return (
                                                            <div key={c.roommateId} className="relative group">
                                                                <button onClick={() => onTogglePaidStatus(exp.id, c.roommateId)} className="focus:outline-none">
                                                                    <img src={roommate?.avatarUrl} alt={roommate?.name} className={`w-8 h-8 rounded-full border-2 transition-all transform hover:scale-110 ${c.paid ? 'border-neon-cyan' : 'border-neon-orange'}`} />
                                                                </button>
                                                                <div className="absolute bottom-full mb-2 w-max px-2 py-1 bg-space-dark text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{roommate?.name}: ${c.amount.toFixed(2)} ({c.paid ? 'Paid' : 'Owed'})</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${exp.contributions[0]?.paid ? 'bg-neon-cyan/20 text-neon-cyan' : 'bg-neon-orange/20 text-neon-orange'}`}>
                                                    {exp.contributions[0]?.paid ? 'Paid' : 'Owed'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                          <div className="flex items-center gap-4">
                                              <button onClick={() => handleEditClick(exp)} className="text-stardust/60 hover:text-neon-cyan transition-colors">
                                                  <EditIcon className="w-5 h-5" />
                                              </button>
                                              <button onClick={() => onDeleteExpense(exp.id)} className="text-stardust/60 hover:text-neon-orange transition-colors">
                                                  <DeleteIcon className="w-5 h-5" />
                                              </button>
                                          </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-stardust/80">No expenses found for this category.</p>
                            <p className="text-sm text-stardust/60">Click "Add Expense" to get started!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;