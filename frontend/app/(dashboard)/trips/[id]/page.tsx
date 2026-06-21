"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

import { motion } from "framer-motion";
import {
  MapPin, Calendar, Clock, Loader2, DollarSign, Bed, Star, AlertCircle, Sparkles, Trash2, CheckCircle2, Circle
} from "lucide-react";

interface Activity {
  title: string;
  description: string;
  estimatedCostUSD: number;
  timeOfDay: string;
}

interface DayPlan {
  dayNumber: number;
  activities: Activity[];
}

interface Hotel {
  name: string;
  rating: number;
  pricePerNight: number;
  description: string;
  tier: string;
}

interface Budget {
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  localTransport: number;
  totalCost: number;
}

interface PackingItem {
  item: string;
  reason: string;
  packed: boolean;
}

interface Trip {
  _id: string;
  destination: string;
  startDate: string;
  durationDays: number;
  budgetTier: string;
  itinerary: DayPlan[];
  hotels: Hotel[];
  estimatedBudget: Budget;
  packingList: PackingItem[];
}

export default function TripDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = localStorage.getItem("trao_token");
        const res = await fetch(`http://localhost:5000/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch trip details");
        const data = await res.json();
        setTrip(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch trip details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const refetchTrip = async () => {
    try {
      const token = localStorage.getItem("trao_token");
      const res = await fetch(`http://localhost:5000/api/trips/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePacking = async (index: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem("trao_token");
      
      // Optimistic update
      if (trip) {
        const newTrip = { ...trip };
        newTrip.packingList[index].packed = !currentStatus;
        setTrip(newTrip);
      }

      await fetch(`http://localhost:5000/api/trips/${id}/packing-list`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemIndex: index, packed: !currentStatus })
      });
    } catch (err) {
      console.error(err);
      refetchTrip(); // Revert on error
    }
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    const promptOverride = prompt(`What changes would you like for Day ${dayNumber}? (e.g., "More museums, less shopping")`);
    if (!promptOverride) return;

    setRegeneratingDay(dayNumber);
    try {
      const token = localStorage.getItem("trao_token");
      const res = await fetch(`http://localhost:5000/api/trips/${id}/regenerate-day`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dayNumber, promptOverride })
      });
      
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to regenerate day");
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityIndex: number) => {
    if (!confirm("Are you sure you want to remove this activity?")) return;
    
    try {
      const token = localStorage.getItem("trao_token");
      const res = await fetch(`http://localhost:5000/api/trips/${id}/activity/${activityIndex}?dayNumber=${dayNumber}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setTrip(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    try {
      const token = localStorage.getItem("trao_token");
      const res = await fetch(`http://localhost:5000/api/trips/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        router.push("/dashboard");
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

  if (error || !trip) {
    return (
      <div className="text-center mt-20">
        <p className="text-destructive">{error || "Trip not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="bg-ai-gradient rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{trip.destination}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <div className="flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              {new Date(trip.startDate).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              {trip.durationDays} Days
            </div>
            <div className="flex items-center gap-1 bg-black/20 px-3 py-1.5 rounded-full">
              <DollarSign className="w-4 h-4" />
              {trip.budgetTier} Budget
            </div>
            <button 
              onClick={handleDeleteTrip}
              className="flex items-center gap-1 bg-destructive/80 hover:bg-destructive text-white px-4 py-1.5 rounded-full transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              Delete Trip
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="text-primary w-6 h-6" /> Your Itinerary
            </h2>
            
            <div className="relative border-l-2 border-primary/20 ml-4 pl-8 space-y-12 py-4">
              {trip.itinerary.map((day, dayIdx) => (
                <div key={day.dayNumber} className="relative">
                  {/* Timeline Node for the Day */}
                  <div className="absolute -left-[41px] top-1 w-6 h-6 rounded-full bg-background border-4 border-primary shadow-[0_0_15px_rgba(233,69,96,0.5)] z-10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  </div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: dayIdx * 0.1 }}
                    className="glass-card rounded-2xl p-6 relative overflow-hidden"
                  >
                    {regeneratingDay === day.dayNumber && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          Regenerating Day {day.dayNumber}...
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/30">
                      <h3 className="text-2xl font-black uppercase tracking-wider text-foreground">Day {day.dayNumber}</h3>
                      <button 
                        onClick={() => handleRegenerateDay(day.dayNumber)}
                        className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-accent hover:bg-accent/10 px-3 py-1.5 rounded-full transition-colors border border-accent/20"
                      >
                        <Sparkles className="w-3 h-3" /> Regenerate
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="flex gap-4 group relative">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-secondary shadow-[0_0_10px_rgba(255,209,102,0.5)] mt-1.5 z-10" />
                            {idx !== day.activities.length - 1 && <div className="absolute top-3 bottom-[-24px] left-[5px] w-0.5 bg-border/50" />}
                          </div>
                          <div className="flex-1 bg-background/40 border border-white/5 rounded-xl p-4 relative hover:bg-background/60 transition-colors">
                            <button 
                              onClick={() => handleRemoveActivity(day.dayNumber, idx)}
                              className="absolute top-4 right-4 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">{activity.timeOfDay}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-background/50 px-2 py-0.5 rounded border border-border/50">${activity.estimatedCostUSD}</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-1">{activity.title}</h4>
                            <p className="text-muted-foreground text-sm">{activity.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          
          {/* Packing List */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-accent" /> AI Packing List
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Weather-aware suggestions for {trip.destination}.</p>
            <div className="space-y-3">
              {trip.packingList.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-3 cursor-pointer group"
                  onClick={() => handleTogglePacking(idx, item.packed)}
                >
                  <div className="mt-0.5 text-primary">
                    {item.packed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />}
                  </div>
                  <div>
                    <p className={`font-medium text-sm transition-all ${item.packed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.item}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-secondary" /> Est. Budget
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Flights</span> <span className="font-medium">${trip.estimatedBudget.flights}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accommodation</span> <span className="font-medium">${trip.estimatedBudget.accommodation}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Food</span> <span className="font-medium">${trip.estimatedBudget.food}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Activities</span> <span className="font-medium">${trip.estimatedBudget.activities}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transport</span> <span className="font-medium">${trip.estimatedBudget.localTransport}</span></div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span> <span className="text-primary">${trip.estimatedBudget.totalCost}</span>
              </div>
            </div>
          </div>

          {/* Hotels */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bed className="w-5 h-5 text-primary" /> Hotel Suggestions
            </h3>
            <div className="space-y-4">
              {trip.hotels.map((hotel, idx) => (
                <div key={idx} className="border-b border-border last:border-0 pb-4 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm">{hotel.name}</h4>
                    <span className="text-xs font-medium text-secondary">${hotel.pricePerNight}/nt</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-xs text-muted-foreground">{hotel.rating} Rating · {hotel.tier}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{hotel.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
