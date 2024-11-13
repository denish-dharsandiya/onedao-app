const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const restrictedCountries = ['SY', 'AF', 'IR'];
const crypto = require('crypto');
const responseHandler = require('../utils/responseHandler');
const nodemailer = require('nodemailer');

async function getCountryCode(ip) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await response.json();
      return data.country;
    } catch (error) {
      console.error('Error fetching country code:', error);
      throw new Error('Unable to verify country');
    }
  }

const register = async (req, res) => {
    const { email, password, country } = req.body;
  
    if (!email || !password) {
        return responseHandler(res, false, 'All fields (email, password) are required.', null, 400);
    }
  
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const countryCode = await getCountryCode(ip);

      if (restrictedCountries.includes(countryCode)) {
        return responseHandler(res, false, 'Registration from your country is not allowed.', null, 403);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('Hashed Password:', hashedPassword);
  
      const result = await pool.query(
        'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
        [email, hashedPassword]
      );
  
      const user = result.rows[0];
      responseHandler(res, true, 'User registered successfully', user, 201);
    } catch (err) {
      console.error(err);
      responseHandler(res, false, 'Error registering user', { error: err.message }, 500);
    }
  };
  

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
        return responseHandler(res, false, 'Invalid credentials', null, 400);
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return responseHandler(res, false, 'Invalid credentials', null, 400);
    }

    /*const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'xyz@gmail.com',
          pass: '*****'
        }
    });
  
    await transporter.sendMail({
        from: 'xyz@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    });*/

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    
    await pool.query('UPDATE users SET otp = $1, otp_expiry = $2 WHERE id = $3', [otp, otpExpiry, user.id]);
    responseHandler(res, true, 'OTP sent to your email');
  } catch (err) {
    responseHandler(res, false, 'Error logging in', { error: err.message }, 500);
  }
};


const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      const user = result.rows[0];
  
      if (!user || user.otp !== otp || Date.now() > user.otp_expiry) {
        return responseHandler(res, false, 'Invalid or expired OTP', null, 400);
      }
      const token = jwt.sign({ userId: user.id }, config.JWT_SECRET, { expiresIn: '1h' });
      await pool.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);
        responseHandler(res, true, 'Login successful', { token });
    } catch (err) {
        responseHandler(res, false, 'Error verifying OTP', { error: err.message }, 500);
    }
};

module.exports = { register, login, verifyOtp };
