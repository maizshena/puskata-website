import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak sama",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

export const bookSchema = z.object({
  title: z.string().min(1, 'Judul harus diisi'),
  author: z.string().min(1, 'Penulis harus diisi'),
  isbn: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  quantity: z.number().min(1).default(1),
});

export const loanSchema = z.object({
  book_id: z.number(),
  loan_date: z.string(),
  due_date: z.string(),
});