# Brinda Publications Web Portal

A production-ready Book Publications Web Portal with React frontend, FastAPI backend, and MongoDB database.

## 🏗️ Architecture

```
brinda-web/
├── apps/
│   ├── web/          # React + Vite + TypeScript frontend
│   └── api/          # Python + FastAPI backend
├── docker/           # Dockerfiles for each service
├── infra/            # Docker Compose and deployment scripts
└── docs/             # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB 8+ (or Docker)
- Docker & Docker Compose (for containerized deployment)

### Development Setup

#### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker compose -f infra/docker-compose.dev.yml up

# Access:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/api/docs
```

#### Option 2: Manual Setup

**Backend:**
```bash
cd apps/api
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env    # Edit with your settings
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
npm install
cp .env.example .env.local
npm run dev
```

### Production Deployment

```bash
# Set required environment variables
export JWT_SECRET="your-super-secret-key"
export MONGO_PASSWORD="your-mongo-password"

# Deploy
docker compose -f infra/docker-compose.prod.yml up -d --build
```

## 📚 API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/health` | GET | Health check | No |
| `/api/auth/login` | POST | User login | No |
| `/api/auth/register` | POST | User registration | No |
| `/api/products` | GET | List products | No |
| `/api/products/{id}` | GET | Get product | No |
| `/api/products` | POST | Create product | Manager/Admin |
| `/api/dashboard/analytics` | GET | Sales analytics | Yes |
| `/api/dashboard/summary` | GET | Quick summary | Yes |

## 🔑 User Roles

- **Admin**: Full access to all features
- **Manager**: Can manage products and view analytics
- **Sales Rep**: Can view analytics only

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, TypeScript |
| Backend | Python 3.11, FastAPI |
| Database | MongoDB 7 |
| Auth | JWT (python-jose, bcrypt) |
| Deployment | Docker, Nginx |

## 📁 Project Structure

```
apps/
├── web/                    # Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── layouts/        # Layout wrappers
│   │   ├── context/        # React context providers
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   └── routes/         # Route configuration
│   ├── vite.config.ts
│   └── package.json
│
└── api/                    # Backend
    ├── app/
    │   ├── main.py         # FastAPI app entry
    │   ├── config.py       # Configuration
    │   ├── database.py     # MongoDB connection
    │   ├── models/         # Pydantic models
    │   ├── routes/         # API routes
    │   ├── services/       # Business logic
    │   ├── middleware/     # Auth middleware
    │   └── utils/          # Utilities
    ├── requirements.txt
    └── pyproject.toml
```

## 🔒 Security

- JWT tokens with configurable expiration
- Password hashing with bcrypt
- Role-based access control
- Security headers via Nginx
- Rate limiting in production
- Environment-based configuration

## 📈 Scalability

This architecture supports future growth:

1. **Horizontal scaling**: Add more EC2 instances behind a load balancer
2. **Database scaling**: Migrate to MongoDB Atlas for managed scaling
3. **Feature extension**: Add new routes/pages without restructuring
4. **Microservices**: Can split backend into separate services if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

UNLICENSED - Proprietary software of Brinda Publications.
