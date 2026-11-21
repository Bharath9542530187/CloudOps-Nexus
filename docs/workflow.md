# CloudOps Nexus Workflow

## Incident Management

1. The user opens the React application in a browser.
2. Nginx serves the frontend.
3. The React page sends incident requests to `/api/incidents`.
4. Nginx forwards the request to FastAPI.
5. FastAPI reads or writes incident records in PostgreSQL.
6. The response returns through Nginx to the browser.

## Monitoring

1. The dashboard or Server Monitoring page requests `/api/monitoring`.
2. Nginx forwards the request to FastAPI.
3. FastAPI requests CPU, memory, and disk metrics from CloudWatch.
4. CloudWatch returns the latest available datapoints.
5. FastAPI returns the values and timestamps to React.

| Metric | CloudWatch namespace | Source |
|---|---|---|
| CPU utilization | AWS/EC2 | EC2 monitoring |
| Memory used percent | CWAgent | CloudWatch Agent |
| Disk used percent | CWAgent | CloudWatch Agent |

## Deployment

1. Code is pushed to the `main` branch.
2. GitHub Actions checks backend Python syntax.
3. GitHub Actions builds the React frontend.
4. GitHub Actions validates the Docker Compose configuration.
5. GitHub Actions connects to the existing EC2 instance over SSH.
6. The EC2 instance pulls the latest code.
7. Docker Compose rebuilds and restarts the frontend, backend, and database services.
8. The workflow checks the running container list.

The same deployment can be started manually on EC2 with `docker compose up -d --build`.
