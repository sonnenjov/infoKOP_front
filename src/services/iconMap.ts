
 export function getWeatherIconName(code: number): string {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly_cloudy_day';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 55) return 'rainy_light';
  if (code >= 71 && code <= 75) return 'weather_snowy';
  if (code >= 61 && code <= 65) return 'rainy';
  
  return 'sunny';
}