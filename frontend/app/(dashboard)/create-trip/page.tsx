"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Sparkles, Map, Calendar, Wallet, Heart } from "lucide-react";
import { motion } from "framer-motion";

const createTripSchema = z.object({
  destination: z.string().min(2, "Please enter a destination"),
  startDate: z.string().min(1, "Please select a start date"),
  durationDays: z.number().min(1, "Minimum 1 day").max(30, "Maximum 30 days"),
  budgetTier: z.enum(["Low", "Medium", "High"]),
  interests: z.string().min(3, "Please enter at least one interest"),
});

export type CreateTripFormValues = z.infer<typeof createTripSchema>;

export default function CreateTripPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("Analyzing destination and weather...");

  useEffect(() => {
    if (!isGenerating) return;
    
    const steps = [
      "Analyzing destination and weather...",
      "Finding the best activities...",
      "Curating hotel recommendations...",
      "Preparing your packing list...",
      "Finalizing itinerary magic..."
    ];
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
      setGenerationStep(steps[currentStep]);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isGenerating]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTripFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTripSchema) as any,
    defaultValues: {
      budgetTier: "Medium",
      durationDays: 7,
    },
  });

  const onSubmit = async (data: CreateTripFormValues) => {
    setIsGenerating(true);
    setError("");
    setGenerationStep("Analyzing destination and weather...");

    try {
      const token = localStorage.getItem("trao_token");
      
      // Parse interests from comma separated string
      const payload = {
        ...data,
        interests: data.interests.split(",").map((i: string) => i.trim()).filter(Boolean),
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to generate trip");

      router.push(`/trips/${json._id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to generate trip");
      }
      setIsGenerating(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="absolute inset-4 rounded-full bg-secondary/30 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-accent animate-bounce" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-4">Generating Itinerary</h2>
        <p className="text-muted-foreground text-lg max-w-sm animate-pulse">
          {generationStep}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Plan a New Trip</h1>
        <p className="text-muted-foreground mt-1">Tell us where you want to go, and let AI do the heavy lifting.</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-3xl p-6 md:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Map className="w-4 h-4 text-primary" /> Destination
            </label>
            <input
              {...register("destination")}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              placeholder="e.g., Tokyo, Japan"
            />
            {errors.destination && <p className="text-destructive text-xs">{errors.destination.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" /> Start Date
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
              {errors.startDate && <p className="text-destructive text-xs">{errors.startDate.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" /> Duration (Days)
              </label>
              <input
                type="number"
                {...register("durationDays", { valueAsNumber: true })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="7"
                min="1"
                max="30"
              />
              {errors.durationDays && <p className="text-destructive text-xs">{errors.durationDays.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Wallet className="w-4 h-4 text-secondary" /> Budget Tier
            </label>
            <select
              {...register("budgetTier")}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
            >
              <option value="Low">Budget (Hostels, Street Food, Public Transit)</option>
              <option value="Medium">Mid-range (3-4 Star Hotels, Nice Restaurants)</option>
              <option value="High">Luxury (5-Star Hotels, Fine Dining, Private Cars)</option>
            </select>
            {errors.budgetTier && <p className="text-destructive text-xs">{errors.budgetTier.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Heart className="w-4 h-4 text-accent" /> Interests
            </label>
            <input
              {...register("interests")}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              placeholder="e.g., History, Food, Nightlife, Hiking (comma separated)"
            />
            {errors.interests && <p className="text-destructive text-xs">{errors.interests.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-ai-gradient text-white font-medium py-4 rounded-xl shadow-lg hover:shadow-primary/25 hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-5 h-5" />
            Generate Magic Itinerary
          </button>
        </form>
      </motion.div>
    </div>
  );
}
