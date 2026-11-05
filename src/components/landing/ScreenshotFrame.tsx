import { cn } from "cn";

export interface IScreenshot {
  readonly alt: string;
  readonly height: number;
  readonly src: string;
  readonly width: number;
}

interface IScreenshotFrameProps {
  readonly className?: string;
  readonly priority?: boolean;
  readonly screenshot: IScreenshot;
}

export const ScreenshotFrame = ({
  className,
  priority = false,
  screenshot,
}: Readonly<IScreenshotFrameProps>) => (
  <div
    className={cn(
      "bg-muted/30 ring-foreground/10 overflow-hidden rounded-xl ring-1",
      className
    )}
  >
    <img
      alt={screenshot.alt}
      className="block h-auto w-full"
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      height={screenshot.height}
      loading={priority ? "eager" : "lazy"}
      src={screenshot.src}
      width={screenshot.width}
    />
  </div>
);
