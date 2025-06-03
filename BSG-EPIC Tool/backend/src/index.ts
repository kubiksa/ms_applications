import express from 'express';
import { SyncService } from './services/sync.service';
import { logger } from './utils/logger';

const app = express();
const syncService = new SyncService();

app.use(express.json());

// Middleware to handle errors
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Route to validate and process form data
app.post('/api/forms', async (req, res) => {
  try {
    const { projectNumber, formData } = req.body;

    if (!projectNumber || !formData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const isValid = await syncService.validateAndProcessForm(projectNumber, formData);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid project number' });
    }

    res.status(200).json({ message: 'Form submitted successfully' });
  } catch (error) {
    logger.error('Error processing form submission:', error);
    res.status(500).json({ error: 'Error processing form' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await syncService.start();
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await syncService.stop();
  process.exit(0);
});

startServer(); 