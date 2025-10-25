import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Expense, ExpenseTag } from '../types';

interface InsightsProps {
  expenses: Expense[];
}

const COLORS = ['#fb923c', '#22d3ee', '#8b5cf6', '#ec4899', '#22c55e'];

const Insights: React.FC<InsightsProps> = ({ expenses }) => {
  const sharedSpending = expenses
    .filter(e => e.tag === ExpenseTag.Shared)
    .reduce((sum, e) => sum + e.amount, 0);
  const personalSpending = expenses
    .filter(e => e.tag === ExpenseTag.Personal)
    .reduce((sum, e) => sum + e.amount, 0);

  const spendingData = [
    { name: 'Shared Expenses', value: sharedSpending },
    { name: 'Personal Expenses', value: personalSpending },
  ].filter(d => d.value > 0);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Description,Amount,Tag,DueDate\n";
    expenses.forEach(exp => {
      const row = [exp.description, exp.amount, exp.tag, exp.dueDate].join(",");
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cosmocash_expenses.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
        <div className="flex justify-between items-center">
            <h2 className="text-4xl font-bold font-orbitron text-stardust">Insights & Reporting</h2>
            <button onClick={exportToCSV} disabled={expenses.length === 0} className="bg-neon-cyan text-space-dark font-bold py-2 px-4 rounded-md shadow-neon-cyan hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Export to CSV
            </button>
        </div>
        
        <div className="bg-space-medium/50 backdrop-blur-md p-6 rounded-lg border border-space-light/30">
            <h3 className="text-xl font-bold font-orbitron text-neon-orange mb-4">Spending Breakdown</h3>
            {expenses.length > 0 ? (
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={spendingData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={150}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {spendingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#1e293b', 
                                    border: '1px solid #334155',
                                    color: '#e2e8f0',
                                }}
                            />
                            <Legend wrapperStyle={{ color: '#e2e8f0' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                 <div className="text-center py-20">
                    <p className="text-stardust/80 text-lg">No spending data to analyze.</p>
                    <p className="text-sm text-stardust/60 mt-2">Add some expenses to see your financial insights here.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Insights;
