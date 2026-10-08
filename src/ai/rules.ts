// CO4: Rule-based reasoning
// IF-THEN engine to analyze financial data

import { Budget, Recommendation, Transaction } from '../types';
import { BUDGET_THRESHOLDS, FINANCIAL_CONDITIONS, RECOMMENDATION_TEMPLATES, SAVINGS_TARGET_PERCENTAGE } from './knowledge';
import { predictNextMonthExpense } from './ml';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface FinancialState {
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
  categorySpending: Record<string, number>;
  budgets: Record<string, Budget>;
  transactions: Transaction[];
}

export const calculateFinancialState = (transactions: Transaction[], budgets: Budget[]): FinancialState => {
  const now = new Date();
  const start = startOfMonth(now).getTime();
  const end = endOfMonth(now).getTime();

  const currentMonthTx = transactions.filter(t => t.date >= start && t.date <= end);
  
  let income = 0;
  let expenses = 0;
  const categorySpending: Record<string, number> = {};

  currentMonthTx.forEach(t => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expenses += t.amount;
      categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
    }
  });

  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const budgetMap: Record<string, Budget> = {};
  budgets.forEach(b => {
    budgetMap[b.category] = b;
  });

  return { income, expenses, savings, savingsRate, categorySpending, budgets: budgetMap, transactions };
};

type RuleFunction = (state: FinancialState) => Recommendation | null;

// Rule 1: Over budget alert
const checkOverBudget: RuleFunction = (state) => {
  for (const [category, spent] of Object.entries(state.categorySpending)) {
    const budget = state.budgets[category];
    if (budget && spent > budget.amount) {
      return {
        id: `over-budget-${category}`,
        title: `${category} Over Budget`,
        message: RECOMMENDATION_TEMPLATES.OVER_BUDGET(category, spent - budget.amount),
        reason: `IF spending in ${category} (₹${spent}) > allocated budget (₹${budget.amount}) THEN alert.`,
        type: 'warning'
      };
    }
  }
  return null;
};

// Rule 2: Approaching budget
const checkApproachingBudget: RuleFunction = (state) => {
  for (const [category, spent] of Object.entries(state.categorySpending)) {
    const budget = state.budgets[category];
    if (budget && spent > 0) {
      const percentage = (spent / budget.amount) * 100;
      const threshold = BUDGET_THRESHOLDS.find(t => t.category === category)?.warningPercentage || 80;
      
      if (percentage >= threshold && percentage <= 100) {
        return {
          id: `near-budget-${category}`,
          title: `${category} Budget Warning`,
          message: RECOMMENDATION_TEMPLATES.NEAR_BUDGET(category, budget.amount - spent),
          reason: `IF spending in ${category} is >= ${threshold}% of budget THEN warn.`,
          type: 'info'
        };
      }
    }
  }
  return null;
};

// Rule 3: Low savings rate
const checkLowSavings: RuleFunction = (state) => {
  if (state.income > 0 && state.savingsRate < SAVINGS_TARGET_PERCENTAGE) {
    return {
      id: 'low-savings',
      title: 'Low Savings Rate',
      message: RECOMMENDATION_TEMPLATES.LOW_SAVINGS(),
      reason: `IF savings rate (${Math.round(state.savingsRate)}%) < target (${SAVINGS_TARGET_PERCENTAGE}%) THEN recommend saving more.`,
      type: 'warning'
    };
  }
  return null;
};

// Rule 4: Predictive Overspending (ML integrated with Rules)
const checkPredictiveOverspending: RuleFunction = (state) => {
  for (const category of Object.keys(state.budgets)) {
    const prediction = predictNextMonthExpense(state.transactions, category);
    const budget = state.budgets[category];
    
    if (prediction.confidence !== 'Insufficient Data' && prediction.predictedAmount > budget.amount * 1.1) {
      return {
        id: `predictive-over-${category}`,
        title: `Predicted Overspending in ${category}`,
        message: RECOMMENDATION_TEMPLATES.PREDICTION_WARNING(category, Math.round(prediction.predictedAmount - budget.amount)),
        reason: `IF ML predicted expenses (₹${prediction.predictedAmount}) > planned budget + 10% THEN recommend adjusting habits.`,
        type: 'warning'
      };
    }
  }
  return null;
};

export const RULE_ENGINE = [
  checkOverBudget,
  checkApproachingBudget,
  checkLowSavings,
  checkPredictiveOverspending
];

export const evaluateRules = (state: FinancialState): Recommendation[] => {
  const recommendations: Recommendation[] = [];
  
  for (const rule of RULE_ENGINE) {
    const rec = rule(state);
    if (rec) recommendations.push(rec);
  }
  
  return recommendations;
};
