import {z} from 'zod';

export const adminSchema = z.object({
    username: z.string().min(3, { message: 'Username must be at least 3 characters long.' }).max(50, { message: 'Username must be at most 50 characters long.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
});

export const registerSchema = z.object({
    teamName: z.string()
        .min(1, { message: "Please enter the team name" })
        .refine(value => /^[a-zA-Z0-9@\-_\(\). ]+$/.test(value), {
            message: "Only @ , - , _ , ( , ) , . are allowed as special characters"
        }),
    username: z.string()
        .min(2, { message: "Username should be at least 2 characters long" })
        .refine(value => /^[a-zA-Z0-9@\-_\(\). ]+$/.test(value), {
            message: "Only @ , - , _ , ( , ) , . are allowed as special characters"
        }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password should be atleast 6 characters long" }),
});

export const loginSchema = z.object({
    username: z.string().min(2, { message: "Username is atleast 2 characters long" }),
    password: z.string().min(6, { message: "Password is atleast 6 characters long" }),
});

export const answerSchema = z.object({
    answer: z.string().min(1, { message: "Please enter the answer" })
});

export const memberRegisterSchema = z.object({
    username: z.string().min(2, { message: "Username should be atleast 2 characters long" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password should be atleast 6 characters long" }),
});