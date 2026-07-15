const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const tagRoutes = require('./routes/tags');
const authRoutes = require('./routes/auth');
const { startRecurrenceJob } = require('./utils/recurrence');
const { initSocket } = require('./socket');

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

connectDB();
initSocket(server);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', auth, taskRoutes);
app.use('/api/projects', auth, projectRoutes);
app.use('/api/tags', auth, tagRoutes);

app.use(errorHandler);

startRecurrenceJob();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
