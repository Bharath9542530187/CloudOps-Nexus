# CloudOps Nexus – AWS Services

## 1. AWS services used

### Amazon EC2

Amazon Elastic Compute Cloud provides the virtual server used for the demonstrated backend environment.

In this project, EC2 hosts the FastAPI backend process. The frontend was run separately on the development computer during the demonstration.

### Amazon CloudWatch

CloudWatch collects and stores monitoring metrics. The FastAPI backend uses Boto3 to request metric datapoints and return them to the dashboard.

The backend currently requests:

| Metric | Namespace | Meaning |
|---|---|---|
| CPU utilization | `AWS/EC2` | Percentage of allocated CPU capacity being used |
| Memory used | `CWAgent` | Percentage of memory in use |
| Disk used | `CWAgent` | Percentage of disk space in use |

### CloudWatch Agent

The CloudWatch Agent runs on the EC2 operating system and collects system-level metrics such as memory and disk usage. These metrics are published to the `CWAgent` namespace.

EC2 CPU metrics are available from the EC2 monitoring integration; memory and disk metrics need the agent.

### AWS IAM role

The EC2 instance uses an IAM role so the backend can access CloudWatch without storing long-lived AWS access keys in the application code.

The role should follow least-privilege access: grant only the CloudWatch read actions required by the application.

### Boto3

Boto3 is the AWS SDK for Python. The FastAPI monitoring endpoint uses it to create a CloudWatch client and call `get_metric_statistics`.

## 2. Monitoring request sequence

1. The frontend calls the backend's `/monitoring` endpoint.
2. FastAPI creates a Boto3 CloudWatch client for the configured region.
3. Boto3 obtains credentials from the runtime environment (the EC2 role in the EC2 setup).
4. The backend requests metric statistics for the configured EC2 instance.
5. The backend selects the latest datapoint and returns its value and timestamp.

## 3. Permissions and security

- Attach an IAM role to EC2 rather than putting access keys in source code.
- Keep IAM permissions limited to the required read-only CloudWatch actions.
- Never commit AWS access keys, private keys, passwords, database URLs, or real `.env` files.
- Restrict SSH access to trusted IP addresses.
- Do not expose the database port publicly.
- For a production deployment, use HTTPS, managed secrets, security-group restrictions, logging, and a persistent application service.

## 4. Configuration notes

The current backend source specifies the AWS region and EC2 instance identifier in its configuration. For a more reusable deployment, these values should be moved into environment variables and documented through placeholders in `.env.example`.

Do not copy live credentials or sensitive environment values into this repository.

## 5. Planned AWS extensions (not implemented)

| Service / feature | Intended purpose | Status |
|---|---|---|
| Amazon SNS | Send email notifications for selected events | Planned |
| AWS Cost Explorer | Display cost and usage information | Planned |
| CloudWatch alarms | Trigger actions when metrics cross thresholds | Not shown as implemented |
| Automated recovery | Execute approved remediation actions | Future idea |

This document separates the AWS services used by the current monitoring workflow from possible future integrations.
