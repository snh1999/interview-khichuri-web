import { useEffect, useState } from "react";
import { useResendStore } from "@/store/resendStore.ts";

const COOLDOWN_SECONDS = 300;
const getRemainingCooldown = (lastSentAt: number | null): number => {
  if (!lastSentAt) {
    return 0;
  }
  const elapsed = Math.floor((Date.now() - lastSentAt) / 1000);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
};

export const useEmailResendCooldown = (): {
  cooldown: number;
  markSent: () => void;
} => {
  const { lastSentAt, markSent } = useResendStore();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const remaining = getRemainingCooldown(lastSentAt);
    setCooldown(remaining);

    let id: ReturnType<typeof setInterval> | undefined;

    if (remaining > 0) {
      id = setInterval(() => {
        const remainingTime = getRemainingCooldown(lastSentAt);
        setCooldown(remainingTime);
        if (remainingTime <= 0) {
          clearInterval(id);
        }
      }, 1000);
    }

    return () => {
      clearInterval(id);
    };
  }, [lastSentAt]);

  return { cooldown, markSent } as const;
};
