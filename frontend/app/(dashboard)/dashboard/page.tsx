"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Loader2, ArrowRight, Trash2 } from "lucide-react";

interface Trip {
  _id: string;
  destination: string;
  startDate: string;
  durationDays: number;
  budgetTier: string;
}

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const token = localStorage.getItem("trao_token");
        const res = await fetch("http://localhost:5000/api/trips", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch trips");
        }

        const data = await res.json();
        setTrips(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch trips");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const handleDeleteTrip = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      const token = localStorage.getItem("trao_token");
      const res = await fetch(`http://localhost:5000/api/trips/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setTrips((prevTrips) => prevTrips.filter((trip) => trip._id !== id));
      } else {
        alert("Failed to delete trip");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete trip");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Your Trips</h1>
          <p className="text-muted-foreground mt-1">Manage and view your AI-generated itineraries.</p>
        </div>
      </div>

      {trips.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No trips yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            You haven&apos;t planned any trips yet. Generate your first AI itinerary to get started!
          </p>
          <Link
            href="/create-trip"
            className="bg-primary text-white font-medium px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
          >
            Create New Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={trip._id}
              className="group relative glass-card p-6 flex flex-col hover:shadow-[0_8px_32px_0_rgba(233,69,96,0.15)] transition-all hover:-translate-y-1"
            >
              {/* Passport Stamp Decoration */}
              <div className="absolute top-6 right-6 border-4 border-primary/20 rounded-full w-24 h-24 flex items-center justify-center rotate-12 opacity-50 pointer-events-none mix-blend-screen">
                <div className="border border-primary/20 rounded-full w-20 h-20 flex flex-col items-center justify-center text-primary/30 uppercase text-[10px] font-bold text-center leading-tight tracking-widest">
                  <span>Aurora</span>
                  <MapPin className="w-4 h-4 my-0.5 opacity-50" />
                  <span>Entry</span>
                </div>
              </div>

              {/* Header */}
              <div className="mb-6 z-10 border-b-2 border-dashed border-border/50 pb-4 relative">
                <button
                  onClick={(e) => handleDeleteTrip(e, trip._id)}
                  className="absolute right-0 top-0 text-muted-foreground hover:text-destructive transition-colors p-1 z-20"
                  title="Delete Trip"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-black uppercase tracking-wider text-foreground mb-1 pr-8">
                  {trip.destination}
                </h3>
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <span>TRP-{trip._id.substring(0, 6)}</span>
                  <span>•</span>
                  <span>V-01</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 flex flex-col z-10">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Departure</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Duration</p>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="w-4 h-4 text-secondary" />
                      <span>{trip.durationDays} Days</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/30">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded border border-primary/20">
                    {trip.budgetTier}
                  </span>
                  
                  <Link
                    href={`/trips/${trip._id}`}
                    className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors"
                  >
                    View Visa
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
