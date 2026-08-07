## Goal

Make the WhatsApp hand-off reliable from both the embedded preview and the published site without changing order persistence or message content.

## Confirmed cause

**Do I know what the issue is? Yes.**

- The order page is currently running inside a cross-origin Lovable preview iframe, not as the browser's top-level page.
- `wa.me` redirects to `api.whatsapp.com`. WhatsApp's response explicitly restricts `frame-ancestors` to WhatsApp-owned origins, so loading that destination in the preview frame is rejected as `ERR_BLOCKED_BY_RESPONSE`.
- The supplied DevTools message confirms the popup is inheriting the preview iframe's sandbox. WhatsApp also sends `Cross-Origin-Opener-Policy: same-origin-allow-popups`; Chromium therefore refuses to load that cross-origin document in the sandboxed popup.
- The current helper creates and clicks a hidden anchor only after uploads and the order save finish. By then the original trusted button activation has expired, so this synthetic click cannot reliably escape embedded/sandboxed preview handling.
- Changing among `web.whatsapp.com`, `wa.me`, and `api.whatsapp.com` cannot solve the frame restriction; `wa.me` redirects to the same restricted page.

## Fix

1. **Use a two-stage hand-off**
   - Keep the first button responsible for validation, uploads, and saving the order.
   - After completion, show a concise success/hand-off state with a real, visible **Open WhatsApp** link.
   - The customer's second click is a fresh trusted browser action. Outside the editor frame, it opens the canonical WhatsApp link normally.

2. **Handle the embedded preview explicitly**
   - Detect whether the app is framed (`window.top !== window`).
   - In a top-level/published page, render the canonical WhatsApp link normally in a new tab.
   - In the embedded preview, do not create another sandboxed web popup. Offer an installed-app hand-off using the `whatsapp://send` protocol and make the copy fallback prominent.
   - Explain briefly in the hand-off state that WhatsApp Web blocks editor previews and that the direct/published site is the correct place to test WhatsApp Web.

3. **Remove the synthetic hidden-link workaround**
   - Keep one canonical `wa.me/<number>?text=<encoded message>` URL builder.
   - Add a dedicated installed-app URL builder for framed previews.
   - Render URLs directly on anchor-based buttons rather than calling `a.click()` or delayed `window.open()`.

4. **Add a resilient fallback**
   - Include **Copy order details** beside the hand-off link so customers can paste the already-generated message into WhatsApp if their browser, preview host, or app association still blocks external navigation.
   - Preserve the saved order reference in both the WhatsApp text and copied text.

5. **Preserve existing behavior**
   - No database changes.
   - No changes to message generation, order creation, photo upload, or WhatsApp number.
   - Keep mobile app hand-off and desktop WhatsApp Web selection under WhatsApp's own `wa.me` redirect.

## Verification

- Complete an order inside the embedded preview and confirm saving finishes before the hand-off appears.
- In the embedded preview, verify the button attempts the installed WhatsApp app rather than opening `api.whatsapp.com` in a sandboxed popup.
- Verify the copy fallback contains the complete message and order reference.
- Repeat from a direct top-level/published-style page and confirm `wa.me` opens WhatsApp Web normally.
- Check mobile-sized and desktop layouts, popup-blocked behavior, and duplicate-click prevention.

## Limitation

The app cannot override either the editor iframe's sandbox flags or WhatsApp's `frame-ancestors`/COOP headers. WhatsApp Web therefore cannot be made to render inside this editor preview. The reliable application-side behavior is: installed-app protocol plus copy fallback while framed, and the normal `wa.me` web hand-off when the site is opened directly or published.
