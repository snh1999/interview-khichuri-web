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
  black: "#000000",
  darkText: "#111111",
  grayText: "#333333",
  lineRule: "#000000",
};

export const jakesTemplateConfig: ResumeTemplateConfig = {
  sections: [
    { id: "summary", title: "Summary", enabled: true },
    { id: "education", title: "Education", enabled: true },
    { id: "workExperience", title: "Experience", enabled: true },
    { id: "projects", title: "Projects", enabled: true },
    { id: "skills", title: "Technical Skills", enabled: true },
    { id: "publications", title: "Publications", enabled: true },
    { id: "activities", title: "Activities", enabled: true },
  ],
  pdfSettings: {
    fontFamily: "Arimo",
    fontSize: 11,
    lineHeight: 1.1,
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
    // Header
    headerContainer: {
      alignItems: "center" as const,
      marginBottom: 8,
    },
    name: {
      fontSize: settings.fontSize * (22 / 11),
      lineHeight: 1.1,
      fontWeight: 700,
      color: COLORS.black,
      textAlign: "center" as const,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    contactRow: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      fontSize: settings.fontSize * (9.5 / 11),
      color: COLORS.grayText,
    },
    contactItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
    },
    sep: {
      marginHorizontal: 4,
      color: COLORS.grayText,
    },
    link: {
      color: COLORS.black,
      textDecoration: "underline" as const,
    },
    // Section Title & Divider (Jake's LaTeX titlerule)
    section: {
      marginTop: 6,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: settings.fontSize * (11.5 / 11),
      fontWeight: 700,
      color: COLORS.black,
      textTransform: "uppercase" as const,
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    sectionRule: {
      borderBottomWidth: 0.75,
      borderBottomColor: COLORS.lineRule,
      marginBottom: 4,
    },
    // Common Flex Rows
    flexRowBetween: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      alignItems: "flex-start" as const,
      width: "100%",
    },
    entryBlock: {
      marginBottom: 4,
    },
    boldTitle: {
      fontWeight: 700,
      color: COLORS.black,
      fontSize: settings.fontSize,
      flex: 1,
      paddingRight: 8,
    },
    rightText: {
      fontSize: settings.fontSize,
      color: COLORS.black,
      textAlign: "right" as const,
    },
    italicSubtext: {
      fontSize: settings.fontSize * (10 / 11),
      fontStyle: "italic" as const,
      color: COLORS.darkText,
      flex: 1,
      paddingRight: 8,
    },
    italicRight: {
      fontSize: settings.fontSize * (10 / 11),
      fontStyle: "italic" as const,
      color: COLORS.darkText,
      textAlign: "right" as const,
    },
    para: {
      fontSize: settings.fontSize * (10 / 11),
      lineHeight: 1.25,
      marginBottom: 2,
    },
    bold: {
      fontWeight: 700,
      color: COLORS.black,
    },
    italic: {
      fontStyle: "italic" as const,
    },
    // Bullet Lists
    bulletList: {
      marginTop: 1,
      marginBottom: 2,
    },
    bulletRow: {
      flexDirection: "row" as const,
      marginBottom: 1.5,
    },
    bulletMark: {
      width: 12,
      fontSize: settings.fontSize * (10 / 11),
    },
    bulletText: {
      flex: 1,
      fontSize: settings.fontSize * (10 / 11),
      lineHeight: 1.25,
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
    <View style={styles.section}>
      <View style={styles.sectionRule} />
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
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {education.map((edu, i) => {
        const degreeLine = [edu.degreeName, edu.fieldOfStudy]
          .filter(Boolean)
          .join(" in ");

        return (
          <View key={edu.id ?? i} style={styles.entryBlock}>
            {/* Row 1: Institution (Bold) | Location (Bold) */}
            <View style={styles.flexRowBetween}>
              <Text style={styles.boldTitle}>{edu.institution}</Text>
              <Text style={styles.rightText}>{edu.location ?? ""}</Text>
            </View>

            {/* Row 2: Degree/Field (Italic) | Dates (Italic) */}
            <View style={styles.flexRowBetween}>
              <Text style={styles.italicSubtext}>
                {degreeLine}
                {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
              </Text>
              <Text style={styles.italicRight}>
                {dateRange(edu.startDate, edu.endDate, false, true)}
              </Text>
            </View>

            {edu.notes ? <Text style={styles.para}>{edu.notes}</Text> : null}
            {edu.coursework && edu.coursework.length > 0 && (
              <Text style={styles.para}>
                <Text style={styles.bold}>Relevant Coursework: </Text>
                {edu.coursework.join(", ")}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ExperienceSection({ title, data, styles }: ISectionProps) {
  const { workExperience } = data;
  if (!workExperience || workExperience.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {workExperience.map((exp, i) => {
        const responsibilitiesList = exp.responsibilities
          ? exp.responsibilities
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : [];

        return (
          <View key={exp.id ?? i} style={styles.entryBlock}>
            {/* Row 1: Role Title (Bold) | Dates (Bold) */}
            <View style={styles.flexRowBetween}>
              <Text style={styles.boldTitle}>{exp.title}</Text>
              <Text style={styles.rightText}>
                {dateRange(exp.startDate, exp.endDate, exp.isCurrent)}
              </Text>
            </View>

            {/* Row 2: Company (Italic) | Location (Italic) */}
            <View style={styles.flexRowBetween}>
              <Text style={styles.italicSubtext}>{exp.company}</Text>
              <Text style={styles.italicRight}>{exp.location ?? ""}</Text>
            </View>

            {responsibilitiesList.length > 0 && (
              <View style={styles.bulletList}>
                {responsibilitiesList.map((resp, j) => (
                  <View key={j.toString()} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{"\u2022"}</Text>
                    <Text style={styles.bulletText}>{resp}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function ProjectsSection({ title, data, styles }: ISectionProps) {
  const topicsMap = useResumeLookup(HARDCODED_TOPICS);
  const { projects } = data;
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {projects.map((proj, i) => {
        const bulletsList = proj.description?.split("\n") ?? [];
        const techStackString = proj.skills?.length
          ? proj.skills
              .map((id) => topicsMap.get(id)?.name)
              .filter((name): name is string => Boolean(name))
              .join(", ")
          : "";

        return (
          <View key={proj.id ?? i} style={styles.entryBlock}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.boldTitle}>{proj.name}</Text>
              {proj.type === "research" ? (
                <Text style={styles.italicSubtext}>Research</Text>
              ) : null}
            </View>

            {techStackString ? (
              <Text style={styles.italicSubtext}>{techStackString}</Text>
            ) : null}

            {bulletsList.length > 0 && (
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
        id: "frameworks",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["libraries", "frameworks"])
        ).join(", "),
        label: "Frameworks",
      },
      {
        id: "tools",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["tools", "platforms"])
        ).join(", "),
        label: "Developer Tools",
      },
      {
        id: "libraries",
        keywords: "",
        label: "Libraries",
      },
    ]);
  }, [data.professional?.skills, setSkillGroups, topicsMap, categoriesMap]);

  const rawSkills = data.professional?.skills ?? [];
  const parsedDirectSkills = rawSkills
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => {
      const idx = s.indexOf(":");
      if (idx !== -1) {
        return {
          keywords: s.slice(idx + 1).trim(),
          label: s.slice(0, idx).trim(),
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{ label: string; keywords: string }>;

  const visibleGroups = skillGroups.filter((group) => group.keywords.trim());

  if (visibleGroups.length === 0 && parsedDirectSkills.length === 0) {
    return null;
  }

  const itemsToRender =
    parsedDirectSkills.length > 0
      ? parsedDirectSkills
      : visibleGroups.map((g) => ({ keywords: g.keywords, label: g.label }));

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {itemsToRender.map((item, idx) => (
        <Text key={idx.toString()} style={styles.para}>
          <Text style={styles.bold}>{item.label}: </Text>
          {item.keywords}
        </Text>
      ))}
    </View>
  );
}

function PublicationsSection({ title, data, styles }: ISectionProps) {
  const { publications } = data;
  if (!publications || publications.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {publications.map((pub, i) => (
        <View key={pub.id ?? i} style={styles.entryBlock}>
          <View style={styles.flexRowBetween}>
            <Text style={styles.boldTitle}>{pub.title}</Text>
            {pub.publicationType ? (
              <Text style={styles.rightText}>{pub.publicationType}</Text>
            ) : null}
          </View>
          <Text style={styles.italicSubtext}>{pub.authors.join(", ")}</Text>
          {pub.notes ? <Text style={styles.para}>{pub.notes}</Text> : null}
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
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {activities.map((act, i) => {
        const dateText = dateRange(
          act.startDate,
          act.endDate,
          act.isCurrent,
          true
        );
        const notesList = act.notes
          ? act.notes
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean)
          : [];

        return (
          <View key={act.id ?? i} style={styles.entryBlock}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.boldTitle}>
                {[act.name, act.organization, act.position]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              {dateText && <Text style={styles.rightText}>{dateText}</Text>}
            </View>
            {notesList.length > 0 && (
              <View style={styles.bulletList}>
                {notesList.map((b, j) => (
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
    </View>
  );
}

const SECTION_REGISTRY: Record<string, FC<ISectionProps>> = {
  activities: ActivitiesSection,
  education: EducationSection,
  projects: ProjectsSection,
  publications: PublicationsSection,
  skills: SkillsSection,
  summary: SummarySection,
  workExperience: ExperienceSection,
};

export function JakeResumeTemplate({
  data,
  sections,
}: {
  data: TProfileFormData;
  sections: ISectionConfig[];
}) {
  const settings = usePdfSettings();
  const styles = useMemo(() => buildStyles(settings), [settings]);
  const { personal, links } = data;

  const fullName = [personal.firstName, personal.lastName]
    .filter(Boolean)
    .join(" ");

  const contactItems: Array<{ text: string; url?: string }> = [];
  if (personal.phone) {
    contactItems.push({ text: personal.phone });
  }

  if (personal.email) {
    contactItems.push({
      text: personal.email,
      url: `mailto:${personal.email}`,
    });
  }

  if (links) {
    for (const link of links) {
      contactItems.push({
        text: stripProtocol(link.url),
        url: link.url,
      });
    }
  }

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{fullName}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, idx) => (
              <View key={idx.toString()} style={styles.contactItem}>
                {idx > 0 && <Text style={styles.sep}>|</Text>}
                {item.url ? (
                  <Link src={item.url} style={styles.link}>
                    {item.text}
                  </Link>
                ) : (
                  <Text>{item.text}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

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
