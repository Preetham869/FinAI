// Financial Advice Engine
// Generates personalized advice based on income, savings rate, and category spending

import { FinancialState } from './rules';

export type AdviceSeverity = 'success' | 'warning' | 'danger' | 'info';

export interface FinancialAdvice {
  id: string;
  icon: string;
  title: string;
  message: string;
  severity: AdviceSeverity;
  actionable: string; // Short "what to do" tip
}

// Standard personal-finance benchmarks (as % of income)
const BENCHMARKS = {
  FOOD: 0.30,           // ≤ 30% of income
  ENTERTAINMENT: 0.10,  // ≤ 10% of income
  RENT: 0.35,           // ≤ 35% of income (30/30/30/10 rule)
  TRANSPORT: 0.10,      // ≤ 10% of income
  SHOPPING: 0.08,       // ≤ 8% of income
  BILLS: 0.20,          // ≤ 20% of income
  HEALTHCARE: 0.05,     // ≤ 5% of income
  EDUCATION: 0.05,      // ≤ 5% of income
  SAVINGS_EXCELLENT: 0.20,  // ≥ 20% savings rate = excellent
  SAVINGS_FAIR: 0.10,       // ≥ 10% = fair
  EMERGENCY_FUND_MONTHS: 3, // Should have 3× monthly expenses saved
};

const categoryBenchmark: Record<string, number> = {
  Food:          BENCHMARKS.FOOD,
  Entertainment: BENCHMARKS.ENTERTAINMENT,
  Rent:          BENCHMARKS.RENT,
  Transport:     BENCHMARKS.TRANSPORT,
  Shopping:      BENCHMARKS.SHOPPING,
  Bills:         BENCHMARKS.BILLS,
  Healthcare:    BENCHMARKS.HEALTHCARE,
  Education:     BENCHMARKS.EDUCATION,
};

const categoryEmoji: Record<string, string> = {
  Food: '🍽️',
  Entertainment: '🎬',
  Rent: '🏠',
  Transport: '🚗',
  Shopping: '🛍️',
  Bills: '🧾',
  Healthcare: '💊',
  Education: '📚',
  Travel: '✈️',
  Other: '📦',
};

export function generateFinancialAdvice(state: FinancialState): FinancialAdvice[] {
  const advice: FinancialAdvice[] = [];
  const { income, savings, savingsRate, categorySpending } = state;

  if (income === 0) {
    advice.push({
      id: 'no-income',
      icon: '⚠️',
      title: 'No Income Recorded',
      message: 'Add your income transactions for this month to unlock personalized financial advice.',
      severity: 'warning',
      actionable: 'Go to Transactions → Add Income to get started.',
    });
    return advice;
  }

  // ── 1. Savings Rate Advice ──────────────────────────────────────────────────
  if (savingsRate >= BENCHMARKS.SAVINGS_EXCELLENT * 100) {
    advice.push({
      id: 'savings-excellent',
      icon: '🎉',
      title: 'Excellent Savings Rate!',
      message: `You are saving ${Math.round(savingsRate)}% of your income (₹${savings.toLocaleString('en-IN')}), which exceeds the recommended 20%. Great discipline!`,
      severity: 'success',
      actionable: 'Consider putting surplus savings into a SIP, PPF, or index fund.',
    });
  } else if (savingsRate >= BENCHMARKS.SAVINGS_FAIR * 100) {
    advice.push({
      id: 'savings-fair',
      icon: '📈',
      title: 'Decent Savings, Room to Grow',
      message: `Your savings rate is ${Math.round(savingsRate)}%. You're on the right track, but the target is 20% of income (₹${Math.round(income * 0.20).toLocaleString('en-IN')}).`,
      severity: 'info',
      actionable: `Try to save an additional ₹${Math.round((income * 0.20) - savings).toLocaleString('en-IN')} to hit the 20% target.`,
    });
  } else if (savingsRate > 0) {
    advice.push({
      id: 'savings-low',
      icon: '💸',
      title: 'Savings Rate Is Below 10%',
      message: `You are saving only ${Math.round(savingsRate)}% of your income this month. This makes you vulnerable to financial shocks.`,
      severity: 'danger',
      actionable: `Aim to save at least ₹${Math.round(income * 0.10).toLocaleString('en-IN')} (10%) immediately. Review discretionary spending.`,
    });
  } else {
    advice.push({
      id: 'savings-negative',
      icon: '🚨',
      title: 'Spending Exceeds Income!',
      message: `Your expenses (₹${state.expenses.toLocaleString('en-IN')}) exceed your income (₹${income.toLocaleString('en-IN')}). You are in a deficit of ₹${Math.abs(savings).toLocaleString('en-IN')}.`,
      severity: 'danger',
      actionable: 'Immediately cut non-essential spending. Review and reduce the biggest expense categories.',
    });
  }

  // ── 2. Emergency Fund Nudge ─────────────────────────────────────────────────
  const emergencyFundNeeded = state.expenses * BENCHMARKS.EMERGENCY_FUND_MONTHS;
  if (savings < emergencyFundNeeded && savings > 0) {
    advice.push({
      id: 'emergency-fund',
      icon: '🛡️',
      title: 'Build Your Emergency Fund',
      message: `Financial experts recommend having ${BENCHMARKS.EMERGENCY_FUND_MONTHS}× your monthly expenses (≈ ₹${Math.round(emergencyFundNeeded).toLocaleString('en-IN')}) saved as an emergency buffer.`,
      severity: 'warning',
      actionable: 'Open a separate savings account and auto-transfer a fixed amount each month.',
    });
  }

  // ── 3. Category-Level Advice ────────────────────────────────────────────────
  for (const [category, spent] of Object.entries(categorySpending)) {
    const benchmark = categoryBenchmark[category];
    if (!benchmark) continue;

    const allowedAmount = income * benchmark;
    const ratio = spent / income;
    const emoji = categoryEmoji[category] || '📋';

    if (spent > allowedAmount) {
      const overBy = spent - allowedAmount;
      advice.push({
        id: `overspend-${category}`,
        icon: emoji,
        title: `${category} Spending Too High`,
        message: `You spent ₹${spent.toLocaleString('en-IN')} on ${category} (${Math.round(ratio * 100)}% of income). The recommended limit is ${Math.round(benchmark * 100)}% (₹${Math.round(allowedAmount).toLocaleString('en-IN')}).`,
        severity: 'danger',
        actionable: `Reduce ${category} spending by ₹${Math.round(overBy).toLocaleString('en-IN')} to stay within the healthy range.`,
      });
    } else if (spent > allowedAmount * 0.80) {
      advice.push({
        id: `approaching-${category}`,
        icon: emoji,
        title: `${category} Nearing Limit`,
        message: `${category} spending (₹${spent.toLocaleString('en-IN')}) is at ${Math.round(ratio * 100)}% of income — approaching the ${Math.round(benchmark * 100)}% recommended cap.`,
        severity: 'warning',
        actionable: `You can still spend ₹${Math.round(allowedAmount - spent).toLocaleString('en-IN')} more on ${category} this month.`,
      });
    }
  }

  // ── 4. Investment Nudge (when doing very well) ──────────────────────────────
  if (savingsRate >= 30) {
    advice.push({
      id: 'invest-surplus',
      icon: '📊',
      title: 'Great Job — Now Invest the Surplus!',
      message: `You're saving ${Math.round(savingsRate)}% of income. After your emergency fund is covered, idle savings lose value to inflation.`,
      severity: 'info',
      actionable: 'Explore ELSS mutual funds (tax-saving) or start a monthly SIP in a Nifty 50 index fund.',
    });
  }

  // Cap at 6 advice items to avoid overwhelming the user
  return advice.slice(0, 6);
}
