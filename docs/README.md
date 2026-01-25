# Documentation

This folder contains documentation for the Brinda Publications Web Portal.

## Contents

- [Architecture Overview](#architecture-overview)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [API Reference](#api-reference)

## Architecture Overview

### Monorepo Benefits

1. **Single source of truth**: All code in one repository
2. **Atomic commits**: Frontend and backend changes together
3. **Shared tooling**: Consistent dev experience
4. **Easier CI/CD**: Single pipeline for all apps
5. **Type sharing potential**: Can share types between frontend and backend

### CORS Strategy

The application avoids CORS issues through architectural design:

- **Development**: Vite dev server proxies `/api` requests to the backend
- **Production**: Nginx reverse proxy serves both frontend and backend from the same origin

This means CORS configuration is only needed as a fallback for development edge cases.

### Database Design

#### Users Collection
```javascript
{
  "_id": ObjectId,
  "email": String,
  "password_hash": String,
  "full_name": String,
  "role": "admin" | "manager" | "sales_rep",
  "is_active": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

#### Products Collection
```javascript
{
  "_id": ObjectId,
  "title": String,
  "isbn": String,
  "author": String,
  "category": String,
  "price": Number,
  "currency": String,
  "stock_quantity": Number,
  "description": String,
  "cover_image_url": String,
  "is_active": Boolean,
  "created_at": ISODate,
  "updated_at": ISODate
}
```

#### Sales Collection
```javascript
{
  "_id": ObjectId,
  "product_id": ObjectId,
  "quantity": Number,
  "unit_price": Number,
  "total_amount": Number,
  "currency": String,
  "customer_name": String,
  "customer_region": String,
  "sales_rep_id": ObjectId,
  "sale_date": ISODate,
  "created_at": ISODate
}
```

## Development Guide

### Setting Up Development Environment

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Start MongoDB (via Docker or local installation)
4. Configure environment variables
5. Run both servers

### Environment Variables

See `.env.example` files in the root, `apps/api/`, and `apps/web/` directories.

### Running Tests

```bash
# Backend
cd apps/api
pytest

# Frontend
cd apps/web
npm test
```

## Deployment Guide

### EC2 Deployment

1. Launch an EC2 instance (t2.medium or larger recommended)
2. Install Docker and Docker Compose
3. Clone the repository
4. Set environment variables
5. Run: `docker compose -f infra/docker-compose.prod.yml up -d`

### SSL/HTTPS Setup

1. Obtain SSL certificate (Let's Encrypt recommended)
2. Mount certificates in nginx container
3. Update nginx.prod.conf for HTTPS
4. Restart nginx container

## API Reference

See the interactive API documentation at `/api/docs` when running the backend.
