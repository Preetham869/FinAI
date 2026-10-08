// Machine learning for intelligent decision-making
// Using Linear Regression to predict future expenses

import { linearRegression, linearRegressionLine } from 'simple-statistics';
import { Transaction } from '../types';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface PredictionResult {
  category: string;
  predictedAmount: number;
  confidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
  historicalData: { month: string; amount: number }[];
}

/**
 * Prepares data for regression model
 */
const prepareDataForRegression = (transactions: Transaction[], category: string | null = null, numMonths = 6) => {
  const currentDate = new Date();
  const dataPoints: [number, number][] = [];
  const historicalData: { month: string; amount: number }[] = [];

  // Look back 'numMonths' months
  for (let i = numMonths - 1; i >= 0; i--) {
    const targetMonth = subMonths(currentDate, i);
    const start = startOfMonth(targetMonth).getTime();
    const end = endOfMonth(targetMonth).getTime();
    const monthKey = format(targetMonth, 'MMM yy');

    // Filter expenses for this month and optionally category
    const monthExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      t.date >= start && 
      t.date <= end &&
      (category === null || t.category === category)
    );

    const totalSpent = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
    
    // x = time index (0, 1, 2...), y = amount spent
    dataPoints.push([numMonths - 1 - i, totalSpent]);
    historicalData.push({ month: monthKey, amount: totalSpent });
  }

  return { dataPoints, historicalData };
};

/**
 * Predicts next month's expenses using Linear Regression
 */
export const predictNextMonthExpense = (
  transactions: Transaction[], 
  category: string | null = null
): PredictionResult => {
  const { dataPoints, historicalData } = prepareDataForRegression(transactions, category);

  // We need at least 2 data points (months) where amount > 0 to make a meaningful prediction
  const nonZeroMonths = dataPoints.filter(point => point[1] > 0).length;

  if (nonZeroMonths < 2) {
    return {
      category: category || 'Total',
      predictedAmount: historicalData[historicalData.length - 1]?.amount || 0,
      confidence: 'Insufficient Data',
      historicalData
    };
  }

  try {
    // Generate the linear regression model
    const model = linearRegression(dataPoints);
    const line = linearRegressionLine(model);
    
    // Predict for the next month (index = dataPoints.length)
    const nextIndex = dataPoints.length;
    let predicted = line(nextIndex);
    
    // Expenses can't be negative
    predicted = Math.max(0, predicted);

    // Determine confidence based on data points
    let confidence: 'High' | 'Medium' | 'Low' = 'Low';
    if (nonZeroMonths >= 5) confidence = 'High';
    else if (nonZeroMonths >= 3) confidence = 'Medium';

    return {
      category: category || 'Total',
      predictedAmount: Math.round(predicted),
      confidence,
      historicalData
    };
  } catch (err) {
    console.error("Error in ML prediction:", err);
    return {
      category: category || 'Total',
      predictedAmount: 0,
      confidence: 'Insufficient Data',
      historicalData
    };
  }
};
