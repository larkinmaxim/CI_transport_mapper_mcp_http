# Quick Deployment Reference

## 🚀 Deploy Container

```powershell
# Default deployment (production, port 3100)
.\deploy.ps1

# Custom deployment
.\deploy.ps1 -Port 3101 -Environment dev
```

## 📊 Container Management

```powershell
# Status
podman ps --filter name=ci-transport-mapper-mcp-http

# Logs
podman logs -f ci-transport-mapper-mcp-http

# Stop/Start/Restart
podman stop ci-transport-mapper-mcp-http
podman start ci-transport-mapper-mcp-http
podman restart ci-transport-mapper-mcp-http
```

## 🌐 Access

- **HTTP Endpoint**: http://localhost:3100
- **Status Check**: `curl http://localhost:3100`
- **MCP Endpoint**: http://localhost:3100/mcp

## 🔧 Troubleshooting

```powershell
# Check health
podman inspect ci-transport-mapper-mcp-http --format "{{.State.Health.Status}}"

# Container details
podman inspect ci-transport-mapper-mcp-http

# Resource usage
podman stats ci-transport-mapper-mcp-http
```

## 📚 Full Documentation

See [Container Deployment Guide](Documentation/Container_Deployment_Guide.md) for comprehensive instructions.
