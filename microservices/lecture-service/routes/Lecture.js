const express = require('express');
const {
  getAllLectures,
  getLectureById,
  createLecture,
  updateLecture,
  deleteLecture
} = require('../controllers/lectureController');

const router = express.Router();

router.get('/', getAllLectures);
router.get('/:id', getLectureById);
router.post('/', createLecture);
router.put('/:id', updateLecture);
router.delete('/:id', deleteLecture);

module.exports = router;
