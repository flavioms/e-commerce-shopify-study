import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { getContacts } from "@/lib/contentstack-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const revalidate = 60; // ISR

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Reach out to the flavio-commerce team closest to you.",
};

export default async function ContactPage() {
  const contacts = await getContacts();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-2 font-heading text-2xl font-semibold tracking-tight text-foreground">
        Contact us
      </h1>
      <p className="mb-8 max-w-xl text-sm text-muted-foreground">
        Reach out to the team closest to you — we typically reply within one business day.
      </p>

      {contacts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Contact information isn&apos;t available right now.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {contacts.map((contact) => (
            <Card key={contact.uid}>
              <CardHeader>
                <CardTitle>{contact.title}</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                {contact.address && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <address className="whitespace-pre-line not-italic">{contact.address}</address>
                  </div>
                )}

                {contact.contact_number?.map((number) => (
                  <Link
                    key={number}
                    href={`tel:+${number}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Phone className="size-4 shrink-0" aria-hidden="true" />+{number}
                  </Link>
                ))}

                {contact.email_address && (
                  <Link
                    href={`mailto:${contact.email_address}`}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    {contact.email_address}
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
