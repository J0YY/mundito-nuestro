import { Category } from "@types/memory";

export const CATEGORY_COLORS: Record<Category, string> = {
  core: '#ff80b5',
  thought: '#7cd4ff',
  bucket_list: '#ffd700',
  trip: '#9aff95',
  milestone: '#ffae42',
  inside_joke: '#c084fc',
  celebration: '#ffdd95',
  heartbreak_repair: '#fb7185',
  anniversary: '#f97316',
  secret: '#9ca3af'
};

export const CONTRIBUTOR_COLORS: Record<'joy'|'socrates', string> = {
  joy: '#f9a8d4',
  socrates: '#93c5fd'
};

export const CATEGORY_LABELS: Record<Category, string> = {
  core: 'Core',
  thought: 'Thought',
  bucket_list: 'Bucket List',
  trip: 'Trip',
  milestone: 'Milestone',
  inside_joke: 'Inside Joke',
  celebration: 'Celebration',
  heartbreak_repair: 'Heartbreak Repair',
  anniversary: 'Anniversary',
  secret: 'Secret'
};

