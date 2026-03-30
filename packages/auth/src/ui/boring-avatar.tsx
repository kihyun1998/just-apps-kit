import Avatar from "boring-avatars";

const PALETTE = ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];

interface BoringAvatarProps {
  name: string;
  size?: number;
}

export function BoringAvatar({ name, size = 32 }: BoringAvatarProps) {
  return <Avatar size={size} name={name} variant="beam" colors={PALETTE} />;
}
