## What I found

The code is already correct:

- `src/lib/order-config.ts` → `WHATSAPP_NUMBER = "27784210783"` (your real number, 078 421 0783 in international format)
- `src/routes/order.tsx` reads from this constant — no hardcoded number anywhere else

So the source of truth is right. If a test is still opening WhatsApp with the old number `27812345678`, it's almost certainly one of these three things — none of which need a code change:

### Most likely causes

1. **Browser cache / old preview tab** — The preview tab still has the old JavaScript bundle in memory. Fix: hard refresh the preview (Cmd/Ctrl + Shift + R), or close the preview tab and reopen it.
2. **The app hasn't been republished** — The Published URL currently shows "(not published)". If you've shared a link with someone (or are testing on a different device using an old link), they're seeing the old build. Fix: click Publish so the new number goes live.
3. **WhatsApp itself opened an existing chat thread** — If you previously tapped the old number, WhatsApp may auto-open that chat. Look at the recipient at the top of WhatsApp: if it says `+27 81 234 5678`, that's the cached chat, not a new link. The actual `wa.me` link being generated is correct.

### How to confirm in 10 seconds

1. Hard refresh the preview.
2. Fill in the order form and click Send.
3. Before WhatsApp opens, look at the URL — it should contain `wa.me/27784210783...`. If it does, the app is fine and the issue is on the WhatsApp side (cause #3).

## Plan

No code changes needed unless the verification above shows the URL still contains `27812345678`. If that happens, let me know and I'll dig deeper (could be a service-worker cache or a stale build artifact).

If everything checks out, the next step is just to **Publish** the app so the live link uses the new number.
