/** User-facing copy for appointment-type management — shared by control panel editors. */

export const APPOINTMENT_TYPE_COPY = {
  pageTitleLabel: "Appointment Types",
  pageSubtitleLabel:
    "Manage organization-wide visit templates and doctor-specific custom types. Set visit fees here — they drive automatic invoice generation when appointments are completed.",
  additionalSectionTitle: "Additional Appointment Types",
  additionalSectionBlurb:
    "Visit types unique to this doctor. They appear on the public Services page next to organization-wide templates. Manage shared templates under Appointment Types.",
  globalSectionBlurb:
    "Organization-wide visit templates available to every doctor for booking and the public Services page. Only admins can add or remove templates here.",
  customSectionBlurb:
    "Doctor-specific visit types created by individual doctors. Admins can edit or remove any custom type. Prices set here override the doctor's default consultation fee for auto-invoicing.",
} as const;
