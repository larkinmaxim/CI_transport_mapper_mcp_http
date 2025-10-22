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
podman ps --filter name=ci-xml-transformer-mcp

# Logs
podman logs -f ci-xml-transformer-mcp

# Stop/Start/Restart
podman stop ci-xml-transformer-mcp
podman start ci-xml-transformer-mcp
podman restart ci-xml-transformer-mcp
```

## 🌐 Access

- **HTTP Endpoint**: http://localhost:3100
- **Status Check**: `curl http://localhost:3100`
- **MCP Endpoint**: http://localhost:3100/mcp

## 🔧 Troubleshooting

```powershell
# Check health
podman inspect ci-xml-transformer-mcp --format "{{.State.Health.Status}}"

# Container details
podman inspect ci-xml-transformer-mcp

# Resource usage
podman stats ci-xml-transformer-mcp
```

## 📚 Full Documentation

See [Container Deployment Guide](Documentation/Container_Deployment_Guide.md) for comprehensive instructions.
