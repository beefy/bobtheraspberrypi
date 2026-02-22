#!/bin/bash

# Compute Engine startup script for Bob the Raspberry Pi
# This script sets up the environment and deploys the application

# Update system
sudo apt-get update -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create app directory
sudo mkdir -p /opt/bob-raspberry-pi
sudo chown $USER:$USER /opt/bob-raspberry-pi
cd /opt/bob-raspberry-pi

# Pull and run the application
docker pull gcr.io/PROJECT_ID/bob-raspberry-pi:latest
docker run -d \
  --name bob-raspberry-pi-app \
  --restart unless-stopped \
  -p 80:80 \
  -e NODE_ENV=production \
  -e REACT_APP_API_URL=https://your-api-domain.com/api \
  gcr.io/PROJECT_ID/bob-raspberry-pi:latest

# Setup monitoring
sudo apt-get install -y curl htop

echo "Bob the Raspberry Pi deployment complete!"