export const RELEASE_STATUSES = ["Planning", "In Progress", "Released"];

// Sort options for releases
export const RELEASE_SORT_OPTIONS = [
  { value: "target_date_asc", label: "Target Date (Earliest First)" },
  { value: "target_date_desc", label: "Target Date (Latest First)" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "status_asc", label: "Status (A-Z)" },
  { value: "created_date_desc", label: "Created Date (Newest First)" },
  { value: "created_date_asc", label: "Created Date (Oldest First)" },
];

// Default filter state for releases
export const DEFAULT_RELEASE_FILTERS = {
  status: [],
  target_date_from: "",
  target_date_to: "",
  version: "",
  search: "",
};
