# CloudOps Nexus – AWS Services

## Amazon EC2

Amazon Elastic Compute Cloud provides virtual servers in AWS. In CloudOps Nexus, EC2 hosts the demonstrated FastAPI backend and is the infrastructure instance being monitored.

## Amazon CloudWatch

Amazon CloudWatch collects and provides access to monitoring metrics. CloudOps Nexus retrieves the following metrics:

| Metric | Namespace | Description |
|---|---|---|
| CPUUtilization | AWS/EC2 | Percentage of allocated CPU being used |
| mem_used_percent | CWAgent | Percentage of memory used |
| disk_used_percent | CWAgent | Percentage of disk space used |

## CloudWatch Agent

The CloudWatch Agent runs on the EC2 operating system and collects guest operating system metrics, including memory and disk utilization. It publishes these metrics to the CWAgent namespace.

## AWS IAM Role

An IAM role attached to EC2 provides temporary AWS credentials and permissions to applications running on the instance. This avoids storing long-lived access keys in source code. The role should follow the principle of least privilege.

## Boto3

Boto3 is the AWS SDK for Python. The FastAPI backend uses a Boto3 CloudWatch client and the `get_metric_statistics` operation to retrieve recent metric datapoints.

## Monitoring Request Flow

1. React calls the FastAPI `GET /monitoring` endpoint.
2. FastAPI creates a CloudWatch client in the configured AWS region.
3. Boto3 obtains credentials through the AWS credential provider chain; on EC2, these normally come from the attached IAM role.
4. CloudWatch returns the requested datapoints.
5. FastAPI selects the latest datapoint and returns the result as JSON.

## Security and Configuration

- AWS access keys and secrets are not stored in source code.
- An EC2 IAM role is preferred over long-lived access keys.
- Security group rules should expose only the required ports to trusted sources.
- The AWS region and EC2 instance identifier in the current source should be moved into environment-based configuration before reuse.
- CloudWatch metric dimensions must match the CloudWatch Agent configuration.

## Planned AWS Integrations

Amazon SNS email notifications and AWS Cost Explorer reporting are potential extensions. Neither integration is part of the current working implementation.

HTTPS, persistent process supervision, load balancing, managed secrets, and automated deployment are also production-readiness improvements.
