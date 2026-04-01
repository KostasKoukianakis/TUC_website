/** Source of truth aligned with https://www.display.tuc.gr/en/lab-members — update when the site changes. */
export const DISPLAY_LAB_MEMBERS_PAGE =
  "https://www.display.tuc.gr/en/lab-members" as const;

export type LabTeamMember = {
  id: string;
  name: string;
  /** Short line next to the L-bracket (Faculty / Research partner). */
  category: "Faculty" | "Research partner";
  /** Full position / degrees as on the official page. */
  position: string;
  office: string;
  tel: string;
  /** Plain email (no mailto in data). */
  email: string;
  cvLabel: "CV" | "Short CV";
  /** Optional; defaults to lab members page when missing. */
  cvUrl?: string;
  initials: string;
};

/** Five roster entries: faculty first, then research partners (order as on the official page). */
export const LAB_TEAM_MEMBERS: LabTeamMember[] = [
  {
    id: "zervakis",
    name: "Michalis Zervakis",
    category: "Faculty",
    position:
      "Professor — School of Electrical and Computer Engineering (ECE) of the Technical University of Crete (TUC)",
    office:
      "Office 149.A06, 3rd floor, A Wing, Science Building, University Campus",
    tel: "+30 28210 37003",
    email: "mzervakis@tuc.gr",
    cvLabel: "CV",
    initials: "MZ",
  },
  {
    id: "moirogiorgou",
    name: "Konstantia (Dina) Moirogiorgou",
    category: "Research partner",
    position: "Electronic & Computer Engineer, M.Sc.",
    office: "Office 141.A33, 1st floor, Science Building, University Campus",
    tel: "+30 28210 37216",
    email: "kmoirogiorgou@tuc.gr",
    cvLabel: "Short CV",
    initials: "KM",
  },
  {
    id: "papadogiorgaki",
    name: "Maria Papadogiorgaki",
    category: "Research partner",
    position: "Electrical & Computer Engineer",
    office: "Office 141.A33, 1st floor, Science Building, University Campus",
    tel: "+30 28210 37216",
    email: "mpapadogiorgaki@tuc.gr",
    cvLabel: "CV",
    initials: "MP",
  },
  {
    id: "antonakakis",
    name: "Marios Antonakakis",
    category: "Research partner",
    position:
      "Dr. Biomedical Engineer, Electrical and Computer Engineer",
    office: "Office 141.A33, 1st floor, Science Building, University Campus",
    tel: "+30 28210 37216",
    email: "mantonakakis@tuc.gr",
    cvLabel: "Short CV",
    initials: "MA",
  },
  {
    id: "livanos",
    name: "Giorgos Livanos",
    category: "Research partner",
    position: "Electronic & Computer Engineer, M.Sc.",
    office: "Office 141.A33, 1st floor, Science Building, University Campus",
    tel: "+30 28210 37216",
    email: "glivanos@tuc.gr",
    cvLabel: "Short CV",
    initials: "GL",
  },
];

export function labMemberCvHref(member: LabTeamMember): string {
  return member.cvUrl ?? DISPLAY_LAB_MEMBERS_PAGE;
}

export function telHref(tel: string): string {
  return `tel:${tel.replace(/\s/g, "")}`;
}
