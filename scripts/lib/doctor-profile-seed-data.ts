/**
 * Shared professional fields for all 8 demo doctors — used by seed-test-user + seed-extended-schema.
 */

export type DoctorProfileSeed = {
  specialty: string;
  bio: string;
  phone: string;
  license_number: string;
  department: string;
  consultation_fee: number;
  office_location: string;
  languages_spoken: string[];
  years_of_experience: number;
  is_active: boolean;
};

/** Keys: test@doctor.com + demo.doctor2..8@healthcal.dev */
export const DOCTOR_PROFILES: Record<string, DoctorProfileSeed> = {
  "test@doctor.com": {
    specialty: "Internal Medicine",
    bio: "Dr. Müller is a board-certified internist with over 8 years of clinical experience at HealthCal Berlin. She specialises in preventive care, chronic disease management, and comprehensive annual health evaluations.",
    phone: "+49 30 123 456 00",
    license_number: "MED-2018-DE-001",
    department: "Internal Medicine",
    consultation_fee: 15000,
    office_location: "Room 101, Block A — Demo Clinic",
    languages_spoken: ["English", "German"],
    years_of_experience: 8,
    is_active: true,
  },
  "demo.doctor2@healthcal.dev": {
    specialty: "Cardiology",
    bio: "Dr. Laurent is an interventional cardiologist with 11 years of expertise in coronary artery disease, heart failure, and non-invasive cardiac imaging. He conducts regular electrocardiography and echocardiography clinics.",
    phone: "+49 30 234 567 00",
    license_number: "MED-2015-DE-002",
    department: "Cardiology",
    consultation_fee: 20000,
    office_location: "Cardiac Wing, Floor 2 — Demo Clinic",
    languages_spoken: ["English", "French"],
    years_of_experience: 11,
    is_active: true,
  },
  "demo.doctor3@healthcal.dev": {
    specialty: "Dermatology",
    bio: "Dr. García is a dermatologist specialising in medical and cosmetic skin conditions, including acne, eczema, psoriasis, and mole mapping. She has 6 years of dedicated clinical dermatology practice.",
    phone: "+49 30 345 678 00",
    license_number: "MED-2019-DE-003",
    department: "Dermatology",
    consultation_fee: 18000,
    office_location: "Derma Suite, Room 3B — Demo Clinic",
    languages_spoken: ["English", "Spanish"],
    years_of_experience: 6,
    is_active: true,
  },
  "demo.doctor4@healthcal.dev": {
    specialty: "Neurology",
    bio: "Dr. Al-Rashid is a consultant neurologist with 14 years of experience treating headache disorders, epilepsy, multiple sclerosis, and movement disorders. He is an active researcher in neuroinflammatory diseases.",
    phone: "+49 30 456 789 00",
    license_number: "MED-2012-DE-004",
    department: "Neurology",
    consultation_fee: 22000,
    office_location: "Neuro Clinic, Floor 4 — Demo Clinic",
    languages_spoken: ["English", "German", "Arabic"],
    years_of_experience: 14,
    is_active: true,
  },
  "demo.doctor5@healthcal.dev": {
    specialty: "Pediatrics",
    bio: "Dr. Yıldız is a paediatric physician with 5 years of experience in child wellness, vaccinations, developmental assessments, and management of acute childhood illnesses. She takes a family-centred care approach.",
    phone: "+49 30 567 890 00",
    license_number: "MED-2020-DE-005",
    department: "Pediatrics",
    consultation_fee: 12000,
    office_location: "Children's Wing, Room 5 — Demo Clinic",
    languages_spoken: ["English", "Turkish"],
    years_of_experience: 5,
    is_active: true,
  },
  "demo.doctor6@healthcal.dev": {
    specialty: "Oncology",
    bio: "Dr. Kowalski is a medical oncologist with 16 years of clinical and research experience in haematological malignancies, solid tumour chemotherapy, and targeted therapies. He leads the tumour board at HealthCal Berlin.",
    phone: "+49 30 678 901 00",
    license_number: "MED-2010-DE-006",
    department: "Oncology",
    consultation_fee: 25000,
    office_location: "Cancer Centre, Floor 6 — Demo Clinic",
    languages_spoken: ["English", "German", "Polish"],
    years_of_experience: 16,
    is_active: true,
  },
  "demo.doctor7@healthcal.dev": {
    specialty: "Orthopedics",
    bio: "Dr. Rossi is an orthopaedic surgeon specialising in sports injuries, joint replacement, and spinal disorders. With 10 years of surgical experience, he combines minimally invasive techniques with evidence-based rehabilitation.",
    phone: "+49 30 789 012 00",
    license_number: "MED-2016-DE-007",
    department: "Orthopedics",
    consultation_fee: 19000,
    office_location: "Ortho Block, Room 7 — Demo Clinic",
    languages_spoken: ["English", "Italian"],
    years_of_experience: 10,
    is_active: true,
  },
  "demo.doctor8@healthcal.dev": {
    specialty: "Psychiatry",
    bio: "Dr. Volkov is a consultant psychiatrist with 9 years of clinical experience in mood disorders, anxiety, PTSD, and psychotherapy. He integrates pharmacotherapy with cognitive-behavioural approaches for holistic patient care.",
    phone: "+49 30 890 123 00",
    license_number: "MED-2017-DE-008",
    department: "Psychiatry",
    consultation_fee: 17000,
    office_location: "Mental Health Suite, Level 2 — Demo Clinic",
    languages_spoken: ["English", "German", "Russian"],
    years_of_experience: 9,
    is_active: true,
  },
};

export function getDoctorProfileSeed(email: string): DoctorProfileSeed | undefined {
  return DOCTOR_PROFILES[email];
}
