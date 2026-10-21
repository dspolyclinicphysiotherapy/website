const express = require('express');
const router = express.Router();
const db = require('../db');
const { publicBookingLimiter, sanitizeObject, verifyHoneypot } = require('../security');

// Get public clinic metadata & SEO configuration
router.get('/clinic/info', (req, res) => {
  const settings = db.getSettings();
  // Never expose admin password hash to public
  const safeSettings = { ...settings };
  delete safeSettings.adminUser;
  res.json({ success: true, data: safeSettings });
});

// Get clinic services
router.get('/services', (req, res) => {
  const services = db.getServices();
  res.json({ success: true, data: services });
});

// Get patient testimonials and Google reviews
router.get('/reviews', (req, res) => {
  const reviews = db.getReviews();
  res.json({ success: true, data: reviews });
});

// Public Appointment Booking Endpoint
router.post('/bookings', publicBookingLimiter, verifyHoneypot, (req, res) => {
  try {
    const rawData = req.body;
    const cleanData = sanitizeObject(rawData);

    // Validate required fields
    if (!cleanData.patientName || !cleanData.patientPhone) {
      return res.status(400).json({
        success: false,
        error: "Patient name and contact phone number are required."
      });
    }

    if (!cleanData.date || !cleanData.timeSlot) {
      return res.status(400).json({
        success: false,
        error: "Please select a preferred appointment date and time slot."
      });
    }

    // Default values if omitted
    const appointmentRecord = {
      patientName: cleanData.patientName,
      patientEmail: cleanData.patientEmail || "Not provided",
      patientPhone: cleanData.patientPhone,
      serviceId: cleanData.serviceId || "sports-rehab",
      serviceName: cleanData.serviceName || "Initial Diagnostic Consultation",
      painLocation: cleanData.painLocation || "General Consultation",
      urgency: cleanData.urgency || "Moderate",
      consultationType: cleanData.consultationType || "In-Clinic",
      date: cleanData.date,
      timeSlot: cleanData.timeSlot,
      patientNotes: cleanData.patientNotes || ""
    };

    const saved = db.createAppointment(appointmentRecord);

    res.status(201).json({
      success: true,
      message: "Your appointment request has been reserved! Our clinical coordinator will confirm via SMS / WhatsApp shortly.",
      data: saved
    });
  } catch (err) {
    console.error("Error creating appointment:", err);
    res.status(500).json({
      success: false,
      error: "An unexpected error occurred while booking your appointment. Please call us directly."
    });
  }
});

// Public Lead Capture (from Visual Pain Navigator or 60-Second Recovery Quiz)
router.post('/leads', publicBookingLimiter, verifyHoneypot, (req, res) => {
  try {
    const cleanData = sanitizeObject(req.body);

    if (!cleanData.name || !cleanData.phone) {
      return res.status(400).json({
        success: false,
        error: "Please provide your name and phone number so we can send your personalized recovery plan."
      });
    }

    const leadRecord = {
      name: cleanData.name,
      email: cleanData.email || "",
      phone: cleanData.phone,
      painArea: cleanData.painArea || "Not specified",
      painSeverity: cleanData.painSeverity || "Moderate",
      duration: cleanData.duration || "Recent",
      dailyImpact: cleanData.dailyImpact || "Mobility limitation",
      source: cleanData.source || "Website Triage",
      recommendedTreatment: cleanData.recommendedTreatment || "Comprehensive Diagnostic Assessment"
    };

    const saved = db.createLead(leadRecord);

    res.status(201).json({
      success: true,
      message: "Thank you! Your recovery assessment has been submitted. A physiotherapist will review your case and contact you.",
      data: saved
    });
  } catch (err) {
    console.error("Error creating lead:", err);
    res.status(500).json({
      success: false,
      error: "Unable to submit your inquiry at this moment. Please call our clinic directly."
    });
  }
});

module.exports = router;
