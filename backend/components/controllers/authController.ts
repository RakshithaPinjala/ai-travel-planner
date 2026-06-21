import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { User } from '../models/User';
import { generateToken } from '../utils/generateToken';

import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const emailVerificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      name,
      email,
      passwordHash,
      emailVerificationToken
    });

    if (user) {
      // TODO: Send email with verification link containing emailVerificationToken
      
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // Optional: Check if email is verified
      // if (!user.isEmailVerified) {
      //   res.status(403).json({ message: 'Please verify your email first' });
      //   return;
      // }

      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // req.user is set in authMiddleware
    const user = req.user;
    if (user) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
