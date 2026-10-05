import { toast } from "sonner";

/**
 * Copies text to the clipboard and confirms it with a toast. Read-only text
 * (a copy prompt, backup codes, a share link) has no business failing
 * silently, so the failure gets its own toast.
 */
export const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
    return true;
  } catch {
    toast.error("Failed to copy to clipboard");
    return false;
  }
};
