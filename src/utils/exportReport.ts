import { FinancialState } from '../types/finance';
import {
  calculateAvailableCash,
  calculateActualSpent,
  calculateTotalSaved,
  calculateRemainingCommitments,
  calculateDailyAllowance,
  calculateProjectedDay30Balance,
  calculateFinancialHealth,
  calculateFinancialRisk,
} from './calculations';

export function generateReportData(state: FinancialState) {
  const availableCash = calculateAvailableCash(state);
  const actualSpent = calculateActualSpent(state);
  const totalSaved = calculateTotalSaved(state);
  const remainingCommitments = calculateRemainingCommitments(state);
  const dailyAllowance = calculateDailyAllowance(state);
  const projectedDay30Balance = calculateProjectedDay30Balance(state);
  const financialHealth = calculateFinancialHealth(state);
  const financialRisk = calculateFinancialRisk(state);

  return {
    summary: {
      appName: 'PaisaPilot',
      user: state.userName,
      generatedAt: new Date().toISOString(),
      challengeDay: state.currentDay,
      totalDays: state.totalDays,
      totalBudget: state.totalBudget,
      availableLiquidCash: availableCash,
      actualSpentSoFar: actualSpent,
      totalVaultedSavings: totalSaved,
      reservedFixedCommitments: remainingCommitments,
      safeDailyAllowance: dailyAllowance,
      projectedDay30Balance,
      financialHealthScore: financialHealth.score,
      financialHealthStatus: financialHealth.status,
      financialRiskScore: financialRisk.riskScore,
      financialRiskBand: financialRisk.riskBand,
    },
    transactions: state.transactions,
    commitments: state.commitments,
    subscriptions: state.subscriptions,
    savingsGoals: state.savingsGoals,
    categoryBudgets: state.categoryBudgets,
  };
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function exportReportJSON(state: FinancialState) {
  const data = generateReportData(state);
  const jsonString = JSON.stringify(data, null, 2);
  const filename = `PaisaPilot_Financial_Report_Day${state.currentDay}_${new Date().toISOString().slice(0, 10)}.json`;
  downloadFile(jsonString, filename, 'application/json;charset=utf-8;');
}

export function exportReportCSV(state: FinancialState) {
  const data = generateReportData(state);
  const lines: string[] = [];

  // Title & Metadata
  lines.push('=== PAISAPILOT FINANCIAL AUDIT REPORT ===');
  lines.push(`Generated for,${data.summary.user}`);
  lines.push(`Export Date,${new Date().toLocaleDateString('en-IN')}`);
  lines.push(`Challenge Progress,Day ${data.summary.challengeDay} of ${data.summary.totalDays}`);
  lines.push('');

  // Executive Summary
  lines.push('=== EXECUTIVE FINANCIAL SUMMARY ===');
  lines.push(`Metric,Value (INR),Notes`);
  lines.push(`Total Monthly Budget,${data.summary.totalBudget},Starting reconciled funding`);
  lines.push(`Available Liquid Cash,${data.summary.availableLiquidCash},In hand and ready to spend`);
  lines.push(`Actual Expenses Incurred,${data.summary.actualSpentSoFar},Confirmed expenditure`);
  lines.push(`Total Vaulted Savings,${data.summary.totalVaultedSavings},Protected in goal vaults`);
  lines.push(`Reserved Fixed Commitments,${data.summary.reservedFixedCommitments},Mandatory upcoming bills & mess`);
  lines.push(`Safe Daily Allowance,${data.summary.safeDailyAllowance},Calculated discretionary daily limit`);
  lines.push(`Projected Day 30 Balance,${data.summary.projectedDay30Balance},Estimated balance at end of challenge`);
  lines.push(`Financial Health Index,${data.summary.financialHealthScore}/100,Status: ${data.summary.financialHealthStatus}`);
  lines.push(`Financial Risk Index,${data.summary.financialRiskScore}/100,Band: ${data.summary.financialRiskBand}`);
  lines.push('');

  // Transactions Ledger
  lines.push('=== TRANSACTION LEDGER ===');
  lines.push('ID,Description,Amount (INR),Category,Day,Type,Payment Method');
  if (data.transactions.length === 0) {
    lines.push('N/A,No transactions recorded yet,0,N/A,N/A,N/A,N/A');
  } else {
    data.transactions.forEach((tx) => {
      lines.push(
        `"${tx.id}","${tx.description.replace(/"/g, '""')}",${tx.amount},"${tx.category}","Day ${tx.day}","${tx.type}","${tx.paymentMethod}"`
      );
    });
  }
  lines.push('');

  // Fixed Commitments
  lines.push('=== FIXED COMMITMENTS ===');
  lines.push('ID,Name,Amount (INR),Category,Due Day,Status,Essential');
  data.commitments.forEach((c) => {
    lines.push(
      `"${c.id}","${c.name.replace(/"/g, '""')}",${c.amount},"${c.category}","Day ${c.dueDay}","${c.isPaid ? 'Paid' : 'Pending'}","${c.isEssential ? 'Yes' : 'No'}"`
    );
  });
  lines.push('');

  // Subscriptions
  lines.push('=== RECURRING SUBSCRIPTIONS ===');
  lines.push('ID,Name,Monthly Price (INR),Annual Run-Rate (INR),Billing Day,Category,Status,Essential');
  data.subscriptions.forEach((s) => {
    lines.push(
      `"${s.id}","${s.name.replace(/"/g, '""')}",${s.monthlyPrice},${s.monthlyPrice * 12},"Day ${s.dueDay}","${s.category}","${s.isActive ? 'Active' : 'Paused'}","${s.isEssential ? 'Yes' : 'No'}"`
    );
  });
  lines.push('');

  // Savings Goals
  lines.push('=== SAVINGS GOAL VAULTS ===');
  lines.push('ID,Goal Name,Target Amount (INR),Vaulted Amount (INR),Funded %,Priority,Category');
  data.savingsGoals.forEach((g) => {
    const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
    lines.push(
      `"${g.id}","${g.name.replace(/"/g, '""')}",${g.targetAmount},${g.currentAmount},"${pct}%","${g.priority}","${g.category}"`
    );
  });

  const csvString = lines.join('\n');
  const filename = `PaisaPilot_Financial_Report_Day${state.currentDay}_${new Date().toISOString().slice(0, 10)}.csv`;
  downloadFile(csvString, filename, 'text/csv;charset=utf-8;');
}
