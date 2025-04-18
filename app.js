const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const cors = require('cors');

const instructorRoutes = require('./routes/instructors');
const courseRoutes = require('./routes/courses');
const lectureRoutes = require('./routes/lectures');
const swaggerDocs = require('./swagger');

const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.use('/api/instructors', instructorRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
swaggerDocs(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
