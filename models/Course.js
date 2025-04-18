const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  startDate: { type: Date, required: true }, // NEW: mandatory course start date
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }]
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
