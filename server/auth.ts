import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import connectPgSimple from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

// Set up pgSession
const PgSession = connectPgSimple(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // If stored password doesn't have a salt part (from initial seed data)
  // Just do a direct comparison
  if (!stored.includes(".")) {
    return supplied === stored;
  }
  
  // For properly hashed passwords, do secure comparison
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function getSession() {
  // Using 'SESSION_SECRET' from env or fallback for development
  const sessionSecret = process.env.SESSION_SECRET || "dev-session-secret-for-testing";
  
  // Enhanced session configuration for reliable authentication
  let sessionConfig: session.SessionOptions = {
    secret: sessionSecret,
    resave: true, // Save session on every request
    saveUninitialized: true, // Create session for all visitors
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Only use secure in production
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for better persistence
      sameSite: 'lax' // More permissive cookie policy
    },
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions', // Store sessions in database for persistence
      createTableIfMissing: true
    })
  };
  
  // Log detailed session configuration for debugging
  console.log("Session configuration:", {
    secret: "***",
    resave: sessionConfig.resave,
    saveUninitialized: sessionConfig.saveUninitialized,
    cookie: sessionConfig.cookie
  });
  
  return session(sessionConfig);
}

export function setupAuth(app: Express) {
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (usernameOrEmail, password, done) => {
      try {
        // Try to find user by username first
        let user = await storage.getUserByUsername(usernameOrEmail);
        
        // If not found by username, try by email
        if (!user) {
          // Check if input looks like an email (contains @)
          if (usernameOrEmail.includes('@')) {
            user = await storage.getUserByEmail(usernameOrEmail);
          }
          
          // If still not found
          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }
        }
        
        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Login endpoint with enhanced error handling and debugging
  app.post("/api/auth/login", (req, res, next) => {
    console.log("Login attempt for:", req.body.username);
    
    passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Authentication failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("Session login error:", loginErr);
          return next(loginErr);
        }
        
        // Create an auth token for the client
        const authToken = {
          id: user.id,
          username: user.username,
          timestamp: new Date().toISOString()
        };
        
        // Don't return the password
        const { password: _, ...userWithoutPassword } = user;
        
        // Set additional headers for auth token (belt and suspenders approach)
        res.cookie('auth_user_id', user.id.toString(), { 
          httpOnly: true, 
          secure: false, // Should be true in production with HTTPS
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        console.log("Login successful for user:", user.username);
        return res.json({
          ...userWithoutPassword,
          authToken
        });
      });
    })(req, res, next);
  });

  // Logout endpoint with improved error handling
  app.post("/api/auth/logout", (req, res) => {
    // Clear auth cookie first
    res.clearCookie('auth_user_id');
    
    req.logout((err: Error | null) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      
      // Destroy the session completely
      if (req.session) {
        req.session.destroy((sessionErr) => {
          if (sessionErr) {
            console.error("Session destruction error:", sessionErr);
          }
          
          console.log("User successfully logged out");
          return res.status(200).json({ message: "Logged out successfully" });
        });
      } else {
        console.log("User logged out (no session to destroy)");
        return res.status(200).json({ message: "Logged out successfully" });
      }
    });
  });

  // Get current user endpoint with token support for cross-environment compatibility
  app.get("/api/user", (req, res) => {
    // First check for session-based authentication
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    
    // Then check for token-based authentication (from X-Auth-Token header)
    const authToken = req.headers['x-auth-token'];
    if (authToken) {
      try {
        // Parse the token (simple JSON token implementation)
        const tokenData = JSON.parse(authToken as string);
        
        // Check if token has necessary data and is recent (within 24 hours)
        if (tokenData && tokenData.id && tokenData.username && tokenData.timestamp) {
          const tokenDate = new Date(tokenData.timestamp);
          const currentDate = new Date();
          const timeDiff = currentDate.getTime() - tokenDate.getTime();
          
          // Token valid for 24 hours
          if (timeDiff < 24 * 60 * 60 * 1000) {
            // Look up the user with the token details
            storage.getUser(tokenData.id).then(user => {
              if (user) {
                // Establish session for future requests
                req.login(user, (err) => {
                  if (err) {
                    console.error("Error establishing session from token:", err);
                  }
                });
                return res.json(user);
              } else {
                return res.status(401).json({ message: "User not found" });
              }
            }).catch(error => {
              console.error("Error looking up user by token:", error);
              return res.status(401).json({ message: "Authentication error" });
            });
            return; // End execution here as we're handling response in promise
          }
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
    
    // If no valid authentication found
    return res.status(401).json({ message: "Not authenticated" });
  });
}

// Middleware to check if user is authenticated
// Supports both session-based and token-based authentication
export function isAuthenticated(req: any, res: any, next: any) {
  // First try session-based authentication
  if (req.isAuthenticated()) {
    return next();
  }
  
  // Then try token-based authentication
  const authToken = req.headers['x-auth-token'];
  if (authToken) {
    try {
      // Parse the token
      const tokenData = JSON.parse(authToken as string);
      
      // Validate token format and freshness
      if (tokenData && tokenData.id && tokenData.username && tokenData.timestamp) {
        const tokenDate = new Date(tokenData.timestamp);
        const currentDate = new Date();
        const timeDiff = currentDate.getTime() - tokenDate.getTime();
        
        // Token valid for 24 hours
        if (timeDiff < 24 * 60 * 60 * 1000) {
          // Look up the user and authenticate them
          storage.getUser(tokenData.id).then(user => {
            if (user) {
              // Log them in via session for future requests
              req.login(user, (loginErr: Error | null) => {
                if (loginErr) {
                  console.error("Error establishing session from token:", loginErr);
                  return res.status(401).json({ message: "Session creation failed" });
                }
                // Continue to the protected route
                return next();
              });
            } else {
              return res.status(401).json({ message: "User not found" });
            }
          }).catch(error => {
            console.error("Token auth error:", error);
            return res.status(401).json({ message: "Authentication error" });
          });
          return; // End execution here since we're handling in the promise
        }
      }
    } catch (error) {
      console.error("Error parsing auth token:", error);
    }
  }
  
  // If no valid authentication found
  return res.status(401).json({ message: "Authentication required" });
}

// Helper function to hash password for registration
export { hashPassword };