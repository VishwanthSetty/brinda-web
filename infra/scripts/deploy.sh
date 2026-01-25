#!/bin/bash
# ================================
# Deployment Script
# ================================
# Usage: ./deploy.sh [dev|prod]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    log_info "Docker is installed and running."
}

# Deploy development environment
deploy_dev() {
    log_info "Deploying development environment..."
    
    cd "$PROJECT_ROOT"
    
    # Start services
    docker compose -f infra/docker-compose.dev.yml up -d --build
    
    log_info "Development environment is starting..."
    log_info "Frontend: http://localhost:5173"
    log_info "Backend API: http://localhost:8000"
    log_info "API Docs: http://localhost:8000/api/docs"
    log_info "MongoDB: localhost:27017"
    
    # Show logs
    log_info "Showing logs (Ctrl+C to exit)..."
    docker compose -f infra/docker-compose.dev.yml logs -f
}

# Deploy production environment
deploy_prod() {
    log_info "Deploying production environment..."
    
    # Check for required environment variables
    if [ -z "$JWT_SECRET" ]; then
        log_error "JWT_SECRET environment variable is required."
        exit 1
    fi
    
    if [ -z "$MONGO_PASSWORD" ]; then
        log_error "MONGO_PASSWORD environment variable is required."
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    
    # Build and start services
    docker compose -f infra/docker-compose.prod.yml up -d --build
    
    log_info "Production environment is starting..."
    log_info "Application: http://localhost"
    
    # Wait for health checks
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    if curl -s http://localhost/health > /dev/null 2>&1; then
        log_info "Application is healthy!"
    else
        log_warn "Health check failed. Check logs for details."
        docker compose -f infra/docker-compose.prod.yml logs --tail=50
    fi
}

# Stop services
stop_services() {
    log_info "Stopping services..."
    
    cd "$PROJECT_ROOT"
    
    if [ "$1" == "prod" ]; then
        docker compose -f infra/docker-compose.prod.yml down
    else
        docker compose -f infra/docker-compose.dev.yml down
    fi
    
    log_info "Services stopped."
}

# Show usage
show_usage() {
    echo "Usage: $0 [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  up      Start services (default)"
    echo "  down    Stop services"
    echo "  logs    Show logs"
    echo "  status  Show service status"
    echo ""
    echo "Environments:"
    echo "  dev     Development (default)"
    echo "  prod    Production"
    echo ""
    echo "Examples:"
    echo "  $0 up dev        # Start development environment"
    echo "  $0 up prod       # Start production environment"
    echo "  $0 down dev      # Stop development environment"
    echo "  $0 logs prod     # Show production logs"
}

# Main
main() {
    check_docker
    
    COMMAND="${1:-up}"
    ENVIRONMENT="${2:-dev}"
    
    case "$COMMAND" in
        up)
            if [ "$ENVIRONMENT" == "prod" ]; then
                deploy_prod
            else
                deploy_dev
            fi
            ;;
        down)
            stop_services "$ENVIRONMENT"
            ;;
        logs)
            cd "$PROJECT_ROOT"
            if [ "$ENVIRONMENT" == "prod" ]; then
                docker compose -f infra/docker-compose.prod.yml logs -f
            else
                docker compose -f infra/docker-compose.dev.yml logs -f
            fi
            ;;
        status)
            cd "$PROJECT_ROOT"
            if [ "$ENVIRONMENT" == "prod" ]; then
                docker compose -f infra/docker-compose.prod.yml ps
            else
                docker compose -f infra/docker-compose.dev.yml ps
            fi
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
