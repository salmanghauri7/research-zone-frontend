import { Toaster as SonnerToaster } from "sonner";

export { toast } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      closeButton
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border border-border shadow-lg rounded-xl",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
    />
  );
}
