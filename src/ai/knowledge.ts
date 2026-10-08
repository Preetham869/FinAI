// CO3: Knowledge Representation
// Representing financial knowledge, rules, constraints, and recommendations

export const CATEGORIES = [
  'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 
  'Education', 'Healthcare', 'Travel', 'Rent', 'Other'
];

export interface SpendingThreshold {
  category: string;
  warningPercentage: number; // e.g., 80% of budget
  criticalPercentage: number; // e.g., 100% of budget
}

export const BUDGET_THRESHOLDS: SpendingThreshold[] = CATEGORIES.map(cat => ({
  category: cat,
  warningPercentage: 80,
  criticalPercentage: 100
}));

export const SAVINGS_TARGET_PERCENTAGE = 20; // 20% of income is a standard healthy savings rate

export const FINANCIAL_CONDITIONS = {
  HIGH_EXPENSE_RATIO: 0.8, // If expenses > 80% of income
  LOW_SAVINGS_RATIO: 0.1,  // If savings < 10% of income
  SUDDEN_SPENDING_SPIKE: 1.5, // 50% increase compared to last month
};

export const RECOMMENDATION_TEMPLATES = {
  OVER_BUDGET: (category: string, overAmount: number) => 
    `You have exceeded your ${category} budget by ₹${overAmount}. Consider reducing discretionary spending for the rest of the month.`,
  NEAR_BUDGET: (category: string, remainingAmount: number) => 
    `You are approaching your limit for ${category}. Only ₹${remainingAmount} remaining.`,
  LOW_SAVINGS: () => 
    `Your savings rate is below the recommended ${SAVINGS_TARGET_PERCENTAGE}%. Try to identify non-essential expenses to cut back on.`,
  TREND_SPIKE: (category: string, percentage: number) => 
    `Your spending in ${category} has increased by ${percentage}% compared to last month.`,
  PREDICTION_WARNING: (category: string, predictedOverAmount: number) =>
    `Based on your current trend, you are predicted to exceed your ${category} budget by ₹${predictedOverAmount} next month.`
};
