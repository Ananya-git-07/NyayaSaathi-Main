import { Router } from 'express';
import VoiceQuery from '../models/VoiceQuery.js';
import { softDeleteById } from '../utils/helpers.js';

const router = Router();


// Get all voice queries for the logged-in user
router.get('/', async (req, res, next) => {
  try {
    const voiceQueries = await VoiceQuery.find({ userId: req.user.userId, isDeleted: false });
    res.json(voiceQueries);
  } catch (err) {
    next(err);
  }
});

// Soft delete a voice query
router.delete('/:id', async (req, res, next) => {
  try {
    const query = await softDeleteById(VoiceQuery, req.params.id);
    res.json({ message: 'Voice Query soft-deleted successfully', query });
  } catch (err) {
    next(err);
  }
});

export default router;