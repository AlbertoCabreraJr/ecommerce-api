const { z } = require('zod');

const passwordRequirements =
  'Password must be at least 8 characters and include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character';


const signupSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(8, { message: passwordRequirements })
    .max(100, { message: "Password must be less than 100 characters" })
    .regex(/[A-Z]/, { message: passwordRequirements })
    .regex(/[a-z]/, { message: passwordRequirements })
    .regex(/[0-9]/, { message: passwordRequirements })
    .regex(/[^A-Za-z0-9]/, { message: passwordRequirements })
});

const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
})

module.exports = {
  signupSchema,
  loginSchema
}