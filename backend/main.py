import os
from datetime import datetime, timedelta, timezone

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import Incident

app = FastAPI(title="CloudOps Nexus")

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
EC2_INSTANCE_ID = os.getenv("EC2_INSTANCE_ID", "")
CW_DISK_DEVICE = os.getenv("CW_DISK_DEVICE", "nvme0n1p1")
CW_DISK_FSTYPE = os.getenv("CW_DISK_FSTYPE", "xfs")
CW_DISK_PATH = os.getenv("CW_DISK_PATH", "/")


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class IncidentCreate(BaseModel):
    title: str
    description: str


def get_latest_metric(client, namespace, metric_name, dimensions):
    end_time = datetime.now(timezone.utc)
    response = client.get_metric_statistics(
        Namespace=namespace,
        MetricName=metric_name,
        Dimensions=dimensions,
        StartTime=end_time - timedelta(minutes=30),
        EndTime=end_time,
        Period=300,
        Statistics=["Average"],
    )
    points = response.get("Datapoints", [])
    if not points:
        return {"value": None, "timestamp": None}

    latest = max(points, key=lambda point: point["Timestamp"])
    return {
        "value": round(latest["Average"], 2),
        "timestamp": latest["Timestamp"].isoformat(),
    }


@app.get("/")
def home():
    return {"message": "CloudOps Nexus API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/monitoring")
def get_monitoring_metrics():
    if not EC2_INSTANCE_ID:
        raise HTTPException(status_code=503, detail="EC2_INSTANCE_ID is not configured")

    try:
        client = boto3.client("cloudwatch", region_name=AWS_REGION)
        instance = [{"Name": "InstanceId", "Value": EC2_INSTANCE_ID}]

        cpu = get_latest_metric(client, "AWS/EC2", "CPUUtilization", instance)
        memory = get_latest_metric(client, "CWAgent", "mem_used_percent", instance)
        disk_dimensions = instance + [
            {"Name": "device", "Value": CW_DISK_DEVICE},
            {"Name": "fstype", "Value": CW_DISK_FSTYPE},
            {"Name": "path", "Value": CW_DISK_PATH},
        ]
        disk = get_latest_metric(client, "CWAgent", "disk_used_percent", disk_dimensions)

        return {
            "instance_id": EC2_INSTANCE_ID,
            "region": AWS_REGION,
            "cpu": cpu,
            "memory": memory,
            "disk": disk,
        }
    except (BotoCoreError, ClientError) as error:
        raise HTTPException(status_code=503, detail=f"CloudWatch error: {error}") from error


@app.post("/incidents")
def create_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    record = Incident(title=incident.title, description=incident.description)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@app.get("/incidents")
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()
