// src/components/GoalCalendar.tsx
/**
 * GoalCalendar — Componente de calendario visual para la selección de fecha objetivo.
 *
 * - Recibe el estado del calendario del hook `useCalendar` (ya calculado con useMemo).
 * - Soporta Dark Mode / Light Mode vía `useAppTheme`.
 * - La cuadrícula de días usa width:'14.28%' (1/7) con aspectRatio:1 para
 *   celdas cuadradas responsivas sin calcular px manualmente.
 * - Los días pasados se muestran con opacidad reducida y están deshabilitados.
 * - El día de hoy tiene un borde de color marca si no está seleccionado.
 * - El día seleccionado tiene fondo de color marca y texto blanco.
 */
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CalendarDay, UseCalendarReturn, WEEK_DAYS_ES } from "../hooks/useCalendar";
import { useAppTheme } from "../hooks/useAppTheme";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CalendarioMetaProps {
  /** Estado y handlers calculados por useCalendar */
  calendar: UseCalendarReturn;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CalendarioMeta: React.FC<CalendarioMetaProps> = ({ calendar }) => {
  const { current_colors } = useAppTheme();
  const {
    monthLabel,
    calendarDays,
    canGoPrev,
    goToPrevMonth,
    goToNextMonth,
    selectDay,
  } = calendar;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: current_colors.background,
          borderColor: current_colors.border,
        },
      ]}
    >
      {/* ── Navegación de mes ──────────────────────────────────── */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, { opacity: canGoPrev ? 1 : 0.25 }]}
          onPress={goToPrevMonth}
          disabled={!canGoPrev}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Text style={[styles.navArrow, { color: current_colors.brand }]}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={[styles.monthLabel, { color: current_colors.textPrimary }]}>
          {monthLabel}
        </Text>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={goToNextMonth}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.6}
        >
          <Text style={[styles.navArrow, { color: current_colors.brand }]}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Encabezados de día de semana ──────────────────────── */}
      <View style={styles.weekHeader}>
        {WEEK_DAYS_ES.map((label) => (
          <Text
            key={label}
            style={[styles.weekDayLabel, { color: current_colors.textSecondary }]}
          >
            {label}
          </Text>
        ))}
      </View>

      {/* ── Cuadrícula de días ─────────────────────────────────── */}
      <View style={styles.daysGrid}>
        {calendarDays.map((day: CalendarDay, index: number) => {
          // Celda de relleno vacía (antes del primer día del mes)
          if (!day.isCurrentMonth || day.day === 0) {
            return <View key={`pad-${index}`} style={styles.dayCell} />;
          }

          const isDisabled = day.isPast;

          // Colores dinámicos según estado del día
          const bgColor = day.isSelected
            ? current_colors.brand
            : day.isToday
            ? current_colors.iconBackground
            : "transparent";

          const textColor = day.isSelected
            ? "#FFFFFF"
            : isDisabled
            ? current_colors.textSecondary
            : current_colors.textPrimary;

          const hasTodayBorder = day.isToday && !day.isSelected;

          return (
            <TouchableOpacity
              key={`day-${day.day}-${index}`}
              style={[
                styles.dayCell,
                styles.dayBtnBase,
                {
                  backgroundColor: bgColor,
                  borderColor: hasTodayBorder
                    ? current_colors.brand
                    : "transparent",
                  borderWidth: hasTodayBorder ? 1.5 : 0,
                  opacity: isDisabled ? 0.35 : 1,
                },
              ]}
              onPress={() => selectDay(day)}
              disabled={isDisabled}
              activeOpacity={0.65}
            >
              <Text
                style={[
                  styles.dayText,
                  {
                    color: textColor,
                    fontWeight:
                      day.isToday || day.isSelected ? "700" : "400",
                  },
                ]}
              >
                {day.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  // Navegación mes anterior / siguiente
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  navArrow: {
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 34,
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  // Encabezados Lu Ma Mi…
  weekHeader: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekDayLabel: {
    // Cada columna ocupa 1/7 del ancho — igual que las celdas de día
    width: "14.28%",
    textAlign: "center",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    paddingVertical: 2,
  },
  // Cuadrícula (flexWrap para las 7 columnas)
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  // Base de cada celda: 1/7 del ancho × cuadrada
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 1,
  },
  // Capa adicional para el fondo con bordes redondeados
  dayBtnBase: {
    borderRadius: 100, // Círculo perfecto
  },
  dayText: {
    fontSize: 13,
    textAlign: "center",
  },
});
