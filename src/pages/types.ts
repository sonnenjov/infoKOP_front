export interface Reservation {
  id: number
  activity?: {
    id: number
    title: string
    price: number
    season: string
    company_name?: string
    description?: string
    image?: string
    duration_minutes?: number
    max_capacity?: number
    location?: string
  }
  accommodation?: {
    id: number
    name: string
    price_per_night: number
    description?: string
    location?: string
  }
  event?: {
    id: number
    name: string
    price: number
    description?: string
    start_date: string
    end_date: string
    location?: string
  }
  reservation_type: 'activity' | 'accommodation' | 'event'
  date_from: string
  date_to: string
  time_from?: string
  time_to?: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at: string
  qr_code?: string
  number_of_people?: number
  note?: string
}