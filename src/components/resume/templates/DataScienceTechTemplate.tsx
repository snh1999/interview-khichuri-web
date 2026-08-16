import { type FC, useEffect, useMemo, useRef } from "react";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import type { ResumeTemplateConfig } from "@/components/resume/template-registry.ts";
import {
  dateRange,
  filterSkills,
  HARDCODED_CATEGORIES,
  HARDCODED_TOPICS,
  stripProtocol,
  useResumeLookup,
} from "@/components/resume/utils.ts";
import { type ISectionConfig, useResumeStore } from "@/store/resumeStore.ts";
import {
  Document,
  Link,
  Page,
  type PdfSettings,
  StyleSheet,
  Text,
  usePdfSettings,
  View,
} from "../PDFAdapter.tsx";

const COLORS = {
  highlight: "#3D5A80",
  darkText: "#222222",
  subtext: "#555555",
  lightRule: "#CCCCCC",
};

export const dataScienceTemplateConfig: ResumeTemplateConfig = {
  sections: [
    { id: "summary", title: "Summary", enabled: true },
    { id: "education", title: "Education", enabled: true },
    { id: "workExperience", title: "Technical Experience", enabled: true },
    { id: "skills", title: "Skills", enabled: true },
    { id: "activities", title: "Activities", enabled: true },
  ],
  pdfSettings: {
    fontFamily: "Source Sans 3",
    fontSize: 11,
    lineHeight: 1.2,
    padding: 50,
  },
};

function buildStyles(settings: PdfSettings) {
  return StyleSheet.create({
    page: {
      paddingTop: settings.padding,
      paddingBottom: settings.padding,
      paddingLeft: settings.padding,
      paddingRight: settings.padding,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      color: COLORS.darkText,
    },
    // Header 3-Column Layout (TLCresume)
    headerContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    } as const,
    headerLeft: {
      width: "32%",
      flexDirection: "column",
    } as const,
    headerCenter: {
      width: "36%",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    } as const,
    headerRight: {
      width: "32%",
      flexDirection: "column",
      alignItems: "flex-end",
      textAlign: "right",
    } as const,
    headerText: {
      fontSize: settings.fontSize * 0.8,
      lineHeight: 1.25,
      color: COLORS.subtext,
    },
    headerLink: {
      color: COLORS.highlight,
      textDecoration: "none" as const,
    },
    name: {
      fontSize: settings.fontSize * 1.7,
      lineHeight: 1.1,
      fontWeight: 700,
      color: COLORS.darkText,
      textAlign: "center",
    } as const,
    roleTitle: {
      fontSize: settings.fontSize * 0.95,
      lineHeight: 1.2,
      fontWeight: 600,
      color: COLORS.highlight,
      marginTop: 2,
      textAlign: "center",
    } as const,
    headerDivider: {
      borderBottomWidth: 1.2,
      borderBottomColor: COLORS.highlight,
      marginBottom: 6,
      marginTop: 4,
    },
    // Section Title & Formatting
    section: {
      marginTop: 6,
      marginBottom: 2,
    },
    sectionTitleContainer: {
      borderBottomWidth: 0.75,
      borderBottomColor: COLORS.lightRule,
      paddingBottom: 2,
      marginBottom: 4,
    },
    sectionTitle: {
      fontSize: settings.fontSize * 0.95,
      lineHeight: 1.1,
      fontWeight: 700,
      color: COLORS.highlight,
      letterSpacing: 0.5,
    },
    // Entries Layout
    entryBlock: {
      marginBottom: 3.5,
    },
    flexRowBetween: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "baseline",
    } as const,
    boldTitle: {
      fontWeight: 700,
      color: COLORS.darkText,
      fontSize: settings.fontSize * 0.8,
      flex: 1,
      paddingRight: 8,
    },
    regularTitle: {
      fontWeight: 400,
      color: COLORS.darkText,
      fontSize: settings.fontSize * 0.8,
      flex: 1,
      paddingRight: 8,
    },
    entryTitleContainer: {
      fontSize: settings.fontSize * 0.8,
      flex: 1,
      paddingRight: 8,
    },
    boldRightDate: {
      fontSize: settings.fontSize * 0.8,
      fontWeight: 700,
      color: COLORS.darkText,
      textAlign: "right",
    } as const,
    regularRightDate: {
      fontSize: settings.fontSize * 0.8,
      fontWeight: 400,
      color: COLORS.darkText,
      textAlign: "right",
    } as const,
    rightDate: {
      fontSize: settings.fontSize * 0.8,
      fontWeight: 600,
      color: COLORS.subtext,
      textAlign: "right",
    } as const,
    subtext: {
      fontStyle: "italic" as const,
      color: COLORS.darkText,
      fontSize: settings.fontSize * 0.8,
      marginTop: 0.5,
      marginBottom: 1.5,
    },
    para: {
      marginBottom: 2,
      fontSize: settings.fontSize * 0.8,
      lineHeight: 1.2,
    },
    bold: {
      fontWeight: 700,
    },
    italic: {
      fontStyle: "italic" as const,
    },
    // Bullet Lists
    bulletList: {
      marginTop: 1,
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 1,
    } as const,
    bulletMark: {
      width: 10,
      color: COLORS.darkText,
      fontSize: settings.fontSize * 0.8,
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize * 0.8,
      lineHeight: 1.2,
    },
    // Skills Table Layout
    skillsRow: {
      flexDirection: "row",
      marginBottom: 2.5,
    } as const,
    skillsCategory: {
      width: "30%",
      fontWeight: 700,
      color: COLORS.darkText,
      fontSize: settings.fontSize * 0.8,
    },
    skillsList: {
      flex: 1,
      fontSize: settings.fontSize * 0.8,
      color: COLORS.darkText,
      lineHeight: 1.2,
    },
    referencesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    } as const,
    referenceCol: {
      width: "48%",
      marginBottom: 6,
    },
  });
}

interface ISectionProps {
  title: string;
  data: TProfileFormData;
  styles: ReturnType<typeof buildStyles>;
}

function SummarySection({ data, styles }: ISectionProps) {
  const summary = data.professional?.summary;
  if (!summary) {
    return null;
  }
  return (
    <View style={{ marginTop: 2, marginBottom: 4 }}>
      <Text style={styles.para}>{summary}</Text>
    </View>
  );
}

function EducationSection({ title, data, styles }: ISectionProps) {
  const { education } = data;
  if (!education || education.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>

      {education.map((edu, i) => {
        const degreeText = [edu.degreeName, edu.fieldOfStudy]
          .filter(Boolean)
          .join(" in ");
        const instText = edu.institution ? `, ${edu.institution}` : "";

        return (
          <View key={edu.id ?? i} style={{ marginBottom: 2 }}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.entryTitleContainer}>
                {degreeText ? (
                  <Text style={styles.bold}>{degreeText}</Text>
                ) : null}
                {instText ? <Text>{instText}</Text> : null}
              </Text>
              <Text style={styles.regularRightDate}>
                {dateRange(edu.startDate, edu.endDate, false, true)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function TechnicalExperienceSection({ title, data, styles }: ISectionProps) {
  const workExperience = data.workExperience ?? [];
  const projects = data.projects ?? [];
  const publications = data.publications ?? [];

  if (
    workExperience.length === 0 &&
    projects.length === 0 &&
    publications.length === 0
  ) {
    return null;
  }

  const sectionHeaderTitle = title || "TECHNICAL EXPERIENCE";

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>
          {sectionHeaderTitle.toUpperCase()}
        </Text>
      </View>

      {workExperience.map((exp, i) => (
        <View key={exp.id ?? i} style={styles.entryBlock}>
          <View style={styles.flexRowBetween}>
            <Text style={styles.boldTitle}>{exp.title}</Text>
            <Text style={styles.boldRightDate}>
              {dateRange(exp.startDate, exp.endDate, exp.isCurrent)}
            </Text>
          </View>

          {exp.company || exp.location ? (
            <View style={styles.flexRowBetween}>
              <Text style={styles.subtext}>{exp.company}</Text>
              {exp.location ? (
                <Text style={styles.subtext}>{exp.location}</Text>
              ) : null}
            </View>
          ) : null}

          {exp.responsibilities ? (
            <View style={styles.bulletList}>
              {exp.responsibilities
                .split("\n")
                .filter((line) => line.trim().length > 0)
                .map((line, j) => (
                  <View key={j.toString()} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{"\u2022"}</Text>
                    <Text style={styles.bulletText}>{line.trim()}</Text>
                  </View>
                ))}
            </View>
          ) : null}
        </View>
      ))}

      {projects.map((proj, i) => {
        const bulletsList = proj.description?.split("\n");

        return (
          <View key={proj.id ?? `proj-${i}`} style={styles.entryBlock}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.boldTitle}>{proj.name}</Text>
            </View>

            {bulletsList && bulletsList.length > 0 && (
              <View style={styles.bulletList}>
                {bulletsList.map((b, j) => (
                  <View key={j.toString()} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{"\u2022"}</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}

      {publications.map((pub, i) => (
        <View key={pub.id ?? `pub-${i}`} style={styles.entryBlock}>
          <View style={styles.flexRowBetween}>
            <Text style={styles.boldTitle}>{pub.title}</Text>
          </View>
          <Text style={styles.subtext}>{pub.authors.join(", ")}</Text>
          {pub.notes ? <Text style={styles.para}>{pub.notes}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function SkillsSection({ title, data, styles }: ISectionProps) {
  const skillGroups = useResumeStore((state) => state.skillGroups);
  const setSkillGroups = useResumeStore((state) => state.setSkillGroups);
  const topicsMap = useResumeLookup(HARDCODED_TOPICS);
  const categoriesMap = useResumeLookup(HARDCODED_CATEGORIES);

  const seeded = useRef(skillGroups.length > 0);

  useEffect(() => {
    if (seeded.current) {
      return;
    }
    seeded.current = true;
    const skillIds = data.professional?.skills ?? [];

    setSkillGroups([
      {
        id: "languages",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["languages"])
        ).join(", "),
        label: "Languages",
      },
      {
        id: "libraries",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["libraries", "frameworks"])
        ).join(", "),
        label: "Libraries & Frameworks",
      },
      {
        id: "tools",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["tools", "platforms"])
        ).join(", "),
        label: "Tools & Platforms",
      },
    ]);
  }, [data.professional?.skills, setSkillGroups, topicsMap, categoriesMap]);

  const visibleGroups = skillGroups.filter((group) => group.keywords.trim());
  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>

      {visibleGroups.map((group) => (
        <View key={group.id} style={styles.skillsRow}>
          <Text style={styles.skillsCategory}>{group.label.trim()}</Text>
          <Text style={styles.skillsList}>
            {group.keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter(Boolean)
              .join(", ")}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ActivitiesSection({ title, data, styles }: ISectionProps) {
  const { activities } = data;
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
      </View>

      {activities.map((act, i) => {
        const lineText = [act.name, act.organization, act.position]
          .filter(Boolean)
          .join(", ");
        const dateText = dateRange(
          act.startDate,
          act.endDate,
          act.isCurrent,
          true
        );

        return (
          <View key={act.id ?? i} style={{ marginBottom: 2 }}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.regularTitle}>{lineText}</Text>
              {dateText && (
                <Text style={styles.regularRightDate}>{dateText}</Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const SECTION_REGISTRY: Record<string, FC<ISectionProps>> = {
  activities: ActivitiesSection,
  education: EducationSection,
  projects: () => null,
  publications: () => null,
  references: () => null,
  skills: SkillsSection,
  summary: SummarySection,
  workExperience: TechnicalExperienceSection,
};

export function DataScienceTechTemplate({
  data,
  sections,
}: {
  data: TProfileFormData;
  sections: ISectionConfig[];
}) {
  const settings = usePdfSettings();
  const styles = useMemo(() => buildStyles(settings), [settings]);

  const { personal, professional, links } = data;
  const fullName = [personal.firstName, personal.lastName]
    .filter(Boolean)
    .join(" ");

  const githubLink = links?.find((l) => l.type === "github")?.url;
  const linkedinLink = links?.find((l) => l.type === "linkedin")?.url;
  const portfolioLink = links?.find((l) => l.type === "portfolio")?.url;

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {personal.phone ? (
              <Text style={styles.headerText}>{personal.phone}</Text>
            ) : null}
            {personal.location ? (
              <Text style={styles.headerText}>{personal.location}</Text>
            ) : null}
            {personal.email ? (
              <Text style={styles.headerText}>
                <Link
                  src={`mailto:${personal.email}`}
                  style={styles.headerLink}
                >
                  {personal.email}
                </Link>
              </Text>
            ) : null}
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.name}>{fullName}</Text>
            {professional?.title ? (
              <Text style={styles.roleTitle}>{professional.title}</Text>
            ) : null}
          </View>

          {/* Right Column */}
          <View style={styles.headerRight}>
            {portfolioLink ? (
              <Text style={styles.headerText}>
                Portfolio:{" "}
                <Link src={portfolioLink} style={styles.headerLink}>
                  {stripProtocol(portfolioLink)}
                </Link>
              </Text>
            ) : null}
            {githubLink ? (
              <Text style={styles.headerText}>
                <Link src={githubLink} style={styles.headerLink}>
                  {stripProtocol(githubLink)}
                </Link>
              </Text>
            ) : null}
            {linkedinLink ? (
              <Text style={styles.headerText}>
                <Link src={linkedinLink} style={styles.headerLink}>
                  {stripProtocol(linkedinLink)}
                </Link>
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.headerDivider} />

        {/* Dynamic Sections */}
        {sections
          .filter((sec) => sec.enabled)
          .map((sec) => {
            const SectionComponent = SECTION_REGISTRY[sec.id];
            if (!SectionComponent) {
              return null;
            }

            return (
              <SectionComponent
                data={data}
                key={sec.id}
                styles={styles}
                title={sec.title}
              />
            );
          })}
      </Page>
    </Document>
  );
}
