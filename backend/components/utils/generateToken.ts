import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const generateToken = (id: mongoose.Types.ObjectId | string): string => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET as string, {
    expiresIn: '30d',
  });
};
