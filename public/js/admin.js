// KineticPulse Physiotherapy & Sports Rehabilitation
// Admin CRM & Pipeline Controller

let currentToken = localStorage.getItem('physio_admin_token') || null;

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initLoginForm();
  initTabs();
  initStatusFilters();
});

// ==========================================
// 1. AUTHENTICATION
// ==========================================
async function checkAuth() {
  if (!currentToken) {
    showLogin();
    return;
  }

  try {
    const res = await fetch('/api/admin/me', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();

    if (data.success) {
      showDashboard(data.user);
    } else {
      showLogin();
    }
  } catch (err) {
    console.error(err);
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('admin-layout').classList.remove('active');
}

function showDashboard(username = 'admin') {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-layout').classList.add('active');
  document.getElementById('admin-username-display').textContent = `Staff: ${username}`;

  loadDashboardMetrics();
  loadAppointments();
  loadLeads();
  loadSettings();
  loadAuditLogs();
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  const alert = document.getElementById('login-alert');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('login-submit-btn');
    const uInput = document.getElementById('login-username').value.trim();
    const pInput = document.getElementById('login-password').value;

    submitBtn.textContent = "Authenticating...";
    submitBtn.disabled = true;
    alert.style.display = 'none';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: uInput, password: pInput })
      });
      const data = await res.json();

      if (data.success) {
        currentToken = data.token;
        localStorage.setItem('physio_admin_token', data.token);
        showDashboard(data.user);
      } else {
        alert.textContent = data.error || "Invalid username or password.";
        alert.style.display = 'block';
      }
    } catch (err) {
      console.error(err);
      alert.textContent = "Server communication failure. Please check the backend connection.";
      alert.style.display = 'block';
    } finally {
      submitBtn.textContent = "Sign In to Clinic CRM →";
      submitBtn.disabled = false;
    }
  });

  window.logoutAdmin = async function() {
    await fetch('/api/admin/logout', { method: 'POST' });
    localStorage.removeItem('physio_admin_token');
    currentToken = null;
    showLogin();
  };
}

// ==========================================
// 2. TAB SWITCHING
// ==========================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.crm-tab-btn');
  const panes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(target).classList.add('active');

      if (target === 'tab-appointments') loadAppointments();
      else if (target === 'tab-leads') loadLeads();
      else if (target === 'tab-dashboard') loadDashboardMetrics();
      else if (target === 'tab-logs') loadAuditLogs();
    });
  });
}

// ==========================================
// 3. DASHBOARD METRICS
// ==========================================
async function loadDashboardMetrics() {
  try {
    const res = await fetch('/api/admin/dashboard', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const { success, metrics } = await res.json();
    if (!success) return;

    document.getElementById('kpi-total-appointments').textContent = metrics.totalAppointments;
    document.getElementById('kpi-today-appointments').textContent = metrics.todayCount;
    document.getElementById('kpi-pending-appointments').textContent = metrics.pendingAppointments;
    document.getElementById('kpi-urgent-cases').textContent = metrics.urgentCases;
    document.getElementById('kpi-total-leads').textContent = metrics.totalLeads;
    document.getElementById('kpi-revenue').textContent = `$${metrics.estimatedRevenue.toLocaleString()}`;

    // Render today's list
    const todayList = document.getElementById('today-schedule-list');
    if (todayList) {
      todayList.innerHTML = '';
      if (metrics.todayAppointments.length === 0) {
        todayList.innerHTML = `<p style="color:var(--admin-muted); padding:12px;">No appointments scheduled for today yet.</p>`;
      } else {
        metrics.todayAppointments.forEach(apt => {
          const div = document.createElement('div');
          div.style = "background:rgba(255,255,255,0.03); border-radius:8px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;";
          div.innerHTML = `
            <div>
              <strong>${escapeHtml(apt.patientName)}</strong> • <span style="color:var(--primary);">${apt.timeSlot}</span>
              <div style="font-size:12px; color:var(--admin-muted);">${apt.serviceName} (${apt.painLocation})</div>
            </div>
            <span class="status-badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
          `;
          todayList.appendChild(div);
        });
      }
    }
  } catch (err) {
    console.error("Failed to load dashboard metrics:", err);
  }
}

// ==========================================
// 4. APPOINTMENTS PIPELINE
// ==========================================
let currentStatusFilter = 'all';

function initStatusFilters() {
  const pills = document.querySelectorAll('#apt-filter-pills .filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentStatusFilter = pill.dataset.status;
      loadAppointments();
    });
  });

  const searchInput = document.getElementById('apt-search-input');
  if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', () => {
      clearTimeout(timeout);
      timeout = setTimeout(loadAppointments, 300);
    });
  }
}

async function loadAppointments() {
  const tbody = document.getElementById('appointments-table-body');
  if (!tbody) return;

  const search = document.getElementById('apt-search-input')?.value || '';
  const url = `/api/admin/appointments?status=${currentStatusFilter}&search=${encodeURIComponent(search)}`;

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const { success, data } = await res.json();
    if (!success) return;

    tbody.innerHTML = '';
    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--admin-muted);">No appointments found matching this criteria.</td></tr>`;
      return;
    }

    data.forEach(apt => {
      const tr = document.createElement('tr');
      const isUrgent = apt.urgency === 'Severe / Acute';

      tr.innerHTML = `
        <td><strong style="color:var(--primary);">${apt.id}</strong></td>
        <td>
          <div style="font-weight:700;">${escapeHtml(apt.patientName)}</div>
          <div style="font-size:12px; color:var(--admin-muted);">${escapeHtml(apt.patientPhone)}</div>
        </td>
        <td>
          <div style="font-weight:600;">${escapeHtml(apt.painLocation)}</div>
          <div style="font-size:11px; color:var(--admin-muted);">${apt.serviceName}</div>
          ${isUrgent ? `<span class="badge-urgent">URGENT</span>` : ''}
        </td>
        <td>
          <div>${apt.date}</div>
          <div style="color:var(--primary); font-size:12px;">${apt.timeSlot}</div>
        </td>
        <td><span style="font-size:12px; color:var(--admin-muted);">${apt.consultationType}</span></td>
        <td>
          <span class="status-badge badge-${apt.status.toLowerCase()}">${apt.status}</span>
        </td>
        <td>
          <div style="max-width:180px; font-size:12px; color:var(--admin-muted);" title="${escapeHtml(apt.doctorNotes || '')}">
            ${escapeHtml(apt.doctorNotes || 'No notes added')}
          </div>
        </td>
        <td>
          <div class="action-btn-group">
            ${apt.status !== 'Confirmed' ? `
              <button class="act-btn" style="color:var(--success);" onclick="updateAptStatus('${apt.id}', 'Confirmed')" title="Confirm Appointment">✓</button>
            ` : ''}
            ${apt.status !== 'Completed' ? `
              <button class="act-btn" style="color:var(--primary);" onclick="updateAptStatus('${apt.id}', 'Completed')" title="Mark Completed">Done</button>
            ` : ''}
            <button class="act-btn act-btn-whatsapp" onclick="sendWhatsAppConfirmation('${apt.patientPhone}', '${escapeHtml(apt.patientName)}', '${apt.date}', '${apt.timeSlot}', '${apt.serviceName}')" title="Send WhatsApp Confirmation">💬</button>
            <button class="act-btn" onclick="addDoctorNotesPrompt('${apt.id}', '${escapeHtml(apt.doctorNotes || '')}')" title="Doctor Notes">📝</button>
            <button class="act-btn" style="color:var(--danger);" onclick="deleteApt('${apt.id}')" title="Delete">✕</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load appointments:", err);
  }
}

window.updateAptStatus = async function(id, status) {
  try {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      loadAppointments();
      loadDashboardMetrics();
    }
  } catch (err) {
    console.error(err);
  }
};

window.addDoctorNotesPrompt = async function(id, existingNotes) {
  const notes = prompt("Enter clinical progress / doctor notes:", existingNotes);
  if (notes === null) return;

  try {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ doctorNotes: notes })
    });
    const data = await res.json();
    if (data.success) loadAppointments();
  } catch (err) {
    console.error(err);
  }
};

window.sendWhatsAppConfirmation = function(phone, name, date, time, service) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const msg = encodeURIComponent(
    `Hello ${name},\n\nYour physiotherapy appointment at KineticPulse Clinic has been confirmed for ${date} at ${time} (${service}).\n\nClinic Address: 420 HealthCare Blvd, Suite 100, Metro City.\n\nPlease arrive 5 minutes early in comfortable athletic wear. Reply to this message if you have any questions!`
  );
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
};

window.deleteApt = async function(id) {
  if (!confirm(`Are you sure you want to permanently delete appointment ${id}?`)) return;

  try {
    const res = await fetch(`/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await res.json();
    if (data.success) {
      loadAppointments();
      loadDashboardMetrics();
    }
  } catch (err) {
    console.error(err);
  }
};

// ==========================================
// 5. LEADS MANAGEMENT
// ==========================================
async function loadLeads() {
  const tbody = document.getElementById('leads-table-body');
  if (!tbody) return;

  try {
    const res = await fetch('/api/admin/leads', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const { success, data } = await res.json();
    if (!success) return;

    tbody.innerHTML = '';
    data.forEach(lead => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color:var(--primary);">${lead.id}</strong></td>
        <td>
          <div style="font-weight:700;">${escapeHtml(lead.name)}</div>
          <div style="font-size:12px; color:var(--admin-muted);">${escapeHtml(lead.phone)}</div>
          <div style="font-size:11px; color:var(--admin-muted);">${escapeHtml(lead.email || '')}</div>
        </td>
        <td>
          <strong>${escapeHtml(lead.painArea)}</strong>
          <div style="font-size:11px; color:var(--admin-muted);">Severity: ${lead.painSeverity}</div>
        </td>
        <td><span style="font-size:12px; color:var(--admin-muted);">${lead.duration || 'N/A'}</span></td>
        <td><span style="font-size:12px; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:4px;">${lead.source}</span></td>
        <td>
          <select class="admin-select" style="padding:4px 8px; font-size:12px;" onchange="updateLeadStatus('${lead.id}', this.value)">
            <option value="New" ${lead.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Contacted" ${lead.status === 'Contacted' ? 'selected' : ''}>Contacted</option>
            <option value="Booked" ${lead.status === 'Booked' ? 'selected' : ''}>Booked</option>
            <option value="Not Interested" ${lead.status === 'Not Interested' ? 'selected' : ''}>Not Interested</option>
          </select>
        </td>
        <td>
          <a href="tel:${lead.phone}" class="act-btn" style="display:inline-block;">📞 Call</a>
          <button class="act-btn act-btn-whatsapp" onclick="sendWhatsAppLeadMessage('${lead.phone}', '${escapeHtml(lead.name)}', '${escapeHtml(lead.painArea)}')">💬 WA</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load leads:", err);
  }
}

window.updateLeadStatus = async function(id, status) {
  try {
    await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status })
    });
    loadDashboardMetrics();
  } catch (err) {
    console.error(err);
  }
};

window.sendWhatsAppLeadMessage = function(phone, name, painArea) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const msg = encodeURIComponent(
    `Hi ${name}, this is Dr. Sarah from KineticPulse Physiotherapy. I received your triage submission regarding your ${painArea} discomfort. Do you have 5 minutes for a quick consultation so we can get you out of pain?`
  );
  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
};

// ==========================================
// 6. CLINIC SETTINGS
// ==========================================
async function loadSettings() {
  try {
    const res = await fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const { success, data } = await res.json();
    if (!success) return;

    document.getElementById('setting-clinic-name').value = data.clinicName || '';
    document.getElementById('setting-phone').value = data.phone || '';
    document.getElementById('setting-email').value = data.email || '';
    document.getElementById('setting-whatsapp').value = data.whatsappNumber || '';
    document.getElementById('setting-address').value = data.address || '';
    document.getElementById('setting-weekdays').value = data.operatingHours?.weekdays || '';
    document.getElementById('setting-saturday').value = data.operatingHours?.saturday || '';
  } catch (err) {
    console.error("Failed to load settings:", err);
  }

  const form = document.getElementById('settings-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = document.getElementById('save-settings-btn');
      saveBtn.textContent = "Saving...";

      const payload = {
        clinicName: document.getElementById('setting-clinic-name').value,
        phone: document.getElementById('setting-phone').value,
        email: document.getElementById('setting-email').value,
        whatsappNumber: document.getElementById('setting-whatsapp').value,
        address: document.getElementById('setting-address').value,
        operatingHours: {
          weekdays: document.getElementById('setting-weekdays').value,
          saturday: document.getElementById('setting-saturday').value
        }
      };

      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          alert("✓ Clinic & SEO settings updated successfully!");
        }
      } catch (err) {
        console.error(err);
      } finally {
        saveBtn.textContent = "Save Clinic Settings";
      }
    });
  }
}

// ==========================================
// 7. AUDIT LOGS
// ==========================================
async function loadAuditLogs() {
  const container = document.getElementById('audit-logs-container');
  if (!container) return;

  try {
    const res = await fetch('/api/admin/audit-logs', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const { success, data } = await res.json();
    if (!success) return;

    container.innerHTML = '';
    data.forEach(log => {
      const div = document.createElement('div');
      div.style = "background:rgba(255,255,255,0.02); border-bottom:1px solid rgba(255,255,255,0.06); padding:10px 14px; font-size:12px; display:flex; justify-content:space-between; align-items:center;";
      div.innerHTML = `
        <div>
          <strong style="color:var(--primary);">${log.action}</strong>
          <span style="color:var(--admin-muted); margin-left:8px;">${escapeHtml(log.details)}</span>
        </div>
        <div style="color:var(--admin-muted); font-size:11px;">
          ${new Date(log.timestamp).toLocaleString()} • Actor: ${log.actor}
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load audit logs:", err);
  }
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
