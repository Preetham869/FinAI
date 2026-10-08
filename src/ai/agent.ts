// Intelligent agent models and problem-solving
// Agent that orchestrates data observation, ML prediction, and Rule evaluation

import { Budget, Recommendation, Transaction, AIInsight } from '../types';
import { calculateFinancialState, evaluateRules, FinancialState } from './rules';
import { predictNextMonthExpense } from './ml';

export interface AgentAnalysis {
  state: FinancialState;
  healthScore: number;
  healthReasons: string[];
  recommendations: Recommendation[];
  insights: AIInsight[];
  nextMonthPredictionTotal: number;
}

export class FinanceAgent {
  private transactions: Transaction[];
  private budgets: Budget[];

  constructor(transactions: Transaction[], budgets: Budget[]) {
    this.transactions = transactions;
    this.budgets = budgets;
  }

  // Orchestration method
  public analyze(): AgentAnalysis {
    // 1. Observe
    const state = calculateFinancialState(this.transactions, this.budgets);
    
    // 2. ML Prediction
    const totalPrediction = predictNextMonthExpense(this.transactions, null);
    
    // 3. Rule-based Reasoning
    const recommendations = evaluateRules(state);
    
    // 4. Generate Insights
    const insights = this.generateInsights(state, totalPrediction.predictedAmount);

    // 5. Calculate Health Score
    const { score, reasons } = this.calculateHealthScore(state, recommendations.length);

    return {
      state,
      healthScore: score,
      healthReasons: reasons,
      recommendations,
      insights,
      nextMonthPredictionTotal: totalPrediction.predictedAmount
    };
  }

  private generateInsights(state: FinancialState, nextMonthTotalPrediction: number): AIInsight[] {
    const insights: AIInsight[] = [];
    
    // Find highest spending category
    let highestCat = '';
    let maxSpent = 0;
    Object.entries(state.categorySpending).forEach(([cat, spent]) => {
      if (spent > maxSpent) {
        maxSpent = spent;
        highestCat = cat;
      }
    });

    if (highestCat) {
      insights.push({
        type: 'trend',
        title: 'Highest Spending Category',
        description: `You spent the most on ${highestCat} (₹${maxSpent}) this month.`,
      });
    }

    if (nextMonthTotalPrediction > 0) {
      insights.push({
        type: 'prediction',
        title: 'Total Expense Prediction',
        description: `Our ML model predicts you will spend roughly ₹${nextMonthTotalPrediction} next month based on historical data.`,
      });
    }

    return insights;
  }

  private calculateHealthScore(state: FinancialState, warningsCount: number): { score: number, reasons: string[] } {
    let score = 100;
    const reasons: string[] = [];

    if (state.income === 0) {
      return { score: 0, reasons: ['No income recorded this month.'] };
    }

    // Savings rate logic
    if (state.savingsRate >= 20) {
      reasons.push('✓ Excellent savings rate (>= 20%)');
    } else if (state.savingsRate > 0) {
      score -= 15;
      reasons.push('⚠ Savings rate is below recommended 20%');
    } else {
      score -= 30;
      reasons.push('❌ Negative or zero savings. You spent more than you earned.');
    }

    // Warnings penalties
    if (warningsCount > 0) {
      score -= (warningsCount * 10);
      reasons.push(`⚠ You have ${warningsCount} active budget/spending warnings.`);
    } else {
      reasons.push('✓ All categories within budget.');
    }

    // Bound score
    score = Math.max(0, Math.min(100, score));

    return { score, reasons };
  }
}
