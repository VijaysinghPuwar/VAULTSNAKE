import Image from "next/image";
import clsx from "clsx";

type LogoSize = "tiny" | "nav" | "sidebar" | "hero";

interface VaultSnakeLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  priority?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

const MARK_WRAPPER: Record<LogoSize, string> = {
  tiny:    "h-5 w-5 rounded",
  nav:     "h-9 w-9 rounded-md",
  sidebar: "h-10 w-10 rounded-lg",
  hero:    "h-28 w-28 rounded-2xl sm:h-32 sm:w-32 lg:h-36 lg:w-36",
};

// px values that match the Tailwind classes above, for use with explicit width/height
const FIXED_PX: Record<"tiny" | "nav" | "sidebar", number> = {
  tiny:    20,
  nav:     36,
  sidebar: 40,
};

const IMAGE_SCALE: Record<LogoSize, string> = {
  tiny:    "scale-[1.45]",
  nav:     "scale-[1.45]",
  sidebar: "scale-[1.38]",
  hero:    "scale-[1.12]",
};

export default function VaultSnakeLogo({
  size = "nav",
  showWordmark = false,
  priority = false,
  className,
  wordmarkClassName,
}: VaultSnakeLogoProps) {
  const isHero = size === "hero";

  return (
    <div className={clsx("flex min-w-0 items-center gap-3", className)}>
      <span
        className={clsx(
          "relative block shrink-0 overflow-hidden border border-cyber-cyan/15 bg-cyber-bg/80 shadow-[0_0_18px_rgba(0,212,255,0.10)]",
          MARK_WRAPPER[size]
        )}
      >
        {isHero ? (
          /* Hero uses fill for responsive sizing */
          <Image
            src="/logo.png"
            alt={showWordmark ? "" : "VAULTSNAKE logo"}
            fill
            priority={priority}
            sizes="(max-width: 640px) 112px, (max-width: 1024px) 128px, 144px"
            className={clsx("object-cover object-[42%_58%]", IMAGE_SCALE[size])}
          />
        ) : (
          /* Fixed sizes use explicit px dimensions — more reliable for small logos */
          <Image
            src="/logo.png"
            alt={showWordmark ? "" : "VAULTSNAKE logo"}
            width={FIXED_PX[size] * 2}
            height={FIXED_PX[size] * 2}
            priority={priority}
            className={clsx(
              "absolute inset-0 h-full w-full object-cover object-[42%_58%]",
              IMAGE_SCALE[size]
            )}
          />
        )}
      </span>

      {showWordmark && (
        <span
          className={clsx(
            "min-w-0 truncate text-xs font-bold uppercase tracking-[0.18em] text-cyber-text sm:text-sm",
            wordmarkClassName
          )}
        >
          VAULT<span className="text-cyber-cyan">SNAKE</span>
        </span>
      )}
    </div>
  );
}
