import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, LoadingState } from "@/components/common";
import { AdminPageHeader } from "@/features/admin/components/AdminPageHeader";
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar";
import { MonthView } from "@/features/calendar/components/MonthView";
import { DayColumns } from "@/features/calendar/components/DayColumns";
import { WeekSchedule } from "@/features/calendar/components/WeekSchedule";
import { CalendarEventDialog } from "@/features/calendar/components/CalendarEventDialog";
import { AvailabilityPanel } from "@/features/calendar/components/AvailabilityPanel";
import { CapacityPanel } from "@/features/calendar/components/CapacityPanel";
import { buildDayIndex } from "@/features/calendar/lib/day-index";
import {
  shiftAnchor,
  toKey,
  viewDays,
  viewRange,
  viewTitle,
} from "@/features/calendar/lib/calendar-range";
import {
  useCalendarRange,
  useCapacitySettings,
  useCreateAvailabilityBlock,
  useCreateCalendarEvent,
  useCreateCapacitySetting,
  useDeleteAvailabilityBlock,
  useDeleteCalendarEvent,
  useDeleteCapacitySetting,
  useUpdateCalendarEvent,
  useUpdateCapacitySetting,
} from "@/features/calendar/hooks/useCalendar";
import type { CalendarView } from "@/features/calendar/types";

const key = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Calendar admin module: production schedule, availability and capacity.
 * All data access lives in the calendar feature — the route only mounts this.
 */
export function CalendarManager() {
  const [view, setView] = useState<CalendarView>("month");
  const [anchor, setAnchor] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogDate, setDialogDate] = useState(new Date());
  // Per-day expand/collapse state for the week schedule. Reset whenever a new
  // week is opened so the default collapsed behaviour is preserved.
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  const range = viewRange(view, anchor);
  const days = useMemo(() => viewDays(view, anchor), [view, anchor]);
  const { data, isPending, error } = useCalendarRange(key(range.start), key(range.end));
  const dayIndex = useMemo(() => buildDayIndex(data), [data]);

  // Availability + capacity tabs work on a wide, view-independent window.
  const today = new Date();
  const settings = useCalendarRange(key(today), key(addDays(today, 365)));
  const capacity = useCapacitySettings();

  useEffect(() => {
    setExpandedDays({});
  }, [view, toKey(range.start)]);

  const setAllDays = (value: boolean) =>
    setExpandedDays(Object.fromEntries(days.map((day) => [toKey(day), value])));

  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const createBlock = useCreateAvailabilityBlock();
  const deleteBlock = useDeleteAvailabilityBlock();
  const createCapacity = useCreateCapacitySetting();
  const updateCapacity = useUpdateCapacitySetting();
  const deleteCapacity = useDeleteCapacitySetting();

  const editingEvent = data?.events.find((event) => event.id === editingId) ?? null;

  const openNew = (date: Date) => {
    setEditingId(null);
    setDialogDate(date);
    setDialogOpen(true);
  };

  return (
    <>
      <AdminPageHeader
        title="Calendar"
        description="Production schedule, collections, deliveries and availability in one planner."
      />

      <Tabs defaultValue="schedule" className="mt-6">
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="mt-6 space-y-4">
          <CalendarToolbar
            title={viewTitle(view, anchor)}
            view={view}
            onViewChange={setView}
            onPrev={() => setAnchor((current) => shiftAnchor(view, current, -1))}
            onNext={() => setAnchor((current) => shiftAnchor(view, current, 1))}
            onToday={() => setAnchor(new Date())}
            action={
              <div className="flex items-center gap-2">
                {view === "week" && (
                  <div className="hidden items-center gap-1 sm:flex">
                    <Button variant="ghost" size="sm" onClick={() => setAllDays(true)}>
                      Expand all
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setAllDays(false)}>
                      Collapse all
                    </Button>
                  </div>
                )}
                <Button size="sm" onClick={() => openNew(anchor)}>
                  <Plus className="mr-1 h-4 w-4" /> New event
                </Button>
              </div>
            }
          />

          {isPending && <LoadingState label="Loading calendar…" />}
          {error && (
            <EmptyState message={`Could not load the calendar — ${error.message}`} />
          )}

          {!isPending &&
            !error &&
            (view === "month" ? (
              <MonthView
                days={days}
                anchor={anchor}
                dayIndex={dayIndex}
                onSelectDay={openNew}
                onSelectEvent={(id) => {
                  setEditingId(id);
                  setDialogOpen(true);
                }}
              />
            ) : view === "week" ? (
              <WeekSchedule
                days={days}
                dayIndex={dayIndex}
                expanded={expandedDays}
                onToggleDay={(key) =>
                  setExpandedDays((current) => ({ ...current, [key]: !current[key] }))
                }
                onSelectDay={openNew}
                onEditEvent={(id) => {
                  setEditingId(id);
                  setDialogOpen(true);
                }}
                onDeleteEvent={(id) => deleteEvent.mutate(id)}
              />
            ) : (
              <DayColumns
                days={days}
                dayIndex={dayIndex}
                onSelectDay={openNew}
                onSelectEvent={(id) => {
                  setEditingId(id);
                  setDialogOpen(true);
                }}
              />
            ))}
        </TabsContent>

        <TabsContent value="availability" className="mt-6">
          <AvailabilityPanel
            blocks={settings.data?.blocks}
            loading={settings.isPending}
            saving={createBlock.isPending}
            onCreate={(values) => createBlock.mutate(values)}
            onDelete={(id) => deleteBlock.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="capacity" className="mt-6">
          <CapacityPanel
            settings={capacity.data}
            loading={capacity.isPending}
            saving={createCapacity.isPending}
            onCreate={(values) => createCapacity.mutate(values)}
            onUpdate={(id, values) => updateCapacity.mutate({ id, values })}
            onDelete={(id) => deleteCapacity.mutate(id)}
          />
        </TabsContent>
      </Tabs>

      <CalendarEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDate={dialogDate}
        event={editingEvent}
        saving={createEvent.isPending || updateEvent.isPending}
        onSubmit={(values) => {
          if (editingEvent) updateEvent.mutate({ id: editingEvent.id, values });
          else createEvent.mutate(values);
          setDialogOpen(false);
        }}
        onDelete={(id) => {
          deleteEvent.mutate(id);
          setDialogOpen(false);
        }}
      />
    </>
  );
}
