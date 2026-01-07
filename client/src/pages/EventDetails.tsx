import { useEvent, useDeleteAttendee, useDeleteEvent } from "@/hooks/use-events";
import { Link, useRoute, useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { RegisterAttendeeButton } from "@/components/AttendeeForm";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Calendar, MapPin, Users, Trash2, 
  MoreVertical, Mail, Clock
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function EventDetails() {
  const [match, params] = useRoute("/events/:id");
  const id = parseInt(params?.id || "0");
  const [, setLocation] = useLocation();
  
  const { data: event, isLoading, error } = useEvent(id);
  const deleteEvent = useDeleteEvent();
  const deleteAttendee = useDeleteAttendee(id);

  if (isLoading) return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Event not found</h2>
        <Link href="/" className="text-primary hover:underline">Return to Dashboard</Link>
      </main>
    </div>
  );

  const isFull = event.attendees.length >= event.capacity;

  const handleDeleteEvent = () => {
    deleteEvent.mutate(id, {
      onSuccess: () => setLocation("/")
    });
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto animate-in">
          
          {/* Navigation */}
          <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>

          {/* Event Header Card */}
          <div className="bg-white rounded-3xl p-8 border border-border shadow-sm mb-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                    {event.title}
                  </h1>
                  <div className="flex flex-wrap gap-6 text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-primary" />
                      {format(new Date(event.date), "EEEE, MMMM d, yyyy")}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary" />
                      {format(new Date(event.date), "h:mm a")}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      {event.location}
                    </div>
                  </div>
                </div>

                <AlertDialog>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Event
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{event.title}" and remove all {event.attendees.length} registered attendees. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete Event
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">About Event</h3>
                <p className="text-foreground/80 leading-relaxed max-w-3xl">
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Attendees Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-display font-bold">Attendees</h2>
                <div className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                  {event.attendees.length} / {event.capacity}
                </div>
              </div>
              <RegisterAttendeeButton eventId={event.id} isFull={isFull} />
            </div>

            {/* List */}
            {event.attendees.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
                <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-muted-foreground">No attendees yet</h3>
                <p className="text-sm text-muted-foreground/70">Be the first to register!</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Registered</th>
                      <th className="px-6 py-4 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {event.attendees.map((attendee) => (
                      <tr key={attendee.id} className="group hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">
                          {attendee.name}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 mr-2 opacity-50" />
                            {attendee.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {attendee.registeredAt && format(new Date(attendee.registeredAt), "MMM d, h:mm a")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => deleteAttendee.mutate(attendee.id)}
                            disabled={deleteAttendee.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
