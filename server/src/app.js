const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const fakeAuth = require('./middleware/fakeAuth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const tagRoutes = require('./routes/tags');
const { startRecurrenceJob } = require('./utils/recurrence');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(fakeAuth);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tags', tagRoutes);

app.use(errorHandler);

startRecurrenceJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
