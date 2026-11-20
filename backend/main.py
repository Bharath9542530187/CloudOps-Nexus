 
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import Incident
from pydantic import BaseModel

import boto3
from datetime import datetime, timedelta, timezone
from botocore.exceptions import BotoCoreError, ClientError


# Create FastAPI application
app = FastAPI(title="CloudOps Intelligence Platform")

# AWS configuration
AWS_REGION = "us-east-1"
INSTANCE_ID = "i-01d84b19a86a4b42d"


# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Request format
class IncidentCreate(BaseModel):
    title: str
    description: str


# Get latest CloudWatch metric
def get_latest_metric(cloudwatch, namespace, metric_name, dimensions):

    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(minutes=15)

    response = cloudwatch.get_metric_statistics(
        Namespace=namespace,
        MetricName=metric_name,
        Dimensions=dimensions,
        StartTime=start_time,
        EndTime=end_time,
        Period=300,
        Statistics=["Average"]
    )

    datapoints = response["Datapoints"]

    if not datapoints:
        return {
            "value": None,
            "timestamp": None
        }

    latest = max(datapoints, key=lambda point: point["Timestamp"])

    return {
        "value": round(latest["Average"], 2),
        "timestamp": latest["Timestamp"].isoformat()
    }


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "CloudOps Intelligence Platform is running"
    }


# Health endpoint
@app.get("/health")
def health():
    return {
        "status": "Healthy"
    }


# AWS monitoring endpoint
@app.get("/monitoring")
def get_monitoring_metrics():

    try:
        cloudwatch = boto3.client(
            "cloudwatch",
            region_name=AWS_REGION
        )

        cpu = get_latest_metric(
            cloudwatch,
            "AWS/EC2",
            "CPUUtilization",
            [
                {"Name": "InstanceId", "Value": INSTANCE_ID}
            ]
        )

        memory = get_latest_metric(
            cloudwatch,
            "CWAgent",
            "mem_used_percent",
            [
                {"Name": "InstanceId", "Value": INSTANCE_ID}
            ]
        )

        disk = get_latest_metric(
            cloudwatch,
            "CWAgent",
            "disk_used_percent",
            [
                {"Name": "InstanceId", "Value": INSTANCE_ID},
                {"Name": "device", "Value": "nvme0n1p1"},
                {"Name": "fstype", "Value": "xfs"},
                {"Name": "path", "Value": "/"}
            ]
        )

        return {
            "instance_id": INSTANCE_ID,
            "cpu": cpu,
            "memory": memory,
            "disk": disk
        }

    except (BotoCoreError, ClientError) as error:
        raise HTTPException(
            status_code=503,
            detail=f"CloudWatch monitoring error: {str(error)}"
        )


# Create incident
@app.post("/incidents")
def create_incident(
    incident: IncidentCreate,
    db: Session = Depends(get_db)
):
    new_incident = Incident(
        title=incident.title,
        description=incident.description
    )

    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    return new_incident


# View all incidents
@app.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).all()
