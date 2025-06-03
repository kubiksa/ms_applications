import { sp } from '@pnp/sp';
import { logger } from '../utils/logger';
import { config } from '../config';

export class SharePointService {
  constructor() {
    sp.setup({
      sp: {
        baseUrl: config.sharepoint.siteUrl,
        headers: {
          Accept: 'application/json;odata=verbose',
        },
      },
    });
  }

  async validateProjectInList(projectNumber: string): Promise<boolean> {
    try {
      const items = await sp.web.lists
        .getByTitle('ValidProjects')
        .items
        .filter(`ProjectNumber eq '${projectNumber}'`)
        .get();

      return items.length > 0;
    } catch (error) {
      logger.error('Error validating project in SharePoint:', error);
      throw error;
    }
  }

  async saveFormData(projectNumber: string, formData: any): Promise<void> {
    try {
      await sp.web.lists
        .getByTitle('ProjectForms')
        .items
        .add({
          ProjectNumber: projectNumber,
          FormData: JSON.stringify(formData),
          Status: 'Pending',
          SubmittedDate: new Date().toISOString()
        });

      logger.info(`Form data saved to SharePoint for project ${projectNumber}`);
    } catch (error) {
      logger.error('Error saving form data to SharePoint:', error);
      throw error;
    }
  }

  async getUnprocessedForms(): Promise<any[]> {
    try {
      const items = await sp.web.lists
        .getByTitle('ProjectForms')
        .items
        .filter("Status eq 'Pending'")
        .get();

      return items.map(item => ({
        id: item.Id,
        projectNumber: item.ProjectNumber,
        formData: JSON.parse(item.FormData),
        submittedDate: new Date(item.SubmittedDate)
      }));
    } catch (error) {
      logger.error('Error fetching unprocessed forms from SharePoint:', error);
      throw error;
    }
  }

  async updateFormStatus(formId: number, status: 'Processed' | 'Failed', error?: string): Promise<void> {
    try {
      await sp.web.lists
        .getByTitle('ProjectForms')
        .items
        .getById(formId)
        .update({
          Status: status,
          ProcessedDate: new Date().toISOString(),
          ProcessingError: error || null
        });

      logger.info(`Updated form ${formId} status to ${status}`);
    } catch (error) {
      logger.error('Error updating form status in SharePoint:', error);
      throw error;
    }
  }
} 