
import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();
/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Expense created successfully
 */

// ✅ CREATE - Add a new expense
// CREATE - Add a new expense
router.post('/', async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;

    if (!title || !amount || !date || !category) {
      return res.status(400).json({ message: 'Title, amount, date, and category are required' });
    }

    const newExpense = new Expense({ title, amount, date, category, description });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ READ - Get all expenses
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ READ - Get single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update expense by ID
router.put('/:id', async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      { title, amount, date, category, description },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ✅ DELETE - Remove expense by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
