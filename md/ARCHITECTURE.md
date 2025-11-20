# Kiến trúc Hệ thống - DH Pharmacy

## Tổng quan

DH Pharmacy là một nền tảng e-pharmacy được xây dựng với kiến trúc 3-tier:

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
│  (HTML, CSS, JavaScript - Frontend)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS/REST API
                     │
┌────────────────────▼────────────────────────────────────┐
│                  APPLICATION LAYER                     │
│  (Node.js + Express - Backend API)                       │
│  - Authentication & Authorization                        │
│  - Business Logic                                       │
│  - API Endpoints                                        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
┌───────▼───┐ ┌──────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
│  MongoDB  │ │ Elasticsearch│ │ AWS S3/ │ │ Payment │
│           │ │              │ │   R2    │ │ Gateway │
└───────────┘ └─────────────┘ └─────────┘ └─────────┘
```

## Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **JavaScript (ES6+)**: Vanilla JS, no framework dependencies
- **Responsive Design**: Mobile-first approach
- **PWA Ready**: Can be extended to Progressive Web App

### Backend
- **Node.js 18+**: Runtime environment
- **Express.js 4.x**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing

### Third-party Services
- **Payment**: VNPay, MoMo, ZaloPay
- **SMS**: Twilio
- **Email**: SendGrid
- **Shipping**: Giao Hàng Nhanh, Viettel Post
- **Maps**: Google Maps API
- **Storage**: AWS S3 / Cloudflare R2
- **Search**: Elasticsearch (optional)

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: ['customer', 'pharmacist', 'admin'],
  healthProfile: {
    dateOfBirth: Date,
    gender: String,
    medicalHistory: Array,
    allergies: Array,
    currentMedications: Array
  },
  addresses: Array,
  loyaltyPoints: Number,
  twoFactorEnabled: Boolean
}
```

### Products Collection
```javascript
{
  name: String,
  genericName: String,
  type: ['prescription', 'otc', 'supplement'],
  category: String,
  price: Number,
  stock: Number,
  images: Array,
  indications: Array,
  contraindications: Array,
  interactions: Array,
  ratings: {
    average: Number,
    count: Number
  }
}
```

### Orders Collection
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: Array,
  subtotal: Number,
  shippingFee: Number,
  total: Number,
  deliveryAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  status: String,
  prescription: ObjectId (ref: Prescription)
}
```

### Prescriptions Collection
```javascript
{
  user: ObjectId (ref: User),
  order: ObjectId (ref: Order),
  imageUrl: String,
  ocrData: Object,
  verificationStatus: String,
  verifiedBy: ObjectId (ref: User),
  retentionUntil: Date (2 years)
}
```

## API Design

### RESTful Principles
- **GET**: Retrieve resources
- **POST**: Create resources
- **PUT**: Update resources
- **DELETE**: Delete resources

### Endpoint Structure
```
/api/{resource}/{id?}/{action?}
```

### Authentication Flow
1. User registers/logs in
2. Server returns JWT token
3. Client stores token in localStorage
4. Client includes token in Authorization header for protected routes
5. Server validates token on each request

## Security Measures

### 1. Authentication & Authorization
- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based access control (RBAC)
- 2FA support (optional)

### 2. Data Protection
- AES-256 encryption for sensitive data
- HTTPS/SSL for all communications
- Input validation & sanitization
- SQL injection protection (MongoDB)
- XSS protection

### 3. Rate Limiting
- 100 requests per 15 minutes per IP
- Prevents DDoS and abuse

### 4. Compliance
- GDPR/PDPA compliance
- Prescription retention (2 years)
- Medical data encryption
- Privacy policy & Terms of service

## File Structure

```
dh-pharmacy/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── validators/      # Input validators
├── frontend/
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript files
│   ├── pages/           # HTML pages
│   └── assets/          # Images, icons
├── admin/
│   └── pages/           # Admin dashboard pages
├── scripts/
│   └── seed.js          # Database seeding
├── server.js            # Entry point
└── package.json         # Dependencies
```

## Data Flow

### Order Processing Flow
```
1. User adds products to cart
2. User proceeds to checkout
3. System validates cart items
4. System checks stock availability
5. System calculates totals
6. System applies discounts/promotions
7. User confirms order
8. System creates order record
9. System updates product stock
10. System sends confirmation email/SMS
11. Admin processes order
12. Order status updates
13. Shipping provider notified
14. Order delivered
15. User receives notification
```

### Prescription Verification Flow
```
1. User uploads prescription image
2. OCR extracts text (optional)
3. Prescription saved with "pending" status
4. Pharmacist reviews prescription
5. Pharmacist verifies/approves
6. Prescription linked to order
7. Order can proceed
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Load balancer for multiple instances
- Database replication (MongoDB replica set)
- CDN for static assets

### Caching Strategy
- Redis for session storage
- Cache frequently accessed products
- Cache user profiles
- Cache search results

### Database Optimization
- Proper indexing on frequently queried fields
- Text search indexes
- Aggregation pipelines for analytics
- Connection pooling

## Monitoring & Logging

### Application Monitoring
- PM2 process monitoring
- Health check endpoints
- Error tracking
- Performance metrics

### Logging
- Request logging (Morgan)
- Error logging
- Audit logs for sensitive operations
- Log rotation

## Backup & Recovery

### Database Backups
- Daily automated backups
- Retention: 30 days
- Off-site backup storage
- Test restore procedures

### Disaster Recovery
- Backup restoration procedures
- Failover mechanisms
- Data replication
- Recovery time objectives (RTO)

## Future Enhancements

1. **Microservices Architecture**: Split into smaller services
2. **GraphQL API**: More flexible data fetching
3. **Real-time Updates**: WebSocket for order tracking
4. **AI/ML Integration**: Drug interaction detection, recommendation engine
5. **Mobile Apps**: Native iOS/Android apps
6. **Blockchain**: Prescription verification
7. **IoT Integration**: Smart pill dispensers

