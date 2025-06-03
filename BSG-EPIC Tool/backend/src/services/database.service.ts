import * as sql from 'mssql';
import { config } from '../config';
import { logger } from '../utils/logger';

export class DatabaseService {
  private pool: sql.ConnectionPool | null = null;

  async connect(): Promise<void> {
    try {
      this.pool = await new sql.ConnectionPool(config.mssql).connect();
      logger.info('Successfully connected to MSSQL');
    } catch (error) {
      logger.error('Failed to connect to MSSQL:', error);
      throw error;
    }
  }

  async validateProjectNumber(projectNumber: string): Promise<boolean> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }

    try {
      const result = await this.pool
        .request()
        .input('projectNumber', sql.VarChar, projectNumber)
        .query('SELECT COUNT(*) as count FROM Projects WHERE ProjectNumber = @projectNumber');
      
      return result.recordset[0].count > 0;
    } catch (error) {
      logger.error('Error validating project number:', error);
      throw error;
    }
  }

  async getProjectData(projectNumber: string): Promise<any> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }

    try {
      const result = await this.pool
        .request()
        .input('projectNumber', sql.VarChar, projectNumber)
        .query('SELECT * FROM Projects WHERE ProjectNumber = @projectNumber');
      
      return result.recordset[0];
    } catch (error) {
      logger.error('Error fetching project data:', error);
      throw error;
    }
  }

  async updateProjectData(projectNumber: string, data: any): Promise<void> {
    if (!this.pool) {
      throw new Error('Database connection not initialized');
    }

    try {
      await this.pool
        .request()
        .input('projectNumber', sql.VarChar, projectNumber)
        .input('data', sql.NVarChar, JSON.stringify(data))
        .query(`
          UPDATE Projects 
          SET ProjectData = @data, 
              LastUpdated = GETDATE() 
          WHERE ProjectNumber = @projectNumber
        `);
      
      logger.info(`Successfully updated project ${projectNumber}`);
    } catch (error) {
      logger.error('Error updating project data:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
} 