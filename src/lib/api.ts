import { collection, doc, setDoc, getDocs, query, where, deleteDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Transaction, Budget } from '../types';

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const newRef = doc(collection(db, 'transactions'));
  const newTx = { ...transaction, id: newRef.id };
  await setDoc(newRef, newTx);
  return newTx;
};

export const deleteTransaction = async (id: string) => {
  await deleteDoc(doc(db, 'transactions', id));
};

export const saveBudget = async (budget: Omit<Budget, 'id'>) => {
  const budgetQuery = query(
    collection(db, 'budgets'), 
    where('userId', '==', budget.userId),
    where('category', '==', budget.category),
    where('month', '==', budget.month)
  );
  
  const snapshot = await getDocs(budgetQuery);
  
  if (!snapshot.empty) {
    // Update existing
    const existingId = snapshot.docs[0].id;
    await updateDoc(doc(db, 'budgets', existingId), { amount: budget.amount });
  } else {
    // Create new
    const newRef = doc(collection(db, 'budgets'));
    await setDoc(newRef, { ...budget, id: newRef.id });
  }
};

export const subscribeToUserData = (
  userId: string, 
  onTransactions: (txs: Transaction[]) => void,
  onBudgets: (bs: Budget[]) => void
) => {
  const txQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
  const unsubTx = onSnapshot(txQuery, (snapshot) => {
    const txs = snapshot.docs.map(doc => doc.data() as Transaction).sort((a, b) => b.date - a.date);
    onTransactions(txs);
  });

  const bQuery = query(collection(db, 'budgets'), where('userId', '==', userId));
  const unsubB = onSnapshot(bQuery, (snapshot) => {
    const bs = snapshot.docs.map(doc => doc.data() as Budget);
    onBudgets(bs);
  });

  return () => {
    unsubTx();
    unsubB();
  };
};

// Seed sample data for ML presentation
export const seedSampleData = async (userId: string) => {
  // Generate 6 months of data
  const categories = ['Food', 'Transport', 'Entertainment', 'Rent'];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
    const monthStr = monthDate.toISOString().slice(0, 7);
    
    // Add income
    await addTransaction({
      userId,
      type: 'income',
      amount: 50000,
      category: 'Salary',
      date: monthDate.getTime(),
      description: 'Monthly Salary'
    });

    // Add expenses
    for (const cat of categories) {
      // Simulate increasing trend for food to trigger ML warning
      let amount = 0;
      if (cat === 'Rent') amount = 15000;
      else if (cat === 'Food') amount = 5000 + ( (5-i) * 800 ); // Gradually increasing
      else if (cat === 'Transport') amount = 3000;
      else if (cat === 'Entertainment') amount = 2000 + Math.random() * 1000;
      
      await addTransaction({
        userId,
        type: 'expense',
        amount: Math.round(amount),
        category: cat,
        date: monthDate.getTime(),
        description: `Sample ${cat} expense`
      });

      // Set budget for the current month only
      if (i === 0) {
        await saveBudget({
          userId,
          category: cat,
          amount: cat === 'Rent' ? 15000 : (cat === 'Food' ? 7000 : 4000), // Note: Food budget is 7000, but spending will be ~9000
          month: monthStr
        });
      }
    }
  }
};
