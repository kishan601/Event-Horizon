import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAttendeeSchema } from "@shared/schema";
import { useRegisterAttendee } from "@/hooks/use-events";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// Schema for form (omitting eventId as it's passed via props/url)
const formSchema = insertAttendeeSchema.omit({ eventId: true }).extend({
  email: z.string().email("Please enter a valid email address"),
});

type FormData = z.infer<typeof formSchema>;

export function RegisterAttendeeButton({ eventId, isFull }: { eventId: number; isFull: boolean }) {
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useRegisterAttendee(eventId);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
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
        <button 
          disabled={isFull}
          className="btn-primary flex items-center gap-2 text-sm px-4 py-2 h-10 disabled:opacity-50 disabled:grayscale"
        >
          {isFull ? "Event Full" : (
            <>
              <UserPlus className="w-4 h-4" />
              Register Attendee
            </>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl bg-card rounded-2xl">
        <div className="bg-gradient-to-r from-accent/10 to-pink-500/10 p-6 border-b border-border/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-accent">Register Attendee</DialogTitle>
            <p className="text-muted-foreground mt-1">Add a new guest to the list.</p>
          </DialogHeader>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              {...form.register("name")} 
              className="input-field border-border bg-muted/30" 
              placeholder="John Doe" 
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email"
              {...form.register("email")} 
              className="input-field border-border bg-muted/30" 
              placeholder="john@example.com" 
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="bg-accent hover:bg-accent/90 text-white">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                "Confirm Registration"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
