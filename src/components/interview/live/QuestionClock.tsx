import { ClockIcon } from "@phosphor-icons/react";
import {
  memo,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

export interface IInterviewTimingRefs {
  startRef: RefObject<number>;
  pausedAccumRef: RefObject<number>;
  totalElapsedRef: RefObject<number>;
}

export interface IInterviewTiming extends IInterviewTimingRefs {
  currentElapsed: () => number;
  elapsedClock: () => number;
  resetOnAdvance: () => void;
}

const formatClock = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes
    ? `${minutes}:${String(seconds).padStart(2, "0")}`
    : String(seconds);
};

export const QuestionClock = memo(
  ({
    startRef,
    pausedAccumRef,
    totalElapsedRef,
    hideIcon = false,
  }: Readonly<IInterviewTimingRefs> & { hideIcon?: boolean }) => {
    const [clock, setClock] = useState(0);

    useEffect(() => {
      const timer = window.setInterval(() => {
        const visible =
          document.visibilityState === "visible"
            ? Math.floor((Date.now() - startRef.current) / 1000)
            : 0;
        setClock(totalElapsedRef.current + pausedAccumRef.current + visible);
      }, 1000);

      return () => {
        window.clearInterval(timer);
      };
    }, [startRef, pausedAccumRef, totalElapsedRef]);

    return (
      <span className="flex items-center gap-1 font-medium text-muted-foreground text-xs tabular-nums">
        {hideIcon ? null : <ClockIcon className="size-3.5" />}
        {formatClock(clock)}
      </span>
    );
  }
);

// detached hook because it has to come from parents
export const useInterviewTiming = (
  draftIndex: number | undefined
): IInterviewTiming => {
  const startRef = useRef(Date.now());
  const pausedAccumRef = useRef(0);
  const totalElapsedRef = useRef(0);

  const currentElapsed = useCallback(
    () =>
      pausedAccumRef.current +
      (document.visibilityState === "visible"
        ? Math.floor((Date.now() - startRef.current) / 1000)
        : 0),
    []
  );

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        startRef.current = Date.now();
      } else {
        pausedAccumRef.current += Math.floor(
          (Date.now() - startRef.current) / 1000
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (draftIndex === undefined) {
      return;
    }
    pausedAccumRef.current = 0;
    startRef.current = Date.now();
  }, [draftIndex]);

  const elapsedClock = useCallback(
    () => totalElapsedRef.current + currentElapsed(),
    [currentElapsed]
  );

  const resetOnAdvance = useCallback(() => {
    totalElapsedRef.current += currentElapsed();
    pausedAccumRef.current = 0;
    startRef.current = Date.now();
  }, [currentElapsed]);

  return {
    startRef,
    pausedAccumRef,
    totalElapsedRef,
    currentElapsed,
    elapsedClock,
    resetOnAdvance,
  };
};
