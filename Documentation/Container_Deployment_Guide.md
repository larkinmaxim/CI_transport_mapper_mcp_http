# Container Deployment Guide

This guide provides comprehensive instructions for deploying the XML Transformer MCP Server using container technologies (Podman/Docker).

## 📋 Overview

The XML Transformer MCP Server can be deployed as a container using either Podman (recommended) or Docker. The deployment includes:

- **HTTP Transport**: Optimized for web clients and API integration
- **Health Monitoring**: Built-in health checks with automatic recovery
- **Environment Isolation**: Secure containerized deployment
- **Auto-restart**: Automatic recovery from failures
- **Port Mapping**: Configurable port exposure

## 🐳 Podman Deployment (Recommended)

### Prerequisites

#### Required Software
- **Podman** 4.0+ - Container runtime ([Installation Guide](https://podman.io/getting-started/installation))
- **PowerShell** 5.1+ - Windows PowerShell or PowerShell Core

#### Installing Podman
- **Windows**: Download from [Podman.io](https://podman.io/getting-started/installation)
- **Linux**: `sudo apt install podman` or `sudo dnf install podman`
- **macOS**: `brew install podman`

### Quick Start

#### 1. Basic Deployment
```powershell
# Deploy with default settings
.\deploy.ps1
```

This will:
- Build the container image as `ci-transport-mapper-mcp-http:latest`
- Create and start container `ci-transport-mapper-mcp-http`
- Expose the service on port 3100
- Configure automatic restart and health monitoring

#### 2. Custom Deployment
```powershell
# Deploy with custom port and environment
.\deploy.ps1 -Port 3101 -Environment dev
```

#### 3. Verify Deployment
```powershell
# Check container status
podman ps --filter name=ci-transport-mapper-mcp-http

# Test HTTP endpoint
curl http://localhost:3100

# View container logs
podman logs ci-transport-mapper-mcp-http
```

### Deployment Script Features

The `deploy.ps1` script provides:

- ✅ **Automated Build**: Builds container image from Dockerfile
- ✅ **Cleanup**: Stops and removes existing containers automatically
- ✅ **Configuration**: Sets proper environment variables and labels
- ✅ **Validation**: Checks Podman installation and deployment status
- ✅ **Error Handling**: Clear error messages and exit codes
- ✅ **Status Reporting**: Shows deployment progress and final status

### Script Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `Port` | Integer | 3100 | Host port to map to container port 3100 |
| `Environment` | String | production | Environment label for container |

### Container Configuration

#### Image Details
- **Name**: `ci-transport-mapper-mcp-http:latest`
- **Base Image**: `node:20-alpine`
- **Size**: ~200MB (optimized Alpine Linux)
- **Security**: Runs as non-root user

#### Container Details
- **Name**: `ci-transport-mapper-mcp-http`
- **Port Mapping**: `{HOST_PORT}:3100`
- **Restart Policy**: `unless-stopped`
- **Health Check**: HTTP GET to `/` every 30 seconds

#### Environment Variables
```bash
NODE_ENV=production          # Runtime environment
MCP_TRANSPORT=http          # Transport protocol
PORT=3100                   # Internal container port
```

#### Labels
```bash
environment=production       # Environment identifier
project=xml-transformer-mcp # Project identifier
```

## 🔧 Container Management

### Daily Operations

#### View Logs
```powershell
# Real-time logs
podman logs -f ci-transport-mapper-mcp-http

# Recent logs with timestamps
podman logs -t --tail 50 ci-transport-mapper-mcp-http
```

#### Container Control
```powershell
# Stop container
podman stop ci-transport-mapper-mcp-http

# Start container
podman start ci-transport-mapper-mcp-http

# Restart container
podman restart ci-transport-mapper-mcp-http

# Remove container
podman rm ci-transport-mapper-mcp-http
```

#### Status and Monitoring
```powershell
# Container status
podman ps --filter name=ci-transport-mapper-mcp-http

# Detailed container info
podman inspect ci-transport-mapper-mcp-http

# Resource usage
podman stats ci-transport-mapper-mcp-http

# Health status
podman inspect ci-transport-mapper-mcp-http --format "{{.State.Health.Status}}"
```

### Image Management

#### Build and Update
```powershell
# Rebuild and redeploy
.\deploy.ps1

# Build only (no deployment)
podman build -t ci-transport-mapper-mcp-http:latest .

# List images
podman images
```

#### Cleanup
```powershell
# Remove unused images
podman image prune

# Remove all project containers
podman ps -a --filter "label=project=xml-transformer-mcp" --format "{{.Names}}" | ForEach-Object { podman rm -f $_ }
```

### Backup and Migration

#### Export Container Image
```powershell
# Export image
podman save ci-transport-mapper-mcp-http:latest -o xml-transformer-backup.tar

# Import on another system
podman load -i xml-transformer-backup.tar
```

## 🐋 Docker Alternative

If you prefer Docker over Podman, you can use Docker Compose:

### Docker Compose Deployment

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f xml-transformer-mcp

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

### Docker Commands

```bash
# Build image
docker build -t ci-transport-mapper-mcp-http:latest .

# Run container
docker run -d --name ci-transport-mapper-mcp-http -p 3100:3100 ci-transport-mapper-mcp-http:latest

# Container management (same as Podman, replace 'podman' with 'docker')
docker logs ci-transport-mapper-mcp-http
docker stop ci-transport-mapper-mcp-http
docker start ci-transport-mapper-mcp-http
```

## 🌍 Multi-Environment Deployment

### Development Environment
```powershell
# Deploy to development
.\deploy.ps1 -Port 3101 -Environment dev
```

### Staging Environment
```powershell
# Deploy to staging
.\deploy.ps1 -Port 3102 -Environment staging
```

### Production Environment
```powershell
# Deploy to production (default)
.\deploy.ps1 -Port 3100 -Environment production
```

## 🔍 Monitoring and Troubleshooting

### Health Checks

The container includes built-in health monitoring:
- **Check Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3 attempts
- **Start Period**: 40 seconds (grace period)

### Health Status
```powershell
# Check health status
podman inspect ci-transport-mapper-mcp-http --format "{{.State.Health.Status}}"

# Possible values: starting, healthy, unhealthy
```

### Common Issues

#### 1. Port Already in Use
```powershell
# Use different port
.\deploy.ps1 -Port 3101
```

#### 2. Container Won't Start
```powershell
# Check logs for errors
podman logs ci-transport-mapper-mcp-http

# Inspect container configuration
podman inspect ci-transport-mapper-mcp-http
```

#### 3. Health Check Failing
```powershell
# Manual health check
curl http://localhost:3100

# Check container internal logs
podman exec ci-transport-mapper-mcp-http ps aux
```

#### 4. Build Failures
```powershell
# Check Dockerfile and dependencies
podman build -t ci-transport-mapper-mcp-http:latest . --no-cache
```

### Performance Monitoring

#### Resource Usage
```powershell
# Real-time stats
podman stats ci-transport-mapper-mcp-http

# Memory and CPU limits (if needed)
podman run -d --name ci-transport-mapper-mcp-http --memory=512m --cpus=1.0 -p 3100:3100 ci-transport-mapper-mcp-http:latest
```

## 🔐 Security Considerations

### Container Security
- ✅ **Non-root User**: Container runs as `xmluser` (UID 1001)
- ✅ **Alpine Base**: Minimal attack surface with Alpine Linux
- ✅ **Production Dependencies**: Only production packages in final image
- ✅ **Health Monitoring**: Early detection of service issues

### Network Security
- ✅ **Port Mapping**: Only expose necessary ports
- ✅ **Localhost Binding**: Default binding to localhost only
- ✅ **No Privileged Mode**: Container runs with standard permissions

### Best Practices
1. **Regular Updates**: Rebuild containers with updated base images
2. **Resource Limits**: Set appropriate CPU and memory limits
3. **Log Rotation**: Configure log rotation for long-running containers
4. **Monitoring**: Implement proper monitoring and alerting
5. **Backup Strategy**: Regular image and configuration backups

## 📊 Production Deployment

### Recommended Production Setup

```powershell
# Production deployment with resource limits
podman run -d \
  --name ci-transport-mapper-mcp-http \
  -p 3100:3100 \
  --memory=1g \
  --cpus=2 \
  --restart unless-stopped \
  --health-cmd "wget --no-verbose --tries=1 --spider http://localhost:3100/" \
  --health-interval 30s \
  --health-timeout 10s \
  --health-retries 3 \
  -e NODE_ENV=production \
  -e MCP_TRANSPORT=http \
  -e PORT=3100 \
  --label environment=production \
  --label project=xml-transformer-mcp \
  ci-transport-mapper-mcp-http:latest
```

### Load Balancing and Scaling

For high-availability deployments:

```powershell
# Multiple instances with different ports
.\deploy.ps1 -Port 3100 -Environment production  # Instance 1
.\deploy.ps1 -Port 3101 -Environment production  # Instance 2
.\deploy.ps1 -Port 3102 -Environment production  # Instance 3
```

## 📚 Additional Resources

- [Podman Documentation](https://docs.podman.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Container Security Best Practices](https://sysdig.com/blog/dockerfile-best-practices/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🆘 Support

If you encounter issues:

1. **Check Logs**: `podman logs ci-transport-mapper-mcp-http`
2. **Verify Configuration**: `podman inspect ci-transport-mapper-mcp-http`
3. **Test Connectivity**: `curl http://localhost:3100`
4. **Check Resources**: `podman stats ci-transport-mapper-mcp-http`
5. **Review Documentation**: Check this guide and related docs

For additional support, review the project's GitHub repository and documentation.
