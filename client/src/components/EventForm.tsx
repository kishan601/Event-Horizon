import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventSchema, type InsertEvent } from "@shared/schema";
import { useCreateEvent } from "@/hooks/use-events";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Enhance schema for form validation
const formSchema = insertEventSchema.extend({
  date: z.date({ required_error: "A date is required." }),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
});

type FormData = z.infer<typeof formSchema>;

export function CreateEventButton() {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateEvent();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      capacity: 100,
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl bg-card rounded-2xl">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 p-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-primary">Create New Event</DialogTitle>
            <p className="text-muted-foreground mt-1">Fill in the details for your upcoming event.</p>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input 
              id="title" 
              {...form.register("title")} 
              className="input-field border-border bg-muted/30" 
              placeholder="e.g. Annual Tech Conference" 
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 flex flex-col">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-normal input-field h-auto py-3 border-border bg-muted/30",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    {form.watch("date") ? (
                      format(form.watch("date"), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input 
                id="capacity" 
                type="number"
                {...form.register("capacity")} 
                className="input-field border-border bg-muted/30" 
              />
               {form.formState.errors.capacity && (
                <p className="text-sm text-destructive">{form.formState.errors.capacity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              {...form.register("location")} 
              className="input-field border-border bg-muted/30" 
              placeholder="e.g. Convention Center, Hall A" 
            />
             {form.formState.errors.location && (
              <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              {...form.register("description")} 
              className="input-field border-border bg-muted/30 min-h-[100px] resize-none" 
              placeholder="What is this event about?" 
            />
             {form.formState.errors.description && (
              <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
