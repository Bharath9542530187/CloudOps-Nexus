# CloudOps-Nexus
AWS CloudOps monitoring and incident management platform

# CloudOps Nexus

### AWS Cloud Infrastructure Monitoring & Incident Management Platform

CloudOps Nexus is a cloud operations platform designed to monitor AWS infrastructure, manage incidents, track cloud costs, and support operational visibility through a centralized dashboard.

## Project Overview

The platform combines a React frontend, Python FastAPI backend, and PostgreSQL database. It is being developed to integrate AWS services for infrastructure monitoring, cost visibility, and automated notifications.

## Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Python, FastAPI |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Cloud | AWS EC2, CloudWatch |
| Programming | Python, JavaScript |
| Version Control | Git, GitHub |
| CI/CD | GitHub Actions (planned) |
| Containerization | Docker, Docker Compose (planned) |

## Current Features

- React-based monitoring dashboard
- Dark mode interface
- Incident creation and listing
- PostgreSQL database integration
- FastAPI REST API
- AWS EC2 infrastructure monitoring setup
- CloudWatch CPU, memory, and disk metrics collection

## Planned Features

- Docker containerization
- Docker Compose deployment
- GitHub Actions CI/CD automation
- AWS EC2 application deployment
- CloudWatch dashboard integration
- SNS email notifications
- AWS Cost Explorer integration
- Incident status management

## Project Architecture

```text
              React Frontend
                    |
                    v
              FastAPI Backend
                    |
             PostgreSQL Database
                    |
          AWS Service Integration
                    |
       +------------+------------+
       |            |            |
   CloudWatch      SNS      Cost Explorer
   Monitoring     Alerts     Cost Tracking
```

## Project Status

The application foundation and incident management functionality are implemented. AWS infrastructure monitoring has been configured and tested. Full application deployment and remaining AWS integrations are in progress.

## Project Repository

GitHub: https://github.com/Bharath9542530187/CloudOps-Nexus

## Author

B.Tech Computer Science and Engineering – Data Science

AWS Cloud & DevOps Project
