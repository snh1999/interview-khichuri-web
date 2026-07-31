import { type FC, useEffect, useMemo, useRef } from "react";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers";
import type { ResumeTemplateConfig } from "@/components/resume/temp/template-registry";
import {
  dateRange,
  filterSkills,
  HARDCODED_CATEGORIES,
  HARDCODED_TOPICS,
  stripProtocol,
  useResumeLookup,
} from "@/components/resume/temp/utils";
import { type ISectionConfig, useResumeStore } from "@/store/resumeStore";
import {
  Document,
  Link,
  Page,
  type PdfSettings,
  StyleSheet,
  Text,
  usePdfSettings,
  View,
} from "./PDFAdapter";

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
    { id: "researchProjects", title: "Projects", enabled: true },
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
    boldRight: {
      fontSize: settings.fontSize,
      fontWeight: 700,
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

function SummarySection({ title, data, styles }: ISectionProps) {
  const summary = data.professional?.summary;
  if (!summary) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />
      <Text style={styles.para}>{summary}</Text>
    </View>
  );
}

function EducationSection({ title, data, styles }: ISectionProps) {
  const education = data.education;
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
              <Text style={styles.boldRight}>
                {[edu.location, edu.country].filter(Boolean).join(", ")}
              </Text>
            </View>

            {/* Row 2: Degree/Field (Italic) | Dates (Italic) */}
            <View style={styles.flexRowBetween}>
              <Text style={styles.italicSubtext}>
                {degreeLine}
                {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
              </Text>
              <Text style={styles.italicRight}>
                {dateRange(edu.startDate, edu.graduationDate, false, true)}
              </Text>
            </View>

            {edu.notes && <Text style={styles.para}>{edu.notes}</Text>}
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
  const workExperience = data.workExperience;
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
              <Text style={styles.boldRight}>
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
  const projects = data.researchProjects;
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {projects.map((proj, i) => {
        const bulletsList = proj.notes?.split("\n") ?? [];

        const techStackString = proj.skills?.length
          ? proj.skills.join(", ")
          : "";

        return (
          <View key={proj.id ?? i} style={styles.entryBlock}>
            <View style={styles.flexRowBetween}>
              <Text style={styles.boldTitle}>
                {proj.title}
                {techStackString ? (
                  <Text style={styles.italicSubtext}> | {techStackString}</Text>
                ) : null}
              </Text>
              {proj.date && <Text style={styles.boldRight}>{proj.date}</Text>}
            </View>

            {proj.organization && (
              <Text style={styles.italicSubtext}>{proj.organization}</Text>
            )}

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
        label: "Languages",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["languages"])
        ).join(", "),
      },
      {
        id: "frameworks",
        label: "Frameworks",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["libraries", "frameworks"])
        ).join(", "),
      },
      {
        id: "tools",
        label: "Developer Tools",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["tools", "platforms"])
        ).join(", "),
      },
      {
        id: "libraries",
        label: "Libraries",
        keywords: "",
      },
    ]);
  }, [data.professional?.skills, setSkillGroups, topicsMap, categoriesMap]);

  // If skills array contains strings formatted like "Languages: Python, Java", parse directly
  const rawSkills = data.professional?.skills ?? [];
  const parsedDirectSkills = rawSkills
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => {
      const idx = s.indexOf(":");
      if (idx !== -1) {
        return {
          label: s.slice(0, idx).trim(),
          keywords: s.slice(idx + 1).trim(),
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
      : visibleGroups.map((g) => ({ label: g.label, keywords: g.keywords }));

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
  const publications = data.publications;
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
            {pub.status && <Text style={styles.boldRight}>{pub.status}</Text>}
          </View>
          <Text style={styles.italicSubtext}>{pub.authors.join(", ")}</Text>
          {pub.venue && <Text style={styles.para}>{pub.venue}</Text>}
        </View>
      ))}
    </View>
  );
}

function ActivitiesSection({ title, data, styles }: ISectionProps) {
  const activities = data.activities;
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionRule} />

      {activities.map((act, i) => (
        <View key={act.id ?? i} style={styles.entryBlock}>
          <View style={styles.flexRowBetween}>
            <Text style={styles.boldTitle}>
              {[act.title, act.organization].filter(Boolean).join(", ")}
            </Text>
            {act.date && <Text style={styles.boldRight}>{act.date}</Text>}
          </View>
          {act.description && (
            <Text style={styles.para}>{act.description}</Text>
          )}
          {act.bullets && act.bullets.length > 0 && (
            <View style={styles.bulletList}>
              {act.bullets.map((b, j) => (
                <View key={j.toString()} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>{"\u2022"}</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const SECTION_REGISTRY: Record<string, FC<ISectionProps>> = {
  summary: SummarySection,
  education: EducationSection,
  workExperience: ExperienceSection,
  researchProjects: ProjectsSection,
  skills: SkillsSection,
  publications: PublicationsSection,
  activities: ActivitiesSection,
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

  // Build contact items array
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
  if (personal.location) {
    contactItems.push({ text: personal.location });
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
        {/* Centered Heading */}
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
