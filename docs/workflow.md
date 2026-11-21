# CloudOps Nexus – Application Workflow

## 1. Application startup
1. Start PostgreSQL and create the application database.
2. Configure DATABASE_URL in a local .env file using .env.example as a template.
3. Start the FastAPI backend.
4. Start the React/Vite development server separately.
5. Open the Vite URL in a browser.

## 2. Monitoring workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as React
    participant API as FastAPI
    participant CW as CloudWatch
    participant Agent as CloudWatch Agent
    User->>UI: Open monitoring page
    UI->>API: GET /monitoring
    API->>CW: Request CPU metric
    Agent->>CW: Publish memory and disk metrics
    API->>CW: Request memory and disk metrics
    CW-->>API: Metric datapoints
    API-->>UI: JSON values and timestamps
    UI-->>User: Display metrics
```

| Metric | Namespace | Source |
|---|---|---|
| CPUUtilization | AWS/EC2 | EC2 monitoring |
| mem_used_percent | CWAgent | CloudWatch Agent |
| disk_used_percent | CWAgent | CloudWatch Agent |

The backend requests recent datapoints and selects the newest timestamp. If no datapoint exists, the metric value and timestamp are returned as null.

## 3. Create incident workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as React
    participant API as FastAPI
    participant DB as PostgreSQL
    User->>UI: Enter title and description
    UI->>API: POST /incidents
    API->>API: Validate request body
    API->>DB: Insert using SQLAlchemy
    DB-->>API: Saved record
    API-->>UI: Return incident JSON
    UI-->>User: Show result
```

## 4. List incidents
1. React requests GET /incidents.
2. FastAPI opens a database session.
3. SQLAlchemy queries the incidents table.
4. FastAPI returns records as JSON.
5. React renders the list.

## 5. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | Basic application response |
| GET | /health | Health status |
| GET | /monitoring | CloudWatch CPU, memory, and disk metrics |
| POST | /incidents | Create an incident |
| GET | /incidents | List incidents |

## 6. Operational considerations
- DATABASE_URL must be configured before backend startup.
- The backend needs AWS permissions to read CloudWatch metrics.
- CloudWatch Agent must be running and publishing guest OS metrics.
- Metrics can be delayed or temporarily unavailable.
- The demonstrated API process was started manually and does not automatically restart after a reboot.

## 7. Future workflows – not implemented
SNS notifications, Cost Explorer reporting, incident update/assignment/resolution endpoints, automated tests, container builds, and CI/CD deployment are future enhancements.
