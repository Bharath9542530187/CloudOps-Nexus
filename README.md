# CloudOps Nexus

CloudOps Nexus is a small AWS operations dashboard built to bring EC2 monitoring and incident tracking into one place. The web interface is built with React, the API uses FastAPI, and PostgreSQL keeps the incident records. AWS CloudWatch supplies the instance metrics shown by the dashboard.

## Architecture

CloudOps Nexus is hosted on one existing Amazon EC2 instance. **EC2 is the deployment host for the complete application.** Docker Compose runs the frontend, backend, and database as three containers on that instance.

```mermaid
flowchart TB
    Browser[User browser]

    subgraph EC2["AWS EC2 instance — CloudOps Nexus deployment host"]
      direction TB

      subgraph APP["Docker Compose — cloudops network"]
        direction TB
        Nginx["Frontend container<br/>React + Nginx<br/>Host port 80"]
        API["Backend container<br/>FastAPI :8000"]
        DB[("Database container<br/>PostgreSQL :5432")]
        VOL[("Persistent volume<br/>postgres_data")]

        Nginx -->|/api requests| API
        API -->|Incident data| DB
        DB --- VOL
      end

      Runner["GitHub Actions self-hosted runner"]
      Runner -->|Runs docker-compose up --build| APP
    end

    Browser -->|HTTP to EC2 public IP :80| Nginx

    API -->|Reads CPU, memory and disk metrics| CW["Amazon CloudWatch"]
    ROLE["IAM role attached to EC2"] -.->|Grants AWS permissions| API
    GitHub["GitHub repository<br/>push to main"] -->|Triggers workflow| Runner
```

### How the components work together

- **EC2:** Hosts the Docker Engine, the self-hosted GitHub Actions runner, and all three application containers.
- **Frontend container:** Nginx serves the React production build on port 80. It forwards requests under `/api/` to FastAPI.
- **Backend container:** FastAPI handles incident requests and retrieves EC2 CPU, memory, and disk metrics from CloudWatch using Boto3.
- **Database container:** PostgreSQL stores incident records. The `postgres_data` volume keeps database files when containers are recreated.
- **Docker Compose:** Connects the frontend, backend, and database through the private `cloudops` bridge network. Only the frontend publishes a host port (`80:80`); ports 8000 and 5432 are not published to the host.
- **GitHub Actions runner:** Runs on the EC2 instance. A push to `main` triggers the workflow, which checks the code, builds the frontend, validates the Compose configuration, and runs the deployment command on that same EC2 host.
- **EC2 IAM role:** Supplies AWS permissions used by the backend to query CloudWatch. It is attached to the EC2 host, not a separate application container or server.

**Deployment destination:** the existing EC2 instance `cloudops-intelligence-server` (`i-01d84b19a86a4b42d`) in `us-east-1`. The browser reaches the application at the EC2 public address over HTTP port 80. GitHub stores the source and workflow; EC2 runs the deployed application.

## What the dashboard includes

- EC2 CPU utilization from the `AWS/EC2` CloudWatch namespace.
- Memory and disk utilization from the `CWAgent` namespace.
- Incident creation and incident listing backed by PostgreSQL.
- Light and dark dashboard themes.

This version does not include Cost Explorer reporting, user authentication, incident editing or deletion, or notification delivery.

## Technology used

| Part | Implementation |
|---|---|
| Web interface | React and Vite |
| Web server / reverse proxy | Nginx |
| API | Python and FastAPI |
| AWS metrics | Boto3 and Amazon CloudWatch |
| Database | PostgreSQL and SQLAlchemy |
| Packaging and runtime | Docker and Docker Compose |
| Hosting | Amazon EC2 (Amazon Linux 2023) |
| Automation | GitHub Actions with a self-hosted EC2 runner |

## AWS deployment

CloudOps Nexus is deployed to the existing EC2 instance below. The workflow updates this server; it does not provision a replacement instance.

| Detail | Value |
|---|---|
| EC2 instance name | `cloudops-intelligence-server` |
| Instance ID | `i-01d84b19a86a4b42d` |
| AWS Region | `us-east-1` (N. Virginia) |
| Operating system | Amazon Linux 2023 |
| Public-facing container | Frontend / Nginx |
| Published port | TCP 80 |
| Deployment runner | `cloudops-ec2-runner` (self-hosted) |

The GitHub Actions runner is installed on the EC2 host. On a push to `main`, the workflow checks out the new revision in the runner workspace, checks the backend Python syntax, builds the Vite frontend, and validates the Compose configuration. It then copies the server-side environment file from `/home/ec2-user/cloudops-backend/.env` into the workflow workspace and starts the updated services with Docker Compose.

The environment file contains the database configuration and the AWS region, EC2 instance ID, and CloudWatch Agent disk dimensions used by the monitoring endpoint. It stays on the EC2 host and is not stored in the repository. The EC2 instance role is used for AWS API access.

For browser access, the EC2 security group needs an inbound HTTP rule for TCP port 80. SSH (TCP 22) should remain limited to trusted administrator addresses. Do not expose ports 8000 or 5432 to the public internet. A successful CI/CD run confirms that the deployment commands and containers completed; it does not by itself confirm that the website is reachable from every browser or network.

## Docker Compose

The Compose file defines the three services and their relationship:

- `database` uses `postgres:16-alpine`, checks readiness with `pg_isready`, and stores data in `postgres_data`.
- `backend` is built from `backend/` and starts after the database reports healthy.
- `frontend` is built from `frontend/`, serves on host port 80, and sends API traffic through Nginx to the backend.

The application reads its configuration from environment variables. The tracked `.env.example` shows the required names; use real values only in a private `.env` file. Never commit that private file or put its password in an issue, screenshot, or log.

### Start the stack

For a local machine with the Docker Compose v2 plugin, use:

```bash
cp .env.example .env
# Set the values in .env before starting the services.
docker compose up -d --build
```

The EC2 runner currently uses the standalone `docker-compose` command. Its deployment workflow runs:

```bash
docker-compose config -q
docker-compose up -d --build --remove-orphans
docker-compose ps
```

### Check and stop services

Use the Compose command installed on the machine:

```bash
docker compose ps
docker compose logs -f
docker compose down
```

On the EC2 host, the equivalent command name is `docker-compose`:

```bash
docker-compose ps
docker-compose logs -f
docker-compose down
```

The normal `down` command removes the containers and network but leaves the `postgres_data` volume intact. Removing that volume would also remove the stored incident records, so do not add the `-v` option unless deleting the database is intentional.

## API routes

Nginx exposes these backend routes under `/api`:

| Method | Route | Use |
|---|---|---|
| GET | `/api/health` | Check that the API responds |
| GET | `/api/monitoring` | Retrieve CPU, memory, and disk metrics |
| GET | `/api/incidents` | List saved incidents |
| POST | `/api/incidents` | Create an incident |

## Repository layout

```text
backend/                 FastAPI code, database models, and backend Dockerfile
frontend/                React app, Nginx configuration, and frontend Dockerfile
.github/workflows/       GitHub Actions deployment workflow
docker-compose.yml       Frontend, backend, and database services
.env.example             Names and example values for required configuration
docs/                    Project documentation
```
