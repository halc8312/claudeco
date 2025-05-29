import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import screenshotRoutes from './routes/screenshots';
import { setupSocketHandlers } from './socket/handlers';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../public')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
  });
}

// Routes
app.use('/api/screenshots', screenshotRoutes);

// Socket.io handlers
setupSocketHandlers(io);

// Export for use in other modules
export { io };

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});