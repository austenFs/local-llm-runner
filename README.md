# Ollama Qwen2.5 Coder with Docker GPU

A simple Node.js + TypeScript project to run Ollama with Qwen2.5 Coder model in Docker with GPU support.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- NVIDIA GPU with drivers installed
- NVIDIA Container Toolkit ([installation guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html))

## Quick Start

### 1. Install dependencies and setup everything
```bash
npm run setup
```

This will:
- Install Node dependencies
- Build Docker image
- Start Ollama container
- Pull Qwen2.5-coder model

### 2. Test the connection
```bash
npm run ping
```

## Available Scripts

### Docker Management
- `npm run docker:build` - Build the Docker images
- `npm run docker:up` - Start containers in detached mode
- `npm run docker:down` - Stop and remove containers
- `npm run docker:logs` - View all container logs
- `npm run docker:logs:app` - View app container logs only
- `npm run docker:logs:ollama` - View ollama container logs only
- `npm run docker:restart` - Restart containers

### Application
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application (local)
- `npm run dev` - Run with ts-node (development, local)
- `npm run ping` - Run the app container to ping Qwen
- `npm run ping:local` - Build and run locally (requires Ollama at localhost:11434)

### Setup/Teardown
- `npm run setup` - Full setup (install, build, start, pull model)
- `npm run teardown` - Stop containers and remove volumes

## Manual Model Pull

If you need to pull the model manually:
```bash
docker compose exec ollama ollama pull qwen2.5-coder
```

## Project Structure

```
.
├── docker/
│   ├── Dockerfile.ollama  # Ollama container definition
│   └── Dockerfile.app     # Node.js app container definition
├── src/
│   └── index.ts          # Main application code
├── dist/                 # Compiled JavaScript (generated)
├── docker-compose.yml   # Multi-container orchestration with GPU
├── package.json         # Node.js dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## Architecture

The project uses a multi-container Docker setup:

- **ollama container**: Runs Ollama with GPU support, hosts the Qwen2.5-coder model
- **app container**: Runs the Node.js/TypeScript application
- **ollama-network**: Bridge network connecting both containers

The app container connects to the ollama container via Docker's internal networking at `http://ollama:11434`.

## Troubleshooting

**Cannot connect to Ollama:**
- Make sure containers are running: `docker compose ps`
- Check logs: `npm run docker:logs`

**Model not found:**
- Pull the model: `docker compose exec ollama ollama pull qwen2.5-coder`

**GPU not detected:**
- Verify NVIDIA Container Toolkit is installed
- Check GPU is visible: `docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu22.04 nvidia-smi`