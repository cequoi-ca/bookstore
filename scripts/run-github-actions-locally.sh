#!/bin/bash

# Script to run GitHub Actions workflows locally using 'act'
# This allows developers to test CI workflows before pushing to GitHub

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "================================================"
echo "  Bookstore Local GitHub Actions Runner"
echo "================================================"
echo ""

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo -e "${RED}Error: 'act' is not installed.${NC}"
    echo ""
    echo "Installation instructions:"
    echo ""
    echo -e "${YELLOW}macOS:${NC}"
    echo "  brew install act"
    echo ""
    echo -e "${YELLOW}Linux:${NC}"
    echo "  curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash"
    echo ""
    echo -e "${YELLOW}Windows:${NC}"
    echo "  choco install act-cli"
    echo ""
    echo "For more information, visit: https://github.com/nektos/act"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ act is installed${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker and try again."
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"
echo ""

# Parse command line arguments
WORKFLOW=""
JOB=""
EVENT="push"

while [[ $# -gt 0 ]]; do
    case $1 in
        -w|--workflow)
            WORKFLOW="$2"
            shift 2
            ;;
        -j|--job)
            JOB="$2"
            shift 2
            ;;
        -e|--event)
            EVENT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -w, --workflow WORKFLOW    Specify workflow file (default: all workflows)"
            echo "  -j, --job JOB              Specify job to run (default: all jobs)"
            echo "  -e, --event EVENT          Specify event type (default: push)"
            echo "  -h, --help                 Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                         # Run all workflows"
            echo "  $0 -w test-bookstore.yml   # Run specific workflow"
            echo "  $0 -j test                 # Run specific job"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Build act command
ACT_CMD="act $EVENT"

if [ -n "$WORKFLOW" ]; then
    ACT_CMD="$ACT_CMD -W .github/workflows/$WORKFLOW"
fi

if [ -n "$JOB" ]; then
    ACT_CMD="$ACT_CMD -j $JOB"
fi

# Display what we're running
echo "Running GitHub Actions locally..."
echo "Event: $EVENT"
if [ -n "$WORKFLOW" ]; then
    echo "Workflow: $WORKFLOW"
fi
if [ -n "$JOB" ]; then
    echo "Job: $JOB"
fi
echo ""
echo "Command: $ACT_CMD"
echo ""
echo "================================================"
echo ""

# Run act
$ACT_CMD

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "================================================"
    echo -e "${GREEN}✓ Workflow completed successfully${NC}"
    echo "================================================"
else
    echo ""
    echo "================================================"
    echo -e "${RED}✗ Workflow failed${NC}"
    echo "================================================"
    exit 1
fi
