import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-line bg-surface/40 px-5 py-3.5 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-accent";

function Label({
  htmlFor,
  children,
  optional,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-center gap-2 text-[0.66rem] uppercase tracking-wider2 text-muted"
    >
      {children}
      {optional && <span className="text-faint normal-case tracking-normal">(optional)</span>}
    </label>
  );
}

function Error({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs text-accent">{msg}</p>;
}

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    optional?: boolean;
  }
>(function Input({ label, error, optional, id, className, ...rest }, ref) {
  return (
    <div>
      <Label htmlFor={id!} optional={optional}>
        {label}
      </Label>
      <input
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className={cn(fieldClass, error && "border-accent", className)}
        {...rest}
      />
      <Error msg={error} />
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label: string;
    error?: string;
    optional?: boolean;
  }
>(function Textarea({ label, error, optional, id, className, ...rest }, ref) {
  return (
    <div>
      <Label htmlFor={id!} optional={optional}>
        {label}
      </Label>
      <textarea
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className={cn(fieldClass, "min-h-32 resize-y", error && "border-accent", className)}
        {...rest}
      />
      <Error msg={error} />
    </div>
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    error?: string;
    optional?: boolean;
  }
>(function Select({ label, error, optional, id, className, children, ...rest }, ref) {
  return (
    <div>
      <Label htmlFor={id!} optional={optional}>
        {label}
      </Label>
      <select
        id={id}
        ref={ref}
        aria-invalid={!!error}
        className={cn(fieldClass, error && "border-accent", className)}
        {...rest}
      >
        {children}
      </select>
      <Error msg={error} />
    </div>
  );
});
