# Gi-Recon

## Project Overview

Gi-Recon is a desktop reconciliation tool built as an Electron application for Giligan's restaurant chain. It facilitates the matching and reconciliation of transactions between their point-of-sale (POS) system and delivery partners like Grab and Foodpanda. The system addresses the challenge of ensuring financial accuracy by automating the comparison of in-store POS data with third-party delivery service reports, reducing manual effort and minimizing discrepancies in financial records.

## Key Features & Functionality

- **Automated Matching**: Intelligent algorithm to match POS transactions with delivery partner orders based on amounts, dates, and branch locations.
- **Manual Matching Interface**: User-friendly UI for resolving unmatched transactions through manual intervention.
- **Discrepancy Reporting**: Identifies and reports amount differences, unmatched POS entries, and unmatched partner transactions.
- **Data Export and Reporting**: Generates reconciliation reports with metrics on matched/unmatched items and financial summaries.
- **Branch Mapping Management**: Maintains configurable mappings between POS branch codes and delivery partner store names.
- **Batch and Manual Import**: Supports bulk import of data files and individual file uploads.
- **Real-time Progress Tracking**: Provides feedback during data import and reconciliation processes.
- **Database Persistence**: Stores all transaction data and reconciliation results in a local SQLite database.

## Data Sources

The system handles multiple data formats from different sources:

| Source | Format | Key Fields | Description |
|--------|--------|------------|-------------|
| **POS System** | DBF files (zipped) | Branch name, Order date, Amount (grschrg), Customer name, Customer number | Transaction data from Giligan's POS system, filtered by delivery partner (e.g., GRAB or PANDA in customer name) |
| **Grab** | Excel (.xlsx/.xls) | Booking ID, Store name, Created on, Amount, Status, Category | Transaction reports from Grab delivery service, including completed, transferred, and cancelled orders |
| **Foodpanda** | Excel (.xlsx/.xls) | Order Code, Partner name, Order date, Gross food value | Transaction data from Foodpanda, with order codes and gross values |

Data is imported via file uploads and processed into normalized database tables for reconciliation.

## Core Reconciliation Process

The reconciliation process follows a systematic approach:

1. **Data Filtering**: POS transactions are filtered by customer name containing partner identifiers (e.g., "GRAB" or "PANDA").
2. **Date Range Selection**: Transactions are filtered by specified date ranges for both POS and partner data.
3. **Branch Mapping**: POS branch names are mapped to partner store names using a configurable mapping table.
4. **Automated Matching**:
   - Matches transactions based on exact amount equality
   - Considers date proximity (same day)
   - Validates branch/store alignment
   - For Grab: Includes status filtering (Completed, Transferred, Cancelled) and category considerations
5. **Discrepancy Identification**: Calculates amount differences for matched transactions and flags unmatched entries.
6. **Manual Resolution**: Provides interface for users to manually match remaining unmatched transactions.
7. **Result Finalization**: Saves matched results and generates reconciliation metrics.

## Technical Architecture

### Frontend
- **Framework**: React with TypeScript for type-safe component development
- **Styling**: Tailwind CSS for responsive, utility-first styling
- **Routing**: React Router DOM for navigation between pages (Overview, Grab, Panda)
- **State Management**: React hooks for local state, with IPC communication for backend data
- **UI Components**: Custom components for tables, modals, and forms, including data visualization for reconciliation metrics

### Backend
- **Runtime**: Node.js within Electron's main process
- **Database**: SQLite with better-sqlite3 for efficient, file-based data storage
- **File Processing**: Libraries for DBF (dbffile) and Excel (xlsx) file parsing
- **Worker Threads**: Multi-threaded processing for large data imports using Node.js worker threads

### Inter-Process Communication (IPC)
- **Mechanism**: Electron's IPC (ipcMain/ipcRenderer) for secure communication between main and renderer processes
- **Channels**: Dedicated IPC handlers for data import, reconciliation runs, and database queries
- **Security**: Context isolation and preload scripts to prevent direct access to Node.js APIs from renderer

### Data Processing Pipeline
1. **File Upload**: Temporary file storage in app temp directory
2. **Parsing**: Format-specific parsing (DBF for POS, Excel for partners)
3. **Validation**: Data validation and cleaning during import
4. **Database Injection**: Batch inserts into SQLite tables using prepared statements
5. **Indexing**: Database indexes on key fields (dates, amounts, branch names) for efficient queries
6. **Cleanup**: Automatic removal of temporary files after processing

### Build System
- **Development**: Electron-Vite for fast development with hot reloading
- **TypeScript Compilation**: Separate configs for web (renderer) and node (main) environments
- **Packaging**: Electron Builder for creating distributable executables
- **Linting**: ESLint with Prettier for code quality and formatting
- **Dependencies**: NPM scripts for building, testing, and packaging across platforms

### File Handling
- **Temporary Storage**: Uploaded files copied to Electron's temp directory for processing
- **Permanent Storage**: SQLite database stored in userData directory
- **Cleanup**: Automatic deletion of temp files after import completion
- **Error Recovery**: Transaction rollbacks for failed imports to maintain data integrity

## Folder Structure

```
gi-recon/
├── build/                 # Build output directory
├── resources/             # Static resources and icons
├── src/
│   ├── main/              # Electron main process code
│   │   ├── ipc/           # IPC handlers for main-renderer communication
│   │   ├── services/      # Business logic services (recon, ingest, logging)
│   │   ├── worker/        # Worker threads for data processing
│   │   └── types.ts       # TypeScript type definitions
│   ├── preload/           # Preload scripts for secure IPC
│   └── renderer/          # React frontend application
│       ├── src/
│       │   ├── components/# Reusable UI components
│       │   ├── hooks/     # Custom React hooks
│       │   ├── layouts/   # Page layout components
│       │   ├── lib/       # Utility libraries
│       │   └── pages/     # Main application pages
│       └── index.html     # Main HTML entry point
├── types/                 # Shared type definitions
├── electron.vite.config.ts# Vite configuration for Electron
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## User Workflow

1. **Setup and Configuration**:
   - Launch the Gi-Recon application
   - Configure branch mappings if needed (POS branch names to partner store names)

2. **Data Import**:
   - Select date range and branches for reconciliation
   - Import POS data: Upload ZIP file containing DBF files organized by branch
   - Import partner data: Upload Excel files for Grab or Foodpanda transactions

3. **Automated Reconciliation**:
   - Run reconciliation process for selected partner (Grab or Panda)
   - Review automatic matches and identified discrepancies

4. **Manual Matching**:
   - Use the matching workspace to manually pair unmatched transactions
   - Resolve amount differences and confirm matches

5. **Finalization and Reporting**:
   - Finalize reconciliation results and save to database
   - View overview dashboard with reconciliation statistics and metrics
   - Export reports or repeat process for different date ranges

## Security & Error Handling

### Data Integrity
- **Database Transactions**: All data imports and reconciliation operations use SQLite transactions to ensure atomicity
- **Validation**: Input validation for file formats, data types, and required fields during import
- **Backup**: SQLite database provides inherent backup capabilities through file copying

### Error Handling
- **Graceful Failures**: Import processes continue with error logging for individual file failures
- **User Feedback**: Toast notifications and progress indicators for long-running operations
- **Logging**: Comprehensive logging service tracks system events, errors, and performance metrics
- **Recovery**: Failed imports can be retried without data loss; temporary files are cleaned up automatically

### Security Measures
- **Local Processing**: All data processing occurs locally; no external data transmission
- **File Access**: Restricted file system access through Electron's secure APIs
- **Context Isolation**: Renderer process isolated from Node.js APIs to prevent security vulnerabilities