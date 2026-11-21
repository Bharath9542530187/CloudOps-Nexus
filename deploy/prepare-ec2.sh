#!/bin/bash
set -euo pipefail

sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker ec2-user

sudo mkdir -p /opt/cloudops-nexus
sudo chown ec2-user:ec2-user /opt/cloudops-nexus

if [ ! -d /opt/cloudops-nexus/.git ]; then
  git clone https://github.com/Bharath9542530187/CloudOps-Nexus.git /opt/cloudops-nexus
fi

cd /opt/cloudops-nexus
if [ ! -f .env ]; then
  cp .env.example .env
  chmod 600 .env
fi

echo "Docker is installed and the project is in /opt/cloudops-nexus."
echo "Edit /opt/cloudops-nexus/.env with the existing EC2 instance ID and a strong database password."
echo "Log out and back in before running Docker commands as ec2-user."
