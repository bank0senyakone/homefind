
import prisma  from '../config/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const {
        username,
        password,
        email,
        firstName,
        lastName,
        phone,
        role = 'USER' // Default role if not specified
      } = req.body;
      // Validate required fields
      if (!username || !password || !email || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }
      // Check if username or email already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
            {phone}
          ]
        }
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.username === username 
          ? 'Username is already taken' 
          :existingUser.phone === phone
          ? 'Phone number is already registered'
          : 'Email is already registered'
        });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          firstName,
          lastName,
          phone,
          role,
          isActive: true // New users are active by default
        }
      });
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Return success response with token and user data
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          profile: {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone
          }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  // Login endpoint
  async login(req, res) {
    try {
      const { username, password } = req.body;
      // Find user by username
      const user = await prisma.user.findUnique({
        where: { username }
      });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }
      // Check if user is active
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive'
        });
      }
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      // Return success response
      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          profile: {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            profileImage: user.profileImage
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  // Logout endpoint
  async logout(req, res) {
    try {
      // Since we're using JWT, we don't need to do anything server-side
      // The client should remove the token
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          profileImage: true,
          isActive: true
        }
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      res.json({
        success: true,
        user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

export default new AuthController();