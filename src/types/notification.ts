export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  link?: string;
  /** False when link absent or target entity deleted — UI hides View / Open link. */
  link_valid?: boolean;
}
