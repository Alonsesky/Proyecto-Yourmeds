export function nextDailyOccurrence(hour: number, minute: number) {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1); // rueda a mañana
  }
  return next;
}

export function nextByInterval(base: Date, intervalHours: number) {
  const now = new Date();
  let next = new Date(base);
  while (next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + intervalHours * 60 * 60 * 1000);
  }
  return next;
}