const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateAdmin, requireAdminAuth } = require('../auth');
const { loginLimiter, sanitizeObject } = require('../security');

// Admin Login
router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Username and password are required."
    });
  }

  const token = authenticateAdmin(username, password);
  if (!token) {
    db.logAudit("ADMIN_LOGIN_FAILED", username, `Failed login attempt from IP: ${req.ip}`);
    return res.status(401).json({
      success: false,
      error: "Invalid username or password."
    });
  }

  // Set HTTP-only secure cookie
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  });

  res.json({
    success: true,
    message: "Login successful.",
    token,
    user: username
  });
});

// Admin Logout
router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.json({ success: true, message: "Logged out successfully." });
});

// Check current session
router.get('/me', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: req.admin.user,
    role: req.admin.role
  });
});

// Dashboard Analytics & KPIs
router.get('/dashboard', requireAdminAuth, (req, res) => {
  const appointments = db.getAppointments();
  const leads = db.getLeads();

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
  const completedAppointments = appointments.filter(a => a.status === 'Completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled').length;

  const urgentCases = appointments.filter(a => a.urgency === 'Severe / Acute').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;

  // Pain area frequency
  const painAreaCounts = {};
  appointments.forEach(a => {
    const area = a.painLocation || 'Other';
    painAreaCounts[area] = (painAreaCounts[area] || 0) + 1;
  });
  leads.forEach(l => {
    const area = l.painArea || 'Other';
    painAreaCounts[area] = (painAreaCounts[area] || 0) + 1;
  });

  // Calculate estimated pipeline value ($95 average per session)
  const estimatedRevenue = (confirmedAppointments + completedAppointments) * 95;

  res.json({
    success: true,
    metrics: {
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      urgentCases,
      todayCount: todayAppointments.length,
      todayAppointments,
      totalLeads,
      newLeads,
      estimatedRevenue,
      painAreaCounts
    }
  });
});

// Appointments Management
router.get('/appointments', requireAdminAuth, (req, res) => {
  let appointments = db.getAppointments();
  const { status, search } = req.query;

  if (status && status !== 'all') {
    appointments = appointments.filter(a => a.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    appointments = appointments.filter(a =>
      (a.patientName && a.patientName.toLowerCase().includes(q)) ||
      (a.patientPhone && a.patientPhone.includes(q)) ||
      (a.painLocation && a.painLocation.toLowerCase().includes(q)) ||
      (a.serviceName && a.serviceName.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: appointments });
});

router.patch('/appointments/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, doctorNotes, date, timeSlot } = req.body;

  const appointments = db.getAppointments();
  const apt = appointments.find(a => a.id === id);

  if (!apt) {
    return res.status(404).json({ success: false, error: "Appointment not found." });
  }

  if (status) apt.status = status;
  if (doctorNotes !== undefined) apt.doctorNotes = doctorNotes;
  if (date) apt.date = date;
  if (timeSlot) apt.timeSlot = timeSlot;

  db.updateAppointmentStatus(id, apt.status, apt.doctorNotes);

  res.json({
    success: true,
    message: "Appointment updated successfully.",
    data: apt
  });
});

router.delete('/appointments/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const ok = db.deleteAppointment(id);
  if (ok) {
    res.json({ success: true, message: `Appointment ${id} deleted.` });
  } else {
    res.status(404).json({ success: false, error: "Appointment not found." });
  }
});

// Leads / Inquiries Management
router.get('/leads', requireAdminAuth, (req, res) => {
  let leads = db.getLeads();
  const { status, search } = req.query;

  if (status && status !== 'all') {
    leads = leads.filter(l => l.status.toLowerCase() === status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(l =>
      (l.name && l.name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.painArea && l.painArea.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, data: leads });
});

router.patch('/leads/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const updated = db.updateLeadStatus(id, status, notes);
  if (!updated) {
    return res.status(404).json({ success: false, error: "Lead not found." });
  }

  res.json({
    success: true,
    message: "Lead updated successfully.",
    data: updated
  });
});

// Clinic Settings
router.get('/settings', requireAdminAuth, (req, res) => {
  const settings = db.getSettings();
  const safe = { ...settings };
  delete safe.adminUser;
  res.json({ success: true, data: safe });
});

router.put('/settings', requireAdminAuth, (req, res) => {
  const cleanSettings = sanitizeObject(req.body);
  const updated = db.updateSettings(cleanSettings);
  const safe = { ...updated };
  delete safe.adminUser;
  res.json({
    success: true,
    message: "Clinic settings updated successfully.",
    data: safe
  });
});

// Audit Logs
router.get('/audit-logs', requireAdminAuth, (req, res) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, data: logs });
});

// CSV Export for Appointments
router.get('/export/appointments.csv', requireAdminAuth, (req, res) => {
  const appointments = db.getAppointments();
  const headers = "ID,Patient Name,Phone,Email,Service,Pain Location,Urgency,Type,Date,Time,Status,Doctor Notes,Created At\n";
  const rows = appointments.map(a => [
    `"${a.id}"`,
    `"${(a.patientName || '').replace(/"/g, '""')}"`,
    `"${a.patientPhone || ''}"`,
    `"${a.patientEmail || ''}"`,
    `"${(a.serviceName || '').replace(/"/g, '""')}"`,
    `"${(a.painLocation || '').replace(/"/g, '""')}"`,
    `"${a.urgency || ''}"`,
    `"${a.consultationType || ''}"`,
    `"${a.date || ''}"`,
    `"${a.timeSlot || ''}"`,
    `"${a.status || ''}"`,
    `"${(a.doctorNotes || '').replace(/"/g, '""')}"`,
    `"${a.createdAt || ''}"`
  ].join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="physio-appointments.csv"');
  res.send(headers + rows);
});

// CSV Export for Leads
router.get('/export/leads.csv', requireAdminAuth, (req, res) => {
  const leads = db.getLeads();
  const headers = "ID,Name,Phone,Email,Pain Area,Severity,Duration,Source,Status,Notes,Created At\n";
  const rows = leads.map(l => [
    `"${l.id}"`,
    `"${(l.name || '').replace(/"/g, '""')}"`,
    `"${l.phone || ''}"`,
    `"${l.email || ''}"`,
    `"${(l.painArea || '').replace(/"/g, '""')}"`,
    `"${l.painSeverity || ''}"`,
    `"${l.duration || ''}"`,
    `"${l.source || ''}"`,
    `"${l.status || ''}"`,
    `"${(l.notes || '').replace(/"/g, '""')}"`,
    `"${l.createdAt || ''}"`
  ].join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="physio-leads.csv"');
  res.send(headers + rows);
});

module.exports = router;
