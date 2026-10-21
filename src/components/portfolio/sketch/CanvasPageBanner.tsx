import {
  CheckIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  ImageIcon,
  TrashIcon,
  UploadSimpleIcon,
  XIcon,
} from "@phosphor-icons/react";
import type React from "react";
import { useEffect, useState } from "react";
import { useController, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/ui/button/ActionButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAssetImage, saveAssetImage } from "@/lib/storage/imageStorageDb";
import { generateSafeId } from "@/lib/utils";
import {
  useCurrentPortfolio,
  useSketchBuilderStore,
} from "@/store/sketchBuilderStore";
import type { FrameElement } from "./types";

interface CanvasPageBannerProps {
  frame: FrameElement;
}

interface BannerFormValues {
  title: string;
  route: string;
  description: string;
  parentPageId: string;
}

const formValuesFromFrame = (frame: FrameElement): BannerFormValues => ({
  title: frame.title,
  route: frame.route || "",
  description: frame.description || "",
  parentPageId: frame.parentPageId || "none",
});

export const CanvasPageBanner: React.FC<CanvasPageBannerProps> = ({
  frame,
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: verbatim source function; complexity acceptable at this boundary
}) => {
  const updateElement = useSketchBuilderStore((s) => s.updateElement);
  const deleteElement = useSketchBuilderStore((s) => s.deleteElement);
  const selectedElementIds = useSketchBuilderStore((s) => s.selectedElementIds);
  const selectElements = useSketchBuilderStore((s) => s.selectElements);

  const zoom = useSketchBuilderStore((s) => s.draft?.viewport.zoom ?? 1);

  const currentPortfolio = useCurrentPortfolio();
  const allFrames = currentPortfolio.elements.filter(
    (el): el is FrameElement => el.type === "frame" && el.id !== frame.id
  );

  // A frame may not be parented to itself or any of its descendants, which
  // would create a parentPageId cycle.
  const framesById = new Map(
    currentPortfolio.elements
      .filter((el): el is FrameElement => el.type === "frame")
      .map((f) => [f.id, f] as const)
  );
  const isDescendantOfCurrentFrame = (id: string): boolean => {
    const seen = new Set<string>();
    let parentId = framesById.get(id)?.parentPageId;
    while (parentId && !seen.has(parentId)) {
      if (parentId === frame.id) {
        return true;
      }
      seen.add(parentId);
      parentId = framesById.get(parentId)?.parentPageId;
    }
    return false;
  };
  const parentOptions = allFrames.filter(
    (f) => !isDescendantOfCurrentFrame(f.id)
  );
  const parentSelectData = [
    { value: "none", label: "None (Top-Level)" },
    ...parentOptions.map((f) => ({
      value: f.id,
      label: `${f.title} (${f.route || "/"})`,
    })),
  ];

  const isSelected = selectedElementIds.includes(frame.id);
  const [isExpanded, setIsExpanded] = useState(false);
  const [resolvedInspirationSrc, setResolvedInspirationSrc] = useState<
    string | null
  >(null);

  const form = useForm<BannerFormValues>({
    defaultValues: formValuesFromFrame(frame),
  });
  const { field: parentField } = useController({
    control: form.control,
    name: "parentPageId",
  });

  useEffect(() => {
    let active = true;
    const url = frame.inspirationImageUrl;
    if (!url) {
      setResolvedInspirationSrc(null);
      return;
    }

    if (url.startsWith("idb://")) {
      const assetId = url.replace("idb://", "");
      getAssetImage(assetId).then((data) => {
        if (active) {
          setResolvedInspirationSrc(data);
        }
      });
    } else {
      setResolvedInspirationSrc(url);
    }

    return () => {
      active = false;
    };
  }, [frame.inspirationImageUrl]);

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const assetId = generateSafeId(`frame_insp_${frame.id}`);

      const saved = await saveAssetImage(assetId, base64);
      if (!saved) {
        toast.error("Failed to save inspiration image to local storage");
        return;
      }

      updateElement(
        frame.id,
        { inspirationImageUrl: `idb://${assetId}` },
        true
      );

      // A replaced asset is left for the orphan sweep (`cleanupOrphanAssetImages`),
      // which also counts undo/redo history and duplicated frames still pointing at
      // it — deleting eagerly here would break those references.
      toast.success("Inspiration image attached to frame");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveInspiration = () => {
    // Leave the asset to the orphan sweep; undo still holds this URL.
    updateElement(frame.id, { inspirationImageUrl: undefined });
  };

  const handleDeleteClick = async () => {
    await deleteElement(frame.id);
    toast.success(`Deleted page "${frame.title}" and its components`);
    return { error: false };
  };
  const handleStopPropagation = (e: React.MouseEvent) => e.stopPropagation();
  const handleCollapse = () => setIsExpanded(false);
  const handleInspirationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInspirationUpload(e);
    e.target.value = "";
  };
  const onSubmit = form.handleSubmit((values) => {
    updateElement(
      frame.id,
      {
        title: values.title,
        route: values.route,
        description: values.description,
        parentPageId:
          values.parentPageId && values.parentPageId !== "none"
            ? values.parentPageId
            : undefined,
      },
      true
    );
    setIsExpanded(false);
    toast.success(`Saved settings for "${values.title}"`);
  });
  const handleSelectFrame = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectElements([frame.id]);
  };
  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    form.reset(formValuesFromFrame(frame));
    setIsExpanded(true);
  };

  // The banner wrapper inherits the canvas `scale(zoom)`, so the gap above the
  // artboard must be divided by zoom — otherwise the gap shrinks as you zoom
  // out and the banner slides inside the artboard.
  const safeZoom = zoom || 1;
  const bannerOffset = (isExpanded ? 240 : 42) / safeZoom;
  const bannerTop = frame.y - bannerOffset;

  return (
    // biome-ignore lint/a11y/noNoninteractiveElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
    // biome-ignore lint/a11y/noStaticElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
    <div
      className="pointer-events-auto absolute z-50 origin-top-left select-none"
      onMouseDown={handleStopPropagation}
      style={{
        left: `${frame.x}px`,
        top: `${bannerTop}px`,
        transform: safeZoom === 1 ? undefined : `scale(${1 / safeZoom})`,
      }}
    >
      {isExpanded ? (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
        // biome-ignore lint/a11y/useKeyWithClickEvents: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
        <form
          className="w-95 space-y-3 rounded-2xl border border-primary/80 bg-card p-4 text-foreground shadow-2xl backdrop-blur-xl sm:w-105"
          onClick={handleStopPropagation}
          onSubmit={onSubmit}
        >
          <div className="flex items-center justify-between border-border border-b pb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center text-muted-foreground">
                {frame.isHome ? (
                  <HouseIcon className="text-primary" size={16} weight="bold" />
                ) : (
                  <FileTextIcon size={16} />
                )}
              </span>
              <span className="font-bold text-primary text-xs uppercase tracking-wider">
                Page Artboard Setup
              </span>
              {frame.isHome ? (
                <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-bold text-[9px] text-primary">
                  Home (/)
                </span>
              ) : null}
            </div>
            <Button
              className="text-muted-foreground hover:text-foreground"
              onClick={handleCollapse}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <XIcon size={13} />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label
                className="font-bold text-muted-foreground text-xxs uppercase tracking-wider"
                htmlFor={`frame-title-${frame.id}`}
              >
                Page Title
              </Label>
              <Input
                className="h-7 bg-background text-xs"
                id={`frame-title-${frame.id}`}
                placeholder="e.g. Case Study: Nova AI"
                type="text"
                {...form.register("title")}
              />
            </div>
            <div className="space-y-1">
              <Label
                className="font-bold text-muted-foreground text-xxs uppercase tracking-wider"
                htmlFor={`frame-route-${frame.id}`}
              >
                Route Path
              </Label>
              <Input
                className="h-7 bg-background font-mono text-xs"
                id={`frame-route-${frame.id}`}
                placeholder="e.g. /projects/nova-ai"
                type="text"
                {...form.register("route")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-2">
              <Label
                className="font-bold text-muted-foreground text-xxs uppercase tracking-wider"
                htmlFor={`frame-goal-${frame.id}`}
              >
                Page Goal / Vibe Hint
              </Label>
              <Input
                className="h-7 bg-background text-xs"
                id={`frame-goal-${frame.id}`}
                placeholder="e.g. Highlight technical depth & live metrics"
                type="text"
                {...form.register("description")}
              />
            </div>
            <div className="space-y-1">
              <Label
                className="font-bold text-muted-foreground text-xxs uppercase tracking-wider"
                htmlFor={`frame-parent-${frame.id}`}
              >
                Parent Page
              </Label>
              <Select
                items={parentSelectData}
                onValueChange={parentField.onChange}
                value={parentField.value}
              >
                <SelectTrigger
                  className="w-full"
                  id={`frame-parent-${frame.id}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parentSelectData.map((option) => (
                    <SelectItem
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between border-border border-t pt-2">
            <div className="flex items-center gap-2">
              <Label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 font-medium text-foreground text-xs transition-colors hover:bg-accent">
                {frame.inspirationImageUrl ? (
                  <UploadSimpleIcon size={13} />
                ) : (
                  <ImageIcon size={13} />
                )}
                <span>
                  {frame.inspirationImageUrl
                    ? "Change Inspiration"
                    : "Attach Inspiration"}
                </span>
                <input
                  accept="image/*"
                  className="hidden"
                  onChange={handleInspirationChange}
                  type="file"
                />
              </Label>
              {frame.inspirationImageUrl ? (
                <Button
                  className="text-destructive"
                  onClick={handleRemoveInspiration}
                  size="xs"
                  type="button"
                  variant="link"
                >
                  Remove
                </Button>
              ) : null}
            </div>

            <Button className="rounded-lg" type="submit">
              <CheckIcon size={13} weight="bold" />
              <span>Save & Close</span>
            </Button>
          </div>
        </form>
      ) : (
        // biome-ignore lint/a11y/noNoninteractiveElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
        // biome-ignore lint/a11y/useKeyWithClickEvents: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
        // biome-ignore lint/a11y/noStaticElementInteractions: raw pointer surface or wrapper containing nested controls; no semantic HTML equivalent
        <div
          className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-1.5 shadow-md backdrop-blur-md transition-all ${
            isSelected
              ? "border-primary bg-card text-foreground ring-2 ring-primary/20"
              : "border-border bg-card text-foreground hover:border-primary/50"
          }`}
          onClick={handleSelectFrame}
        >
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex items-center text-muted-foreground">
              {frame.isHome ? (
                <HouseIcon className="text-primary" size={14} weight="bold" />
              ) : (
                <FileTextIcon size={14} />
              )}
            </span>
            <span className="max-w-35 truncate rounded px-1.5 py-0.5 font-bold text-foreground text-xs sm:max-w-50">
              {frame.title || "Untitled Page"}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground text-xxs">
              {frame.route || "/"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {resolvedInspirationSrc ? (
              <div
                className="h-5 w-5 overflow-hidden rounded-md border border-emerald-500 shadow-xs"
                title="Visual Inspiration Attached"
              >
                <img
                  alt="Moodboard"
                  className="h-full w-full object-cover"
                  decoding="async"
                  height={20}
                  loading="lazy"
                  src={resolvedInspirationSrc}
                  width={20}
                />
              </div>
            ) : null}

            <Button
              className="rounded-lg"
              onClick={handleExpand}
              size="sm"
              variant="outline"
            >
              <GearSixIcon size={12} />
              <span>Page Setup</span>
            </Button>

            <ActionButton
              action={handleDeleteClick}
              dialogDescription={`This will permanently delete "${frame.title}" and all elements inside it. This action cannot be undone.`}
              dialogTitle="Delete Page Frame"
              requireConfirmation
              size="icon"
              title="Delete Page Frame"
              variant="destructive"
            >
              <TrashIcon size={13} />
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
};
