// biome-ignore-all lint/style/useNamingConvention: <>

import arimoItalic from "@fontsource/arimo/files/arimo-latin-400-italic.woff";
import arimoRegular from "@fontsource/arimo/files/arimo-latin-400-normal.woff";
import arimoBold from "@fontsource/arimo/files/arimo-latin-700-normal.woff";
import carlitoItalic from "@fontsource/carlito/files/carlito-latin-400-italic.woff";
import carlitoRegular from "@fontsource/carlito/files/carlito-latin-400-normal.woff";
import carlitoBold from "@fontsource/carlito/files/carlito-latin-700-normal.woff";
import crimsonProItalic from "@fontsource/crimson-pro/files/crimson-pro-latin-400-italic.woff";
import crimsonProRegular from "@fontsource/crimson-pro/files/crimson-pro-latin-400-normal.woff";
import crimsonProBold from "@fontsource/crimson-pro/files/crimson-pro-latin-700-normal.woff";
import ebGaramondItalic from "@fontsource/eb-garamond/files/eb-garamond-latin-400-italic.woff";
import ebGaramondRegular from "@fontsource/eb-garamond/files/eb-garamond-latin-400-normal.woff";
import ebGaramondBold from "@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff";
import ibmPlexItalic from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-italic.woff";
import ibmPlexRegular from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff";
import ibmPlexBold from "@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff";
import interItalic from "@fontsource/inter/files/inter-latin-400-italic.woff";
import interRegular from "@fontsource/inter/files/inter-latin-400-normal.woff";
import interBold from "@fontsource/inter/files/inter-latin-700-normal.woff";
import libertinusItalic from "@fontsource/libertinus-serif/files/libertinus-serif-latin-400-italic.woff";
import libertinusRegular from "@fontsource/libertinus-serif/files/libertinus-serif-latin-400-normal.woff";
import libertinusBold from "@fontsource/libertinus-serif/files/libertinus-serif-latin-700-normal.woff";
import notoSansItalic from "@fontsource/noto-sans/files/noto-sans-latin-400-italic.woff";
import notoSansRegular from "@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff";
import notoSansBold from "@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff";
import notoSerifItalic from "@fontsource/noto-serif/files/noto-serif-latin-400-italic.woff";
import notoSerifRegular from "@fontsource/noto-serif/files/noto-serif-latin-400-normal.woff";
import notoSerifBold from "@fontsource/noto-serif/files/noto-serif-latin-700-normal.woff";
import publicSansItalic from "@fontsource/public-sans/files/public-sans-latin-400-italic.woff";
import publicSansRegular from "@fontsource/public-sans/files/public-sans-latin-400-normal.woff";
import publicSansBold from "@fontsource/public-sans/files/public-sans-latin-700-normal.woff";
import sourceSansItalic from "@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff";
import sourceSansRegular from "@fontsource/source-sans-3/files/source-sans-3-latin-400-normal.woff";
import sourceSansBold from "@fontsource/source-sans-3/files/source-sans-3-latin-700-normal.woff";
import tinosItalic from "@fontsource/tinos/files/tinos-latin-400-italic.woff";
import tinosRegular from "@fontsource/tinos/files/tinos-latin-400-normal.woff";
import tinosBold from "@fontsource/tinos/files/tinos-latin-700-normal.woff";
import { Font } from "@react-pdf/renderer";

export const FONT_FAMILIES = {
  Carlito: { category: "sans" }, // Calibri
  Arimo: { category: "sans" }, // Arial
  "Noto Sans": { category: "sans" }, // Verdana
  Inter: { category: "sans" },
  "IBM Plex Sans": { category: "sans" },
  "Source Sans 3": { category: "sans" },
  "Public Sans": { category: "sans" },

  Garamond: { category: "serif" },
  "Noto Serif": { category: "serif" }, // Georgia
  Libertinus: { category: "serif" }, // Cambria
  Tinos: { category: "serif" }, // Times New Roman
  "Crimson Pro": { category: "serif" },
} as const;

export type TFontFamily = keyof typeof FONT_FAMILIES;

let registered = false;

export function registerPdfFonts() {
  if (registered) {
    return;
  }
  registered = true;

  Font.register({
    family: "Carlito",
    fonts: [
      { src: carlitoRegular, fontWeight: 400 },
      { src: carlitoBold, fontWeight: 700 },
      { src: carlitoItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Arimo",
    fonts: [
      { src: arimoRegular, fontWeight: 400 },
      { src: arimoBold, fontWeight: 700 },
      { src: arimoItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Noto Sans",
    fonts: [
      { src: notoSansRegular, fontWeight: 400 },
      { src: notoSansBold, fontWeight: 700 },
      { src: notoSansItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Inter",
    fonts: [
      { src: interRegular, fontWeight: 400 },
      { src: interBold, fontWeight: 700 },
      { src: interItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "IBM Plex Sans",
    fonts: [
      { src: ibmPlexRegular, fontWeight: 400 },
      { src: ibmPlexBold, fontWeight: 700 },
      { src: ibmPlexItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Source Sans 3",
    fonts: [
      { src: sourceSansRegular, fontWeight: 400 },
      { src: sourceSansBold, fontWeight: 700 },
      { src: sourceSansItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Garamond",
    fonts: [
      { src: ebGaramondRegular, fontWeight: 400 },
      { src: ebGaramondBold, fontWeight: 700 },
      { src: ebGaramondItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Noto Serif",
    fonts: [
      { src: notoSerifRegular, fontWeight: 400 },
      { src: notoSerifBold, fontWeight: 700 },
      { src: notoSerifItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Libertinus",
    fonts: [
      { src: libertinusRegular, fontWeight: 400 },
      { src: libertinusBold, fontWeight: 700 },
      { src: libertinusItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "Tinos",
    fonts: [
      { src: tinosRegular, fontWeight: 400 },
      { src: tinosBold, fontWeight: 700 },
      { src: tinosItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "Public Sans",
    fonts: [
      { src: publicSansRegular, fontWeight: 400 },
      { src: publicSansBold, fontWeight: 700 },
      { src: publicSansItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });
  Font.register({
    family: "Crimson Pro",
    fonts: [
      { src: crimsonProRegular, fontWeight: 400 },
      { src: crimsonProBold, fontWeight: 700 },
      { src: crimsonProItalic, fontWeight: 400, fontStyle: "italic" },
    ],
  });
}

registerPdfFonts();
