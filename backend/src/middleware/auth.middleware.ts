import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Check whether the Authorization header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    res.status(401).json({
      success: false,
      error: 'Invalid authentication token.',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);

    if (
      typeof decoded === 'string' ||
      typeof decoded !== 'object' ||
      typeof decoded.userId !== 'string'
    ) {
      res.status(401).json({
        success: false,
        error: 'Invalid authentication token.',
      });
      return;
    }

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Session expired or invalid. Please log in again.',
    });
  }
}