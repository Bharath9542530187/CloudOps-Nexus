# CloudOps Nexus – AWS Services

## Amazon EC2
Amazon Elastic Compute Cloud provides virtual servers in AWS. In the demonstration, EC2 hosted the FastAPI backend and was the instance being monitored.

## Amazon CloudWatch
CloudWatch stores and provides access to monitoring metrics. The backend reads the following:

| Metric | Namespace | Meaning |
|---|---|---|
| CPUUtilization | AWS/EC2 | Percentage of allocated CPU being used |
| mem_used_percent | CWAgent | Percentage of memory used |
| disk_used_percent | CWAgent | Percentage of disk space used |

## CloudWatch Agent
The CloudWatch Agent runs on the EC2 operating system and collects guest operating system metrics such as memory and disk utilization. It publishes these values to the CWAgent namespace.

## IAM role
An IAM role attached to EC2 supplies temporary AWS credentials and permissions to software running on the instance. This avoids storing long-lived access keys in source code. Permissions should follow least privilege.

## Boto3
Boto3 is the AWS SDK for Python. The FastAPI backend uses a Boto3 CloudWatch client and calls get_metric_statistics to retrieve recent datapoints.

## Monitoring request path
1. React calls GET /monitoring.
2. FastAPI creates a CloudWatch client in the configured region.
3. Boto3 obtains credentials through the AWS credential provider chain (on EC2, normally the attached role).
4. CloudWatch returns datapoints.
5. FastAPI selects the latest datapoint and returns JSON.

## Security and configuration
- Never commit AWS access keys or secrets.
- Prefer an attached IAM role on EC2.
- Restrict security group inbound rules to required sources.
- Move the current source's fixed region and EC2 instance identifier into environment-based configuration before reuse.
- Ensure metric dimensions match the CloudWatch Agent configuration.

## Planned AWS integrations – not implemented

### Amazon SNS
Could send email notifications when an incident is created or a metric threshold is crossed. SNS notifications are not currently integrated.

### AWS Cost Explorer
Could provide cost and usage reporting for a cost dashboard. Cost Explorer API integration is not currently implemented.

### Production deployment improvements
HTTPS, persistent process supervision, load balancing, managed secrets, and automated deployment are future improvements.
