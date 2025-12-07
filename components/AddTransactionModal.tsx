import React, { useState, useRef } from 'react';
import { Category, Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCurrencySymbol } from '../constants';
import { Icons } from './Icons';
import { scanReceipt } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  currency: string;
}

const AddTransactionModal: React.FC<Props> = ({ isOpen, onClose, onAdd, currency }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const currencySymbol = getCurrencySymbol(currency);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      type,
      amount: parseFloat(amount),
      title: title || 'Untitled',
      category: category || currentCategories[0],
      date: new Date(date).toISOString(),
    });
    // Reset
    setAmount('');
    setTitle('');
    setType('expense');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    // Switch to expense mode automatically for receipts
    setType('expense');
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      try {
        const data = await scanReceipt(base64Data);
        if (data.amount) setAmount(data.amount.toString());
        if (data.title) setTitle(data.title);
        if (data.date) setDate(data.date);
        if (data.category) setCategory(data.category);
      } catch (err) {
        alert('Failed to scan receipt. Please try manual entry.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 animate-slide-up shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">New Transaction</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <Icons.X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Type Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
          <button
            onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              type === 'expense' 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Expense
          </button>
          <button
            onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              type === 'income' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Income
          </button>
        </div>

        {type === 'expense' && (
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="w-full mb-6 py-3 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100 border-dashed"
          >
            {isScanning ? (
              <span className="animate-pulse">Analyzing Receipt...</span>
            ) : (
              <>
                <Icons.Camera className="w-5 h-5" />
                <span>Auto-fill from Receipt</span>
              </>
            )}
          </button>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currencySymbol}</span>
              <input 
                type="number" 
                step="0.01" 
                required 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xl font-bold text-slate-900 focus:ring-2 outline-none ${
                    type === 'income' ? 'focus:ring-green-500' : 'focus:ring-brand-500'
                }`} 
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
            <input 
              type="text" 
              required 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-slate-900 focus:ring-2 outline-none ${
                    type === 'income' ? 'focus:ring-green-500' : 'focus:ring-brand-500'
                }`}
              placeholder={type === 'income' ? 'e.g. Paycheck' : 'e.g. Starbucks'} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={`w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-slate-900 focus:ring-2 outline-none appearance-none ${
                    type === 'income' ? 'focus:ring-green-500' : 'focus:ring-brand-500'
                }`}
              >
                {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
              <input 
                type="date" 
                required 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-slate-900 focus:ring-2 outline-none ${
                    type === 'income' ? 'focus:ring-green-500' : 'focus:ring-brand-500'
                }`}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-lg mt-4 active:scale-[0.98] transition-transform ${
                type === 'income' ? 'bg-green-600 shadow-green-200' : 'bg-brand-600 shadow-brand-200'
            }`}
          >
            {type === 'income' ? 'Add Income' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;