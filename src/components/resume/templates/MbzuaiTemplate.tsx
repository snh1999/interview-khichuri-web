import { type FC, useEffect, useMemo, useRef } from "react";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import type { ResumeTemplateConfig } from "@/components/resume/temp/template-registry.ts";
import {
  dateRange,
  filterSkills,
  HARDCODED_CATEGORIES,
  HARDCODED_TOPICS,
  useResumeLookup,
} from "@/components/resume/temp/utils.ts";
import {
  DEFAULT_SECTION_CONFIGS,
  type ISectionConfig,
  type TSectionIds,
  useResumeStore,
} from "@/store/resumeStore.ts";
import {
  Document,
  Link,
  Page,
  type PdfSettings,
  StyleSheet,
  Text,
  usePdfSettings,
  View,
} from "./PDFAdapter.tsx";

const COLORS = {
  titleBlue: "#00199e",
  subtitleBlue: "#2ec1e0",
  darkText: "#222222",
};

export const mbzuaiTemplateConfig: ResumeTemplateConfig = {
  sections: DEFAULT_SECTION_CONFIGS,
  pdfSettings: {
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 1.1,
    padding: 57.6,
  },
};

// name/sectionTitle scale off settings.fontSize using the original template's
// ratios (24/11 and 14/11) so resizing the base font resizes the whole doc.
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
    name: {
      fontSize: settings.fontSize * (24 / 11),
      lineHeight: 1,
      fontWeight: 700,
      color: COLORS.titleBlue,
      marginBottom: 6,
    },
    headerLine: {
      fontSize: settings.fontSize,
      lineHeight: 1.2,
    },
    url: {
      textDecoration: "none",
    },
    headerBlockSpacer: {
      marginBottom: 4,
    },
    section: {
      marginTop: 6,
    },
    sectionTitle: {
      fontSize: settings.fontSize * (14 / 11),
      lineHeight: 1,
      fontWeight: 700,
      color: COLORS.titleBlue,
      marginBottom: 6,
    },
    para: {
      marginBottom: 0.5,
    },
    entryBlock: {
      marginBottom: 3.3,
    },
    blueItem: {
      fontWeight: 600,
      color: COLORS.subtitleBlue,
      marginBottom: 0.5,
    },
    italic: {
      fontStyle: "italic" as const,
    },
    bold: {
      fontWeight: 700,
    },
    bulletList: {
      marginTop: 0,
    },
    bulletRow: {
      flexDirection: "row" as const,
      marginBottom: 0,
    },
    bulletMark: {
      width: 10,
    },
    bulletText: {
      flex: 1,
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

const LINK_LABELS: Record<string, string> = {
  github: "GitHub",
  gitlab: "GitLab",
  linkedin: "LinkedIn",
  portfolio: "Portfolio",
  blog: "Blog",
  scholar: "Scholar",
  other: "Link",
};

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
      {education.map((edu, i) => (
        <View key={edu.id ?? i} style={styles.entryBlock}>
          <Text style={styles.blueItem}>
            {dateRange(edu.startDate, edu.graduationDate, false, true)}
            {dateRange(edu.startDate, edu.graduationDate, false, true)
              ? ": "
              : ""}
            {edu.degreeName}
            {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
          </Text>
          <Text style={styles.italic}>
            {edu.institution}
            {edu.location ? `, ${edu.location}` : ""}
            {edu.country ? `, ${edu.country}.` : "."}
          </Text>
          {edu.notes && <Text style={styles.para}>{edu.notes}</Text>}
          {edu.gpa && (
            <Text style={styles.para}>
              <Text style={styles.bold}>GPA: </Text>
              {edu.gpa}
            </Text>
          )}
          {edu.coursework && edu.coursework.length > 0 && (
            <Text style={styles.para}>
              <Text style={styles.bold}>Relevant Coursework: </Text>
              {edu.coursework.join(", ")}.
            </Text>
          )}
          {edu.thesis && (
            <Text style={styles.para}>
              <Text style={styles.bold}>Thesis: </Text>
              {edu.thesis}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

function WorkExperienceSection({ title, data, styles }: ISectionProps) {
  const workExperience = data.workExperience;
  if (!workExperience || workExperience.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {workExperience.map((exp, i) => (
        <View key={exp.id ?? i} style={styles.entryBlock}>
          <Text style={styles.blueItem}>
            {dateRange(exp.startDate, exp.endDate, exp.isCurrent)}: {exp.title}
          </Text>
          <Text style={styles.italic}>
            {exp.company}
            {exp.location ? `, ${exp.location}` : ""}
          </Text>
          {exp.responsibilities && (
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
          )}
        </View>
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
      {publications.map((pub, i) => (
        <View key={pub.id ?? i} style={styles.entryBlock}>
          <Text style={styles.blueItem}>
            {pub.title}
            {pub.status ? ` ${pub.status}.` : ""}
            {pub.link ? " [Link]" : ""}
          </Text>
          <Text style={styles.italic}>{pub.authors.join(", ")}</Text>
          {pub.venue && <Text style={styles.italic}>{pub.venue}</Text>}
        </View>
      ))}
    </View>
  );
}

function ResearchProjectsSection({ title, data, styles }: ISectionProps) {
  const topicsMap = useResumeLookup(HARDCODED_TOPICS);

  const researchProjects = data.researchProjects;
  if (!researchProjects || researchProjects.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {researchProjects.map((proj, i) => {
        const bulletsList = proj.notes?.split("\n") ?? [];
        const projectSkills = proj.skills ?? [];
        return (
          <View key={proj.id ?? i} style={styles.entryBlock}>
            <Text style={styles.blueItem}>
              {proj.title}
              {proj.date ? ` | ${proj.date}` : ""}
            </Text>
            {proj.organization && (
              <Text style={styles.italic}>{proj.organization}</Text>
            )}
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
            {projectSkills.length > 0 && (
              <Text style={styles.para}>
                <Text style={styles.bold}>Tech Stack: </Text>
                {projectSkills
                  .map((id) => topicsMap.get(id)?.name)
                  .filter(Boolean)
                  .join(", ")}
              </Text>
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
        id: "libraries",
        label: "Libraries & Frameworks",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["libraries", "frameworks"])
        ).join(", "),
      },
      {
        id: "tools",
        label: "Tools & Platforms",
        keywords: filterSkills(
          skillIds,
          topicsMap,
          categoriesMap,
          new Set(["tools", "platforms"])
        ).join(", "),
      },
    ]);
  }, [data.professional?.skills, setSkillGroups, topicsMap, categoriesMap]);

  const visibleGroups = skillGroups.filter((group) => group.keywords.trim());
  if (visibleGroups.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {visibleGroups.map((group) => (
        <Text key={group.id} style={styles.para}>
          <Text style={styles.bold}>{group.label.trim()}: </Text>
          {group.keywords
            .split(",")
            .map((keyword) => keyword.trim())
            .filter(Boolean)
            .join(", ")}
        </Text>
      ))}
    </View>
  );
}

function ActivitiesSection({ title, data, styles }: ISectionProps) {
  const activities = data.activities; // TODO: add activities schema
  if (!activities || activities.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {activities.map((act, i) => (
        <View key={act.id ?? i} style={styles.entryBlock}>
          <Text style={styles.blueItem}>
            {act.title}
            {act.date ? ` | ${act.date}` : ""}
          </Text>
          {act.organization && (
            <Text style={styles.italic}>{act.organization}</Text>
          )}
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

function ReferencesSection({ title, data, styles }: ISectionProps) {
  const references: TProfileFormData["references"] = data.references;
  if (!references || references.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.referencesRow}>
        {references.map(
          (ref: NonNullable<TProfileFormData["references"]>[number], i) => (
            <View key={ref.id ?? i} style={styles.referenceCol}>
              <Text style={styles.bold}>{ref.name}</Text>
              {ref.title && <Text>{ref.title}</Text>}
              {ref.department && <Text>{ref.department}</Text>}
              {ref.institution && <Text>{ref.institution}</Text>}
              {ref.email && <Text>Email: {ref.email}</Text>}
            </View>
          )
        )}
      </View>
    </View>
  );
}

const SECTION_REGISTRY: Record<TSectionIds, FC<ISectionProps>> = {
  summary: SummarySection,
  education: EducationSection,
  workExperience: WorkExperienceSection,
  publications: PublicationsSection,
  researchProjects: ResearchProjectsSection,
  skills: SkillsSection,
  activities: ActivitiesSection,
  references: ReferencesSection,
};

export function MbzuaiTemplate({
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

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.name}>{fullName}</Text>

        {personal.location && (
          <Text style={styles.headerLine}>{personal.location}</Text>
        )}
        {personal.phone && (
          <Text style={styles.headerLine}>Mobile: {personal.phone}</Text>
        )}
        {personal.email && (
          <Text style={styles.headerLine}>Email: {personal.email}</Text>
        )}
        {links?.map((link) => (
          <Text key={link.type} style={styles.headerLine}>
            {LINK_LABELS[link.type] ?? "Link"}:{" "}
            <Link src={link.url}>{link.url}</Link>
          </Text>
        ))}
        {personal.nationality && (
          <Text style={styles.headerLine}>
            Nationality: {personal.nationality}
          </Text>
        )}

        <View style={styles.headerBlockSpacer} />

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
