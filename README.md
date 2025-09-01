# SafeRoute: AI-Driven Public Safety Navigation System

![SafeRoute Logo](public/favicon.ico)

SafeRoute is an AI-driven public safety navigation system designed for the **Infosys PALS TechZooka Hackathon 2025**. This project focuses on building intelligent navigation for pedestrians and two-wheeler riders in Indian cities, prioritizing safety over speed.

## 🚨 Problem Statement

India faces a severe road safety crisis with 4,61,312 road accidents resulting in 1,68,491 deaths in 2022. Vulnerable road users (pedestrians and two-wheelers) account for 65% of fatalities. Night-time risks are particularly acute, with 43% of pedestrian deaths and 38% of two-wheeler deaths occurring after dark in Delhi alone.

## 🛡️ Solution

SafeRoute addresses this crisis by providing:
- **Multi-factor SafetyScore™** algorithm combining lighting quality, footfall activity, hazard reports, and proximity to help
- **Trust-weighted crowdsourcing** with Wilson score reputation system
- **Real-time safety intelligence** from VIIRS satellite data and municipal dark-spot inventories
- **112 emergency service integration** with sub-3-second activation
- **DPDP Act 2023 compliance** with explicit consent flows and user rights

## 🏆 Hackathon Achievement

Winner - **Infosys PALS TechZooka Hackathon 2025**

## 🧠 Key Features

### Safety-First Routing
- Multi-factor algorithm prioritizing personal safety over travel time
- Real-time safety scoring with environmental intelligence
- Dynamic route optimization based on time-of-day and weather conditions

### Emergency Response
- Sub-3-second 112 emergency service activation
- Automated location sharing with precise coordinates
- Emergency contact notification system

### Community Intelligence
- Trust-weighted crowdsourcing for real-time hazard reporting
- Wilson score-based reputation system for data reliability
- Civic feedback loop for infrastructure improvement

### Privacy & Compliance
- Full DPDP Act 2023 compliance
- Explicit consent management
- Data minimization and user rights protection

## 🛠️ Technology Stack

### Frontend
- **Next.js 15+** with App Router
- **React 19+** with Server Components
- **TypeScript 5+**
- **Tailwind CSS v4+**
- **Shadcn UI** and **Magic UI**
- **Mappls SDK** for Indian geospatial data
- **Framer Motion** for animations

### Backend & AI/ML
- **FastAPI (Python)** for ML services
- **NestJS (TypeScript)** for microservices
- **PostgreSQL + PostGIS** for geospatial data
- **XGBoost/LightGBM** for gradient boosting models
- **PyTorch** for deep learning
- **Kafka/RabbitMQ** for event streaming

### Data Sources
- **VIIRS Black Marble** satellite data for lighting assessment
- **OpenStreetMap** + **Mappls SDK** for base mapping
- **Municipal dark-spot inventories** for civic data
- **Crowdsourced reports** for community intelligence

### Infrastructure
- **Docker** for containerization
- **Kubernetes** for orchestration
- **Prometheus + Grafana** for monitoring
- **ELK Stack** for logging

## 📊 Measurable Impact Targets

- **25% reduction** in low-lit/isolated segment exposure
- **+30% improvement** in self-reported safety perception
- **Sub-3-second** 112/SOS activation with location context
- **90% crowdsourced** report verification rate

## 🏗️ Architecture

SafeRoute follows a microservices architecture with:

1. **ingest-svc** - Data ingestion from multiple sources
2. **score-svc** - Multi-factor SafetyScore calculation
3. **route-svc** - Safety-aware route optimization
4. **reputation-svc** - Trust-weighted crowdsourcing
5. **prediction-svc** - AI/ML incident forecasting
6. **API Gateway** - Authentication and request routing

## 🔐 Security & Compliance

- **DPDP Act 2023** compliant with explicit consent flows
- **JWT with refresh tokens** for authentication
- **AES-256 encryption** at rest
- **TLS 1.3** for data in transit
- **Data minimization** with coarse geo-hashing
- **India data residency** requirements

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- PostgreSQL with PostGIS extension
- Redis (for caching and sessions)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/safeguardnavigators/saferoute.git
cd saferoute
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Services

To start the backend services:

```bash
# Start FastAPI services (ML/AI)
cd backend/fastapi
uvicorn main:app --reload

# Start NestJS services (microservices)
cd backend/nestjs
npm run start:dev
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
# or
yarn test
# or
pnpm test
# or
bun test
```

## 📦 Deployment

### Vercel (Frontend)
The frontend can be deployed to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/safeguardnavigators/saferoute)

### Docker (Backend)
Build and run backend services with Docker:

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

**SafeGuard Navigators**
- **Team Lead:** Pranava Kumar (pranavakumar.it@gmail.com)
- **Team Members:** Sam Daniel J, Muhilan M
- **Mentor:** Mrs. Chinchu Nair (Assistant Professor, Department of CSE)

## 🙏 Acknowledgments

- Thanks to Infosys for organizing the PALS TechZooka Hackathon 2025
- Inspiration from Safetipin's manual safety audits and Delhi's Dark-Spot Program
- NASA's VIIRS Black Marble satellite data
- Mappls for Indian address precision and geospatial data

---

Made with ❤️ for safer urban mobility in India 🇮🇳