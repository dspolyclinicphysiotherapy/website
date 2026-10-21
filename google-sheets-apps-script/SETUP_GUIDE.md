# 📊 Google Sheets + Apps Script Setup Guide for AuraSpine Clinic CRM

Follow these simple steps (takes under 2 minutes) to have every website booking and lead automatically sync into your Google Sheet in real time.

---

### Step 1: Create a New Google Sheet
1. Open [Google Sheets](https://sheets.new) in your browser.
2. Name the spreadsheet: **AuraSpine Clinic CRM** (or your clinic's name).

---

### Step 2: Open Apps Script Editor
1. In the top navigation bar of Google Sheets, click:
   **Extensions** $\rightarrow$ **Apps Script**.
2. A new tab will open with code editor.

---

### Step 3: Paste the Webhook Code
1. Delete any existing code inside `Code.gs`.
2. Open [`google-sheets-apps-script/Code.gs`](Code.gs) from this project folder.
3. Copy all the contents and paste it into the Apps Script editor.
4. *(Optional)* At line 27, you can put your email address in `const CLINIC_ALERT_EMAIL = "your-email@example.com";` to get instant email alerts when a patient books!
5. Click the **Save** icon (💾) or press `Cmd + S` / `Ctrl + S`.

---

### Step 4: Deploy as a Web App
1. At the top right, click the blue **Deploy** button $\rightarrow$ **New deployment**.
2. Click the gear icon (⚙️) on the left side next to *"Select type"* and choose **Web app**.
3. Configure the fields:
   - **Description:** `AuraSpine Patient Booking Webhook`
   - **Execute as:** `Me (your Google account)`
   - **Who has access:** `Anyone` *(Crucial: Allows the website form to submit data without requiring visitors to sign in to Google)*
4. Click **Deploy**.
5. Google will ask for authorization $\rightarrow$ Click **Authorize access**, choose your account, click **Advanced**, and then click **Go to AuraSpine Script (unsafe)** $\rightarrow$ **Allow**.
6. Copy the **Web app URL** that appears on screen:
   *(Format: `https://script.google.com/macros/s/AKfycb.../exec`)*

---

### Step 5: Connect It to Your Clinic Platform
1. Go to your Clinic Admin Panel at: [http://localhost:3050/admin](http://localhost:3050/admin)
2. Click the **Clinic & SEO Settings** tab.
3. Paste your Web app URL into the **Google Apps Script Webhook URL** field.
4. Click **Save Clinic Settings**.

🎉 **You are done!**
Now, every time a patient:
- Fills the 1-Click Booking Modal
- Completes the 60-Second Recovery Quiz
- Clicks a pain area on the Body Map
- Submits an appointment request

A new row will instantly appear in your Google Sheet with their name, phone, email, condition, urgency, appointment slot, and status!
