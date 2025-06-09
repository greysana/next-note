#!/bin/bash

echo "Setting up GitHub Actions Self-Hosted Runner..."

# Create runner directory
mkdir -p ~/actions-runner
cd ~/actions-runner

# Download latest runner
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

echo ""
echo "Next steps:"
echo "1. Go to your GitHub repo Settings > Actions > Runners"
echo "2. Click 'New self-hosted runner'"
echo "3. Copy the configuration command and run it here"
echo "4. Then run: ./run.sh"
