import { type FC, useEffect, useMemo, useRef } from "react";
import type { TProfileFormData } from "@/components/job-profile/profile.helpers.ts";
import type { ResumeTemplateConfig } from "@/components/resume/template-registry.ts";
import {
  dateRange,
  filterSkills,
  HARDCODED_CATEGORIES,
  HARDCODED_TOPICS,
  useResumeLookup,
} from "@/components/resume/utils.ts";
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
} from "../PDFAdapter.tsx";

const COLORS = {
  darkText: "#222222",
  subtitleBlue: "#2ec1e0",
  titleBlue: "#00199e",
};

export const mbzuaiTemplateConfig: ResumeTemplateConfig = {
  pdfSettings: {
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 1.1,
    padding: 57.6,
  },
  sections: DEFAULT_SECTION_CONFIGS,
};

// name/sectionTitle scale off settings.fontSize using the original template's
// ratios (24/11 and 14/11) so resizing the base font resizes the whole doc.
function buildStyles(settings: PdfSettings) {
  return StyleSheet.create({
    blueItem: {
      color: COLORS.subtitleBlue,
      fontWeight: 600,
      marginBottom: 0.5,
    },
    bold: {
      fontWeight: 700,
    },
    bulletList: {
      marginTop: 0,
    },
    bulletMark: {
      width: 10,
    },
    bulletRow: {
      flexDirection: "row" as const,
      marginBottom: 0,
    },
    bulletText: {
      flex: 1,
    },
    entryBlock: {
      marginBottom: 3.3,
    },
    headerBlockSpacer: {
      marginBottom: 4,
    },
    headerLine: {
      fontSize: settings.fontSize,
      lineHeight: 1.2,
    },
    italic: {
      fontStyle: "italic" as const,
    },
    name: {
      color: COLORS.titleBlue,
      fontSize: settings.fontSize * (24 / 11),
      fontWeight: 700,
      lineHeight: 1,
      marginBottom: 6,
    },
    page: {
      color: COLORS.darkText,
      fontFamily: settings.fontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      paddingBottom: settings.padding,
      paddingLeft: settings.padding,
      paddingRight: settings.padding,
      paddingTop: settings.padding,
    },
    para: {
      marginBottom: 0.5,
    },
    referenceCol: {
      marginBottom: 6,
      width: "48%",
    },
    referencesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    } as const,
    section: {
      marginTop: 6,
    },
    sectionTitle: {
      color: COLORS.titleBlue,
      fontSize: settings.fontSize * (14 / 11),
      fontWeight: 700,
      lineHeight: 1,
      marginBottom: 6,
    },
    url: {
      textDecoration: "none",
    },
  });
}

const LINK_LABELS: Record<string, string> = {
  blog: "Blog",
  github: "GitHub",
  gitlab: "GitLab",
  linkedin: "LinkedIn",
  other: "Link",
  portfolio: "Portfolio",
  scholar: "Scholar",
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
  const { education } = data;
  if (!education || education.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {education.map((edu, i) => (
        <View key={edu.id ?? i} style={styles.entryBlock}>
          <Text style={styles.blueItem}>
            {dateRange(edu.startDate, edu.endDate, false, true)}
            {dateRange(edu.startDate, edu.endDate, false, true) ? ": " : ""}
            {edu.degreeName}
            {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
          </Text>
          <Text style={styles.italic}>
            {edu.institution}
            {edu.location ? `, ${edu.location}.` : "."}
          </Text>
          {edu.notes ? <Text style={styles.para}>{edu.notes}</Text> : null}
          {edu.gpa ? (
            <Text style={styles.para}>
              <Text style={styles.bold}>GPA: </Text>
              {edu.gpa}
            </Text>
          ) : null}
          {edu.coursework && edu.coursework.length > 0 ? (
            <Text style={styles.para}>
              <Text style={styles.bold}>Relevant Coursework: </Text>
              {edu.coursework.join(", ")}.
            </Text>
          ) : null}
          {edu.thesis ? (
            <Text style={styles.para}>
              <Text style={styles.bold}>Thesis: </Text>
              {edu.thesis}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function WorkExperienceSection({ title, data, styles }: ISectionProps) {
  const { workExperience } = data;
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
      {publications.map((pub, i) => (
        <View key={pub.id ?? i} style={styles.entryBlock}>
          <Text style={styles.blueItem}>
            {pub.title}
            {pub.publicationType ? ` ${pub.publicationType}.` : ""}
            {pub.link ? " [Link]" : ""}
          </Text>
          <Text style={styles.italic}>{pub.authors.join(", ")}</Text>
          {pub.notes ? <Text style={styles.italic}>{pub.notes}</Text> : null}
        </View>
      ))}
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
      {projects.map((proj, i) => {
        const bulletsList = proj.description?.split("\n") ?? [];
        const projectSkills = proj.skills ?? [];
        return (
          <View key={proj.id ?? i} style={styles.entryBlock}>
            <Text style={styles.blueItem}>
              {proj.name}
              {proj.type === "research" ? " (Research)" : ""}
            </Text>
            {bulletsList && bulletsList.length > 0 ? (
              <View style={styles.bulletList}>
                {bulletsList.map((b, j) => (
                  <View key={j.toString()} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{"\u2022"}</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {projectSkills.length > 0 && (
              <Text style={styles.para}>
                <Text style={styles.bold}>Tech Stack: </Text>
                {projectSkills
                  .map((id) => topicsMap.get(id)?.name)
                  .filter((name): name is string => Boolean(name))
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
  const { activities } = data;
  if (!activities || activities.length === 0) {
    return null;
  }
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
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
            <Text style={styles.blueItem}>
              {act.name}
              {dateText ? ` | ${dateText}` : ""}
            </Text>
            {act.organization ? (
              <Text style={styles.italic}>{act.organization}</Text>
            ) : null}
            {notesList.length > 0 ? (
              <View style={styles.bulletList}>
                {notesList.map((b, j) => (
                  <View key={j.toString()} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>{"\u2022"}</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
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
              {ref.title ? <Text>{ref.title}</Text> : null}
              {ref.company ? <Text>{ref.company}</Text> : null}
              {ref.email ? <Text>Email: {ref.email}</Text> : null}
              {ref.phone ? <Text>Phone: {ref.phone}</Text> : null}
            </View>
          )
        )}
      </View>
    </View>
  );
}

const SECTION_REGISTRY: Record<TSectionIds, FC<ISectionProps>> = {
  activities: ActivitiesSection,
  education: EducationSection,
  projects: ProjectsSection,
  publications: PublicationsSection,
  references: ReferencesSection,
  skills: SkillsSection,
  summary: SummarySection,
  workExperience: WorkExperienceSection,
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

        {personal.location ? (
          <Text style={styles.headerLine}>{personal.location}</Text>
        ) : null}
        {personal.phone ? (
          <Text style={styles.headerLine}>Mobile: {personal.phone}</Text>
        ) : null}
        {personal.email ? (
          <Text style={styles.headerLine}>Email: {personal.email}</Text>
        ) : null}
        {links?.map((link) => (
          <Text key={link.type} style={styles.headerLine}>
            {LINK_LABELS[link.type] ?? "Link"}:{" "}
            <Link src={link.url}>{link.url}</Link>
          </Text>
        ))}
        {personal.nationality ? (
          <Text style={styles.headerLine}>
            Nationality: {personal.nationality}
          </Text>
        ) : null}

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
