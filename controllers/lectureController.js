const Lecture = require('../models/Lecture');
const { getDateTimeMoment } = require('../utils/time');
const moment = require('moment');
const Instructor = require('../models/Instructor');
const Course = require('../models/Course');

// GET all lectures
exports.getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find().populate('course');
    res.json(lectures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const scheduleLecture = async (req, res) => {
  try {
    const { instructorId, courseId, lectureDate, startTime, endTime } = req.body;

    // Convert time strings to Date objects for comparison
    const start = new Date(`${lectureDate}T${startTime}`);
    const end = new Date(`${lectureDate}T${endTime}`);

    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time." });
    }

    // Check for overlapping lectures for the same instructor
    const overlappingLecture = await Lecture.findOne({
      instructor: instructorId,
      lectureDate: new Date(lectureDate),
      $or: [
        {
          $and: [
            { startTime: { $lte: start } },
            { endTime: { $gt: start } }
          ]
        },
        {
          $and: [
            { startTime: { $lt: end } },
            { endTime: { $gte: end } }
          ]
        },
        {
          $and: [
            { startTime: { $gte: start } },
            { endTime: { $lte: end } }
          ]
        }
      ]
    });

    if (overlappingLecture) {
      return res.status(400).json({ message: "This instructor already has a lecture scheduled during that time." });
    }

    const lecture = new Lecture({
      instructor: instructorId,
      course: courseId,
      lectureDate: new Date(lectureDate),
      startTime: start,
      endTime: end,
      attendanceStatus: 'Not Attended'
    });

    await lecture.save();
    return res.status(201).json({ message: 'Lecture scheduled successfully', lecture });
  } catch (error) {
    console.error("Schedule Lecture Error:", error);
    return res.status(500).json({ message: 'Server Error', error });
  }
};
// controllers/lectureController.js
exports.markAttendance = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Attended', 'Not Attended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid attendance status' });
  }

  try {
    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    lecture.attendanceStatus = status;
    await lecture.save();

    res.status(200).json({ message: 'Attendance updated', lecture });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// POST basic lecture creation (without conflict check)
exports.createLecture = async (req, res) => {
  try {
    const lecture = new Lecture(req.body);
    await lecture.save();
    res.status(201).json(lecture);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT update lecture
exports.updateLecture = async (req, res) => {
  try {
    const updated = await Lecture.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// POST /scheduleLecture with conflict checking
// Only one lecture per instructor per day, even if no time conflict
exports.scheduleLecture = async (req, res) => {
  try {
    const { instructorName, course, lectureDate, startTime, durationMinutes } = req.body;

    const existingLectures = await Lecture.find({
      instructorName,
      lectureDate: new Date(lectureDate)
    });

    // ❌ Block any additional lecture on the same date
    if (existingLectures.length > 0) {
      return res.status(400).json({
        message: `Instructor already has a lecture on ${lectureDate}. Only one lecture per day is allowed.`
      });
    }

    const newLecture = new Lecture({
      instructorName,
      course,
      lectureDate,
      startTime,
      durationMinutes
    });

    await newLecture.save();
    res.status(201).json(newLecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
