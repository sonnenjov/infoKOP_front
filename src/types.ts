export interface Activity {
  id: number;
  company: number;
  company_name: string;
  company_slug: string;
  title: string;
  slug: string;
  description: string;
  season: 'summer' | 'winter' | 'all_year';
  price: string;
  duration_minutes: number;
  max_capacity: number;
  location: string;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Reservation {
  reservation_type: any;
  id: number;
  activity: number;
  activity_title: string;
  company_name: string;
  user: number;
  user_email: string;
  date: string;
  time: string | null;
  number_of_people: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  note: string;
  created_at: string;
}

export interface WeatherData {
  daily: {
    time: Date[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_mean: number[];
    weather_code: number[];
  };
  current: {
    weather_code: number;
    apparent_temperature: number;
  };
}

export enum Season {
  Summer = 'summer',
  Winter = 'winter',
  AllYear = 'all_year'
}