import { Platform } from 'react-native';

// Importaciones directas para evitar el crash de Expo Go con las notificaciones remotas
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { getAllScheduledNotificationsAsync } from 'expo-notifications/build/getAllScheduledNotificationsAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

let isInitialized = false;

function initNotifications() {
  if (isInitialized) return;
  isInitialized = true;
  
  // Configurar cómo se comportan las notificaciones cuando la app está en primer plano
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
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
  
  if (existingStatus !== 'granted') {
    const { status } = await requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
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
 * Programa notificaciones para una meta en base a los días seleccionados.
 */
export async function scheduleGoalNotifications(
  goalId: string, 
  goalName: string, 
  reminderDays: number[], 
  reminderTimeStr: string // ej. '9:00 a.m.'
) {
  // Primero cancelar anteriores si las hubiera
  await cancelGoalNotifications(goalId);
  
  if (!reminderDays || reminderDays.length === 0) return;

  // Parsear la hora del string (ej. '9:00 a.m.')
  let hour = 9;
  let minute = 0;
  
  try {
    const timeMatch = reminderTimeStr.match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.)/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      minute = parseInt(timeMatch[2], 10);
      const isPm = timeMatch[3].toLowerCase() === 'p.m.';
      
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
      hour = h;
    }
  } catch (e) {
    console.warn("Error parseando hora de recordatorio", e);
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  // Programar una notificación mensual por cada día seleccionado
  for (const day of reminderDays) {
    await scheduleNotificationAsync({
      content: {
        title: '¡Hora de ahorrar! 🐷',
        body: `Recuerda guardar dinero para tu meta: ${goalName}`,
        data: { goalId },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.CALENDAR,
        day,
        hour,
        minute,
        repeats: true, // Se repetirá todos los meses en ese día a esa hora
      },
    });
  }
}
