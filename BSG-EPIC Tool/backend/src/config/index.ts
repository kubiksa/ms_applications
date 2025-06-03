import dotenv from 'dotenv';

dotenv.config();

interface MSSQLConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

interface SharePointConfig {
  siteUrl: string;
  clientId: string;
  clientSecret: string;
}

interface Config {
  mssql: MSSQLConfig;
  sharepoint: SharePointConfig;
}

export const config: Config = {
  mssql: {
    user: process.env.MSSQL_USER || '',
    password: process.env.MSSQL_PASSWORD || '',
    server: process.env.MSSQL_SERVER || '',
    database: process.env.MSSQL_DATABASE || '',
    options: {
      encrypt: true,
      trustServerCertificate: false
    }
  },
  sharepoint: {
    siteUrl: process.env.SHAREPOINT_SITE_URL || '',
    clientId: process.env.SHAREPOINT_CLIENT_ID || '',
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || ''
  }
}; 