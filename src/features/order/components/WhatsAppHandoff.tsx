import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import { whatsappAppUrl, whatsappUrl } from "../lib/whatsapp";

type WhatsAppHandoffProps = {
  message: string;
  onEdit: () => void;
};

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  }
}

export function WhatsAppHandoff({ message, onEdit }: WhatsAppHandoffProps) {
  const [isFramed, setIsFramed] = useState(false);

  useEffect(() => {
    setIsFramed(window.top !== window);
  }, []);

  const href = isFramed ? whatsappAppUrl(message) : whatsappUrl(message);

  const handleCopy = async () => {
    const copied = await copyText(message);
    if (copied) {
      toast.success("Order details copied");
    } else {
      toast.error("Couldn't copy automatically. Please select and copy the details manually.");
    }
  };

  return (
    <div className="surface-card rounded-3xl p-6 text-center sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Check className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-xl sm:text-2xl">Your request is ready</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
        Open WhatsApp to send your saved request to {BRAND.name}.
      </p>

      {isFramed && (
        <p className="mx-auto mt-3 max-w-md text-xs text-muted-foreground">
          WhatsApp Web blocks embedded editor previews. This button opens the installed WhatsApp app;
          use Copy order details if the app is unavailable.
        </p>
      )}

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Button asChild className="h-12 rounded-full">
          <a
            href={href}
            {...(!isFramed ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
            Open WhatsApp
          </a>
        </Button>
        <Button type="button" variant="outline" className="h-12 rounded-full" onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
          Copy order details
        </Button>
      </div>

      <Button type="button" variant="ghost" className="mt-4" onClick={onEdit}>
        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
        Edit details
      </Button>
    </div>
  );
}