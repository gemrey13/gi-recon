# Gi-Recon

Gi-Recon is a desktop reconciliation tool built as an Electron application for Giligan's restaurant chain. It facilitates the matching and reconciliation of transactions between their point-of-sale (POS) system and delivery partners like Grab and Foodpanda.

## Key Features and Functionality

**Data Sources:**
- **POS Data**: Imported from DBF files containing customer orders, amounts, dates, and branch information
- **Delivery Data**: Grab and Foodpanda transaction data imported from Excel files, including booking IDs, order amounts, and timestamps
- **Branch Mapping**: Maintains mappings between POS branch codes and delivery partner store names across multiple Giligan's locations

**Core Reconciliation Process:**
- Imports and processes POS transactions and delivery orders for specified date ranges and branches
- Automatically matches transactions based on amounts, dates, and branch locations
- Identifies unmatched transactions on both sides (POS and delivery)
- Provides a manual matching interface for resolving discrepancies
- Tracks matched items with amount differences and match confidence levels

**Technical Architecture:**
- **Frontend**: React-based UI with Tailwind CSS styling, featuring tables for unmatched transactions, matching workspace, and reconciliation metrics
- **Backend**: Electron main process with SQLite database for data storage
- **Data Processing**: Worker threads for reading/writing large datasets, IPC communication between processes
- **File Handling**: Supports DBF (POS) and Excel (delivery) file imports
- **Build System**: Vite for development and Electron Builder for packaging

**User Workflow:**
1. Select reconciliation date range and branch(es)
2. Import POS data from DBF files
3. Import Grab/Foodpanda data from Excel files
4. Review automatic matches and manual matching interface
5. Resolve discrepancies through manual matching
6. Finalize and save reconciliation results to database
7. View overview dashboard with reconciliation statistics

The tool helps Giligan's ensure accurate financial reconciliation between their in-store POS transactions and third-party delivery service payments, reducing manual effort and improving financial accuracy.