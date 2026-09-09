import type { StorefrontItem } from "./storefrontData";

interface StorefrontImageProps {
  item: StorefrontItem;
  className: string;
  loading?: "eager" | "lazy";
}

export function StorefrontImage({ item, className, loading }: StorefrontImageProps) {
  if (item.imageStyle) {
    return (
      <div
        role="img"
        aria-label={item.name}
        className={`${className} bg-no-repeat`}
        style={{
          backgroundImage: `url(${item.image})`,
          backgroundSize: item.imageStyle.backgroundSize,
          backgroundPosition: item.imageStyle.backgroundPosition,
        }}
      />
    );
  }

  return <img src={item.image} alt={item.name} loading={loading} className={className} />;
}
