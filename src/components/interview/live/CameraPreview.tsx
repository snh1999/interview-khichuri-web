import {
  UserIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  XIcon,
} from "@phosphor-icons/react";
import { cn } from "cn";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button.tsx";

interface CameraPreviewProps {
  className?: string;
}

export const CameraPreview = memo(
  ({ className }: Readonly<CameraPreviewProps>) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const streamRequestRef = useRef(0);
    const [isOn, setIsOn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const stopStream = useCallback(() => {
      streamRequestRef.current += 1;
      for (const track of streamRef.current?.getTracks() ?? []) {
        track.stop();
      }
      streamRef.current = null;
    }, []);

    const clearError = () => setError("");

    const startStream = useCallback(async () => {
      const requestId = streamRequestRef.current + 1;
      streamRequestRef.current = requestId;
      setError("");
      setIsLoading(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (requestId !== streamRequestRef.current) {
          for (const track of stream.getTracks()) {
            track.stop();
          }
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsOn(true);
      } catch {
        if (requestId === streamRequestRef.current) {
          setError("Camera unavailable or permission denied");
          setIsOn(false);
        }
      } finally {
        if (requestId === streamRequestRef.current) {
          setIsLoading(false);
        }
      }
    }, []);

    const toggleCamera = useCallback(() => {
      if (isOn) {
        stopStream();
        setIsOn(false);
      } else {
        startStream();
      }
    }, [isOn, stopStream, startStream]);

    useEffect(() => stopStream, [stopStream]);

    return (
      <div
        className={cn("flex h-full min-h-0 w-full flex-col gap-2", className)}
      >
        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
          <video
            autoPlay
            className={cn("h-full w-full object-cover", !isOn && "hidden")}
            muted
            playsInline
            ref={videoRef}
          />
          {!isOn && <UserIcon className="h-8 w-8 text-neutral-600" />}
          <span className="absolute bottom-2 left-0 rounded bg-black/40 px-1.5 py-0.5 text-neutral-300 text-xs">
            You
          </span>
          <Button
            className="absolute right-0 bottom-2 rounded-full"
            disabled={isLoading}
            onClick={toggleCamera}
            size="icon"
            title={isOn ? "Turn camera off" : "Turn camera on"}
            variant={isOn ? "destructive" : "default"}
          >
            {isOn ? (
              <VideoCameraSlashIcon className="size-4" />
            ) : (
              <VideoCameraIcon className="size-4" />
            )}
          </Button>
          {error.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted px-2">
              <p className="rounded px-2 py-1 text-center text-destructive text-xs">
                {error}
              </p>
              <Button onClick={clearError} size="xs" variant="destructive">
                <XIcon />
                Clear
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);
