import { createFileRoute } from "@tanstack/react-router";
import { CalendarManager } from "@/features/admin/calendar/CalendarManager";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Vanilla Valley Admin" },
      {
        name: "description",
        content:
          "Production schedule, collections, deliveries, blocked dates and daily capacity for the bakery.",
      },
      { property: "og:title", content: "Calendar — Vanilla Valley Admin" },
      {
        property: "og:description",
        content: "Plan bakery production, availability and daily capacity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CalendarManager,
});
