import { LockSimpleIcon } from "@phosphor-icons/react";
import type React from "react";
import { AlignmentTools } from "./right/AlignmentTools";
import { ColorControls } from "./right/ColorControls";
import { FrameControls } from "./right/FrameControls";
import { GeometryEditor } from "./right/GeometryEditor";
import { LayerControls } from "./right/LayerControls";
import { RightSidebarEmpty } from "./right/RightSidebarEmpty";
import { SelectionHeader } from "./right/SelectionHeader";
import { SliderControls } from "./right/SliderControls";
import { StampEditor } from "./right/StampEditor";
import { TypographyEditor } from "./right/TypographyEditor";
import { useBatchUpdate } from "./right/useBatchUpdate";
import { useSelectionState } from "./right/useSelectionState";

export const RightSidebar: React.FC = () => {
  const {
    selectedElements,
    activeElement,
    isMulti,
    isFrame,
    isLocked,
    isText,
    isStamp,
    strokeWidthState,
    opacityState,
    cornerRadiusState,
    strokeColorState,
    fillColorState,
    themeSwatches,
    theme,
  } = useSelectionState();

  const updateSelected = useBatchUpdate(selectedElements);

  if (selectedElements.length === 0) {
    return (
      <RightSidebarEmpty themeName={theme.name} themeSwatches={themeSwatches} />
    );
  }

  return (
    <aside className="z-20 flex h-full w-64 select-none flex-col justify-between overflow-y-auto border-border border-l bg-card p-4 text-foreground text-xs sm:w-72">
      <div className="space-y-5">
        <SelectionHeader
          activeElement={activeElement}
          isMulti={isMulti}
          selectedElements={selectedElements}
        />

        {/* Locked notice: every editor below is disabled while the selection
            (or its owning frame) is locked. */}
        {isLocked ? (
          <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 font-medium text-amber-600 text-xxs">
            <LockSimpleIcon size={12} weight="bold" />
            <span>
              Locked — unlock this {isFrame ? "page" : "element"} to edit
            </span>
          </div>
        ) : null}

        <fieldset
          className="min-w-0 space-y-5 border-0 p-0 disabled:pointer-events-none disabled:opacity-50"
          disabled={isLocked}
        >
          {!!isMulti && <AlignmentTools />}

          {/* Position & Geometry Dimensions (Supports Multi-element uniform edit & X/Y coordinates) */}
          {activeElement ? (
            <GeometryEditor
              activeElement={activeElement}
              isMulti={isMulti}
              selectedElements={selectedElements}
              updateSelected={updateSelected}
            />
          ) : null}

          {isText && activeElement ? (
            <TypographyEditor activeElement={activeElement} />
          ) : null}

          {isStamp && activeElement ? (
            <StampEditor activeElement={activeElement} />
          ) : null}

          {/* Stroke & Fill Colors (Supports Transparent toggles & Mixed indicators) */}
          {!isFrame && activeElement ? (
            <ColorControls
              activeElement={activeElement}
              fillColorState={fillColorState}
              strokeColorState={strokeColorState}
              theme={theme}
              themeSwatches={themeSwatches}
              updateSelected={updateSelected}
            />
          ) : null}

          {/* Sliders: Stroke Width, Opacity, Corner Radius (With direct number input & mixed indicators) */}
          {!isFrame && activeElement ? (
            <SliderControls
              activeElement={activeElement}
              cornerRadiusState={cornerRadiusState}
              disabled={isLocked}
              opacityState={opacityState}
              strokeWidthState={strokeWidthState}
              updateSelected={updateSelected}
            />
          ) : null}

          {activeElement ? <LayerControls /> : null}

          {isFrame && activeElement ? (
            <FrameControls activeElement={activeElement} />
          ) : null}
        </fieldset>
      </div>
    </aside>
  );
};
