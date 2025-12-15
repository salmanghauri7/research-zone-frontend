import { z } from "zod";

export const signupSchema = z
  .object({
    firstName: z
      .string({ message: "First name is required." })
      .min(1, "First name cannot be empty.")
      .max(50, "First name cannot exceed 50 characters."),

    lastName: z
      .string()
      .max(50, "Last name cannot exceed 50 characters.")
      .optional(),

    username: z
      .string({ message: "Username is required." })
      .min(3, "Username must be at least 3 characters long.")
      .max(30, "Username cannot exceed 30 characters."),

    email: z
      .string({ message: "Email is required." })
      .email("Invalid email format."),

    password: z
      .string({ message: "Password is required." })
      .min(8, "Password must be at least 8 characters long.")
      .max(50, "Password cannot exceed 50 characters."),

    confirmPassword: z
      .string({ message: "Confirm password is required." })
      .min(8, "Confirm password must be at least 8 characters long."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  identifier: z.string().min(1, "Username or Email is required"), // Keep this simple

  password: z.string().min(1, "Password is required"), // <-- This is the fix
});
