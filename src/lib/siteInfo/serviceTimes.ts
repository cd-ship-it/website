import { getEntry } from "astro:content";
import type { LocalizedText } from "../i18n";

export type LocalizedValue = string | LocalizedText;

export interface ServiceTimesCampus {
  campusName: LocalizedValue;
  worshipDate: LocalizedValue;
  services: LocalizedValue[];
  orangeKidsAvailable?: boolean;
}

export interface ServiceTimesData {
  sectionHeading?: LocalizedText;
  campuses: ServiceTimesCampus[];
}

function asLocalizedText(value: LocalizedValue): LocalizedText {
  if (typeof value === "string") return { en: value };
  return value;
}

export function getEnglishText(value: LocalizedValue): string {
  return typeof value === "string" ? value : value.en;
}

export function normalizeCampusKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function slugifyCampusName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-");
}

export async function getServiceTimesData(): Promise<ServiceTimesData> {
  const serviceTimesEntry = await getEntry("siteInfo", "service-times");
  return {
    sectionHeading: serviceTimesEntry?.data.sectionHeading,
    campuses: (serviceTimesEntry?.data.campuses ?? []) as ServiceTimesCampus[],
  };
}

export async function getServiceTimesCampuses(): Promise<ServiceTimesCampus[]> {
  const data = await getServiceTimesData();
  return data.campuses;
}

export async function getCampusNames(): Promise<string[]> {
  const campuses = await getServiceTimesCampuses();
  return campuses.map((campus) => getEnglishText(campus.campusName));
}

export async function getCampusCount(): Promise<number> {
  const names = await getCampusNames();
  return names.length;
}

export async function getCampusByEnglishName(
  campusNameEn: string,
): Promise<ServiceTimesCampus | undefined> {
  const campuses = await getServiceTimesCampuses();
  return campuses.find((campus) => getEnglishText(campus.campusName) === campusNameEn);
}

export async function isOrangeKidsAvailableAtCampus(
  campusNameEn: string,
): Promise<boolean> {
  const campus = await getCampusByEnglishName(campusNameEn);
  return campus?.orangeKidsAvailable !== false;
}

export function filterCampusesForOrangeKids(
  campuses: ServiceTimesCampus[],
): ServiceTimesCampus[] {
  return campuses.filter((campus) => campus.orangeKidsAvailable !== false);
}

export async function assertKnownCampusNames(
  campusNames: readonly string[],
  sourceLabel: string,
): Promise<void> {
  const knownNames = new Set(await getCampusNames());
  const unknown = campusNames.filter((name) => !knownNames.has(name));
  if (unknown.length > 0) {
    throw new Error(
      `${sourceLabel} references unknown campus names: ${unknown.join(", ")}. Update service-times.md or ${sourceLabel}.`,
    );
  }
}

export async function getCampusNavChildren(): Promise<
  Array<{ id: string; label: LocalizedText; href: string }>
> {
  const campuses = await getServiceTimesCampuses();
  return campuses.map((campus) => {
    const campusName = asLocalizedText(campus.campusName);
    const slug = slugifyCampusName(campusName.en);
    return {
      id: slug,
      label: campusName,
      href: `/campus/${slug}`,
    };
  });
}
