# Docker and GitHub Actions

## Docker

Docker packages each part of the application with the software it needs to run.

CloudOps Nexus has three containers:

- React production frontend served by Nginx.
- FastAPI backend.
- PostgreSQL database.

## Docker Compose

Docker Compose starts and manages the three containers using `docker-compose.yml`. The containers communicate over a private Docker network. PostgreSQL data is stored in a named volume so it remains when the application containers are rebuilt.

Start the application:

```bash
docker compose up -d --build
```

View running containers:

```bash
docker compose ps
```

View application logs:

```bash
docker compose logs -f
```

Stop the containers:

```bash
docker compose down
```

## GitHub Actions

GitHub Actions automates deployment when code is pushed to the `main` branch.

The workflow:
1. Downloads the latest project code.
2. Checks the backend Python files.
3. Builds the React frontend.
4. Checks the Docker Compose configuration.
5. Connects to the existing EC2 instance over SSH.
6. Pulls the latest code and rebuilds the containers with Docker Compose.

The deployment uses three GitHub repository secrets: `EC2_HOST`, `EC2_USER`, and `EC2_SSH_KEY`.

The workflow deploys to the existing EC2 instance and does not create another server.
