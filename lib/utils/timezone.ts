import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { parseISO, format } from "date-fns";

// Zona horaria de México (America/Mexico_City)
export const MEXICO_TIMEZONE = "America/Mexico_City";

/**
 * Obtiene la zona horaria del usuario desde el navegador
 */
export function getUserTimeZone(): string {
  if (typeof window !== "undefined") {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return MEXICO_TIMEZONE; // Fallback para servidor
}

/**
 * Convierte una fecha/hora de México a UTC
 */
export function mexicoToUTC(date: Date): Date {
  return zonedTimeToUtc(date, MEXICO_TIMEZONE);
}

/**
 * Convierte una fecha/hora de UTC a México
 */
export function utcToMexico(date: Date | string): Date {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return utcToZonedTime(dateObj, MEXICO_TIMEZONE);
}

/**
 * Formatea una fecha en la zona horaria de México
 */
export function formatInMexico(
  date: Date | string,
  formatStr: string = "PPp"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(dateObj, MEXICO_TIMEZONE, formatStr);
}

/**
 * Formatea una fecha en la zona horaria del usuario
 */
export function formatInUserTimeZone(
  date: Date | string,
  formatStr: string = "PPp"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const userTz = getUserTimeZone();
  return formatInTimeZone(dateObj, userTz, formatStr);
}

/**
 * Crea una fecha en hora de México a partir de una fecha y hora local
 */
export function createMexicoDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): Date {
  // Crear fecha en hora local primero
  const localDate = new Date(year, month, day, hour, minute, 0, 0);
  // Convertir a UTC considerando que es hora de México
  return zonedTimeToUtc(localDate, MEXICO_TIMEZONE);
}

/**
 * Obtiene la hora actual en México
 */
export function getMexicoNow(): Date {
  return utcToZonedTime(new Date(), MEXICO_TIMEZONE);
}



