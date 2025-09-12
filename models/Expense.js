import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    amount: { 
      type: Number, 
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    date: { 
      type: Date, 
      required: [true, 'Date is required'],
      default: Date.now
    },
    category: { 
      type: String, 
      required: [true, 'Category is required'],
      enum: {
        values: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Travel', 'Other'],
        message: 'Category must be one of: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Education, Travel, Other'
      }
    },
    description: { 
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);
