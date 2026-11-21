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

An IAM role attached to EC2 provides temporary AWS permissions to applications running on the instance. The role is configured with the permissions needed by the monitoring application.

## Boto3

Boto3 is the AWS SDK for Python. The FastAPI backend uses a Boto3 CloudWatch client and the `get_metric_statistics` operation to retrieve recent metric datapoints.

## Monitoring Request Flow

1. React calls the FastAPI `GET /monitoring` endpoint.
2. FastAPI creates a CloudWatch client in the configured AWS region.
3. Boto3 uses the AWS permissions available to the backend host.
4. CloudWatch returns the requested datapoints.
5. FastAPI selects the latest datapoint and returns the result as JSON.

## Planned AWS Integrations

Amazon SNS email notifications and AWS Cost Explorer reporting are planned extensions. Neither integration is part of the current working application.

HTTPS, persistent process supervision, load balancing, and automated deployment are also potential improvements for a production environment.
