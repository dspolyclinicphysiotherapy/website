// KineticPulse Physiotherapy & Sports Rehabilitation
// Interactive Frontend Controller

document.addEventListener('DOMContentLoaded', () => {
  initBodyNavigator();
  initQuiz();
  initBookingModal();
  initFaqAccordion();
  initMobileNav();
  initClinicStatus();
});

// ==========================================
// 1. INTERACTIVE VISUAL BODY NAVIGATOR
// ==========================================
const PAIN_REGIONS_DATA = {
  neck: {
    title: "Neck & Cervical Spine",
    icon: "🧘‍♂️",
    commonConditions: "Cervical Spondylosis, Text Neck, Whiplash, Occipital Headaches",
    recoveryWeeks: "2 - 4 Weeks (Average 4 Sessions)",
    recoveryPercent: 96,
    recommendedTreatments: ["Dry Needling", "Joint Mobilization", "Postural Realignment", "Ergonomic Setup"],
    specialist: "Dr. Sarah Jenkins (Spine Specialist)",
    reliefSpeed: "75% pain reduction within 48 hours of initial session"
  },
  shoulder: {
    title: "Shoulder & Rotator Cuff",
    icon: "💪",
    commonConditions: "Rotator Cuff Tendinitis, Frozen Shoulder, Subacromial Impingement, Bursitis",
    recoveryWeeks: "4 - 6 Weeks (Average 5 Sessions)",
    recoveryPercent: 94,
    recommendedTreatments: ["Shockwave Therapy", "Manual Therapy", "Scapular Stabilisation", "Strengthening"],
    specialist: "Dr. Marcus Vance (Sports & Upper Limb)",
    reliefSpeed: "Restores overhead arm mobility without cortisone injections"
  },
  lumbar: {
    title: "Lower Back & Sciatica (Lumbar)",
    icon: "⚡",
    commonConditions: "Sciatica Nerve Compression, Herniated Disc, Chronic Spasms, Facet Joint Arthritis",
    recoveryWeeks: "3 - 5 Weeks (Average 4.5 Sessions)",
    recoveryPercent: 97,
    recommendedTreatments: ["Spinal Decompression", "Neural Flossing", "Core Stabilization", "Myofascial Release"],
    specialist: "Dr. Sarah Jenkins (Orthopedic Spine Lead)",
    reliefSpeed: "91% avoid invasive surgical intervention"
  },
  knee: {
    title: "Knee & Meniscus Joint",
    icon: "🦵",
    commonConditions: "ACL / MCL Sprains, Meniscal Tears, Runner's Knee (PFPS), Patellar Tendinitis",
    recoveryWeeks: "4 - 8 Weeks (Post-Op or Conservative)",
    recoveryPercent: 98,
    recommendedTreatments: ["Biomechanical Gait Analysis", "Targeted Quad/Hamstring Loading", "Knee Taping", "Laser Therapy"],
    specialist: "Dr. Elena Rostova (Joint & Post-Op Specialist)",
    reliefSpeed: "Restores full weight-bearing comfort and squat depth"
  },
  ankle: {
    title: "Ankle & Foot (Plantar Fascia)",
    icon: "👟",
    commonConditions: "Plantar Fasciitis, Inversion Ankle Sprains, Achilles Tendonitis, Heel Spurs",
    recoveryWeeks: "3 - 5 Weeks (Average 4 Sessions)",
    recoveryPercent: 95,
    recommendedTreatments: ["Deep Friction Massage", "Custom Orthotic Triage", "Eccentric Loading", "Ultrasound"],
    specialist: "Dr. Marcus Vance (Sports Rehabilitation)",
    reliefSpeed: "Walk without morning heel stabbing pain within 10 days"
  },
  hip: {
    title: "Hip & Pelvic Alignment",
    icon: "🏃‍♀️",
    commonConditions: "Hip Impingement (FAI), Piriformis Syndrome, Trochanteric Bursitis, Labral Tears",
    recoveryWeeks: "4 - 6 Weeks (Average 5 Sessions)",
    recoveryPercent: 93,
    recommendedTreatments: ["Pelvic Realignment", "Deep Gluteal Mobilization", "Hip Flexor Release", "Pilates Rehab"],
    specialist: "Dr. Elena Rostova (Mobility Specialist)",
    reliefSpeed: "Eradicates deep groin and buttock discomfort when sitting or walking"
  }
};

function initBodyNavigator() {
  const hotspots = document.querySelectorAll('.body-hotspot');
  const pillBtns = document.querySelectorAll('.body-pill-btn');

  function updateRegion(regionKey) {
    const data = PAIN_REGIONS_DATA[regionKey] || PAIN_REGIONS_DATA.lumbar;

    // Update active UI classes
    hotspots.forEach(hs => hs.classList.toggle('active', hs.dataset.region === regionKey));
    pillBtns.forEach(p => p.classList.toggle('active', p.dataset.region === regionKey));

    // Update insight card details
    document.getElementById('pain-region-title').textContent = data.title;
    document.getElementById('pain-region-icon').textContent = data.icon;
    document.getElementById('pain-conditions').textContent = data.commonConditions;
    document.getElementById('recovery-time-val').textContent = data.recoveryWeeks;
    document.getElementById('recovery-progress-bar').style.width = `${data.recoveryPercent}%`;
    document.getElementById('recovery-percent-label').textContent = `${data.recoveryPercent}% Success Rate`;
    document.getElementById('relief-speed-text').textContent = data.reliefSpeed;
    document.getElementById('assigned-specialist').textContent = data.specialist;

    // Treatments tags
    const tagsContainer = document.getElementById('pain-treatment-tags');
    tagsContainer.innerHTML = '';
    data.recommendedTreatments.forEach(t => {
      const span = document.createElement('span');
      span.className = 'treatment-tag';
      span.innerHTML = `<span>✓</span> ${t}`;
      tagsContainer.appendChild(span);
    });

    // Update fast book CTA
    const bookCta = document.getElementById('pain-book-cta');
    bookCta.textContent = `⚡ Book Fast Relief for ${data.title}`;
    bookCta.onclick = () => openBookingModal(data.title);
  }

  hotspots.forEach(hs => {
    hs.addEventListener('click', () => updateRegion(hs.dataset.region));
  });

  pillBtns.forEach(pill => {
    pill.addEventListener('click', () => updateRegion(pill.dataset.region));
  });

  // Default to lower back
  updateRegion('lumbar');
}

// ==========================================
// 2. 60-SECOND INTERACTIVE RECOVERY QUIZ
// ==========================================
function initQuiz() {
  let currentStep = 1;
  const quizAnswers = {
    painLocation: 'Lower Back',
    painSeverity: '7',
    duration: '1-2 Months',
    dailyImpact: 'Sitting & Desk Work'
  };

  const steps = document.querySelectorAll('.quiz-step-content');
  const dots = document.querySelectorAll('.quiz-step-dot');

  window.selectQuizOption = function(field, value, element) {
    quizAnswers[field] = value;
    const parent = element.parentElement;
    parent.querySelectorAll('.quiz-option-card').forEach(c => c.classList.remove('selected'));
    element.classList.add('selected');
  };

  const painSlider = document.getElementById('pain-slider-input');
  if (painSlider) {
    painSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      quizAnswers.painSeverity = val;
      const display = document.getElementById('pain-slider-val');
      let label = "Moderate Discomfort";
      if (val <= 3) label = "Mild / Manageable";
      else if (val <= 6) label = "Moderate / Impairing";
      else if (val <= 8) label = "Severe / Disabling";
      else label = "Critical / Acute Pain";
      display.textContent = `${val} / 10 - ${label}`;
    });
  }

  window.nextQuizStep = function(stepNum) {
    if (stepNum > 4) {
      submitQuizLead();
      return;
    }

    currentStep = stepNum;
    steps.forEach(s => s.classList.remove('active'));
    document.getElementById(`quiz-step-${stepNum}`).classList.add('active');

    dots.forEach((dot, idx) => {
      dot.classList.remove('active');
      if (idx + 1 === stepNum) dot.classList.add('active');
      if (idx + 1 < stepNum) dot.classList.add('completed');
    });
  };

  async function submitQuizLead() {
    const nameInput = document.getElementById('quiz-name-input');
    const phoneInput = document.getElementById('quiz-phone-input');
    const emailInput = document.getElementById('quiz-email-input');
    const honeypotInput = document.getElementById('quiz-hp-token');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';

    if (!name || !phone) {
      alert("Please enter your name and phone number to generate your clinical recovery prescription.");
      return;
    }

    const payload = {
      name,
      phone,
      email,
      painArea: quizAnswers.painLocation,
      painSeverity: `${quizAnswers.painSeverity} / 10`,
      duration: quizAnswers.duration,
      dailyImpact: quizAnswers.dailyImpact,
      source: "60-Second Recovery Quiz",
      hp_clinic_token: honeypotInput ? honeypotInput.value : ""
    };

    try {
      const btn = document.getElementById('quiz-submit-btn');
      btn.textContent = "Analyzing clinical data...";
      btn.disabled = true;

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        document.getElementById('quiz-step-4').classList.remove('active');
        const resultStep = document.getElementById('quiz-result-step');
        resultStep.classList.add('active');

        document.getElementById('quiz-res-location').textContent = quizAnswers.painLocation;
        document.getElementById('quiz-res-severity').textContent = `${quizAnswers.painSeverity}/10 Severity`;
        document.getElementById('quiz-res-plan').textContent = `Targeted Clinical Protocol for ${quizAnswers.painLocation} with focus on ${quizAnswers.dailyImpact} recovery.`;
      } else {
        alert(data.error || "Submission error. Please call our clinic directly.");
        btn.textContent = "Generate My Recovery Prescription →";
        btn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please call the clinic directly at +1 (555) 749-7460.");
    }
  }
}

// ==========================================
// 3. BOOKING MODAL & CRM DISPATCH
// ==========================================
function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const closeBtn = document.getElementById('booking-modal-close');
  const bookingForm = document.getElementById('booking-form');

  window.openBookingModal = function(prefillArea = "") {
    if (prefillArea) {
      const areaSelect = document.getElementById('booking-pain-area');
      if (areaSelect) areaSelect.value = prefillArea;
    }
    // Set minimum date to today
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      if (!dateInput.value) dateInput.value = today;
    }
    modal.classList.add('open');
  };

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  }

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('booking-submit-btn');
      const toast = document.getElementById('booking-toast');

      submitBtn.textContent = "Reserving your appointment...";
      submitBtn.disabled = true;
      toast.className = 'toast-msg';

      const payload = {
        patientName: document.getElementById('booking-name').value.trim(),
        patientPhone: document.getElementById('booking-phone').value.trim(),
        patientEmail: document.getElementById('booking-email').value.trim(),
        serviceName: document.getElementById('booking-service').value,
        painLocation: document.getElementById('booking-pain-area').value,
        urgency: document.getElementById('booking-urgency').value,
        consultationType: document.getElementById('booking-type').value,
        date: document.getElementById('booking-date').value,
        timeSlot: document.getElementById('booking-time').value,
        patientNotes: document.getElementById('booking-notes').value.trim(),
        hp_clinic_token: document.getElementById('booking-hp-token').value
      };

      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await res.json();

        if (result.success) {
          toast.className = 'toast-msg success';
          toast.textContent = "✓ Appointment successfully reserved! Our clinical coordinator will message you via WhatsApp / SMS with your intake details.";
          bookingForm.reset();
          submitBtn.textContent = "Appointment Reserved!";
          setTimeout(() => {
            modal.classList.remove('open');
            submitBtn.textContent = "Confirm & Reserve Slot →";
            submitBtn.disabled = false;
            toast.className = 'toast-msg';
          }, 3500);
        } else {
          toast.className = 'toast-msg error';
          toast.textContent = result.error || "Failed to book. Please call our clinic directly.";
          submitBtn.textContent = "Confirm & Reserve Slot →";
          submitBtn.disabled = false;
        }
      } catch (err) {
        console.error(err);
        toast.className = 'toast-msg error';
        toast.textContent = "Connection error. Please call +1 (555) 749-7460 for urgent bookings.";
        submitBtn.textContent = "Confirm & Reserve Slot →";
        submitBtn.disabled = false;
      }
    });
  }
}

// ==========================================
// 4. FAQ ACCORDION
// ==========================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ==========================================
// 5. MOBILE NAVIGATION
// ==========================================
function initMobileNav() {
  const hamburger = document.getElementById('hamburger-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const closeBtn = document.getElementById('mobile-drawer-close');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => drawer.classList.add('open'));
    if (closeBtn) closeBtn.addEventListener('click', () => drawer.classList.remove('open'));
    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) drawer.classList.remove('open');
    });
    // Close on any link click
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => drawer.classList.remove('open'));
    });
  }
}

// ==========================================
// 6. CLINIC HOURS & LIVE STATUS
// ==========================================
function initClinicStatus() {
  const badge = document.getElementById('clinic-status-badge');
  if (!badge) return;

  const now = new Date();
  const day = now.getDay(); // 0 is Sun, 6 is Sat
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hour * 60 + minutes;

  // Mon-Fri: 7:30 (450m) to 19:30 (1170m)
  // Sat: 8:30 (510m) to 15:00 (900m)
  // Sun: Emergency only
  let isOpen = false;
  if (day >= 1 && day <= 5) {
    isOpen = currentMinutes >= 450 && currentMinutes < 1170;
  } else if (day === 6) {
    isOpen = currentMinutes >= 510 && currentMinutes < 900;
  }

  if (isOpen) {
    badge.innerHTML = `<span class="pulse-dot"></span> <strong>Clinic Open Now</strong> (Walk-ins & Slots Available)`;
  } else {
    badge.innerHTML = `<span class="pulse-dot" style="background:#f59e0b"></span> <strong>Online Booking 24/7</strong> (Next clinic slots open at 7:30 AM)`;
  }
}
