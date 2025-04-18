const express = require('express');
const {
  getAllInstructors,
  getInstructorById,
  createInstructor,
  updateInstructor,
  deleteInstructor
} = require('../controllers/instructorController');

const router = express.Router();

router.get('/', getAllInstructors);
router.get('/:id', getInstructorById);
router.post('/', createInstructor);
router.put('/:id', updateInstructor);
router.delete('/:id', deleteInstructor);

module.exports = router;
