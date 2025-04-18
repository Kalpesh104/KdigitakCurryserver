const Instructor = require('../models/Instructor');

// GET all instructors
exports.getInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find();
    res.json(instructors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getInstructorLectures = async (req, res) => {
  const { instructorName } = req.user; // Assume JWT auth
  const { courseName, startDate, endDate, attendanceStatus } = req.query;

  let query = { instructorName };

  if (courseName) {
    query.courseName = { $regex: courseName, $options: 'i' };
  }

  if (startDate && endDate) {
    query.lectureDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  if (attendanceStatus) {
    query.attendanceStatus = attendanceStatus;
  }

  try {
    const lectures = await Lecture.find(query).sort({ lectureDate: 1 });
    res.status(200).json(lectures);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE a new instructor
exports.createInstructor = async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;
    const newInstructor = new Instructor({ name, phoneNumber, email });
    await newInstructor.save();
    res.status(201).json(newInstructor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE an instructor
exports.updateInstructor = async (req, res) => {
  try {
    const instructor = await Instructor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!instructor) return res.status(404).json({ message: 'Instructor not found' });
    res.json(instructor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
