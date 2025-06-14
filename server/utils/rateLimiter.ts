import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: (req: any) => (req.user ? 1000 : 100),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  keyGenerator: (req: any) => req.ip,
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});

export default limiter;
