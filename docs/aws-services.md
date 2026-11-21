# AWS Services

## Amazon EC2

The existing EC2 instance hosts the CloudOps Nexus application. Docker Compose runs the frontend, backend, and PostgreSQL containers on this server.

## Amazon CloudWatch

CloudWatch provides the metrics returned by the backend monitoring endpoint.

| Metric | Namespace | Meaning |
|---|---|---|
| CPUUtilization | AWS/EC2 | EC2 CPU usage percentage |
| mem_used_percent | CWAgent | Operating system memory usage |
| disk_used_percent | CWAgent | Operating system disk usage |

## CloudWatch Agent

The CloudWatch Agent runs on the EC2 host and publishes memory and disk metrics to the CWAgent namespace.

## EC2 Instance Role

The EC2 instance role gives the backend permission to read CloudWatch metrics. The backend uses the AWS permissions available from the EC2 host.

## Boto3

Boto3 is the AWS SDK for Python. FastAPI uses it to request the latest available metric datapoints from CloudWatch.

## Application Flow

React requests monitoring data from FastAPI. FastAPI uses Boto3 to query CloudWatch and returns the values to React. Nginx forwards browser API requests to the backend container.
