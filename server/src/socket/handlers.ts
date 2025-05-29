import { Server, Socket } from 'socket.io';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);
    
    socket.on('subscribe-job', (jobId: string) => {
      socket.join(`job-${jobId}`);
      console.log(`Client ${socket.id} subscribed to job ${jobId}`);
    });
    
    socket.on('unsubscribe-job', (jobId: string) => {
      socket.leave(`job-${jobId}`);
      console.log(`Client ${socket.id} unsubscribed from job ${jobId}`);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}