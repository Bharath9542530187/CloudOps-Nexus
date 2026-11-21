# CloudOps Nexus – Interview Preparation

## 1. Short project introduction

"CloudOps Nexus is an AWS cloud monitoring and incident management web application. It has a React frontend, a Python FastAPI backend, and a PostgreSQL database. The backend uses Boto3 to retrieve EC2 CPU, memory, and disk metrics from Amazon CloudWatch. Users can also create incidents and view the incident list through REST API endpoints."

## 2. Explain the architecture

- React is the user interface.
- Vite runs the frontend during development.
- FastAPI exposes REST endpoints.
- PostgreSQL stores incident records.
- SQLAlchemy connects Python code to PostgreSQL.
- Boto3 allows the backend to communicate with AWS CloudWatch.
- EC2 hosts the demonstrated backend environment.
- IAM role permissions allow the EC2 workload to call AWS services without embedding access keys.

## 3. Common interview questions

### Q1. What problem does CloudOps Nexus solve?

It provides one dashboard to view infrastructure metrics and manage incident records, making basic cloud operations information easier to access.

### Q2. Why did you use FastAPI?

FastAPI is a Python framework for building REST APIs. It provides request validation, automatic API documentation, and convenient integration with Python libraries such as SQLAlchemy and Boto3.

### Q3. What is a REST API?

A REST API lets applications communicate using HTTP methods. In this project, the frontend sends HTTP requests to FastAPI and receives JSON responses.

### Q4. What is the role of PostgreSQL?

PostgreSQL stores incident records so they can be retrieved after they are created.

### Q5. What is SQLAlchemy?

SQLAlchemy is a Python ORM (Object-Relational Mapper). It lets the backend work with database records using Python objects and queries.

### Q6. What is Boto3?

Boto3 is the AWS SDK for Python. The backend uses it to call CloudWatch APIs.

### Q7. How are CPU, memory, and disk metrics collected?

CPU utilization is read from the EC2 CloudWatch namespace. Memory and disk metrics are collected by the CloudWatch Agent and published to the CWAgent namespace. FastAPI requests the latest available datapoints.

### Q8. Why is an IAM role used?

An IAM role provides temporary credentials and permissions to the EC2 workload. This avoids storing long-lived AWS access keys in the source code.

### Q9. What happens when the user creates an incident?

React sends a POST request to `/incidents`. FastAPI validates the title and description, SQLAlchemy writes the record to PostgreSQL, and the API returns the created record.

### Q10. What happens when the dashboard requests monitoring data?

React calls `/monitoring`. FastAPI calls CloudWatch through Boto3, selects the latest available datapoints, and returns JSON for the frontend to display.

### Q11. What if CloudWatch has no datapoints?

The backend returns a null value and timestamp for that metric. The frontend should handle missing data instead of assuming a number is always available.

### Q12. What is CORS?

Cross-Origin Resource Sharing is a browser security mechanism. The backend configures allowed frontend origins so the browser can call the API from the development frontend URL.

### Q13. Is Docker implemented in this project?

The complete application is not containerized. Docker was used for the local PostgreSQL development database. Full frontend/backend containerization and Docker Compose are planned improvements.

### Q14. Is GitHub Actions CI/CD implemented?

No. It is documented as a planned improvement. A future workflow could run linting, tests, builds, and then an approved deployment.

### Q15. Are SNS notifications and Cost Explorer implemented?

They are planned extensions, not current features. SNS could send email notifications, and Cost Explorer could provide cloud cost and usage data.

## 4. Be clear about current limitations

- The frontend was run locally during the demonstration.
- The FastAPI backend was run on EC2 for the demonstration.
- The backend process was started manually and was not configured as a persistent production service.
- Full-stack Docker Compose is not implemented.
- GitHub Actions CI/CD is not implemented.
- SNS notifications and Cost Explorer integration are not implemented.
- The project is a learning/demo platform, not a production-ready enterprise monitoring product.

## 5. Suggested project walkthrough

1. Open the dashboard and explain the main interface.
2. Show the server monitoring page and explain CPU, memory, and disk metrics.
3. Explain how the frontend calls the FastAPI `/monitoring` endpoint.
4. Open the backend code and explain the Boto3 CloudWatch calls.
5. Show incident creation and the incident list.
6. Explain how SQLAlchemy stores incidents in PostgreSQL.
7. Finish with the architecture diagram and discuss future improvements separately.

## 6. Important preparation advice

Be ready to explain every component and command you mention. Do not claim that a feature is implemented merely because it appears in a future architecture diagram. If asked about an unfinished feature, explain its intended design and what you would implement next.
