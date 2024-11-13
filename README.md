# onedao-app
# create tables for DB
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                    
    email VARCHAR(255) UNIQUE NOT NULL,        
    password VARCHAR(255) NOT NULL,            
    otp VARCHAR(6),                           
    otp_expiry BIGINT,
);
CREATE INDEX idx_email ON users (email);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL
);

# Steps to run application
1) npm install
2) create postgres database
3) create above tables
4) npm start

API End Points
1) Register
http://localhost:5000/auth/register
{
  "email": "test@example.com",
  "password": "password123"
}
2) Login
http://localhost:5000/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
3) Verify OTP
http://localhost:5000/auth/verifyOtp
{
  "email": "test@example.com",
  "otp": "247619"
}
4) Product
Auth Token: Bearer Token

GET: http://localhost:5000/products/

Pagination
http://localhost:5000/products/?page=1&limit=5

5) Create Product
POST: http://localhost:5000/products/
Auth Token: Bearer Token
{
  "name": "test product2",
  "description": "test2",
  "price": "34",
  "user_id": 1
}

6) PUT: http://localhost:5000/products/2
Auth Token: Bearer Token
{
  "name": "test product23",
  "description": "test23",
  "price": "34",
  "user_id": 1
}

7) GET: http://localhost:5000/products/2
Auth Token: Bearer Token

8) DELETE http://localhost:5000/products/2
Auth Token: Bearer Token
{
  "user_id": 1
}
