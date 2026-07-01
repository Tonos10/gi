import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../core/theme';

export function useAppTheme() {
  const system_theme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const user_theme = useAppStore(state => state.settings?.theme || 'system');
  const active_theme = user_theme === 'system' ? system_theme : user_theme;
  
  return {
    theme: active_theme as 'light' | 'dark',
    current_colors: colors[active_theme as 'light' | 'dark'],
  };
}
