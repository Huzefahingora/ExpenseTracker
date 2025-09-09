import express from 'express';
import Expense from '../models/Expense.js';

const router = express.Router();

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     tags: [Expenses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - amount
 *               - date
 *               - category
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

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get all expenses
 *     tags: [Expenses]
 *     responses:
 *       200:
 *         description: List of expenses
 */
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/expenses/{id}:
 *   get:
 *     summary: Get an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense details
 *       404:
 *         description: Expense not found
 */
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
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
 *       200:
 *         description: Expense updated successfully
 *       404:
 *         description: Expense not found
 */
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

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense by ID
 *     tags: [Expenses]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense ID
 *     responses:
 *       200:
 *         description: Expense deleted successfully
 *       404:
 *         description: Expense not found
 */
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
