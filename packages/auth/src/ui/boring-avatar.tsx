import Avatar from "boring-avatars";

const PALETTE = ["#818CF8", "#C084FC", "#F472B6", "#34D399", "#60A5FA"];

interface BoringAvatarProps {
  name: string;
  size?: number;
}

export function BoringAvatar({ name, size = 32 }: BoringAvatarProps) {
  return <Avatar size={size} name={name} variant="marble" colors={PALETTE} />;
}
