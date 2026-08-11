import * as React from "react";

// Minimal Dialog implementation using native <dialog>.
// This repo already contains many ui components; this file was missing in the visible tree.
// If the app already provides a dialog component elsewhere, you can remove this file.

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);

  React.useEffect(() => {
    if (!dialogRef.current) return;
    if (open === undefined) return;
    if (open) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [open]);

  const handleClose = () => {
    onOpenChange?.(false);
  };

  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-black/30"
      onClose={handleClose}
      style={{
        border: "none",
        borderRadius: 12,
        padding: 0,
        width: "min(560px, calc(100vw - 24px))",
      }}
    >
      {children}
    </dialog>
  );
}

export function DialogTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl bg-card p-6 shadow-xl ${className ?? ""}`}>{children}</div>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-3">{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`text-lg font-semibold ${className ?? ""}`}>{children}</h2>;
}

export function DialogDescription({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-sm text-muted-foreground">{children}</p>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>;
}

export function DialogClose({ children }: { children: React.ReactNode }) {
  return <form method="dialog">{children}</form>;
}

