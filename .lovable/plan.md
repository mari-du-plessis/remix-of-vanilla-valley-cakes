## Goal

Stop asking the customer to re-send the inspiration photo on WhatsApp. Instead, when they pick a photo, upload it in the background and include a tappable link in the WhatsApp order message so you can open the image straight from the chat.

## Why a link instead of an inline image

WhatsApp's `wa.me` deep-link only carries text — there's no way for a website to pre-attach an image to that message. The standard fix used by quote/order forms is to upload the photo and drop a link to it into the text.

## What changes

1. **Enable Lovable Cloud** — needed for file storage. (Free, no external setup.)
2. **Create a public `inspiration-photos` storage bucket** with insert-anyone / read-anyone policies (it's a one-off image the customer chose to share, and the link needs to open without login on your phone).
3. **Order form (`src/routes/order.tsx`):**
   - Keep the existing file picker, but actually hold the `File` object in state (currently only the filename is stored).
   - Show a small thumbnail preview after selection so the customer knows it was attached.
   - On Send:
     - If a photo was chosen, upload it to `inspiration-photos/{timestamp}-{safe-name}` and grab its public URL.
     - Replace the current `"will send separately"` line with `*Inspiration photo:* <public URL>` in the WhatsApp message.
     - Show a brief "Uploading photo…" toast and disable the Send button while uploading; if upload fails, fall back to the old "send separately" wording so the order still goes through.
   - Remove the "We'll ask you to share this photo on WhatsApp after submitting" helper text.

## Out of scope

- No order database, no admin dashboard — orders still flow through WhatsApp exactly as today.
- No image resizing/compression (can add later if phone uploads feel slow).
- No auth on uploads; the bucket only accepts images and is only written to from the order form.
