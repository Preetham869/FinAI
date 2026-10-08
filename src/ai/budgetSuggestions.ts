// Smart Budget Suggestions
// Calculates recommended spending limits for each category based on monthly income

import { CATEGORIES } from './knowledge';

// Recommended % of income per category (adds up to ~130% because
// not every category applies to everyone — user picks the relevant ones)
const CATEGORY_INCOME_RATIO: Record<string, number> = {
  Food:          0.30,  // 30% of income
  Transport:     0.10,  // 10%
  Shopping:      0.08,  // 8%
  Entertainment: 0.10,  // 10%
  Bills:         0.20,  // 20%
  Education:     0.05,  // 5%
  Healthcare:    0.05,  // 5%
  Travel:        0.05,  // 5%
  Rent:          0.35,  // 35%
  Other:         0.07,  // 7%
};

export interface BudgetSuggestion {
  category: string;
  suggestedAmount: number;
  percentOfIncome: number;
  rationale: string;
}

/**
 * Returns suggested monthly budget limits for each category
 * based on the user's monthly income.
 */
export function getSuggestedBudgets(monthlyIncome: number): BudgetSuggestion[] {
  if (monthlyIncome <= 0) return [];

  return CATEGORIES.map(category => {
    const ratio = CATEGORY_INCOME_RATIO[category] ?? 0.05;
    const suggestedAmount = Math.round(monthlyIncome * ratio);
    const percentOfIncome = Math.round(ratio * 100);

    const rationales: Record<string, string> = {
      Food:          `Standard guideline: ≤ 30% of income for food`,
      Transport:     `Standard guideline: ≤ 10% for commute & transport`,
      Shopping:      `Lifestyle spending: ≤ 8% keeps discretionary in check`,
      Entertainment: `Fun money: ≤ 10% of income`,
      Bills:         `Utilities & subscriptions: ≤ 20% of income`,
      Education:     `Self-investment: ≤ 5% of income`,
      Healthcare:    `Well-being: ≤ 5% of income`,
      Travel:        `Travel budget: ≤ 5% per month (allocate quarterly if easier)`,
      Rent:          `Housing: ≤ 35% of income (30/30/30/10 rule)`,
      Other:         `Miscellaneous: ≤ 7% of income`,
    };

    return {
      category,
      suggestedAmount,
      percentOfIncome,
      rationale: rationales[category] ?? `Suggested: ${percentOfIncome}% of income`,
    };
  });
}

/**
 * Returns a simple map of category → suggested amount (for quick lookup)
 */
export function getSuggestedBudgetMap(monthlyIncome: number): Record<string, number> {
  const suggestions = getSuggestedBudgets(monthlyIncome);
  const map: Record<string, number> = {};
  suggestions.forEach(s => { map[s.category] = s.suggestedAmount; });
  return map;
}
