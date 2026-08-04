import { Image, type ImageProps } from "@chakra-ui/react";

interface AvatarProps extends Omit<
  ImageProps,
  "src" | "alt" | "borderRadius" | "objectFit" | "bg"
> {
  src: string;
  alt: string;
  size?: string;
}

function Avatar({ src, alt, size = "40px", ...rest }: AvatarProps) {
  return (
    <Image
      src={src}
      alt={alt}
      boxSize={size}
      flexShrink="0"
      borderRadius="full"
      objectFit="cover"
      bg="border"
      {...rest}
    />
  );
}

export default Avatar;
