/**
 * Doctor avatar URL — OAuth/upload image first, else deterministic robohash fallback.
 */

export type DoctorAvatarInput = {
  id: string;
  email?: string | null;
  image?: string | null;
};

export function getDoctorAvatarSrc(doctor: DoctorAvatarInput): string {
  const trimmed = doctor.image?.trim();
  if (trimmed) return trimmed;
  const seed = encodeURIComponent(doctor.email?.trim() || doctor.id);
  return `https://robohash.org/${seed}.png?set=set4&size=128x128`;
}
