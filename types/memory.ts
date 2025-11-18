export type Contributor = 'joy' | 'socrates';

export type Category =
  | 'core'
  | 'thought'
  | 'bucket_list'
  | 'trip'
  | 'milestone'
  | 'inside_joke'
  | 'celebration'
  | 'heartbreak_repair'
  | 'anniversary'
  | 'secret';

export type Mood = 'soft' | 'romantic' | 'chaotic' | 'longing' | 'nostalgic' | null;

export interface Memory {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  contributor: Contributor;
  category: Category;
  color: string | null;
  mood: Mood;
  emoji: string | null;
  date: string; // ISO date (YYYY-MM-DD)
  time: string | null; // HH:mm:ss or null
  photo_url: string | null;
  is_bucket_list_completed: boolean;
  secret_unlock_date: string | null; // ISO date or null
  created_at: string; // ISO datetime
}

export interface NewMemoryInput {
  lat: number;
  lng: number;
  title: string;
  description: string;
  contributor: Contributor;
  category: Category;
  mood?: Mood;
  emoji?: string | null;
  date: string;
  time?: string | null;
  photo_url?: string | null;
  color?: string | null;
  is_bucket_list_completed?: boolean;
  secret_unlock_date?: string | null;
}

