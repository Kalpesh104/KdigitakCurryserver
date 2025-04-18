const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/instructors', require('./routes/instructors'));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Instructor Service running on port ${PORT}`);
});
