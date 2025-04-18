const express = require('express');
const router = express.Router();
const {
  getInstructors,
  createInstructor,
  updateInstructor,getInstructorLectures
} = require('../controllers/instructorController');

router.get('/', getInstructors);
router.post('/', createInstructor);
router.put('/:id', updateInstructor);
router.get('/instructor', getInstructorLectures);

module.exports = router;
