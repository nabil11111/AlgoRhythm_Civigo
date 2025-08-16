# 🏆 Civigo - Hackathon Judge Setup

**One-command setup for evaluating the complete Civigo application**

## 🚀 Quick Start (30 seconds)

```bash
git clone <this-repository>
cd civigo
./setup.sh
```

That's it! Everything will be running and ready to evaluate.

## 📱 What is Civigo?

Civigo is a comprehensive digital government services platform for Sri Lanka that includes:

- **Citizen Mobile App**: Mobile-first citizen portal for booking government services
- **Government Portal**: Officer/admin dashboard for managing services and appointments
- **AI Assistant "Nethra"**: Helps citizens navigate government services
- **Digital Identity (GovID)**: Verified digital identity using NIC + biometrics

## 🌐 Access Points

After running `./setup.sh`, access these URLs:

| Service               | URL                    | Purpose                               |
| --------------------- | ---------------------- | ------------------------------------- |
| **Citizen App**       | http://localhost:3000  | Mobile-first citizen experience       |
| **Government Portal** | http://localhost:3001  | Officer/admin dashboard               |
| **Database Admin**    | http://localhost:54323 | Supabase Studio (database management) |
| **Email Testing**     | http://localhost:8025  | View test emails (MailHog)            |

## 👥 Demo Accounts

Pre-configured accounts for immediate testing:

| Role        | Email            | Password    | Purpose                        |
| ----------- | ---------------- | ----------- | ------------------------------ |
| **Admin**   | admin@demo.com   | password123 | Full system administration     |
| **Officer** | officer@demo.com | password123 | Department-specific management |
| **Citizen** | citizen@demo.com | password123 | Citizen services experience    |

## 🔄 Complete User Flows to Test

### 1. Citizen Onboarding (New User Registration)

- Visit http://localhost:3000
- Click "Get Started"
- Complete identity verification:
  - NIC number entry
  - Phone OTP verification
  - Email verification
  - Personal details
  - Password creation
  - NIC photo uploads (front/back)
  - Facial verification
  - Digital ID issuance

### 2. Service Discovery & Booking

- Browse departments (Motor Traffic, Immigration, etc.)
- View available services
- Check time slots (next 7 days available)
- Book appointments
- Receive confirmation with QR code

### 3. AI Assistant "Nethra"

- Chat bubble available in citizen app
- Ask questions like:
  - "How do I apply for a driving license?"
  - "What documents do I need for passport?"
  - "Show me my appointments"

### 4. Government Officer Experience

- Login at http://localhost:3001 with officer account
- View assigned department appointments
- Manage appointment status
- View analytics and reports

### 5. Admin Dashboard

- Login with admin account
- Manage departments and services
- Assign officers to departments
- View system-wide analytics

## 🏗️ Technical Architecture

### Frontend

- **Next.js 15** with App Router (SSR-first)
- **React 19** with Server Components
- **Tailwind CSS** for responsive design
- **TypeScript** for type safety

### Backend

- **Supabase** (self-hosted):
  - PostgreSQL database with RLS
  - PostgREST API
  - Authentication & authorization
  - Real-time subscriptions
  - File storage

### Key Features Demonstrated

- ✅ **Server-Side Rendering (SSR)** for performance
- ✅ **Row Level Security (RLS)** for data protection
- ✅ **Real-time updates** for appointment status
- ✅ **File uploads** for document management
- ✅ **QR code generation** for appointments
- ✅ **Email notifications** (test environment)
- ✅ **AI integration** with Gemini API
- ✅ **Responsive design** (mobile-first)
- ✅ **Multi-language support** (framework ready)
- ✅ **Accessibility features** (WCAG compliant)

## 📊 Sample Data Included

The system comes pre-loaded with:

- 3 government departments
- 4 services with different durations
- 7 days of available time slots
- Demo user accounts
- Sample appointment data

## 🛠️ Development Commands

```bash
# View all running services
docker-compose ps

# View logs from all services
docker-compose logs -f

# View logs from specific service
docker-compose logs -f civigo-citizen
docker-compose logs -f civigo-gov

# Stop all services
docker-compose down

# Stop and remove all data
docker-compose down -v

# Restart specific service
docker-compose restart civigo-citizen
```

## 🔍 What to Evaluate

### Technical Implementation

- Code quality and architecture
- Database design and RLS policies
- API design and security
- Performance optimization
- Error handling

### User Experience

- Onboarding flow smoothness
- Booking process efficiency
- AI assistant helpfulness
- Mobile responsiveness
- Accessibility compliance

### Innovation

- Digital identity verification
- AI-powered guidance
- Real-time updates
- QR code integration
- Multi-language readiness

### Scalability

- Docker containerization
- Database optimization
- Caching strategies
- Security measures

## 🐛 Troubleshooting

### Port Conflicts

If you get port conflicts, stop other services:

```bash
# Check what's using ports
lsof -i :3000,3001,54321,54322,54323

# Kill processes if needed
sudo kill -9 <PID>
```

### Docker Issues

```bash
# Clean up Docker resources
docker system prune -a
docker volume prune

# Restart Docker Desktop if needed
```

### Service Not Ready

```bash
# Check service health
docker-compose ps
docker-compose logs <service-name>
```

## 📞 Support

If you encounter any issues during evaluation:

1. Check the troubleshooting section above
2. View logs: `docker-compose logs -f`
3. For technical questions, refer to the code documentation

## 🎯 Evaluation Criteria Alignment

This submission demonstrates:

- **Innovation**: AI-powered government services with digital identity
- **Technical Excellence**: Modern stack with security best practices
- **User Experience**: Intuitive flows for complex government processes
- **Scalability**: Containerized architecture ready for production
- **Social Impact**: Streamlining citizen-government interactions

---

**Happy Judging! 🚀**

_Time to evaluate: ~15-20 minutes for complete flow testing_
