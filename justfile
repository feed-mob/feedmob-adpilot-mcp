# FeedMob AdPilot MCP - Development Commands

# Default recipe to display help
default:
    @just --list

# Install dependencies
install:
    npm install

# Start PostgreSQL database
db-start:
    @echo "🐳 Starting PostgreSQL database..."
    docker-compose up -d
    @echo "⏳ Waiting for database to be ready..."
    @sleep 3
    @echo "✅ Database is ready!"

# Stop PostgreSQL database
db-stop:
    @echo "🛑 Stopping PostgreSQL database..."
    docker-compose down
    @echo "✅ Database stopped"

# Stop database and remove all data
db-clean:
    @echo "🗑️  Stopping database and removing all data..."
    docker-compose down -v
    @echo "✅ Database cleaned"

# View database logs
db-logs:
    docker-compose logs -f postgres

# Access PostgreSQL CLI
db-shell:
    docker-compose exec postgres psql -U feedmob -d feedmob_adpilot

# Run database migrations
db-migrate:
    @echo "🔧 Running database migrations..."
    npm run db:migrate
    @echo "✅ Migrations complete"

# Reset database (drop all tables and re-run migrations)
db-reset:
    @echo "⚠️  Resetting database..."
    npm run db:reset
    @echo "✅ Database reset complete"

# Setup development environment (start db + run migrations)
setup:
    @echo "🚀 Setting up development environment..."
    @just db-start
    @sleep 2
    @just db-migrate
    @echo ""
    @echo "✅ Development environment is ready!"
    @echo ""
    @echo "Next steps:"
    @echo "  1. Copy .env.example to .env and update with your API keys"
    @echo "  2. Run 'just dev' to start the server"

# Start development server
dev:
    npm run dev

# Build the project
build:
    npm run build

# Start production server
start:
    npm start

# Run all tests
test:
    npm test

# Run tests in watch mode
test-watch:
    npm run test:watch

# Run tests with coverage
test-coverage:
    npm run test:coverage

# Test with FastMCP CLI
mcp-dev:
    npm run mcp:dev

# Test with MCP Inspector (visual debugging)
mcp-inspect:
    npm run mcp:inspect

# Lint code
lint:
    npm run lint

# Format code
format:
    npm run format

# Check TypeScript types
typecheck:
    npx tsc --noEmit

# Full development workflow (setup + start dev server)
start-dev:
    @echo "🚀 Starting full development environment..."
    @just setup
    @echo ""
    @echo "🔥 Starting development server..."
    @just dev

# Stop everything
stop:
    @just db-stop

# Clean everything (stop db, remove data, clean node_modules)
clean-all:
    @echo "🧹 Cleaning everything..."
    @just db-clean
    rm -rf node_modules dist coverage
    @echo "✅ Clean complete"

# Show database connection info
db-info:
    @echo "📊 Database Connection Info:"
    @echo "  Host: localhost"
    @echo "  Port: 5432"
    @echo "  Database: feedmob_adpilot"
    @echo "  User: feedmob"
    @echo "  Password: feedmob_dev_password"
    @echo ""
    @echo "Connection string:"
    @echo "  postgresql://feedmob:feedmob_dev_password@localhost:5432/feedmob_adpilot"

# Verify setup
verify:
    @echo "🔍 Verifying setup..."
    @./verify-setup.sh
