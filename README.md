# Investment Tracker - Comprehensive Software Documentation

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Design](#database-design)
5. [API Documentation](#api-documentation)
6. [Frontend Architecture](#frontend-architecture)
7. [Backend Architecture](#backend-architecture)
8. [Security Implementation](#security-implementation)
9. [Business Logic](#business-logic)
10. [Deployment Guide](#deployment-guide)
11. [Development Setup](#development-setup)
12. [Testing Strategy](#testing-strategy)
13. [Performance Considerations](#performance-considerations)
14. [Maintenance and Monitoring](#maintenance-and-monitoring)

---

## Executive Summary

### Project Overview
The Investment Tracker is a comprehensive fullstack web application designed to manage investment portfolios, track returns on investment (ROI), handle multi-level marketing (MLM) referral systems, and facilitate withdrawal processes. The system operates as a **Multi-Tier Architecture** with clear separation of concerns between presentation, business logic, and data layers.

### Key Features
- **User Authentication & Authorization**: Role-based access control (RBAC) with admin and user roles
- **Investment Management**: Track investments with different maturity periods and ROI rates
- **MLM Referral System**: Multi-level commission structure with genealogy tracking
- **Withdrawal Processing**: Secure withdrawal requests with admin approval workflow
- **Real-time Notifications**: In-app notification system for system events
- **File Upload System**: Secure document upload for transaction proofs
- **Dashboard Analytics**: Comprehensive reporting and statistical analysis

### Target Users
- **End Users**: Individual investors managing their portfolios
- **Administrators**: System managers handling approvals and oversight
- **Business Stakeholders**: Platform operators monitoring system performance

---

## System Architecture

### Architectural Pattern
The application follows a **Monolithic Architecture** with **Client-Server Model** implementation:

- **Frontend**: Single Page Application (SPA) using React with TypeScript
- **Backend**: RESTful API server using Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM for type-safe database operations
- **File Storage**: Local file system with Multer for document uploads
- **Session Management**: Express-session with MemoryStore for session persistence

### Component Architecture
- **Frontend**: Single Page Application (SPA) using React with TypeScript
- **Backend**: RESTful API server using Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM for type-safe database operations
- **File Storage**: Local file system with Multer for document uploads
- **Session Management**: Express-session with MemoryStore for session persistence

### Data Flow Architecture
1. **Request Flow**: Client → Express Router → Middleware → Controller → Service → Database
2. **Response Flow**: Database → Service → Controller → Middleware → Client
3. **Authentication Flow**: Login → Session Creation → JWT-like Session Management → Route Protection

---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **React** | 18.3.1 | UI Framework | Component-based architecture, virtual DOM |
| **TypeScript** | 5.6.3 | Type Safety | Static typing, better IDE support |
| **Vite** | 6.3.5 | Build Tool | Fast development server, optimized builds |
| **Tailwind CSS** | 3.4.17 | Styling | Utility-first CSS, rapid UI development |
| **Wouter** | 3.3.5 | Routing | Lightweight router for SPA navigation |
| **React Query** | 5.60.5 | State Management | Server state management, caching |
| **React Hook Form** | 7.55.0 | Form Handling | Performance-optimized form management |
| **Zod** | 3.24.2 | Validation | Runtime type checking and validation |

### Backend Technologies
| Technology | Version | Purpose | Rationale |
|------------|---------|---------|-----------|
| **Node.js** | 20.16.11 | Runtime Environment | Event-driven, non-blocking I/O |
| **Express.js** | 4.21.2 | Web Framework | Minimalist, flexible routing |
| **TypeScript** | 5.6.3 | Type Safety | Type-safe backend development |
| **Mongoose ODM** | 8.0.0 | Database ODM | Type-safe database operations |
| **MongoDB** | - | Database | Document-based, flexible schema |
| **bcrypt** | 6.0.0 | Password Hashing | Secure password storage |
| **Multer** | 2.0.1 | File Upload | Multipart form data handling |
| **Nodemailer** | 7.0.3 | Email Service | Transactional email delivery |

### Development Tools
| Tool | Purpose | Configuration |
|------|---------|---------------|
| **ESBuild** | TypeScript compilation | Production builds |
| **TSX** | Development runtime | Hot reloading |
| **Mongoose** | Database modeling | Schema management |
| **Vite** | Frontend bundling | Development and production |

---

## Database Design

### Database Schema Details

#### Users Collection
```typescript
interface User {
  _id: ObjectId;
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  profilePicture?: string;
  walletAddress?: string;
  role: 'user' | 'admin';
  referralCode: string;
  referredBy?: ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  otp?: string;
  otpExpiry?: Date;
}
```

#### Investments Collection
```typescript
interface Investment {
  _id: ObjectId;
  userId: ObjectId;
  amount: number;
  plan: string;
  paymentMethod: string;
  transactionProof?: string;
  notes?: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  roiRate: number;
  maturityDate?: Date;
  approvedBy?: ObjectId;
  approvedAt?: Date;
  createdAt: Date;
}
```

#### Withdrawals Collection
```typescript
interface Withdrawal {
  _id: ObjectId;
  userId: ObjectId;
  amount: number;
  type: 'roi' | 'commission';
  walletAddress: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  txid?: string;
  processedBy?: ObjectId;
  processedAt?: Date;
  createdAt: Date;
}
```

#### Commissions Collection
```typescript
interface Commission {
  _id: ObjectId;
  userId: ObjectId;
  fromUserId: ObjectId;
  investmentId: ObjectId;
  level: number;
  amount: number;
  type: 'direct' | 'unilevel';
  status: 'unpaid' | 'paid';
  paidAt?: Date;
  createdAt: Date;
}
```

### Data Integrity Constraints
- **Indexes**: Ensure fast queries on frequently accessed fields
- **Unique Constraints**: Prevent duplicate emails, usernames, and referral codes
- **Validation**: Mongoose schema validation for data integrity
- **Required Fields**: Ensure required fields are populated

---

## API Documentation

### Authentication Endpoints

#### POST auth/signup
**Purpose**: User registration with email verification
```typescript
Request Body: {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  referralCode?: string;
}

Response: {
  message: string;
  user: User;
}
```

#### POST auth/login
**Purpose**: User authentication with session creation
```typescript
Request Body: {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

Response: {
  user: User;
  message: string;
}
```

#### POST auth/verify-otp
**Purpose**: Email verification using OTP
```typescript
Request Body: {
  userId: number;
  otp: string;
}

Response: {
  message: string;
}
```

### Investment Endpoints

#### GET investments
**Purpose**: Retrieve user's investment portfolio
```typescript
Headers: {
  Cookie: "connect.sid=<session_id>"
}

Response: Investment[]
```

#### POST investments
**Purpose**: Create new investment request
```typescript
Request Body: {
  amount: string;
  plan: "6months" | "12months" | "18months";
  paymentMethod: string;
  transactionProof?: File;
  notes?: string;
}

Response: Investment
```

### Dashboard Endpoints

#### GET dashboard/stats
**Purpose**: Retrieve comprehensive dashboard statistics
```typescript
Response: {
  investmentAmount: number;
  unpaidROI: number;
  unpaidCommissions: number;
  directCommissions: number;
  totalCommissions: number;
  totalReferrals: number;
  activeReferrals: number;
  referralLink: string;
  investmentPercentage: string;
  commissionPercentage: string;
  roiPercentage: string;
  referralPercentage: string;
  investmentGrowth: string;
}
```

### Admin Endpoints

#### GET admin/stats
**Purpose**: System-wide statistics for administrators
```typescript
Response: {
  totalUsers: number;
  activeUsers: number;
  activeInvestments: number;
  totalInvestmentAmount: number;
  pendingWithdrawals: number;
  totalWithdrawalAmount: number;
  totalCommissions: number;
  paidCommissions: number;
  activeUserPercentage: string;
  investmentCompletionRate: string;
  commissionPaidPercentage: string;
  userGrowth: string;
  investmentGrowth: string;
}
```

#### PUT admin/investments/:id/approve
**Purpose**: Approve investment requests
```typescript
Response: Investment
```

### Error Handling
All API endpoints follow consistent error response format:
```typescript
Error Response: {
  message: string;
  status?: number;
  code?: string;
}
```

---

## Frontend Architecture

### Component Structure
The frontend follows a hierarchical component structure with:

- **App Component**: Root component with routing and global providers
- **Authentication Provider**: Manages user authentication state
- **Query Client Provider**: Handles server state management with React Query
- **Route Components**: Page-level components for different application sections
- **Navigation**: Sidebar and header navigation components
- **Layout Components**: Reusable layout wrappers and containers

### State Management Strategy
- **Server State**: Managed by React Query for API data caching and synchronization
- **Client State**: Local component state using React hooks
- **Global State**: Context API for authentication and user session
- **Form State**: React Hook Form for form validation and submission

### Routing Architecture
```typescript
// Route Configuration
const routes = [
  { path: "/", component: Dashboard },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/dashboard", component: Dashboard },
  { path: "/investments", component: Investments },
  { path: "/withdrawals", component: Withdrawals },
  { path: "/genealogy", component: Genealogy },
  { path: "/profile", component: Profile },
  { path: "/admin", component: AdminDashboard },
  // Admin sub-routes
  { path: "/admin/users", component: AdminUsers },
  { path: "/admin/investment-approvals", component: AdminInvestmentApprovals },
  { path: "/admin/withdrawal-approvals", component: AdminWithdrawalApprovals },
];
```

### Component Design Patterns
- **Container Components**: Handle business logic and data fetching
- **Presentational Components**: Focus on UI rendering and user interaction
- **Higher-Order Components (HOCs)**: Authentication guards and role-based access
- **Custom Hooks**: Reusable logic for API calls and state management

---

## Backend Architecture

### Middleware Stack
```typescript
// Middleware Configuration Order
app.use(express.json());                    // Body parsing
app.use(express.urlencoded({ extended: false })); // URL encoding
app.use(session({ ... }));                  // Session management
app.use(loggingMiddleware);                 // Request logging
app.use('', apiRoutes);                 // API routes
app.use('/uploads', staticFiles);           // File serving
app.use(errorHandler);                      // Error handling
```

### Authentication Middleware
```typescript
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  req.user = user;
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};
```

### Service Layer Architecture
```typescript
// Storage Interface
interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Investment operations
  getUserInvestments(userId: number): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment & { userId: number }): Promise<Investment>;
  
  // Commission operations
  getUserCommissions(userId: number): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
}
```

### Business Logic Implementation
- **Commission Calculation**: Multi-level referral commission structure
- **ROI Calculation**: Time-based return on investment computation
- **Referral Tree Management**: Hierarchical user relationship tracking
- **Notification System**: Event-driven notification generation

---

## Security Implementation

### Authentication Security
- **Password Hashing**: bcrypt with salt rounds (10)
- **Session Management**: Express-session with secure cookies
- **OTP Verification**: Time-limited one-time passwords for email verification
- **Password Reset**: Secure token-based password reset flow

### Authorization Security
- **Role-Based Access Control (RBAC)**: Admin and user role separation
- **Route Protection**: Middleware-based route guards
- **Resource Ownership**: Users can only access their own resources
- **Admin Privileges**: Elevated permissions for system administration

### Data Security
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Prevention**: Content Security Policy and input sanitization
- **CSRF Protection**: Session-based CSRF token validation

### File Upload Security
- **File Type Validation**: Whitelist of allowed file extensions
- **File Size Limits**: 5MB maximum file size
- **Secure File Storage**: Isolated upload directory with proper permissions
- **Virus Scanning**: Integration capability for malware detection

### Session Security
```typescript
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));
```

---

## Business Logic

### Investment Management
```typescript
// Investment Plans Configuration
const INVESTMENT_PLANS = {
  "6months": { roiRate: 7, duration: 180 },
  "12months": { roiRate: 8, duration: 365 },
  "18months": { roiRate: 9, duration: 547 }
};

// ROI Calculation Logic
const calculateROI = (investment: Investment): number => {
  const investmentDate = new Date(investment.createdAt);
  const now = new Date();
  const monthsActive = (now.getFullYear() - investmentDate.getFullYear()) * 12 + 
                      (now.getMonth() - investmentDate.getMonth());
  
  if (monthsActive > 0) {
    const monthlyRate = parseFloat(investment.roiRate); // roiRate is now monthly
    return (parseFloat(investment.amount) * monthlyRate / 100) * monthsActive;
  }
  return 0;
};
```

### Commission Structure
```typescript
// Multi-Level Commission Configuration
const COMMISSION_STRUCTURE = {
  direct: 7, // 7% direct referral commission
  unilevel: [5, 3, 2, 1, 1] // 5 levels: 5%, 3%, 2%, 1%, 1%
};

// Commission Calculation Algorithm
const calculateCommissions = async (investment: Investment) => {
  const user = await storage.getUser(investment.userId);
  if (!user?.referredBy) return;
  
  // Direct commission for immediate referrer
  const directCommission = parseFloat(investment.amount) * (COMMISSION_STRUCTURE.direct / 100);
  await storage.createCommission({
    userId: user.referredBy,
    fromUserId: investment.userId,
    investmentId: investment.id,
    level: 1,
    amount: directCommission.toString(),
    type: "direct"
  });
  
  // Unilevel commissions (up to 5 levels)
  let currentUserId = user.referredBy;
  for (let level = 2; level <= 5; level++) {
    const referrer = await storage.getUser(currentUserId);
    if (!referrer?.referredBy) break;
    
    const commissionRate = COMMISSION_STRUCTURE.unilevel[level - 2];
    const commissionAmount = parseFloat(investment.amount) * (commissionRate / 100);
    
    await storage.createCommission({
      userId: referrer.referredBy,
      fromUserId: investment.userId,
      investmentId: investment.id,
      level,
      amount: commissionAmount.toString(),
      type: "unilevel"
    });
    
    currentUserId = referrer.referredBy;
  }
};
```

### Referral System
```typescript
// Referral Tree Generation
const buildReferralTree = async (userId: number, maxLevel: number = 5): Promise<ReferralNode> => {
  const user = await storage.getUser(userId);
  if (!user) return null;
  
  const directReferrals = await storage.getUserReferrals(userId, 1);
  const children = await Promise.all(
    directReferrals.map(referral => buildReferralTree(referral.id, maxLevel - 1))
  );
  
  return {
    ...user,
    level: maxLevel,
    children: children.filter(Boolean)
  };
};
```

---

## Deployment Guide

### Environment Configuration
```bash
# Required Environment Variables
DATABASE_URL=mongodb://username:password@host:port/database
SESSION_SECRET=your-secure-session-secret
NODE_ENV=production
BASE_URL=https://your-domain.com
EMAIL_SERVICE=smtp://username:password@smtp.gmail.com:587
```

### Build Process
```bash
# Install dependencies
npm install

# Build frontend assets
npm run build

# Database migrations
npm run db:push

# Seed database (optional)
npm run seed
```

### Deployment Platforms

#### Vercel Deployment
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public"
      }
    }
  ],
  "routes": [
    {
      "src": "(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "dist/public/$1"
    }
  ]
}
```

#### Railway Deployment
```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[deploy.envs]
NODE_ENV = "production"
```

#### Render Deployment
```yaml
# render.yaml
databases:
  - name: investment-tracker-db
    databaseName: investment_tracker
    user: investment_tracker_user

services:
  - type: web
    name: investment-tracker
    env: node
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: investment-tracker-db
          property: connectionString
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Email service configured
- [ ] File upload directory permissions set
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented

---

## Development Setup

### Prerequisites
- Node.js 18+ 
- MongoDB 4+
- Git

### Local Development Environment
```bash
# Clone repository
git clone <repository-url>
cd InvestmentTracker

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local configuration

# Start development server
npm run dev

# Access application
# Frontend: http://localhost:5000
# API: http://localhost:5000
```

### Database Setup
```bash
# Create MongoDB database
mongo

# Run migrations
npm run db:push

# Seed with test data
npm run seed
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push",
    "seed": "node scripts/seed-db.cjs"
  }
}
```

### Code Quality Tools
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks

---

## Testing Strategy

### Testing Pyramid
```
        E2E Tests (Few)
           ▲
    Integration Tests (Some)
           ▲
    Unit Tests (Many)
```

### Unit Testing
```typescript
// Example unit test for commission calculation
describe('Commission Calculation', () => {
  it('should calculate direct commission correctly', () => {
    const investment = {
      amount: '1000',
      userId: 1,
      createdAt: new Date()
    };
    
    const commission = calculateDirectCommission(investment);
    expect(commission).toBe(70); // 7% of 1000
  });
});
```

### Integration Testing
```typescript
// Example API integration test
describe('Investment API', () => {
  it('should create investment with valid data', async () => {
    const response = await request(app)
      .post('investments')
      .set('Cookie', `connect.sid=${sessionId}`)
      .field('amount', '1000')
      .field('plan', '6months')
      .field('paymentMethod', 'bank_transfer')
      .attach('transactionProof', 'test-file.jpg');
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

### End-to-End Testing
- **User Registration Flow**: Complete signup and verification process
- **Investment Workflow**: Create, approve, and track investments
- **Withdrawal Process**: Request and process withdrawals
- **Admin Operations**: User management and system oversight

---

## Performance Considerations

### Frontend Performance
- **Code Splitting**: Route-based code splitting for reduced bundle size
- **Lazy Loading**: Component lazy loading for improved initial load time
- **Caching Strategy**: React Query for intelligent data caching
- **Image Optimization**: Responsive images and lazy loading

### Backend Performance
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Efficient SQL queries with proper joins
- **Connection Pooling**: Database connection management
- **Caching Layer**: Redis integration for session and data caching

### Database Performance
```sql
-- Recommended Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_commissions_user_id ON commissions(user_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

### Scalability Considerations
- **Horizontal Scaling**: Load balancer configuration for multiple instances
- **Database Scaling**: Read replicas for read-heavy operations
- **CDN Integration**: Content delivery network for static assets
- **Microservices Migration**: Future architecture evolution path

---

## Maintenance and Monitoring

### Logging Strategy
```typescript
// Structured logging implementation
const log = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    requestId: req.headers['x-request-id'],
    userId: req.user?.id
  };
  
  console.log(JSON.stringify(logEntry));
};
```

### Health Checks
```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Database connectivity check
    await storage.getSetting('health_check');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Monitoring Metrics
- **Application Metrics**: Response times, error rates, throughput
- **Database Metrics**: Query performance, connection pool usage
- **System Metrics**: CPU, memory, disk usage
- **Business Metrics**: User registrations, investment volume, commission payouts

### Backup Strategy
- **Database Backups**: Daily automated backups with point-in-time recovery
- **File Backups**: Regular backup of uploaded documents
- **Configuration Backups**: Version-controlled configuration management
- **Disaster Recovery**: Multi-region backup and recovery procedures

### Security Monitoring
- **Authentication Logs**: Failed login attempts and suspicious activities
- **Access Logs**: API endpoint access patterns and anomalies
- **File Upload Monitoring**: Malicious file detection and quarantine
- **Rate Limiting**: API abuse prevention and monitoring

---

## Data Flow and Communication Patterns

### Request-Response Flow
The application follows a standard client-server architecture where:

1. **Client Request**: Browser sends HTTP request to Express.js server
2. **Middleware Processing**: Request passes through authentication, validation, and logging middleware
3. **Controller Layer**: Business logic controllers handle the request
4. **Service Layer**: Service classes contain core business logic
5. **Database Layer**: MongoDB operations are performed through Mongoose ODM
6. **Response Flow**: Data flows back through the layers to the client

### Authentication Flow
The authentication process follows these steps:

1. **Login Request**: User submits credentials via login form
2. **Credential Validation**: Server validates email/username and password
3. **Password Verification**: bcrypt compares hashed passwords
4. **Session Creation**: Express-session creates and stores session data
5. **Cookie Response**: Session cookie is sent to client for future requests
6. **Session Storage**: Session data is stored in memory for subsequent validations

### Investment Approval Flow
The investment approval process includes:

1. **Investment Request**: User submits investment with transaction proof
2. **File Upload Processing**: Multer handles file upload and storage
3. **Notification Creation**: Admin notification is created for approval
4. **Admin Review**: Administrator reviews and approves/rejects investment
5. **Commission Calculation**: Multi-level commission structure is calculated
6. **Status Update**: Investment status is updated in the database

---

## Error Handling and Logging

### Error Handling Strategy
```typescript
// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
    url: _req.url,
    method: _req.method,
    userId: (_req as any).user?.id
  });

  res.status(status).json({ message });
});

// Custom Error Classes
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.status = 403;
  }
}
```

### Request Logging Middleware
```typescript
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});
```

### Client-Side Error Handling
```typescript
// React Query Error Handling
const { data, error, isLoading } = useQuery({
  queryKey: ['investments'],
  queryFn: fetchInvestments,
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors
    if (error.status >= 400 && error.status < 500) {
      return false;
    }
    return failureCount < 3;
  },
  onError: (error) => {
    console.error('Investment fetch failed:', error);
    // Show user-friendly error message
    toast.error('Failed to load investments. Please try again.');
  }
});

// Form Error Handling
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(investmentSchema)
});

// Display form errors
{errors.amount && (
  <p className="text-red-500 text-sm">{errors.amount.message}</p>
)}
```

---

## Configuration Management

### Environment Configuration
```typescript
// Environment Variables Interface
interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  SESSION_SECRET: string;
  BASE_URL: string;
  EMAIL_SERVICE?: string;
  PORT?: number;
  UPLOAD_DIR?: string;
  MAX_FILE_SIZE?: number;
}

// Configuration validation
const validateConfig = (): EnvironmentConfig => {
  const required = ['DATABASE_URL', 'SESSION_SECRET'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    NODE_ENV: (process.env.NODE_ENV as any) || 'development',
    DATABASE_URL: process.env.DATABASE_URL!,
    SESSION_SECRET: process.env.SESSION_SECRET!,
    BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
    EMAIL_SERVICE: process.env.EMAIL_SERVICE,
    PORT: parseInt(process.env.PORT || '5000'),
    UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB
  };
};
```

### Feature Flags
```typescript
// Feature flag configuration
const FEATURE_FLAGS = {
  EMAIL_VERIFICATION: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
  TWO_FACTOR_AUTH: process.env.ENABLE_2FA === 'true',
  ADVANCED_ANALYTICS: process.env.ENABLE_ADVANCED_ANALYTICS === 'true',
  REAL_TIME_NOTIFICATIONS: process.env.ENABLE_REAL_TIME_NOTIFICATIONS === 'true'
};

// Feature flag usage
if (FEATURE_FLAGS.EMAIL_VERIFICATION) {
  // Send verification email
  await sendVerificationEmail(user.email, otp);
}
```

---

## Database Optimization

### Indexing Strategy
```sql
-- Primary indexes for performance
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY idx_users_referral_code ON users(referral_code);
CREATE INDEX CONCURRENTLY idx_users_referred_by ON users(referred_by);

-- Investment indexes
CREATE INDEX CONCURRENTLY idx_investments_user_id ON investments(user_id);
CREATE INDEX CONCURRENTLY idx_investments_status ON investments(status);
CREATE INDEX CONCURRENTLY idx_investments_created_at ON investments(created_at);
CREATE INDEX CONCURRENTLY idx_investments_approved_by ON investments(approved_by);

-- Withdrawal indexes
CREATE INDEX CONCURRENTLY idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX CONCURRENTLY idx_withdrawals_status ON withdrawals(status);
CREATE INDEX CONCURRENTLY idx_withdrawals_created_at ON withdrawals(created_at);

-- Commission indexes
CREATE INDEX CONCURRENTLY idx_commissions_user_id ON commissions(user_id);
CREATE INDEX CONCURRENTLY idx_commissions_from_user_id ON commissions(from_user_id);
CREATE INDEX CONCURRENTLY idx_commissions_investment_id ON commissions(investment_id);
CREATE INDEX CONCURRENTLY idx_commissions_status ON commissions(status);

-- Composite indexes for complex queries
CREATE INDEX CONCURRENTLY idx_investments_user_status ON investments(user_id, status);
CREATE INDEX CONCURRENTLY idx_commissions_user_type ON commissions(user_id, type);
CREATE INDEX CONCURRENTLY idx_withdrawals_user_status ON withdrawals(user_id, status);
```

### Query Optimization
```typescript
// Optimized user dashboard query
const getDashboardStats = async (userId: number) => {
  // Use single query with aggregations instead of multiple queries
  const stats = await db
    .select({
      totalInvestment: sql<number>`COALESCE(SUM(CASE WHEN status = 'active' THEN amount::numeric ELSE 0 END), 0)`,
      totalCommissions: sql<number>`COALESCE(SUM(amount::numeric), 0)`,
      activeReferrals: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)`,
      totalReferrals: sql<number>`COUNT(*)`
    })
    .from(users)
    .leftJoin(investments, eq(users.id, investments.userId))
    .leftJoin(commissions, eq(users.id, commissions.userId))
    .leftJoin(users.as('referrals'), eq(users.id, sql`referrals.referred_by`))
    .where(eq(users.id, userId))
    .groupBy(users.id);

  return stats[0];
};
```

---

## Security Best Practices

### Input Sanitization
```typescript
// Zod schema validation with sanitization
const userInputSchema = z.object({
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  
  email: z.string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  
  phone: z.string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone number format")
    .optional(),
  
  walletAddress: z.string()
    .regex(/^[a-zA-Z0-9]{26,35}$/, "Invalid wallet address format")
    .optional()
});

// XSS Prevention
const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Apply rate limiting
app.use('auth', authLimiter);
app.use('', generalLimiter);
```

### Content Security Policy
```typescript
// CSP middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  next();
});
```

---

## Monitoring and Observability

### Application Metrics
```typescript
// Custom metrics collection
const metrics = {
  requests: 0,
  errors: 0,
  activeUsers: 0,
  investments: 0,
  withdrawals: 0
};

// Metrics middleware
app.use((req, res, next) => {
  metrics.requests++;
  
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      metrics.errors++;
    }
  });
  
  next();
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    metrics
  });
});
```

### Health Check Endpoints
```typescript
// Comprehensive health check
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'unknown',
    fileSystem: 'unknown'
  };

  try {
    // Check database connectivity
    await storage.getSetting('health_check');
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'unhealthy';
  }

  try {
    // Check file system access
    await fs.promises.access(process.env.UPLOAD_DIR || './uploads');
    health.fileSystem = 'accessible';
  } catch (error) {
    health.fileSystem = 'inaccessible';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Check database connectivity
mongo $DATABASE_URL

# Verify environment variables
echo $DATABASE_URL

# Check database logs
tail -f /var/log/mongodb/mongod.log
```

#### File Upload Issues
```bash
# Check upload directory permissions
ls -la uploads/

# Fix permissions if needed
chmod 755 uploads/
chown www-data:www-data uploads/

# Check disk space
df -h
```

#### Session Issues
```bash
# Clear session store
# For MemoryStore, restart the application
# For Redis, flush the database
redis-cli FLUSHDB

# Check session configuration
echo $SESSION_SECRET
```

#### Performance Issues
```bash
# Monitor application performance
top -p $(pgrep node)

# Check memory usage
free -h

# Monitor database performance
mongo --eval "db.serverStatus()"
```

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`, data || '');
  }
};

// Usage in application
debugLog('User login attempt', { email: user.email, timestamp: new Date() });
```

---

## Conclusion

The Investment Tracker application represents a comprehensive fullstack solution for investment portfolio management with MLM referral capabilities. The architecture prioritizes security, scalability, and maintainability while providing a robust user experience.

### Key Strengths
- **Type Safety**: Full TypeScript implementation across frontend and backend
- **Security First**: Comprehensive security measures and best practices
- **Scalable Architecture**: Modular design supporting future growth
- **User Experience**: Intuitive interface with real-time updates
- **Business Logic**: Sophisticated commission and ROI calculation systems

### Future Enhancements
- **Mobile Application**: React Native or Flutter mobile app
- **Real-time Features**: WebSocket integration for live updates
- **Advanced Analytics**: Business intelligence and reporting dashboard
- **Payment Integration**: Third-party payment processor integration
- **Multi-language Support**: Internationalization (i18n) implementation

This documentation serves as a comprehensive guide for developers, system administrators, and stakeholders involved in the Investment Tracker application lifecycle. 