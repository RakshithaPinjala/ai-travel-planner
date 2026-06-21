"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to register");

      setSuccess(true);
      // Wait a moment then redirect to login
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to register");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-6">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Map className="w-10 h-10 text-primary mb-4" />
          <h1 className="text-2xl font-bold text-white text-center">
            Create an Account
          </h1>
          <p className="text-muted-foreground text-sm mt-2 text-center">
            Start planning your dream trips with AI
          </p>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-secondary/20 border border-secondary/50 text-secondary p-3 rounded-lg text-sm mb-6 text-center">
            Registration successful! Please check your email to verify your account. Redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Full Name
            </label>
            <input
              {...register("name")}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Email
            </label>
            <input
              {...register("email")}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            disabled={isLoading || success}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center mt-2 disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
