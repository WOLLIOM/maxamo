"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Textarea } from "./Field";
import { Turnstile, turnstileEnabled } from "./Turnstile";
import { sendContact } from "@/lib/email";
import { site } from "@/lib/site";

const schema = z.object({
  name: z.string().min(2, "Please tell us your name."),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().optional(),
  subject: z.string().min(2, "Add a subject."),
  message: z.string().min(10, "A little more detail, please."),
});

type Values = z.infer<typeof schema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);
  const [token, setToken] = useState<string | null>(turnstileEnabled ? null : "dev");

  async function onSubmit(values: Values) {
    setFailed(false);
    if (!token) {
      setFailed(true);
      return;
    }
    try {
      await sendContact({ ...values, "cf-turnstile-response": token, to: site.email });
      setSent(true);
      reset();
    } catch {
      setFailed(true);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-line/60 bg-surface/40 p-10 text-center"
      >
        <span className="font-jp text-4xl text-accent">謝</span>
        <h2 className="mt-4 font-serif text-3xl text-ink">Message sent</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          Thank you for writing. We&apos;ll reply within one business day.
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-[0.7rem] uppercase tracking-wider2 text-accent"
        >
          Send another message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input id="c-name" label="Name" autoComplete="name" {...register("name")} error={errors.name?.message} />
        <Input id="c-email" label="Email" type="email" autoComplete="email" {...register("email")} error={errors.email?.message} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input id="c-phone" label="Phone" type="tel" optional autoComplete="tel" {...register("phone")} error={errors.phone?.message} />
        <Input id="c-subject" label="Subject" {...register("subject")} error={errors.subject?.message} />
      </div>
      <Textarea
        id="c-message"
        label="Message"
        placeholder="How can we help?"
        {...register("message")}
        error={errors.message?.message}
      />

      <Turnstile onVerify={setToken} />

      <AnimatePresence>
        {failed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-sm text-accent"
          >
            Something went wrong. Please try again or email {site.email}.
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-accent px-9 py-4 text-[0.72rem] uppercase tracking-wider2 text-bg transition-all duration-500 hover:brightness-110 disabled:opacity-60"
      >
        {isSubmitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
