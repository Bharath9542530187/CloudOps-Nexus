# CloudOps Nexus

CloudOps Nexus is a cloud operations dashboard built with React, FastAPI, and PostgreSQL. It supports incident management and displays EC2 CPU, memory, and disk metrics collected through Amazon CloudWatch.

## Architecture

The complete application runs on one existing Amazon EC2 instance. Docker Compose runs three containers:

- **Frontend:** React production build served by Nginx.
- **Backend:** FastAPI handles incident requests and reads CloudWatch metrics.
- **Database:** PostgreSQL stores incident records in a persistent Docker volume.

Nginx serves the website and forwards requests under `/api` to FastAPI. FastAPI connects to PostgreSQL over the private Docker network and to CloudWatch through the EC2 instance role.

## Technology

| Area | Technology |
|---|---|
| Frontend | React, Vite, Nginx |
| Backend | Python, FastAPI, Boto3 |
| Database | PostgreSQL, SQLAlchemy |
| Containers | Docker, Docker Compose |
| Cloud | AWS EC2, IAM, CloudWatch, CloudWatch Agent |
| CI/CD | GitHub Actions |
| Source control | Git, GitHub |

## Application Features

- Dashboard with CPU, memory, disk, and open incident information.
- Create and list incidents stored in PostgreSQL.
- Server monitoring page reads metrics from the FastAPI CloudWatch endpoint.
- Light and dark dashboard themes.

Cost reporting is shown as unavailable because Cost Explorer integration is not part of this version. Incident editing, deletion, authentication, and notifications are also not included.

## Deployment Flow

A push to the `main` branch starts GitHub Actions. The workflow checks the backend Python syntax, builds the React frontend, checks the Docker Compose configuration, connects to the existing EC2 instance over SSH, pulls the latest source, and rebuilds the running containers.

## Run Locally

From the repository root, create a local `.env` file using the values in `.env.example`, then run:

```bash
docker compose up -d --build
```

Open `http://localhost`.

Stop the application with:

```bash
docker compose down
```

The PostgreSQL data remains in the named Docker volume when containers are stopped or recreated.

## EC2 Deployment

The EC2 instance runs Docker Engine, the Docker Compose plugin, and Git. The repository is checked out at `/opt/cloudops-nexus`. The instance's security group allows inbound HTTP traffic on port 80.

The EC2 environment file contains the database settings, AWS region, and the instance ID used for CloudWatch queries. The EC2 instance role allows CloudWatch metric reads.

GitHub Actions uses these repository secrets:

- `EC2_HOST`: public IP or DNS name of the existing EC2 instance.
- `EC2_USER`: SSH login user, usually `ec2-user` for Amazon Linux.
- `EC2_SSH_KEY`: private SSH key for that instance.

The workflow deploys to the existing EC2 instance; it does not create another server.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Backend health check through Nginx |
| GET | `/api/monitoring` | CloudWatch CPU, memory, and disk metrics |
| GET | `/api/incidents` | List incidents |
| POST | `/api/incidents` | Create an incident |

## Repository Layout

```text
backend/                 FastAPI application and Dockerfile
frontend/                React application, Nginx config, Dockerfile
.github/workflows/       GitHub Actions deployment workflow
docker-compose.yml       Application services
.env.example             Environment variable template
docs/                    Architecture and service notes
```
