# ApexCare PS026 — Enterprise Healthcare Operations & Patient Consultation Platform

A runnable student SOA starter with a responsive hospital website, Spring Boot microservices, PostgreSQL, Eureka service discovery, Spring Cloud Gateway, and JWT authentication.

## Architecture
- `frontend/` — responsive login/register and operations dashboard; calls the API Gateway.
- `discovery-server` — Eureka registry on 8761.
- `api-gateway` — gateway on 8080, routes `/api/auth/**`, `/api/patients/**`, `/api/appointments/**`, `/api/billing/**`.
- `auth-service` — registration/login and JWT issuance on 8081.
- `patient-service` — patient CRUD on 8082.
- `appointment-service` — appointment CRUD/status management on 8083; checks patient existence via patient service.
- `billing-service` — invoices and payment status on 8084; checks patient existence via patient service.
- `docker-compose.yml` — PostgreSQL and all backend services.

## Prerequisites
- Java 17+
- Maven 3.9+
- Docker Desktop (recommended) OR local PostgreSQL 16
- Browser / VS Code

## Quick start (recommended)
1. Extract the ZIP.
2. In a terminal, `cd ApexCare_PS026_Full_SOA`.
3. Copy `.env.example` to `.env` if desired. The compose file has demo defaults for local review.
4. Start everything:
   ```bash
   docker compose up --build
   ```
   First startup can take several minutes while Maven dependencies download and services start.
5. Open `frontend/index.html` in your browser, or serve the `frontend` folder with VS Code Live Server.
6. Register a demo account, log in, and add patients / appointments / invoices. API Gateway is `http://localhost:8080`.

## Run backend without Docker
1. Start PostgreSQL and create database `apexcare`.
2. Set environment variables or use the local defaults in each `application.yml`:
   - `DB_URL=jdbc:postgresql://localhost:5432/apexcare`
   - `DB_USERNAME=apexcare`
   - `DB_PASSWORD=apexcare_dev_password`
   - `JWT_SECRET=change-this-demo-secret-to-a-long-random-value-123456`
3. From the `backend` folder run:
   ```bash
   cd backend
   mvn clean package
   ```
4. In separate terminals start services in this order:
   ```bash
   cd backend/discovery-server && mvn spring-boot:run
   cd backend/api-gateway && mvn spring-boot:run
   cd backend/auth-service && mvn spring-boot:run
   cd backend/patient-service && mvn spring-boot:run
   cd backend/appointment-service && mvn spring-boot:run
   cd backend/billing-service && mvn spring-boot:run
   ```
   Each command should run in its own terminal. Wait for Eureka to start before the other services.

## Demo account
Register your own account on the login screen. There is no hard-coded admin password.

## API examples
- `POST http://localhost:8080/api/auth/register` — `{ "name":"Demo User", "email":"demo@example.com", "password":"DemoPass123!" }`
- `POST http://localhost:8080/api/auth/login` — `{ "email":"demo@example.com", "password":"DemoPass123!" }`
- `GET/POST http://localhost:8080/api/patients`
- `GET/POST http://localhost:8080/api/appointments`
- `GET/POST http://localhost:8080/api/billing`

Protected requests require `Authorization: Bearer <token>`. Auth endpoints are public. Use the frontend for interactive testing.

## Important
This is an educational demo, not a certified clinical system. Use fictional patient information only. Before production use, add TLS, secrets management, rate limiting, audit logging, consent workflows, stronger validation, backups, migrations, monitoring, and security review. JWT secret and DB password in compose are local demo defaults and must be changed before deployment.
