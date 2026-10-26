const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed data
const DEFAULT_SETTINGS = {
  clinicName: "DS Polyclinic — Physiotherapy & Rehabilitation",
  tagline: "Advanced Evidence-Based Pain Relief & Movement Restoration",
  phone: "+91 98910 18300",
  email: "dspolyclinicphysiotherapy@gmail.com",
  address: "SS Plaza 1, Sector-16B Extension, Greater Noida, UP 201009",
  whatsappNumber: "+919891018300",
  googleMapsUrl: "https://maps.google.com/?q=DS+Polyclinic+Physiotherapy+Greater+Noida",
  operatingHours: {
    weekdays: "Monday - Sunday: 9:00 AM - 9:30 PM",
    saturday: "Saturday: 9:00 AM - 9:30 PM",
    sunday: "Sunday: 9:00 AM - 9:30 PM"
  },
  geo: {
    latitude: 28.6089,
    longitude: 77.4475
  },
  adminUser: {
    username: "admin",
    passwordHash: "$2b$10$sZD3is6tSVZhs6Agy21b8eqf2BabFrPSRrFvGT4vVQkQCxzRxC.1u" // PhysioAdmin2026!
  }
};

const DEFAULT_SERVICES = [
  {
    id: "sports-rehab",
    name: "Sports Injury & Performance Rehab",
    icon: "running",
    shortDesc: "Rapid recovery protocols for athletes, runners, and active individuals.",
    duration: "45-60 min",
    price: "₹800",
    suitableFor: ["Sprains & Strains", "Rotator Cuff Tears", "ACL / Meniscus", "Tennis Elbow"],
    recoveryRate: "96%",
    badge: "Most Popular"
  },
  {
    id: "spine-sciatica",
    name: "Spinal Decompression & Sciatica Care",
    icon: "spine",
    shortDesc: "Non-surgical, targeted traction and spinal mobilization for chronic back pain.",
    duration: "50 min",
    price: "₹900",
    suitableFor: ["Herniated Discs", "Sciatica", "Lower Back Spasms", "Degenerative Disc"],
    recoveryRate: "94%",
    badge: "High Relief"
  },
  {
    id: "dry-needling",
    name: "Dry Needling & Myofascial Release",
    icon: "target",
    shortDesc: "Precision micro-needle stimulation targeting deep trigger points and muscle knots.",
    duration: "30-45 min",
    price: "₹700",
    suitableFor: ["Neck Stiffness", "Tension Headaches", "Muscle Spasms", "Fibromyalgia"],
    recoveryRate: "98%",
    badge: "Instant Release"
  },
  {
    id: "post-op-rehab",
    name: "Post-Surgical Joint Rehabilitation",
    icon: "shield",
    shortDesc: "Structured milestone-based protocols following joint replacements or ligament repairs.",
    duration: "60 min",
    price: "₹1,000",
    suitableFor: ["Hip / Knee Replacement", "Shoulder Reconstruction", "Fracture Recovery"],
    recoveryRate: "97%",
    badge: "Clinical Standard"
  },
  {
    id: "posture-ergonomics",
    name: "Postural Correction & Desk Ergonomics",
    icon: "user-check",
    shortDesc: "Biomechanics evaluation, spinal realignment, and corrective exercises for desk workers.",
    duration: "45 min",
    price: "₹600",
    suitableFor: ["Text Neck", "Thoracic Kyphosis", "Repetitive Strain (RSI)", "Shoulder Slump"],
    recoveryRate: "95%",
    badge: "Preventative"
  },
  {
    id: "home-visit",
    name: "Home Visit & Concierge Physiotherapy",
    icon: "home",
    shortDesc: "Hospital-grade one-on-one physiotherapy in the comfort and privacy of your home.",
    duration: "60 min",
    price: "₹1,000",
    suitableFor: ["Elderly Mobility", "Acute Post-Op Patients", "Severe Pain Limited Mobility"],
    recoveryRate: "98%",
    badge: "Premium Care"
  }
];

const DEFAULT_APPOINTMENTS = [
  {
    id: "APT-1001",
    patientName: "Amit Verma",
    patientEmail: "amit.v@example.com",
    patientPhone: "+91 99110 23456",
    serviceId: "sports-rehab",
    serviceName: "Sports Injury & Performance Rehab",
    painLocation: "Knee (ACL Post-Op)",
    urgency: "Moderate",
    consultationType: "In-Clinic",
    date: "2026-10-22",
    timeSlot: "10:00 AM",
    status: "Confirmed",
    doctorNotes: "Stage 2 knee flexion drills. Swelling reduced by 70%. Focus on quad strengthening.",
    createdAt: "2026-10-20T09:30:00Z"
  },
  {
    id: "APT-1002",
    patientName: "Priya Sharma",
    patientEmail: "priya.s@example.com",
    patientPhone: "+91 98765 43210",
    serviceId: "spine-sciatica",
    serviceName: "Spinal Decompression & Sciatica Care",
    painLocation: "Lower Back & Leg Numbness",
    urgency: "Severe / Acute",
    consultationType: "In-Clinic",
    date: "2026-10-21",
    timeSlot: "02:30 PM",
    status: "Pending",
    doctorNotes: "Requires immediate MRI review and gentle neural flossing.",
    createdAt: "2026-10-21T08:15:00Z"
  },
  {
    id: "APT-1003",
    patientName: "Rohit Chauhan",
    patientEmail: "rohit.c@example.com",
    patientPhone: "+91 98765 45678",
    serviceId: "dry-needling",
    serviceName: "Dry Needling & Myofascial Release",
    painLocation: "Neck & Upper Trapezius",
    urgency: "Mild",
    consultationType: "In-Clinic",
    date: "2026-10-19",
    timeSlot: "11:15 AM",
    status: "Completed",
    doctorNotes: "3 trigger points treated in trapezius and levator scapulae. Full pain relief reported.",
    createdAt: "2026-10-18T14:20:00Z"
  },
  {
    id: "APT-1004",
    patientName: "Sunita Yadav",
    patientEmail: "sunita.y@example.com",
    patientPhone: "+91 88765 67890",
    serviceId: "home-visit",
    serviceName: "Home Visit & Concierge Physiotherapy",
    painLocation: "Hip Mobility & Post-Op",
    urgency: "Moderate",
    consultationType: "Home Visit",
    date: "2026-10-23",
    timeSlot: "04:00 PM",
    status: "Confirmed",
    doctorNotes: "Home rehabilitation visit for post-arthroplasty gait training.",
    createdAt: "2026-10-21T11:00:00Z"
  }
];

const DEFAULT_LEADS = [
  {
    id: "LEAD-2001",
    name: "Manish Kumar",
    email: "manish.k@example.com",
    phone: "+91 97654 87654",
    painArea: "Shoulder (Rotator Cuff)",
    painSeverity: "7 / 10",
    duration: "2-4 Weeks",
    source: "Visual Body Navigator",
    status: "Contacted",
    notes: "Patient contacted via WhatsApp; interested in morning slot next Tuesday.",
    createdAt: "2026-10-21T09:45:00Z"
  },
  {
    id: "LEAD-2002",
    name: "Jyoti Patel",
    email: "jyoti.p@example.com",
    phone: "+91 98765 98765",
    painArea: "Lower Back (Desk Worker)",
    painSeverity: "8 / 10",
    duration: "More than 2 Months",
    source: "60-Second Recovery Quiz",
    status: "New",
    notes: "Suffering from sitting pain. Recommended Spinal Decompression & Ergonomic review.",
    createdAt: "2026-10-21T12:10:00Z"
  },
  {
    id: "LEAD-2003",
    name: "Arjun Pandey",
    email: "arjun.p@example.com",
    phone: "+91 88765 43210",
    painArea: "Ankle Sprain (Sports)",
    painSeverity: "6 / 10",
    duration: "3 Days ago",
    source: "Emergency Pain Relief Triage",
    status: "Booked",
    notes: "Converted to APT-1001 follow-up.",
    createdAt: "2026-10-20T16:30:00Z"
  }
];

const DEFAULT_REVIEWS = [
  {
    id: 1,
    name: "Rajesh Gupta",
    rating: 5,
    tag: "Sciatica & Herniated Disc",
    timeAgo: "2 weeks ago",
    text: "I was scheduled for back surgery, but Dr. Devansh's spinal decompression and rehabilitation plan completely got me out of pain within 4 sessions. I can pick up my daughter again without fear!",
    verified: true
  },
  {
    id: 2,
    name: "Manoj Tiwari",
    rating: 5,
    tag: "Marathon Runner - Achilles Rehab",
    timeAgo: "1 month ago",
    text: "Tore my calf/Achilles right before the Delhi Marathon. The sports rehab team here uses real biomechanical video analysis and targeted dry needling. Finished my race with a personal best!",
    verified: true
  },
  {
    id: 3,
    name: "Bharti Mishra",
    rating: 5,
    tag: "Frozen Shoulder (Adhesive Capsulitis)",
    timeAgo: "3 weeks ago",
    text: "Could barely lift my arm above shoulder height for 8 months. After 5 sessions of manual therapy and home exercises, I have 95% full range of motion. Truly life-changing care.",
    verified: true
  },
  {
    id: 4,
    name: "Karan Verma",
    rating: 5,
    tag: "Post-Op ACL Reconstruction",
    timeAgo: "Just recently",
    text: "The clinic atmosphere is state-of-the-art and motivating. They track every angle of your knee extension with precision. Best physio clinic in Noida without question.",
    verified: true
  }
];

const DEFAULT_AUDIT_LOGS = [
  {
    id: "LOG-001",
    timestamp: "2026-10-21T08:00:00Z",
    action: "SYSTEM_INITIALIZED",
    actor: "SYSTEM",
    details: "DS Polyclinic Physiotherapy Platform & Security Gateway online."
  }
];

// Helper to safely read and write JSON files
function readJSON(filename, defaultData) {
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      writeJSON(filename, defaultData);
      return defaultData;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return defaultData;
  }
}

function writeJSON(filename, data) {
  const filePath = path.join(DATA_DIR, filename);
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempPath, filePath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    if (fs.existsSync(tempPath)) {
      try { fs.unlinkSync(tempPath); } catch (_) {}
    }
    return false;
  }
}

// Database API wrapper
const db = {
  getSettings: () => readJSON('clinic_settings.json', DEFAULT_SETTINGS),
  updateSettings: (newSettings) => {
    const current = db.getSettings();
    const updated = { ...current, ...newSettings };
    writeJSON('clinic_settings.json', updated);
    db.logAudit("SETTINGS_UPDATED", "ADMIN", "Clinic settings updated");
    return updated;
  },

  getServices: () => readJSON('services.json', DEFAULT_SERVICES),
  updateService: (id, serviceData) => {
    const services = db.getServices();
    const idx = services.findIndex(s => s.id === id);
    if (idx !== -1) {
      services[idx] = { ...services[idx], ...serviceData };
      writeJSON('services.json', services);
      return services[idx];
    }
    return null;
  },

  getAppointments: () => readJSON('appointments.json', DEFAULT_APPOINTMENTS),
  createAppointment: (aptData) => {
    const appointments = db.getAppointments();
    const newApt = {
      id: `APT-${1000 + appointments.length + 1}`,
      createdAt: new Date().toISOString(),
      status: "Pending",
      doctorNotes: "",
      ...aptData
    };
    appointments.unshift(newApt);
    writeJSON('appointments.json', appointments);
    db.logAudit("APPOINTMENT_CREATED", "PATIENT", `New appointment for ${newApt.patientName} (${newApt.painLocation})`);
    return newApt;
  },
  updateAppointmentStatus: (id, status, notes = null) => {
    const appointments = db.getAppointments();
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      if (notes !== null) apt.doctorNotes = notes;
      writeJSON('appointments.json', appointments);
      db.logAudit("APPOINTMENT_UPDATED", "ADMIN", `Appointment ${id} status set to ${status}`);
      return apt;
    }
    return null;
  },
  deleteAppointment: (id) => {
    let appointments = db.getAppointments();
    const beforeLen = appointments.length;
    appointments = appointments.filter(a => a.id !== id);
    if (appointments.length !== beforeLen) {
      writeJSON('appointments.json', appointments);
      db.logAudit("APPOINTMENT_DELETED", "ADMIN", `Appointment ${id} deleted`);
      return true;
    }
    return false;
  },

  getLeads: () => readJSON('leads.json', DEFAULT_LEADS),
  createLead: (leadData) => {
    const leads = db.getLeads();
    const newLead = {
      id: `LEAD-${2000 + leads.length + 1}`,
      createdAt: new Date().toISOString(),
      status: "New",
      notes: "",
      ...leadData
    };
    leads.unshift(newLead);
    writeJSON('leads.json', leads);
    db.logAudit("LEAD_CAPTURED", "PATIENT", `New lead: ${newLead.name} (${newLead.painArea}) via ${newLead.source}`);
    return newLead;
  },
  updateLeadStatus: (id, status, notes = null) => {
    const leads = db.getLeads();
    const lead = leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      if (notes !== null) lead.notes = notes;
      writeJSON('leads.json', leads);
      db.logAudit("LEAD_UPDATED", "ADMIN", `Lead ${id} marked as ${status}`);
      return lead;
    }
    return null;
  },

  getReviews: () => readJSON('reviews.json', DEFAULT_REVIEWS),
  getAuditLogs: () => readJSON('audit_logs.json', DEFAULT_AUDIT_LOGS),
  logAudit: (action, actor, details) => {
    const logs = db.getAuditLogs();
    const newLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      details
    };
    logs.unshift(newLog);
    // Keep max 200 logs
    if (logs.length > 200) logs.pop();
    writeJSON('audit_logs.json', logs);
  }
};

module.exports = db;
