import type { Task } from "./apptypes";

export
function formatDateTime(timestamp?: number) {
  if (!timestamp) return "";

  return `${new Date(timestamp).toLocaleDateString("de-DE")} um ${new Date(
    timestamp
  ).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  })} Uhr`;
}
export
function getStartOfDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
export
function getEndOfDay(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offset);
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}
export
function getTodayDay() {
  const jsDay = new Date().getDay();

  const dayMap: Record<number, string> = {
    0: "So",
    1: "Mo",
    2: "Di",
    3: "Mi",
    4: "Do",
    5: "Fr",
    6: "Sa",
  };

  return dayMap[jsDay];
}
export
function getTomorrowDay() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const jsDay = tomorrow.getDay();

  const dayMap: Record<number, string> = {
    0: "So",
    1: "Mo",
    2: "Di",
    3: "Mi",
    4: "Do",
    5: "Fr",
    6: "Sa",
  };

  return dayMap[jsDay];
}
export
function getTaskDayDateLabel(day: string) {
  const order = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const targetIndex = order.indexOf(day);

  if (targetIndex === -1) return day;

  const date = new Date();
  const todayIndex = date.getDay();

  const diff = (targetIndex - todayIndex + 7) % 7;

  date.setDate(date.getDate() + diff);

  return `${day} ${date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })}`;
}
export
function getCalendarDateForDay(day: string) {
  const order = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const targetIndex = order.indexOf(day);

  if (targetIndex === -1) return new Date();

  const date = new Date();
  const todayIndex = date.getDay();
  const diff = (targetIndex - todayIndex + 7) % 7;

  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);

  return date;
}
export
function getCalendarDateLabel(day: string) {
  const date = getCalendarDateForDay(day);

  return `${day} ${date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })}`;
}
export
function shouldTaskBeMissed(task: Task) {
  if (task.status !== "offen") return false;

  const order = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const today = getTodayDay();

  const taskIndex = order.indexOf(task.day);
  const todayIndex = order.indexOf(today);

  if (taskIndex === -1 || todayIndex === -1) return false;

  return taskIndex < todayIndex;
}
export
function isTaskForToday(task: Task) {
  return task.day === getTodayDay();
}