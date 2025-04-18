const Course = require('../models/Course');

exports.getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { name, level, description, startDate, lectures } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const newCourse = new Course({
      name,
      level,
      description,
      imageUrl,
      startDate,
      lectures: lectures ? JSON.parse(lectures) : []
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { name, level, description, startDate, lectures } = req.body;
    const updateData = {
      name,
      level,
      description,
      startDate,
      lectures: lectures ? JSON.parse(lectures) : undefined
    };

    if (req.file) {
      updateData.imageUrl = req.file.path;
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
