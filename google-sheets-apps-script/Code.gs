/**
 * ===================================================================
 *  AuraSpine Physiotherapy & Sports Rehabilitation
 *  Google Sheets + Google Apps Script Webhook Integration
 * ===================================================================
 *
 *  This script allows your physiotherapy website to automatically push
 *  all patient bookings, quiz assessments, and inquiries directly into
 *  this Google Sheet in real time!
 *
 *  SETUP INSTRUCTIONS (Takes less than 2 minutes):
 *  -------------------------------------------------
 *  1. Open Google Sheets (https://sheets.new) and name it "AuraSpine Clinic CRM".
 *  2. In the top menu, click: Extensions > Apps Script.
 *  3. Delete any default code in Code.gs, paste this entire script, and click Save (💾).
 *  4. Click "Deploy" > "New deployment".
 *  5. Click the gear icon (⚙️) next to "Select type" and choose "Web app".
 *  6. Fill in:
 *     - Description: AuraSpine Patient Booking Webhook
 *     - Execute as: Me (your Google account)
 *     - Who has access: Anyone (Important: so your website can send bookings!)
 *  7. Click "Deploy", authorize permissions when prompted.
 *  8. Copy the "Web app URL" (looks like: https://script.google.com/macros/s/.../exec).
 *  9. Paste that URL into your Clinic Admin Panel at /admin > "Clinic & SEO Settings"
 *     OR test it directly!
 * ===================================================================
 */

// Optional: Enter your clinic notification email here to get instant alerts
const CLINIC_ALERT_EMAIL = ""; // e.g. "doctor@auraspinephysio.com"

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    clinic: "AuraSpine Physiotherapy & Sports Rehabilitation",
    message: "Google Apps Script Webhook is active and listening for patient bookings!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = getOrCreateBookingSheet();
    let data;

    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "No data payload received"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const timestamp = new Date();
    const formattedDate = Utilities.formatDate(timestamp, Session.getScriptTimeZone() || "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");

    const bookingId = data.id || data.bookingId || ("APT-" + Math.floor(1000 + Math.random() * 9000));
    const patientName = data.patientName || data.name || "Anonymous Patient";
    const phone = data.patientPhone || data.phone || "";
    const email = data.patientEmail || data.email || "";
    const condition = data.painLocation || data.painArea || data.serviceName || "General Consultation";
    const urgency = data.urgency || data.painSeverity || "Moderate";
    const consultationType = data.consultationType || "In-Clinic";
    const appointmentDate = data.date || "Not Scheduled";
    const timeSlot = data.timeSlot || "Not Scheduled";
    const status = data.status || "Pending";
    const doctorNotes = data.doctorNotes || data.patientNotes || data.notes || "";
    const source = data.source || "Website Booking Form";

    // Append row to Google Sheet
    sheet.appendRow([
      formattedDate,
      bookingId,
      patientName,
      phone,
      email,
      condition,
      urgency,
      consultationType,
      appointmentDate,
      timeSlot,
      status,
      doctorNotes,
      source
    ]);

    // Send instant email notification if email is configured
    if (CLINIC_ALERT_EMAIL && CLINIC_ALERT_EMAIL.includes("@")) {
      const emailSubject = "⚡ New Patient Booking: " + patientName + " (" + condition + ")";
      const emailBody = "New Appointment Received!\n\n" +
        "Patient: " + patientName + "\n" +
        "Phone: " + phone + "\n" +
        "Email: " + email + "\n" +
        "Condition: " + condition + "\n" +
        "Urgency: " + urgency + "\n" +
        "Preferred Slot: " + appointmentDate + " at " + timeSlot + " (" + consultationType + ")\n" +
        "Notes: " + doctorNotes + "\n\n" +
        "View in your Google Sheet CRM: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();

      try {
        MailApp.sendEmail(CLINIC_ALERT_EMAIL, emailSubject, emailBody);
      } catch (mailErr) {
        Logger.log("Email notification could not be sent: " + mailErr);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Patient booking recorded successfully in Google Sheet!",
      bookingId: bookingId,
      patientName: patientName,
      timestamp: formattedDate
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Ensures the "Patient Bookings" sheet exists with formatted header row
 */
function getOrCreateBookingSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Patient Bookings");

  if (!sheet) {
    sheet = ss.insertSheet("Patient Bookings", 0);

    const headers = [
      "Timestamp",
      "Booking ID",
      "Patient Name",
      "Phone",
      "Email",
      "Condition / Pain Area",
      "Urgency / Severity",
      "Type (In-Clinic / Home)",
      "Preferred Date",
      "Time Slot",
      "Status",
      "Doctor / Clinical Notes",
      "Lead Source"
    ];

    sheet.appendRow(headers);

    // Style the header row (Medical Blue background, bold white text)
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#0F4C81");
    headerRange.setFontColor("#FFFFFF");
    headerRange.setFontWeight("bold");
    headerRange.setFontFamily("Segoe UI");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    sheet.setRowHeight(1, 36);

    // Format column widths for clean readability
    sheet.setColumnWidth(1, 160); // Timestamp
    sheet.setColumnWidth(2, 110); // ID
    sheet.setColumnWidth(3, 170); // Patient Name
    sheet.setColumnWidth(4, 150); // Phone
    sheet.setColumnWidth(5, 180); // Email
    sheet.setColumnWidth(6, 200); // Condition
    sheet.setColumnWidth(7, 130); // Urgency
    sheet.setColumnWidth(8, 140); // Type
    sheet.setColumnWidth(9, 130); // Date
    sheet.setColumnWidth(10, 110); // Time Slot
    sheet.setColumnWidth(11, 110); // Status
    sheet.setColumnWidth(12, 240); // Doctor Notes
    sheet.setColumnWidth(13, 150); // Source
  }

  return sheet;
}

/**
 * Run this function once manually in Apps Script editor to create the sheet and test headers!
 */
function testSetup() {
  const sheet = getOrCreateBookingSheet();
  sheet.appendRow([
    new Date(),
    "TEST-1001",
    "Sample Patient (Dr. Demo)",
    "+91 98450 12345",
    "patient@example.com",
    "Lower Back & Sciatica Relief",
    "Moderate",
    "In-Clinic",
    "2026-10-25",
    "10:00 AM",
    "Confirmed",
    "Initial diagnostic evaluation completed. Ready for manual mobilization.",
    "System Self-Test"
  ]);
  Logger.log("AuraSpine Sheet setup verified successfully!");
}
