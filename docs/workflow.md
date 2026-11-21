# CloudOps Nexus – Application Workflow

## Application Startup

1. PostgreSQL is started and the application database is configured.
2. The backend reads `DATABASE_URL` from environment configuration.
3. FastAPI connects to PostgreSQL through SQLAlchemy.
4. The React/Vite development server starts separately.
5. The browser loads the dashboard.

## Incident Management Workflow

```mermaid
sequenceDiagram
    participant User
    participant UI as React
    participant API as FastAPI
    participant DB as PostgreSQL
    User->>UI: Open dashboard or incidents page
    UI->>API: GET /incidents
    API->>DB: Query incidents with SQLAlchemy
    DB-->>API: Incident records
    API-->>UI: JSON response
    UI-->>User: Display incidents and open count
    User->>UI: Submit incident title and description
    UI->>API: POST /incidents
    API->>DB: Insert incident
    DB-->>API: Saved record
    API-->>UI: Created incident JSON
```

## CloudWatch Monitoring API Workflow

```mermaid
sequenceDiagram
    participant Client
    participant API as FastAPI
    participant CW as CloudWatch
    participant Agent as CloudWatch Agent
    Client->>API: GET /monitoring
    API->>CW: Request CPU metric (AWS/EC2)
    Agent->>CW: Publish memory and disk metrics (CWAgent)
    API->>CW: Request memory and disk metrics
    CW-->>API: Metric datapoints
    API-->>Client: JSON values and timestamps
```

The backend monitoring endpoint is implemented. The current React frontend does not call this endpoint; its monitoring screen and dashboard metric cards remain placeholders.

| Metric | CloudWatch Namespace | Source |
|---|---|---|
| CPUUtilization | AWS/EC2 | EC2 monitoring |
| mem_used_percent | CWAgent | CloudWatch Agent |
| disk_used_percent | CWAgent | CloudWatch Agent |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic application response |
| GET | `/health` | Health status |
| GET | `/monitoring` | CloudWatch CPU, memory, and disk metrics |
| POST | `/incidents` | Create an incident |
| GET | `/incidents` | List incidents |

## Operational Notes

The backend requires a valid `DATABASE_URL` and AWS permissions to read CloudWatch metrics. The CloudWatch Agent must publish memory and disk metrics. Metric publication can be delayed.

The frontend incident API URL is currently hardcoded to `http://127.0.0.1:8000`. The backend API process in the demonstration was started manually and is not configured for automatic restart.

## Future Capabilities

Frontend metric integration, Cost Explorer reporting, SNS notifications, incident updates/resolution, automated tests, Docker Compose, and CI/CD deployment are future improvements.
