#!/bin/bash

# Marcel V8.0 Ultimate - Replit Deployment Script
# ================================================
# This script automates the deployment process to Replit
# Run this IN YOUR REPLIT SHELL after uploading files

echo "=========================================="
echo "🚀 MARCEL V8.0 ULTIMATE - DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Clean existing installation
echo "Step 1: Cleaning existing installation..."
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_status "Removed old node_modules"
fi

if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    print_status "Removed old package-lock.json"
fi

# Clear npm cache
npm cache clean --force 2>/dev/null
print_status "Cleared npm cache"

# Step 2: Check Node.js version
echo ""
echo "Step 2: Checking Node.js environment..."
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js version: $NODE_VERSION"
print_status "npm version: $NPM_VERSION"

# Step 3: Install dependencies
echo ""
echo "Step 3: Installing dependencies..."
npm install --production --no-audit --no-fund

if [ $? -eq 0 ]; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    echo "Trying alternative installation method..."
    npm install --force
fi

# Step 4: Verify installation
echo ""
echo "Step 4: Verifying installation..."
REQUIRED_MODULES=("express" "cors" "dotenv" "@anthropic-ai/sdk")

for module in "${REQUIRED_MODULES[@]}"; do
    if [ -d "node_modules/$module" ]; then
        print_status "$module installed"
    else
        print_warning "$module not found, installing individually..."
        npm install $module
    fi
done

# Step 5: Check environment variables
echo ""
echo "Step 5: Checking environment configuration..."

if [ ! -z "$ANTHROPIC_API_KEY" ]; then
    print_status "ANTHROPIC_API_KEY is configured"
else
    print_warning "ANTHROPIC_API_KEY not found - Marcel will run in fallback mode"
fi

if [ ! -z "$PORT" ]; then
    print_status "PORT is set to: $PORT"
else
    print_warning "PORT not set, will use default 3000"
fi

if [ ! -z "$NODE_ENV" ]; then
    print_status "NODE_ENV is set to: $NODE_ENV"
else
    print_warning "NODE_ENV not set, setting to production"
    export NODE_ENV=production
fi

# Step 6: Test server startup
echo ""
echo "Step 6: Testing server startup..."
timeout 5 node server.js > /tmp/server_test.log 2>&1 &
SERVER_PID=$!
sleep 3

if ps -p $SERVER_PID > /dev/null; then
    print_status "Server started successfully"
    kill $SERVER_PID 2>/dev/null
    
    # Show startup logs
    echo ""
    echo "Server startup logs:"
    echo "-------------------"
    cat /tmp/server_test.log
else
    print_error "Server failed to start"
    echo "Error logs:"
    cat /tmp/server_test.log
fi

# Step 7: Create health check script
echo ""
echo "Step 7: Creating health check script..."
cat > health_check.sh << 'EOF'
#!/bin/bash
# Health check script for Marcel V8.0
HEALTH_URL="http://localhost:3000/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
if [ $RESPONSE -eq 200 ]; then
    echo "✅ Health check passed"
    curl -s $HEALTH_URL | python3 -m json.tool
else
    echo "❌ Health check failed with status: $RESPONSE"
fi
EOF
chmod +x health_check.sh
print_status "Health check script created"

# Step 8: Create startup script
echo ""
echo "Step 8: Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Marcel V8.0 Ultimate..."
export NODE_ENV=production
node server.js
EOF
chmod +x start.sh
print_status "Startup script created"

# Step 9: Final recommendations
echo ""
echo "=========================================="
echo "📋 DEPLOYMENT SUMMARY"
echo "=========================================="
echo ""

# Check if everything is ready
READY=true

if [ ! -f "server.js" ]; then
    print_error "server.js not found"
    READY=false
fi

if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    READY=false
fi

if [ ! -d "node_modules" ]; then
    print_error "node_modules not found"
    READY=false
fi

if [ "$READY" = true ]; then
    print_status "Deployment completed successfully!"
    echo ""
    echo "🎯 NEXT STEPS:"
    echo "1. Click 'Run' button in Replit"
    echo "2. Visit your app URL to verify"
    echo "3. Test endpoints:"
    echo "   - Main: /"
    echo "   - Dashboard: /test-marcel"
    echo "   - Health: /health"
    echo "   - Twilio test: /webhook/twilio/test"
    echo ""
    echo "💡 TIPS:"
    echo "- Run './health_check.sh' to test health endpoint"
    echo "- Run './start.sh' to start server manually"
    echo "- Check logs in Replit console for any issues"
else
    print_error "Deployment incomplete - please fix errors above"
fi

echo ""
echo "=========================================="
echo "🧠 Marcel V8.0 Ultimate - Ready to serve!"
echo "=========================================="