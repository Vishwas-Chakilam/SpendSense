import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Transaction, UserProfile } from '../types';
import { formatCurrency, getCurrencySymbol } from '../constants';

export function exportToPDF(transactions: Transaction[], profile: UserProfile) {
  const doc = new jsPDF();
  const currencySymbol = getCurrencySymbol(profile.currency);
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(2, 132, 199); // Brand color
  doc.text('Spendsense', 20, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Transaction Report for ${profile.name}`, 20, 30);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 38);
  
  // Summary
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 20, 55);
  
  doc.setFontSize(11);
  doc.text(`Total Transactions: ${transactions.length}`, 20, 65);
  doc.setTextColor(22, 163, 74); // Green
  doc.text(`Total Income: ${formatCurrency(income, profile.currency)}`, 20, 73);
  doc.setTextColor(220, 38, 38); // Red
  doc.text(`Total Expenses: ${formatCurrency(expense, profile.currency)}`, 20, 81);
  doc.setTextColor(0, 0, 0);
  
  // Table
  // Sort by date new to old
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tableData = sorted.map(t => [
    new Date(t.date).toLocaleDateString(),
    t.type.toUpperCase(),
    t.category,
    t.title,
    `${currencySymbol}${t.amount.toFixed(2)}`,
  ]);
  
  autoTable(doc, {
    startY: 95,
    head: [['Date', 'Type', 'Category', 'Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [2, 132, 199], // Brand 600
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      4: { halign: 'right' }
    },
    alternateRowStyles: {
      fillColor: [240, 249, 255], // Brand 50
    },
  });
  
  doc.save(`spendsense-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function exportToExcel(transactions: Transaction[], profile: UserProfile) {
  const wb = XLSX.utils.book_new();
  const currencySymbol = getCurrencySymbol(profile.currency);
  
  // Sheet 1: Transactions
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const transactionData = sorted.map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type,
    Category: t.category,
    Description: t.title,
    Amount: t.amount,
    'Currency': profile.currency
  }));
  
  const ws = XLSX.utils.json_to_sheet(transactionData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Type
    { wch: 15 }, // Category
    { wch: 25 }, // Description
    { wch: 12 }, // Amount
    { wch: 10 }, // Currency
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
  
  // Sheet 2: Summary
  const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  const categories = Object.entries(
    transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]);
  
  const summaryData = [
    { Metric: 'Total Transactions', Value: transactions.length },
    { Metric: 'Total Income', Value: income },
    { Metric: 'Total Expenses', Value: expense },
    { Metric: 'Net Balance', Value: income - expense },
    { Metric: '', Value: '' },
    { Metric: 'Category Breakdown', Value: '' },
    ...categories.map(([cat, amount]) => ({
      Metric: cat,
      Value: amount,
    })),
  ];
  
  const summaryWs = XLSX.utils.json_to_sheet(summaryData);
  summaryWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  XLSX.writeFile(wb, `spendsense-report-${new Date().toISOString().split('T')[0]}.xlsx`);
}
