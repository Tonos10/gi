// src/hooks/useGoalImagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';

export interface UseGoalImagePickerReturn {
  photoUri: string | null;
  isLoading: boolean;
  pickImage: () => Promise<void>;
  removeImage: () => void;
}

/**
 * Hook que maneja la selección y eliminación de una foto para la meta.
 * Usa expo-image-picker v56 con la API de permisos integrada.
 *
 * Estrategia de rendimiento:
 * - quality: 0.7  → reduce el tamaño de archivo sin pérdida perceptible
 * - allowsEditing: true → el usuario puede recortar antes de confirmar
 * - exifData desactivado → no cargamos metadata innecesaria
 */
export function useGoalImagePicker(): UseGoalImagePickerReturn {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = useCallback(async () => {
    try {
      setIsLoading(true);

      // En iOS necesitamos pedir permisos explícitos.
      // En Android (API >= 33) expo-image-picker los maneja internamente.
      if (Platform.OS !== 'web') {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permiso denegado',
            'Necesitamos acceso a tu galería para cambiar el ícono de la meta.',
            [{ text: 'Entendido' }],
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',          // Solo imágenes (sin video)
        allowsEditing: true,           // Recorte cuadrado centrado
        aspect: [1, 1],               // Forzamos relación de aspecto 1:1
        quality: 0.7,                  // Compresión moderada para rendimiento
        allowsMultipleSelection: false, // Solo una imagen
        exif: false,                   // No necesitamos metadata EXIF
      });

      if (!result.canceled && result.assets.length > 0) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la galería. Inténtalo de nuevo.');
      console.error('[useGoalImagePicker] Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeImage = useCallback(() => {
    setPhotoUri(null);
  }, []);

  return { photoUri, isLoading, pickImage, removeImage };
}
