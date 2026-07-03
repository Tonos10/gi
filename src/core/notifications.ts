import { Platform } from "react-native";

// Importaciones directas para evitar el crash de Expo Go con las notificaciones remotas
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from "expo-notifications/build/NotificationPermissions";
import { SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { cancelScheduledNotificationAsync } from "expo-notifications/build/cancelScheduledNotificationAsync";
import { getAllScheduledNotificationsAsync } from "expo-notifications/build/getAllScheduledNotificationsAsync";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";

let isInitialized = false;

function initNotifications() {
  if (isInitialized) return;
  isInitialized = true;

  // Configurar cómo se comportan las notificaciones cuando la app está en primer plano
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Solicita permisos de notificación al usuario.
 */
export async function requestNotificationPermissions() {
  initNotifications();

  const { status: existingStatus } = await getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

/**
 * Cancela todas las notificaciones programadas asociadas a una meta.
 * @param goalId ID de la meta
 */
export async function cancelGoalNotifications(goalId: string) {
  const scheduled = await getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.goalId === goalId) {
      await cancelScheduledNotificationAsync(notif.identifier);
    }
  }
}

/**
 * Calcula matemáticamente la próxima fecha válida en el tiempo para un día, hora y minuto dados,
 * manejando casos de borde como días que no existen en el mes actual (ej. 31 de febrero).
 */
function getNextValidDateForDay(
  dayOfMonth: number,
  hour: number,
  minute: number,
): Date {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  // Clampeamos el día al máximo de días del mes actual
  let daysInMonth = new Date(year, month + 1, 0).getDate();
  let clampedDay = Math.min(dayOfMonth, daysInMonth);
  let candidate = new Date(year, month, clampedDay, hour, minute, 0, 0);

  // Si la fecha ya pasó, saltamos al mes siguiente
  if (candidate.getTime() <= now.getTime()) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    daysInMonth = new Date(year, month + 1, 0).getDate();
    clampedDay = Math.min(dayOfMonth, daysInMonth);
    candidate = new Date(year, month, clampedDay, hour, minute, 0, 0);
  }

  return candidate;
}

/**
 * Programa notificaciones para una meta en base a los días seleccionados.
 * Maneja las diferencias entre iOS (calendar trigger) y Android (date trigger calculado).
 */
export async function scheduleMonthlyReminders(
  goalId: string,
  goalName: string,
  days: number[],
  timeStr?: string,
): Promise<void> {
  // Primero cancelar anteriores si las hubiera
  await cancelGoalNotifications(goalId);

  if (!days || days.length === 0) return;

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Configuración por defecto de la hora (09:00 AM)
  let hour = 9;
  let minute = 0;

  if (timeStr) {
    try {
      const timeMatch = timeStr.match(
        /(\d+):(\d+)\s*(a\.m\.|p\.m\.|AM|PM|am|pm)/i,
      );
      if (timeMatch) {
        let h = parseInt(timeMatch[1], 10);
        minute = parseInt(timeMatch[2], 10);
        const isPm = timeMatch[3].toLowerCase().includes("p");

        if (isPm && h < 12) h += 12;
        if (!isPm && h === 12) h = 0;
        hour = h;
      }
    } catch (e) {
      console.warn("Error parseando hora de recordatorio", e);
    }
  }

  for (const day of days) {
    if (Platform.OS === "ios") {
      await scheduleNotificationAsync({
        content: {
          title: "¡Hora de ahorrar! 🐷",
          body: `Recuerda guardar dinero para tu meta: ${goalName}`,
          data: { goalId },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.CALENDAR,
          day,
          hour,
          minute,
          repeats: true,
        },
      });
    } else {
      const nextDate = getNextValidDateForDay(day, hour, minute);

      await scheduleNotificationAsync({
        content: {
          title: "¡Hora de ahorrar! 🐷",
          body: `Recuerda guardar dinero para tu meta: ${goalName}`,
          data: { goalId },
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: nextDate,
        },
      });
    }
  }
}
