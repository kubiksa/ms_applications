# SharePoint-SQL Bridge Application

This application provides a bridge between SharePoint lists and MSSQL database, allowing users to interact with data through SharePoint while maintaining data synchronization with MSSQL.

## Project Structure

```
├── backend/                 # Backend service with premium SQL access
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── services/       # Core services (SharePoint & SQL)
│   │   ├── models/         # Data models
│   │   └── utils/          # Utility functions
│   ├── tests/              # Backend tests
│   └── package.json        # Backend dependencies
├── frontend/               # Frontend SharePoint form application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # Frontend services
│   │   └── utils/         # Frontend utilities
│   └── package.json       # Frontend dependencies
└── docs/                  # Documentation
```

## Prerequisites

- Node.js >= 14.x
- SharePoint Online access
- MSSQL Server instance with premium account
- SharePoint REST API credentials
- MSSQL connection credentials

## Setup Instructions

1. Backend Setup
```bash
cd backend
npm install
```

2. Configure Environment Variables
Create a `.env` file in the backend directory with:
```
MSSQL_CONNECTION_STRING=your_connection_string
SHAREPOINT_SITE_URL=your_sharepoint_site_url
SHAREPOINT_CLIENT_ID=your_client_id
SHAREPOINT_CLIENT_SECRET=your_client_secret
```

3. Frontend Setup
```bash
cd frontend
npm install
```

## Features

- Project number validation against SharePoint list
- Automated data synchronization between SharePoint and MSSQL
- Secure handling of database operations
- Error logging and monitoring
- Rate limiting and request throttling

## Security Considerations

- All sensitive credentials are stored in environment variables
- SharePoint authentication uses secure token-based access
- MSSQL premium account credentials are only used in the backend service 