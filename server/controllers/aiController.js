import { answerShoppingQuery } from '../services/geminiService.js';

// @desc    Interact with AI Shopping Assistant
// @route   POST /api/ai/chat
// @access  Public (or Private depending on choice. We make it public for easier trial)
export const chatWithAI = async (req, res, next) => {
  const { message, context } = req.body;

  try {
    if (!message) {
      res.status(400);
      throw new Error('Please provide a message');
    }

    const reply = await answerShoppingQuery(message, context || {});
    res.json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};
