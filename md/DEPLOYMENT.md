# Deployment Guide - DH Pharmacy

## Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0
- PM2 (for production)
- Nginx (optional, for reverse proxy)
- SSL Certificate (for HTTPS)

---

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd dh-pharmacy
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create `.env` file in root directory:

```env
# Server
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb://localhost:27017/dh_pharmacy
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dh-pharmacy

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# AWS S3 / Cloudflare R2
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=dh-pharmacy-uploads

# Payment Gateways
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+84xxxxxxxxx

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@dhpharmacy.com

# Shipping
GHN_API_KEY=your-ghn-api-key
GHN_SHOP_ID=your-shop-id

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Elasticsearch (Optional)
ELASTICSEARCH_URL=http://localhost:9200
```

---

## Database Setup

### 1. Install MongoDB

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
```

**macOS:**
```bash
brew install mongodb-community
```

**Or use MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string

### 2. Seed Database
```bash
node scripts/seed.js
```

---

## Production Deployment

### Option 1: Using PM2

#### 1. Install PM2
```bash
npm install -g pm2
```

#### 2. Start Application
```bash
pm2 start server.js --name dh-pharmacy
```

#### 3. Save PM2 Configuration
```bash
pm2 save
pm2 startup
```

#### 4. PM2 Commands
```bash
pm2 list              # List all processes
pm2 logs dh-pharmacy  # View logs
pm2 restart dh-pharmacy  # Restart
pm2 stop dh-pharmacy     # Stop
pm2 delete dh-pharmacy   # Delete
```

### Option 2: Using Docker

#### 1. Create Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

#### 2. Build and Run
```bash
docker build -t dh-pharmacy .
docker run -d -p 3000:3000 --env-file .env dh-pharmacy
```

### Option 3: Using Systemd (Linux)

#### 1. Create Service File
```bash
sudo nano /etc/systemd/system/dh-pharmacy.service
```

```ini
[Unit]
Description=DH Pharmacy API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/dh-pharmacy
Environment=NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### 2. Enable and Start
```bash
sudo systemctl enable dh-pharmacy
sudo systemctl start dh-pharmacy
sudo systemctl status dh-pharmacy
```

---

## Nginx Configuration

### 1. Install Nginx
```bash
sudo apt-get install nginx
```

### 2. Create Configuration
```bash
sudo nano /etc/nginx/sites-available/dh-pharmacy
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Static files
    location / {
        root /var/www/dh-pharmacy/frontend;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/dh-pharmacy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL Certificate (Let's Encrypt)

### 1. Install Certbot
```bash
sudo apt-get install certbot python3-certbot-nginx
```

### 2. Obtain Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

### 3. Auto-renewal
Certbot automatically sets up auto-renewal. Test with:
```bash
sudo certbot renew --dry-run
```

---

## Monitoring & Logging

### 1. PM2 Monitoring
```bash
pm2 monit
```

### 2. Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. Health Check Endpoint
```http
GET /api/health
```

---

## Backup Strategy

### 1. Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/dh_pharmacy" --out=/backup/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://localhost:27017/dh_pharmacy" /backup/20240115
```

### 2. Automated Backup Script
Create `scripts/backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out=/backup/$DATE
tar -czf /backup/dh-pharmacy-$DATE.tar.gz /backup/$DATE
# Upload to S3 or other storage
aws s3 cp /backup/dh-pharmacy-$DATE.tar.gz s3://your-backup-bucket/
```

### 3. Cron Job
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall (only allow 80, 443)
- [ ] Keep dependencies updated
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Regular security audits
- [ ] Backup database regularly
- [ ] Monitor logs for suspicious activity

---

## Performance Optimization

### 1. Enable Compression
Already enabled in `server.js` with `compression` middleware.

### 2. CDN for Static Files
Upload static files to CDN (Cloudflare, AWS CloudFront).

### 3. Database Indexing
Ensure proper indexes on frequently queried fields.

### 4. Caching
Consider Redis for session storage and caching.

---

## Troubleshooting

### Application won't start
- Check MongoDB connection
- Verify environment variables
- Check port availability
- Review logs: `pm2 logs dh-pharmacy`

### Database connection errors
- Verify MongoDB is running
- Check connection string
- Verify network/firewall settings

### High memory usage
- Check for memory leaks
- Increase server resources
- Consider clustering with PM2: `pm2 start server.js -i max`

---

## Support

For issues or questions:
- Email: support@dhpharmacy.com
- Documentation: See README.md and API_DOCUMENTATION.md

