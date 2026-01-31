#!/bin/bash
# Deploy script with .env synchronization

set -e

EC2_USER="ec2-user"
EC2_HOST="your-ec2-ip"
PROJECT_ROOT="/home/ec2-user/brinda-web"

echo "Building and pushing Docker image..."
# Build API image
docker build -t brinda-api:latest docker/api/
docker tag brinda-api:latest ${ECR_REGISTRY}/brinda-api:latest
docker push ${ECR_REGISTRY}/brinda-api:latest

echo "Copying .env file to EC2..."
# Copy local .env to EC2 as .env (default for docker-compose)
scp apps/api/.env ${EC2_USER}@${EC2_HOST}:${PROJECT_ROOT}/.env

echo "Deploying to EC2..."
# Restart services on EC2
ssh ${EC2_USER}@${EC2_HOST} "cd ${PROJECT_ROOT} && docker-compose -f infra/docker-compose.prod.yml down && docker-compose -f infra/docker-compose.prod.yml up -d"

echo "Deployment complete!"