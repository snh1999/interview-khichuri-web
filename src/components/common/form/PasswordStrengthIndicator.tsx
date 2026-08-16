import { type Score, zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary } from "@zxcvbn-ts/language-common";

import { useMemo } from "react";

const translations = {
  warnings: {
    straightRow: "Straight rows of keys on your keyboard are easy to guess.",
    keyPattern: "Short keyboard patterns are easy to guess.",
    simpleRepeat: 'Repeated characters like "aaa" are easy to guess.',
    extendedRepeat:
      'Repeated character patterns like "abcabcabc" are easy to guess.',
    sequences: 'Common character sequences like "abc" are easy to guess.',
    recentYears: "Recent years are easy to guess.",
    dates: "Dates are easy to guess.",
    topTen: "This is a heavily used password (in top 10).",
    topHundred: "This is a frequently used password (in top 100).",
    common: "This is a commonly used password.",
    similarToCommon: "This is similar to a commonly used password.",
    wordByItself: "Single words are easy to guess.",
    namesByThemselves: "Single names or surnames are easy to guess.",
    commonNames: "Common names and surnames are easy to guess.",
    userInputs: "There should not be any personal or page related data.",
    pwned: "Your password was exposed by a data breach on the Internet.",
  },
  suggestions: {
    l33t: "Avoid predictable letter substitutions like '@' for 'a'.",
    reverseWords: "Avoid reversed spellings of common words.",
    allUppercase: "Capitalize some, but not all letters.",
    capitalization: "Capitalize more than the first letter.",
    dates: "Avoid dates and years that are associated with you.",
    recentYears: "Avoid recent years.",
    associatedYears: "Avoid years that are associated with you.",
    sequences: "Avoid common character sequences.",
    repeated: "Avoid repeated words and characters.",
    longerKeyboardPattern:
      "Use longer keyboard patterns and change typing direction multiple times.",
    anotherWord: "Add more word/words that are less common.",
    useWords: "Use multiple words, but avoid common phrases.",
    noNeed:
      "You can create strong passwords without using symbols, numbers, or uppercase letters.",
    pwned: "If you use this password elsewhere, you should change it.",
  },
  timeEstimation: {
    ltSecond: "< 1 second",
    second: "{base} second",
    seconds: "{base} seconds",
    minute: "{base} minute",
    minutes: "{base} minutes",
    hour: "{base} hour",
    hours: "{base} hours",
    day: "{base} day",
    days: "{base} days",
    month: "{base} month",
    months: "{base} months",
    year: "{base} year",
    years: "{base} years",
    centuries: "centuries",
  },
} as const;

zxcvbnOptions.setOptions({
  dictionary,
  translations,
  graphs: adjacencyGraphs,
});

const LEVELS = [
  { label: "Very Weak", className: "bg-red-500" },
  { label: "Weak", className: "bg-orange-500" },
  { label: "Fair", className: "bg-yellow-500" },
  { label: "Strong", className: "bg-blue-500" },
  { label: "Very Strong", className: "bg-green-500" },
] as const;

interface IProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: Readonly<IProps>) => {
  const result = useMemo(() => {
    if (!password) {
      return null;
    }
    return zxcvbn(password);
  }, [password]);

  if (!(result && password)) {
    return null;
  }

  const { score } = result;
  const level = LEVELS[score];
  const times = result.crackTimesDisplay;
  const { warning } = result.feedback;
  const { suggestions } = result.feedback;

  const throttled = times.onlineThrottling100PerHour;
  const noThrottle = times.offlineSlowHashing1e4PerSecond;
  const showFast = noThrottle !== throttled;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        <LevelComponent score={score} />
      </div>

      <div className="flex items-center justify-between text-[14px]">
        <span className="font-medium text-foreground">{level.label}</span>
        <span className="text-muted-foreground">
          Cracks in{" "}
          <span className="font-medium text-foreground">{throttled}</span>{" "}
          {showFast ? (
            <span className="opacity-60"> (as fast as {noThrottle})</span>
          ) : null}
        </span>
      </div>

      {warning ? (
        <p className="text-[14px] text-destructive">{warning}</p>
      ) : null}

      {suggestions && suggestions.length > 0 ? (
        <div className="text-[14px] text-green-500">
          <p>Suggestions: </p>
          {suggestions.map((suggestion) => (
            <p key={suggestion}>- {suggestion} </p>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const LevelComponent = ({ score }: { score: Score }) =>
  LEVELS.map((level, i) => (
    <div
      className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
        i <= score ? level.className : "bg-muted"
      }`}
      key={level.label}
    />
  ));
