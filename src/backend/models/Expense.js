import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: { type: String, required: true },
    description: { type: String } // 🆕 optional description field
  },
  { timestamps: true }
);

export default mongoose.model('Expense', expenseSchema);
