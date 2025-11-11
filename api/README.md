# ollama-communicatorAi

## Running Locally with Docker

### Prerequisites
- Docker installed on your machine
- Node.js and npm installed (for development)
    * Node version v20.11.0
    * npm version 10.2.4


### Getting Started

1. Start the infrastructure services:
   ```bash
   npm run compose:infrastructure
   ```
   This command starts all required infrastructure services in detached mode.


2. Start the application service:
  ```bash
  npm run compose:service
  ```

### Additional Commands


- Start both infrastructure and application:
  ```bash
  npm run compose:all
  ```

- Stop all containers:
  ```bash
  npm run compose:down
  ```

- Clean up containers, volumes, and images:
  ```bash
  npm run compose:clean
  ```

