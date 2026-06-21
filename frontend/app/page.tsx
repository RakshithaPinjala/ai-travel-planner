"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Map, Calendar, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center relative pb-20">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent/20 blur-[100px] pointer-events-none" />

      {/* Navbar Placeholder */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10 absolute top-0">
        <div className="flex items-center gap-2">
          <Map className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">
            Aurora Travel
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-6 mt-32 z-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-medium text-white/80">
            Powered by Gemini 2.5 Flash
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6"
        >
          Plan your dream trip in{" "}
          <span className="text-ai-gradient">seconds</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl"
        >
          Generate personalized itineraries, estimate budgets, get hotel
          recommendations, and receive weather-aware packing lists—all powered by
          advanced AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/register"
            className="group flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-medium transition-all"
          >
            Start Planning For Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          {[
            {
              title: "Smart Itineraries",
              description: "Day-by-day plans tailored to your exact interests.",
              icon: <Calendar className="w-6 h-6 text-primary" />,
            },
            {
              title: "Smart Budgets",
              description: "Realistic estimates for flights, food, and stays.",
              icon: <Map className="w-6 h-6 text-secondary" />,
            },
            {
              title: "Weather-Aware Packing",
              description: "Never forget an essential with our smart checklist.",
              icon: <Sparkles className="w-6 h-6 text-accent" />,
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm text-left hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
