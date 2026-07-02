// src/hooks/useCalendar.ts
/**
 * useCalendar — Lógica completa del calendario personalizado.
 *
 * Características clave:
 * - Inicializa en el mes y año actual automáticamente.
 * - Calcula los días exactos del mes usando `new Date(year, month+1, 0)`
 *   → maneja años bisiestos (feb = 28 o 29) y meses de 30/31 días de forma
 *   nativa con el objeto Date de JavaScript, sin librerías externas.
 * - `calendarDays` se genera con `useMemo` para evitar recálculos durante
 *   animaciones del Bottom Sheet (el cálculo solo corre si cambia mes/año/selección).
 * - Semana empieza en Lunes (estándar es-MX).
 * - Previene navegar a meses anteriores al actual.
 */
import { useMemo, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

export const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

/** Encabezados de columna. La semana comienza en Lunes (es-MX). */
export const WEEK_DAYS_ES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarDay {
  /** Número de día (1-31). Si es 0 = celda de relleno vacía. */
  day: number;
  /** false en celdas de relleno del inicio de la fila */
  isCurrentMonth: boolean;
  /** El día ya pasó respecto a hoy → deshabilitado */
  isPast: boolean;
  /** Es el día de hoy */
  isToday: boolean;
  /** El usuario lo tiene seleccionado */
  isSelected: boolean;
}

export interface UseCalendarReturn {
  /** Ej. "Julio 2026" */
  monthLabel: string;
  viewYear: number;
  viewMonth: number;
  /** Array listo para renderizar (incluye celdas vacías de relleno) */
  calendarDays: CalendarDay[];
  /** false si ya estamos en el mes actual (no se puede ir al anterior) */
  canGoPrev: boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  /** Llamado al tocar una celda — ignora días pasados y rellenos */
  selectDay: (day: CalendarDay) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCalendar(
  selectedDate: Date | null,
  onChange: (date: Date) => void,
): UseCalendarReturn {
  // Fecha de hoy normalizada a medianoche para comparaciones exactas
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState<number>(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => today.getMonth());

  const monthLabel = `${MONTHS_ES[viewMonth]} ${viewYear}`;

  // ── Generación de días con useMemo ────────────────────────────────────────
  const calendarDays = useMemo<CalendarDay[]>(() => {
    /**
     * Truco para obtener los días del mes SIN importar si es bisiesto:
     * new Date(year, month+1, 0) → el día 0 del mes siguiente
     *   = el último día del mes actual.
     * Funciona para todos los meses, incluido febrero en años bisiestos.
     */
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    /**
     * getDay() devuelve 0=Dom, 1=Lun … 6=Sáb.
     * Convertimos a semana que empieza en Lunes: 0=Lun … 6=Dom.
     * Fórmula: (día - 1 + 7) % 7
     */
    const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay();
    const firstDayOffset = (rawFirstDay - 1 + 7) % 7;

    const days: CalendarDay[] = [];

    // Celdas de relleno al inicio (antes del primer día del mes)
    for (let i = 0; i < firstDayOffset; i++) {
      days.push({
        day: 0,
        isCurrentMonth: false,
        isPast: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Días reales del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d);
      cellDate.setHours(0, 0, 0, 0);

      const isPast = cellDate < today;
      const isToday = cellDate.getTime() === today.getTime();

      let isSelected = false;
      if (selectedDate !== null) {
        const sel = new Date(selectedDate);
        sel.setHours(0, 0, 0, 0);
        isSelected = cellDate.getTime() === sel.getTime();
      }

      days.push({ day: d, isCurrentMonth: true, isPast, isToday, isSelected });
    }

    return days;
  }, [viewYear, viewMonth, selectedDate, today]);

  // ── Navegación ─────────────────────────────────────────────────────────────

  /** No se puede ir antes del mes actual */
  const canGoPrev =
    viewYear > today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectDay = (day: CalendarDay) => {
    if (!day.isCurrentMonth || day.isPast || day.day === 0) return;
    onChange(new Date(viewYear, viewMonth, day.day));
  };

  return {
    monthLabel,
    viewYear,
    viewMonth,
    calendarDays,
    canGoPrev,
    goToPrevMonth,
    goToNextMonth,
    selectDay,
  };
}
