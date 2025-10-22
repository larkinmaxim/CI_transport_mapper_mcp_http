# Simple deployment script for XML Transformer MCP Server

param(
    [int]$Port = 3100,
    [string]$Environment = "production"
)

$ImageName = "ci-xml-transformer-mcp"
$ContainerName = "ci-xml-transformer-mcp"
$ImageTag = "${ImageName}:latest"

Write-Host "XML Transformer MCP Server - Podman Deploy" -ForegroundColor Blue
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Port: $Port" -ForegroundColor Cyan
Write-Host ""

# Check Podman
Write-Host "Checking Podman installation..." -ForegroundColor Cyan
try {
    $version = podman --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Podman available: $version" -ForegroundColor Green
    } else {
        throw "Podman not found"
    }
}
catch {
    Write-Host "ERROR: Podman not installed or not in PATH" -ForegroundColor Red
    Write-Host "Install from: https://podman.io/getting-started/installation"
    exit 1
}

# Clean up existing container
Write-Host "Cleaning up existing container..." -ForegroundColor Cyan
$existing = podman ps -a --filter "name=$ContainerName" --format "{{.Names}}" 2>$null
if ($existing -eq $ContainerName) {
    podman stop $ContainerName 2>$null | Out-Null
    podman rm $ContainerName 2>$null | Out-Null
    Write-Host "Removed existing container" -ForegroundColor Green
} else {
    Write-Host "No existing container found" -ForegroundColor Green
}

# Build image
Write-Host "Building container image..." -ForegroundColor Cyan
podman build -t $ImageTag -f Dockerfile . | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build image" -ForegroundColor Red
    exit 1
}
Write-Host "Image built successfully: $ImageTag" -ForegroundColor Green

# Deploy container
Write-Host "Deploying container..." -ForegroundColor Cyan
podman run -d --name $ContainerName -p "${Port}:3100" -e "NODE_ENV=$Environment" -e "MCP_TRANSPORT=http" -e "PORT=3100" --restart unless-stopped --label "environment=$Environment" --label "project=xml-transformer-mcp" $ImageTag | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy container" -ForegroundColor Red
    exit 1
}

Write-Host "Container deployed successfully" -ForegroundColor Green

# Wait and check status
Start-Sleep -Seconds 3
Write-Host "Checking status..." -ForegroundColor Cyan

$status = podman ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
if ($status) {
    Write-Host ""
    Write-Host "Container Status:" -ForegroundColor Green
    Write-Host $status
    Write-Host ""
    Write-Host "SUCCESS: XML Transformer MCP Server is running!" -ForegroundColor Green
    Write-Host "URL: http://localhost:$Port" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Management Commands:" -ForegroundColor Yellow
    Write-Host "  View logs: podman logs -f $ContainerName"
    Write-Host "  Stop:      podman stop $ContainerName"
    Write-Host "  Restart:   podman restart $ContainerName"
} else {
    Write-Host "ERROR: Container may not be running" -ForegroundColor Red
    Write-Host "Check logs: podman logs $ContainerName"
    exit 1
}
