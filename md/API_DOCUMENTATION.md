# API Documentation - DH Pharmacy

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0901234567"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as register

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nguyễn Văn B",
  "phone": "0907654321"
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Products Endpoints

### Get All Products
```http
GET /api/products?page=1&limit=20&type=otc&category=Thuốc giảm đau&search=paracetamol&sort=price_asc
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `type`: Filter by type (`prescription`, `otc`, `supplement`)
- `category`: Filter by category
- `search`: Search query
- `minPrice`: Minimum price
- `maxPrice`: Maximum price
- `sort`: Sort option (`price_asc`, `price_desc`, `name_asc`, `name_desc`, `rating`, `popular`)

**Response:**
```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "page": 1,
  "pages": 5,
  "data": [...]
}
```

### Get Product by ID
```http
GET /api/products/:id
```

### Get Product by Slug
```http
GET /api/products/slug/:slug
```

### Get Featured Products
```http
GET /api/products/featured
```

### Get Categories
```http
GET /api/products/categories
```

### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Product Name",
  "genericName": "Generic Name",
  "type": "otc",
  "category": "Category",
  "price": 50000,
  "stock": 100,
  ...
}
```

### Update Product (Admin)
```http
PUT /api/products/:id
Authorization: Bearer <admin_token>
```

### Delete Product (Admin)
```http
DELETE /api/products/:id
Authorization: Bearer <admin_token>
```

---

## Orders Endpoints

### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "product_id",
      "quantity": 2
    }
  ],
  "deliveryAddress": {
    "name": "Nguyễn Văn A",
    "phone": "0901234567",
    "address": "123 Đường ABC",
    "ward": "Phường 1",
    "district": "Quận 1",
    "city": "TP.HCM"
  },
  "deliveryTime": {
    "preferredDate": "2024-01-15",
    "preferredTimeSlot": "morning"
  },
  "paymentMethod": "cod",
  "discountCode": "WELCOME10",
  "customerNotes": "Giao hàng trước 10h"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderNumber": "DH20240115000001",
    "total": 500000,
    "status": "pending",
    ...
  }
}
```

### Get My Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

### Cancel Order
```http
PUT /api/orders/:id/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Không cần nữa"
}
```

### Get All Orders (Admin)
```http
GET /api/orders/admin/all?status=pending&page=1&limit=20
Authorization: Bearer <admin_token>
```

### Update Order Status (Admin)
```http
PUT /api/orders/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmed",
  "note": "Đã xác nhận đơn hàng"
}
```

---

## Users Endpoints

### Get Addresses
```http
GET /api/users/addresses
Authorization: Bearer <token>
```

### Add Address
```http
POST /api/users/addresses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Đường ABC",
  "ward": "Phường 1",
  "district": "Quận 1",
  "city": "TP.HCM",
  "isDefault": true
}
```

### Update Address
```http
PUT /api/users/addresses/:addressId
Authorization: Bearer <token>
```

### Delete Address
```http
DELETE /api/users/addresses/:addressId
Authorization: Bearer <token>
```

### Update Health Profile
```http
PUT /api/users/health-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "medicalHistory": {
    "condition": "Tiểu đường",
    "notes": "Đang điều trị",
    "date": "2024-01-01"
  },
  "allergies": {
    "substance": "Penicillin",
    "severity": "severe"
  }
}
```

---

## Prescriptions Endpoints

### Upload Prescription
```http
POST /api/prescriptions/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

prescription: <file>
doctorName: "BS. Nguyễn Văn A"
hospitalName: "Bệnh viện ABC"
prescriptionDate: "2024-01-15"
```

### Get My Prescriptions
```http
GET /api/prescriptions
Authorization: Bearer <token>
```

### Verify Prescription (Pharmacist/Admin)
```http
PUT /api/prescriptions/:id/verify
Authorization: Bearer <pharmacist_token>
Content-Type: application/json

{
  "verificationStatus": "approved",
  "verificationNotes": "Đơn thuốc hợp lệ"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

**Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

---

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- Prices are in VND (Vietnamese Dong)
- File uploads are limited to 5MB
- JWT tokens expire after 7 days (configurable)

