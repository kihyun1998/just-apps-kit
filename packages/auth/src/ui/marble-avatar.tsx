import Avatar from "boring-avatars";

const PALETTE = ["#818CF8", "#C084FC", "#F472B6", "#34D399", "#60A5FA"];

interface MarbleAvatarProps {
  name: string;
  size?: number;
}

export function MarbleAvatar({ name, size = 32 }: MarbleAvatarProps) {
  return <Avatar size={size} name={name} variant="marble" colors={PALETTE} />;
}
