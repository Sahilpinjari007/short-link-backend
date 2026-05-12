import { email, z } from "zod";

export const registerSchema = z.object({
  fullname: z.string(),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgetPassSchema = z.object({
  email: z.string().email(),
});

export const resetPassSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});
