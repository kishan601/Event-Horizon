import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertEvent, type InsertAttendee } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// ============================================
// EVENTS HOOKS
// ============================================

export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path);
      if (!res.ok) throw new Error("Failed to fetch events");
      return api.events.list.responses[200].parse(await res.json());
    },
  });
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: [api.events.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.events.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch event");
      return api.events.get.responses[200].parse(await res.json());
    },
    enabled: !isNaN(id),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertEvent) => {
      // Ensure types are correct for the API (especially date string serialization)
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
        capacity: Number(data.capacity)
      };
      
      const res = await fetch(api.events.create.path, {
        method: api.events.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create event");
      }
      return api.events.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.events.delete.path, { id });
      const res = await fetch(url, { method: api.events.delete.method });
      if (!res.ok) throw new Error("Failed to delete event");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({
        title: "Deleted",
        description: "Event has been removed",
      });
    },
  });
}

// ============================================
// ATTENDEES HOOKS
// ============================================

export function useRegisterAttendee(eventId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InsertAttendee, "eventId">) => {
      const url = buildUrl(api.attendees.create.path, { eventId });
      const res = await fetch(url, {
        method: api.attendees.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to register attendee");
      }
      return api.attendees.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, eventId] });
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] }); // update counts
      toast({
        title: "Registered",
        description: "Attendee successfully registered",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteAttendee(eventId: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.attendees.delete.path, { id });
      const res = await fetch(url, { method: api.attendees.delete.method });
      if (!res.ok) throw new Error("Failed to remove attendee");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.events.get.path, eventId] });
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      toast({
        title: "Removed",
        description: "Attendee removed from list",
      });
    },
  });
}
