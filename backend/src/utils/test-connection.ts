import { config } from '../config';
import * as msal from '@azure/msal-node';
import { Client } from '@microsoft/microsoft-graph-client';
import * as sql from 'mssql';

async function testConnections() {
  console.log('Testing connections...\n');

  // Test SharePoint/Graph API connection
  try {
    const msalConfig = {
      auth: {
        clientId: config.sharepoint.clientId,
        clientSecret: config.sharepoint.clientSecret,
        authority: `https://login.microsoftonline.com/${config.sharepoint.tenantId}`
      }
    };

    const cca = new msal.ConfidentialClientApplication(msalConfig);
    
    const result = await cca.acquireTokenByClientCredential({
      scopes: ['https://graph.microsoft.com/.default']
    });

    if (result) {
      console.log('✅ Successfully authenticated with Azure AD');
      
      // Test Graph API connection
      const client = Client.init({
        authProvider: (done) => {
          done(null, result.accessToken);
        }
      });

      const site = await client.api(`/sites/${config.sharepoint.siteId}`).get();
      console.log('✅ Successfully connected to SharePoint site:', site.displayName);
    }
  } catch (error) {
    console.error('❌ SharePoint connection failed:', error);
  }

  // Test SQL connection
  try {
    const pool = await sql.connect(config.mssql);
    await pool.request().query('SELECT 1');
    console.log('✅ Successfully connected to MSSQL');
    await pool.close();
  } catch (error) {
    console.error('❌ MSSQL connection failed:', error);
  }
}

testConnections().catch(console.error); 