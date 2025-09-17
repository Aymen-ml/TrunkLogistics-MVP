# Deployment Guide

## Development Setup

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 13+

### Quick Start
```bash
# Clone and setup
cd TrunkLogistics
./scripts/setup.sh

# Start development servers
npm run dev
```

## Production Deployment

### Environment Variables
Create `.env` file with production values:
```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-secure-jwt-secret
```

### Build and Start
```bash
# Build the application
npm run build

# Start production server
npm start
```

## Docker Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Services
```bash
# Database only
docker-compose up -d postgres

# API only
docker-compose up -d api

# Frontend only
docker-compose up -d client
```

## Database Setup

### Create Database
```sql
CREATE DATABASE trunk_logistics;
CREATE USER trunk_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trunk_logistics TO trunk_user;
```

### Run Migrations
```bash
npm run server:db:migrate
```

### Seed Database
```bash
npm run server:db:seed
```

## Monitoring

### Health Checks
- API Health: `GET /api/health`
- Frontend: `http://localhost:5173`
- Database: Check connection in logs

### Logs
- Server logs: `server/logs/`
- Application logs: Console output
- Error tracking: Winston logger

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong, unique secrets in production
3. **Database**: Use strong passwords and restrict access
4. **HTTPS**: Always use HTTPS in production
5. **CORS**: Configure proper CORS origins
6. **Rate Limiting**: Monitor and adjust rate limits

## Scaling

### Horizontal Scaling
- Use load balancer (nginx, HAProxy)
- Multiple API instances
- Database connection pooling

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add caching layer (Redis)

## Backup Strategy

### Database Backups
```bash
# Daily backup
pg_dump trunk_logistics > backup_$(date +%Y%m%d).sql

# Restore backup
psql trunk_logistics < backup_20240822.sql
```

### File Uploads
- Regular backup of uploads directory
- Consider cloud storage (AWS S3) for production
