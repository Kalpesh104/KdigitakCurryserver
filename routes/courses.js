/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     responses:
 *       200:
 *         description: List of courses
 *
 *   post:
 *     summary: Create a new course
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               startDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Course created
 */
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { getCourses, createCourse, updateCourse } = require('../controllers/courseController');

router.get('/', getCourses);

const auth = require('../middleware/auth');
const authorizeRoles = require('../middleware/roles');

// 👇 Only admins can create or update courses
router.post('/', auth, authorizeRoles('admin'), upload.single('image'), createCourse);
router.put('/:id', auth, authorizeRoles('admin'), upload.single('image'), updateCourse);


module.exports = router;
