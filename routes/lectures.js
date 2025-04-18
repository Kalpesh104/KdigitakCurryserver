const express = require('express');
const router = express.Router();
const { getLectures, createLecture, updateLecture,scheduleLecture,markAttendance } = require('../controllers/lectureController');

router.get('/', getLectures);
router.post('/', createLecture);
router.put('/:id', updateLecture);
router.post('/scheduleLecture', scheduleLecture);
router.patch('/mark-attendance/:id', markAttendance);

module.exports = router;
