# CloudOps Nexus – Interview Preparation

These notes reflect the current source and demonstrated setup. Distinguish implemented features from planned improvements.

## 1. Short project introduction
"CloudOps Nexus is an AWS cloud infrastructure monitoring and incident management dashboard. It uses React for the frontend, FastAPI for REST APIs, PostgreSQL for incident storage, and CloudWatch for EC2 CPU, memory, and disk metrics. The backend uses Boto3 to retrieve CloudWatch metrics and SQLAlchemy to interact with PostgreSQL."

## 2. Architecture in simple steps
1. React displays the dashboard in a browser.
2. React sends HTTP requests to FastAPI.
3. FastAPI handles the request.
4. SQLAlchemy reads or writes incident records in PostgreSQL.
5. Boto3 requests monitoring metrics from CloudWatch.
6. FastAPI returns JSON for React to display.

## 3. Common interview questions

### Why FastAPI?
FastAPI is a Python framework for building REST APIs. It supports request validation and interactive API documentation.

### What is an API?
An API is an interface that allows software components to communicate. React calls the FastAPI endpoints in this project.

### Why PostgreSQL?
PostgreSQL stores incident records, including title, description, status, and creation time.

### What is SQLAlchemy?
SQLAlchemy is a Python SQL toolkit and ORM. It lets the backend work with database tables through Python models and sessions.

### What is Boto3?
Boto3 is the AWS SDK for Python. The backend uses it to call CloudWatch APIs.

### Where does CPU utilization come from?
EC2 publishes CPU utilization metrics to the AWS/EC2 CloudWatch namespace.

### How are memory and disk metrics collected?
The CloudWatch Agent runs on the EC2 operating system and publishes memory and disk metrics to the CWAgent namespace.

### Why use an IAM role?
An IAM role supplies temporary credentials and permissions to EC2, avoiding hardcoded AWS access keys.

### What happens when monitoring data is requested?
React calls GET /monitoring. FastAPI uses Boto3 to query CloudWatch, selects the latest datapoints, and returns JSON values and timestamps.

### What happens when a user creates an incident?
React sends title and description to POST /incidents. FastAPI validates the input, SQLAlchemy inserts it into PostgreSQL, and the API returns the saved record.

### What is CORS?
Cross-Origin Resource Sharing controls whether a browser page from one origin can call an API on another origin. FastAPI's CORS middleware allows the configured frontend development origins.

### Are Docker and GitHub Actions implemented?
No. They are planned improvements. The documentation describes a possible design, not a working pipeline.

### Are SNS and Cost Explorer integrated?
No. They are planned future integrations.

### What would you improve next?
I would externalize AWS configuration, add automated tests, configure persistent process supervision and HTTPS, implement SNS and Cost Explorer integrations, and then add Docker and GitHub Actions.

## 4. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | / | Basic response |
| GET | /health | Health status |
| GET | /monitoring | CloudWatch metrics |
| POST | /incidents | Create incident |
| GET | /incidents | List incidents |

## 5. Key terms
- EC2: AWS virtual server.
- CloudWatch: AWS monitoring service.
- CloudWatch Agent: Collects operating system metrics.
- IAM role: AWS identity that grants permissions.
- Boto3: AWS SDK for Python.
- FastAPI: Python framework for APIs.
- PostgreSQL: Relational database.
- SQLAlchemy: Python ORM.
- React: JavaScript library for user interfaces.
- CORS: Browser control for cross-origin API requests.

## 6. Interview honesty checklist
- Explain features you can demonstrate and understand.
- State that Docker, GitHub Actions, SNS, and Cost Explorer are planned.
- Do not claim automated deployment, high availability, or persistent process supervision.
- Be ready to explain how CloudWatch metrics reach the dashboard.
