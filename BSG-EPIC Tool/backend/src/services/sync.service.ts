import { DatabaseService } from './database.service';
import { SharePointService } from './sharepoint.service';
import { logger } from '../utils/logger';
import * as schedule from 'node-schedule';

export class SyncService {
  private dbService: DatabaseService;
  private spService: SharePointService;
  private syncJob: schedule.Job | null = null;

  constructor() {
    this.dbService = new DatabaseService();
    this.spService = new SharePointService();
  }

  async start(): Promise<void> {
    try {
      await this.dbService.connect();
      
      // Schedule sync job to run every 5 minutes
      this.syncJob = schedule.scheduleJob('*/5 * * * *', async () => {
        await this.syncPendingForms();
      });

      logger.info('Sync service started successfully');
    } catch (error) {
      logger.error('Failed to start sync service:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.syncJob) {
      this.syncJob.cancel();
    }
    await this.dbService.disconnect();
    logger.info('Sync service stopped');
  }

  private async syncPendingForms(): Promise<void> {
    try {
      const pendingForms = await this.spService.getUnprocessedForms();
      logger.info(`Found ${pendingForms.length} pending forms to process`);

      for (const form of pendingForms) {
        try {
          // Validate project number in SQL database
          const isValid = await this.dbService.validateProjectNumber(form.projectNumber);
          
          if (!isValid) {
            await this.spService.updateFormStatus(
              form.id,
              'Failed',
              'Invalid project number'
            );
            continue;
          }

          // Update project data in SQL
          await this.dbService.updateProjectData(form.projectNumber, form.formData);
          
          // Mark form as processed in SharePoint
          await this.spService.updateFormStatus(form.id, 'Processed');
          
          logger.info(`Successfully processed form ${form.id} for project ${form.projectNumber}`);
        } catch (error) {
          logger.error(`Error processing form ${form.id}:`, error);
          await this.spService.updateFormStatus(
            form.id,
            'Failed',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
      }
    } catch (error) {
      logger.error('Error in sync process:', error);
    }
  }

  async validateAndProcessForm(projectNumber: string, formData: any): Promise<boolean> {
    try {
      // First validate in SharePoint list
      const isValidInSharePoint = await this.spService.validateProjectInList(projectNumber);
      if (!isValidInSharePoint) {
        logger.warn(`Project ${projectNumber} not found in SharePoint valid projects list`);
        return false;
      }

      // Save to SharePoint form list
      await this.spService.saveFormData(projectNumber, formData);
      logger.info(`Form data saved for project ${projectNumber}`);
      
      return true;
    } catch (error) {
      logger.error('Error in form validation and processing:', error);
      throw error;
    }
  }
} 