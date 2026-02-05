# Mr-Scrooge Importer System Documentation

## Overview

The Mr-Scrooge importer system is responsible for processing financial transaction files from various banks and financial institutions. It transforms raw bank data into standardized transaction records that can be stored and analyzed within the Mr-Scrooge application.

## Architecture

The importer system follows a modular architecture that supports multiple bank formats through a plugin-style parser system. Each parser is responsible for handling a specific bank's file format (CSV, Excel, etc.).

## Flowchart

```mermaid
flowchart TD
    A[Start Import Process] --> B[Receive File Upload]
    B --> C[Validate File Format]
    C --> D{File Valid?}
    D -->|Yes| E[Identify Parser Type]
    D -->|No| F[Return Error Message]
    F --> G[End with Error]
    
    E --> H[Initialize Parser]
    H --> I[Parse File Content]
    I --> J{Parsing Successful?}
    J -->|Yes| K[Transform Data to Standard Format]
    J -->|No| L[Log Parsing Error]
    L --> M[Create Import Report with Errors]
    M --> N[End with Error Status]
    
    K --> O[Validate Transformed Data]
    O --> P{Validation Passed?}
    P -->|Yes| Q[Save Transactions to Database]
    P -->|No| R[Mark Invalid Transactions]
    R --> S[Continue with Valid Transactions]
    S --> Q
    
    Q --> T[Create Import Report]
    T --> U{All Transactions Processed?}
    U -->|Yes| V[Calculate Import Summary]
    U -->|No| W[Process Remaining Transactions]
    W --> T
    
    V --> X{Import Status}
    X -->|Success| Y[Set Status: OK]
    X -->|Partial Success| Z[Set Status: Warning]
    X -->|Failure| AA[Set Status: Error]
    
    Y --> AB[Store Import Report]
    Z --> AB
    AA --> AB
    AB --> AC[Return Import Result]
    AC --> AD[End Successfully]
    
    N --> AE[Clean Up Temp Files]
    AD --> AE
    G --> AE
    AE --> AF[Process Complete]
    
    style A fill:#e1f5fe
    style AF fill:#e8f5e8
    style G fill:#ffebee
    style N fill:#fff3e0
    style AD fill:#e8f5e8
</code>

## Components

### 1. File Import Service (`FileImportService`)
- Manages the overall import process
- Coordinates between parsers, database, and queues
- Maintains a list of available parsers
- Handles file import requests and creates import reports

### 2. Parser Factory System
- Dynamically identifies and loads appropriate parsers
- Supports multiple bank formats (N26, Commerzbank, Caixa Enginyers, etc.)
- Each parser implements a common interface for consistency

### 3. Import Models
- `FileImportReport`: Top-level record of an import operation
- `FileImportRow`: Individual transaction record within an import
- Status tracking (OK, Warning, Error)

### 4. Import API
- REST endpoint for file uploads
- Query endpoints for retrieving import history
- Delete endpoints for managing import records

## Supported Formats

Currently supported bank formats:
- N26 (CSV format)
- Commerzbank (CSV format)
- Caixa Enginyers Credit (CSV format)
- Caixa Enginyers Account (CSV format)

## Import Process Flow

1. **File Upload**: User uploads a financial statement file via the API
2. **Format Detection**: System identifies the appropriate parser based on file characteristics
3. **Parsing**: Selected parser processes the file and extracts transaction data
4. **Transformation**: Raw data is transformed into standardized Mr-Scrooge format
5. **Validation**: Transaction data is validated for correctness
6. **Database Storage**: Valid transactions are saved to the database
7. **Report Generation**: Import report is created with success/error status
8. **Result Return**: API returns import result to the client

## Error Handling

The importer system handles various error conditions:
- Invalid file formats
- Malformed data within files
- Missing required fields
- Database storage errors
- Parser-specific errors

Errors are logged and included in the import report for transparency.

## Status Codes

- **OK**: All transactions processed successfully
- **Warning**: Some transactions failed but others succeeded
- **Error**: Import process failed completely

## API Endpoints

- `POST /api/imports`: Upload and process a new file
- `GET /api/imports`: List previous imports
- `DELETE /api/imports/{id}`: Delete an import record

## Future Enhancements

Potential areas for improvement:
- Support for additional bank formats
- Batch processing capabilities
- Scheduled import jobs
- Enhanced validation rules
- Detailed error reporting