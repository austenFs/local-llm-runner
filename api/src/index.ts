import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { MessageHandler } from './services/messages/message-handler';
import { container } from './services/ioc/IoC-Container';
import { InjectionRegistry } from './services/ioc/injection-registry';
import { ApiHandler } from './services/external/api-handler';
// Load environment variables
dotenv.config();

const apiHandler: ApiHandler = container.get(InjectionRegistry.ApiHandler);
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint (for Docker health check)
app.get('/health', async (req, res) => {
  console.log(await apiHandler.healthCheck());
  console.log('hi')
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'ollama-communicator-api'
  });
});

// Hello world endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to ollama-communicator.ai API!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      root: '/'
    }
  });
});


app.get('/ping', async (req, res) => {
  const value = await apiHandler.ping()
  res.json({ 
    message: value,
  });
});

app.post('/sendMessage',  async (req, res) => {
  const value = await apiHandler.ping()
  res.json({ 
    message: value,
  });
});

// Basic error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 ollama-communicator API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;