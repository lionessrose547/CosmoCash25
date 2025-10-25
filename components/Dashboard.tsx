import React from 'react';
import { Expense, WishlistItem, Roommate, ExpenseTag } from '../types';

interface DashboardProps {
  expenses: Expense[];
  wishlistItems: WishlistItem[];
  roommates: Roommate[];
  currentUser: Roommate;
}

const StatCard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-space-light/30 transform hover:scale-105 transition-transform duration-300">
        <h3 className="text-sm font-semibold text-stardust/70 uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold font-orbitron text-neon-cyan my-2">{value}</p>
        <p className="text-xs text-stardust/60">{description}</p>
    </div>
);

const EmptyState: React.FC<{ title: string, message: string }> = ({ title, message }) => (
    <div className="bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-dashed border-space-light/30 text-center">
        <h3 className="text-xl font-bold font-orbitron text-neon-orange mb-2">{title}</h3>
        <p className="text-stardust/70">{message}</p>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ expenses, wishlistItems, roommates, currentUser }) => {
    const totalPersonalSpending = expenses
        .filter(e => e.tag === ExpenseTag.Personal && e.contributions.some(c => c.roommateId === currentUser.id))
        .reduce((sum, e) => sum + e.amount, 0);

    const totalSharedSpending = expenses
        .filter(e => e.tag === ExpenseTag.Shared)
        .reduce((sum, e) => sum + e.amount, 0);

    const yourOwedAmount = expenses
        .flatMap(e => e.contributions)
        .filter(c => c.roommateId === currentUser.id && !c.paid)
        .reduce((sum, c) => sum + c.amount, 0);

    const upcomingExpenses = expenses
        .filter(e => new Date(e.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 3);
        
    return (
        <div className="space-y-8">
            <h2 className="text-4xl font-bold font-orbitron text-stardust">Welcome, {currentUser.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Your Personal Spending" value={`$${totalPersonalSpending.toFixed(2)}`} description="This month" />
                <StatCard title="Total Shared Expenses" value={`$${totalSharedSpending.toFixed(2)}`} description="This month" />
                <StatCard title="You Owe" value={`$${yourOwedAmount.toFixed(2)}`} description="Across all shared expenses" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {upcomingExpenses.length > 0 ? (
                    <div className="bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-space-light/30">
                        <h3 className="text-xl font-bold font-orbitron text-neon-orange mb-4">Upcoming Bills</h3>
                        <ul className="space-y-4">
                            {upcomingExpenses.map(exp => (
                                <li key={exp.id} className="flex justify-between items-center p-3 bg-space-light/20 rounded-md">
                                    <div>
                                        <p className="font-semibold text-stardust">{exp.description}</p>
                                        <p className="text-xs text-stardust/60">Due: {new Date(exp.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <p className="font-bold text-lg text-neon-cyan">${exp.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : <EmptyState title="No Upcoming Bills" message="Looks like your finances are clear for now." />}

                {wishlistItems.length > 0 ? (
                    <div className="bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-space-light/30">
                        <h3 className="text-xl font-bold font-orbitron text-neon-orange mb-4">Wishlist Fund Progress</h3>
                        <ul className="space-y-4">
                            {wishlistItems.map(item => {
                                const progress = item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0;
                                return (
                                    <li key={item.id}>
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="font-semibold text-stardust">{item.name}</p>
                                            <p className="text-sm text-stardust/80">${item.currentAmount} / ${item.targetAmount}</p>
                                        </div>
                                        <div className="w-full bg-space-light rounded-full h-2.5">
                                            <div className="bg-neon-cyan h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                 ) : <EmptyState title="No Wishlist Items" message="Add a shared goal to start saving together." />}
            </div>
        </div>
    );
};

export default Dashboard;
