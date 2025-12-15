#!/bin/bash

set -e

echo "🚀 Starting Kubernetes deployment for Next.js app..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create a .env file with your environment variables"
    exit 1
fi

# Check if Minikube is running
if ! minikube status &> /dev/null; then
    echo -e "${RED}❌ Minikube is not running. Starting Minikube...${NC}"
    minikube start --driver=docker
else
    echo -e "${GREEN}✅ Minikube is already running${NC}"
fi

# Clean up old deployments (from previous nginx setup)
echo -e "${BLUE}🧹 Cleaning up old resources...${NC}"
kubectl delete deployment nginx 2>/dev/null || true
kubectl delete service nginx-service 2>/dev/null || true
kubectl delete configmap nginx-config 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup completed${NC}"

# Point Docker CLI to Minikube's Docker daemon
echo -e "${BLUE}📦 Configuring Docker to use Minikube's daemon...${NC}"
eval $(minikube docker-env)

# Build the Docker image inside Minikube
echo -e "${BLUE}🔨 Building Docker image...${NC}"
# Option 1: Without build args (recommended - uses Solution 1 or 2)
docker build -t nextjs-app:latest .

# Option 2: With build secrets (if using Solution 3)
# DOCKER_BUILDKIT=1 docker build -t nextjs-app:latest --secret id=env,src=.env .

# Verify image was built
if docker images | grep -q "nextjs-app"; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

# Create Kubernetes secret from .env file (if not exists)
echo -e "${BLUE}🔐 Creating Kubernetes secrets...${NC}"
if kubectl get secret nextjs-secrets &> /dev/null; then
    echo -e "${YELLOW}⚠️  Secret already exists. Deleting and recreating...${NC}"
    kubectl delete secret nextjs-secrets
fi

kubectl create secret generic nextjs-secrets --from-env-file=.env
echo -e "${GREEN}✅ Secrets created from .env${NC}"

# Apply Kubernetes deployments
echo -e "${BLUE}🚢 Applying Kubernetes deployments...${NC}"
echo "  - Deploying Redis..."
kubectl apply -f k8s/redis-deployment.yaml
echo "  - Deploying Next.js app..."
kubectl apply -f k8s/deployment.yaml

# Apply Kubernetes service
echo -e "${BLUE}🌐 Applying Kubernetes service...${NC}"
kubectl apply -f k8s/service.yaml

# Wait for deployment to be ready
echo -e "${BLUE}⏳ Waiting for deployments to be ready...${NC}"
kubectl wait --for=condition=available --timeout=180s deployment/redis
kubectl wait --for=condition=available --timeout=180s deployment/nextjs-app

# Get service URL
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Status:${NC}"
kubectl get deployments
echo ""
echo -e "${BLUE}🔌 Services:${NC}"
kubectl get services
echo ""
echo -e "${BLUE}📦 Pods:${NC}"
kubectl get pods
echo ""

# Get the Minikube IP and service URL
MINIKUBE_IP=$(minikube ip)
NODE_PORT=$(kubectl get service nextjs-app-service -o jsonpath='{.spec.ports[0].nodePort}')
echo -e "${GREEN}🌍 Access your application at: http://${MINIKUBE_IP}:${NODE_PORT}${NC}"
echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo "  - View logs: kubectl logs -f deployment/nextjs-app"
echo "  - View pods: kubectl get pods"
echo "  - Describe pod: kubectl describe pod <pod-name>"
echo "  - Scale app: kubectl scale deployment nextjs-app --replicas=3"
echo "  - Delete deployment: kubectl delete -f k8s/deployment.yaml -f k8s/service.yaml"
echo "  - Delete secrets: kubectl delete secret nextjs-secrets"
echo "  - Restart deployment: kubectl rollout restart deployment/nextjs-app"
echo "  - Open in browser: minikube service nextjs-app-service"
echo ""
echo -e "${YELLOW}🔍 Troubleshooting:${NC}"
echo "  - If app is crashing, check logs: kubectl logs -f deployment/nextjs-app"
echo "  - Check pod status: kubectl describe pod <pod-name>"
echo "  - Verify secrets: kubectl get secret nextjs-secrets -o yaml"
echo ""