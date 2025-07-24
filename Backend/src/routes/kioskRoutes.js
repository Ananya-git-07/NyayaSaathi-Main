import { Router } from 'express';
import Kiosk from '../models/Kiosk.js';
import { softDeleteById } from '../utils/helpers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js'; // Make sure this path is correct

const router = Router();

// ===================================================================
//  PUBLIC ROUTE - No middleware applied
// ===================================================================
// Get all active kiosks (for the public registration page)
router.get('/', async (req, res, next) => {
  try {
    const kiosks = await Kiosk.find({ isDeleted: false });
    // The frontend code is robust and handles `response.data` being the array directly
    res.json(kiosks);
  } catch (err) {
    next(err);
  }
});


// ===================================================================
//  PROTECTED ADMIN ROUTES - Apply middleware individually
// ===================================================================

// Create a new Kiosk (Admin Only)
router.post('/', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const kiosk = await Kiosk.create({ ...req.body, isDeleted: false });
    res.status(201).json(kiosk);
  } catch (err) {
    next(err);
  }
});

// Update a kiosk by its ID (Admin Only)
router.put('/:id', authMiddleware, isAdmin, async (req, res, next) => {
    try {
        const updatedKiosk = await Kiosk.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!updatedKiosk) {
            return res.status(404).json({ message: 'Kiosk not found' });
        }
        res.json({ message: 'Kiosk updated successfully', kiosk: updatedKiosk });
    } catch (err) {
        next(err);
    }
});

// Soft delete a kiosk (Admin Only)
router.delete('/:id', authMiddleware, isAdmin, async (req, res, next) => {
  try {
    const kiosk = await softDeleteById(Kiosk, req.params.id);
    res.json({ message: 'Kiosk soft-deleted successfully', kiosk });
  } catch (err) {
    next(err);
  }
});

export default router;