import { useEvents } from "@/hooks/use-events";
import { Link } from "wouter";
import { Calendar, MapPin, Users, ChevronRight, Search } from "lucide-react";
import { CreateEventButton } from "@/components/EventForm";
import { format } from "date-fns";
import { Sidebar } from "@/components/Sidebar";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const { data: events, isLoading, error } = useEvents();
  const [search, setSearch] = useState("");

  const filteredEvents = events?.filter(event => 
    event.title.toLowerCase().includes(search.toLowerCase()) ||
    event.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Overview of your upcoming events.
              </p>
            </div>
            <CreateEventButton />
          </div>

          {/* Search & Filter */}
          <div className="relative animate-in stagger-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search events by name or location..." 
              className="pl-12 py-6 text-lg rounded-2xl bg-white border-border/50 shadow-sm focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Content Area */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-3xl bg-destructive/5 border border-destructive/20 text-destructive">
              <h3 className="text-xl font-bold">Failed to load events</h3>
              <p className="mt-2">Please try refreshing the page.</p>
            </div>
          ) : filteredEvents?.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-muted/30 border border-dashed border-border flex flex-col items-center justify-center animate-in stagger-2">
              <Calendar className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold text-foreground">No events found</h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-sm mx-auto">
                Get started by creating your first event. It only takes a few seconds.
              </p>
              <CreateEventButton />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in stagger-2">
              {filteredEvents?.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block group h-full">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-card h-full rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                          Upcoming
                        </span>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      
                      <h3 className="text-xl font-bold font-display mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                        {event.description}
                      </p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-border/50">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {format(new Date(event.date), "MMMM d, yyyy")}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          {event.attendeeCount} / {event.capacity}
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${Math.min((event.attendeeCount / event.capacity) * 100, 100)}%` }} 
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
