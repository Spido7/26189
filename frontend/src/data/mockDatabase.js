/**
 * PostgreSQL Mock Database Layer for SIH Criminal Network Analysis
 * Strict Schema Alignment: master, fir_records, person_details
 * 
 * CRITICAL SYSTEM COMPLIANCE:
 * aadhar_no strictly uses "[Aadhaar Redacted]" for all records.
 * No numeric digits are generated for this field.
 */

// ==========================================
// 1. MASTER TABLE MOCK
// Columns: ip_address, mac_address, person_name, phone_no, fir, fir_id, address, isp_loaction
// ==========================================
export const master = [
  // --- CLUSTER 1: JAMTARA CYBER PHISHING SYNDICATE (Hardware-linked: Shared MACs/IPs) ---
  {
    ip_address: "103.212.43.18",
    mac_address: "A4:C3:F0:89:12:DE",
    person_name: "Sunil Kumar Mondal",
    phone_no: "+91 98351 29401",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104",
    address: "Vill Karmatar, Post Jamtara, Jharkhand - 815351",
    isp_loaction: "Karmatar BTS Tower-04, Jamtara Exchange, Jharkhand"
  },
  {
    ip_address: "103.212.43.19",
    mac_address: "A4:C3:F0:89:12:DE", // Shared MAC with Sunil (same router/dongle)
    person_name: "Rahul Dev Mandal",
    phone_no: "+91 98351 88392",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104",
    address: "Station Road, Near Old Post Office, Jamtara - 815351",
    isp_loaction: "Jamtara Main Telecom Exchange, Jharkhand"
  },
  {
    ip_address: "103.212.43.25",
    mac_address: "B8:27:EB:11:43:A9",
    person_name: "Pankaj Saw",
    phone_no: "+91 98351 77104",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104",
    address: "Mihijam Market Complex, Jamtara, Jharkhand - 815354",
    isp_loaction: "Mihijam Tower-02, Jamtara Border Zone"
  },
  {
    ip_address: "103.212.43.18", // Shared IP with Sunil (NAT Gateway)
    mac_address: "A4:C3:F0:89:12:DE", // Shared MAC
    person_name: "Deepak Ansari",
    phone_no: "+91 98351 66205",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104",
    address: "Narayanpur Block, Jamtara District, Jharkhand - 815352",
    isp_loaction: "Narayanpur Sub-Station, Jamtara"
  },

  // --- CLUSTER 2: DELHI HAWALA & USDT CRYPTO RING (Financial/Blockchain-linked) ---
  {
    ip_address: "182.73.192.44",
    mac_address: "D4:6A:91:BC:33:11",
    person_name: "Harish Chand Aggarwal",
    phone_no: "+91 98110 44821",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842",
    address: "Shop 42, Kucha Ghasi Ram, Chandni Chowk, Delhi - 110006",
    isp_loaction: "Chandni Chowk OLT Gateway-09, Central Delhi"
  },
  {
    ip_address: "182.73.192.45",
    mac_address: "E0:CB:4E:99:8A:20",
    person_name: "Vikas Singhal",
    phone_no: "+91 98110 77293",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842",
    address: "114 Nai Sarak, Katra Rathi, Chandni Chowk, Delhi - 110006",
    isp_loaction: "Connaught Place Telecom Sub-Hub, New Delhi"
  },
  {
    ip_address: "182.73.192.98",
    mac_address: "FC:34:97:55:12:AA",
    person_name: "Rameshwar Nath Kapoor",
    phone_no: "+91 98110 99402",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842",
    address: "Level 4, Narain Manzil, Barakhamba Road, Connaught Place, New Delhi - 110001",
    isp_loaction: "Barakhamba Metro Fiber Gateway, New Delhi"
  },
  {
    ip_address: "182.73.192.110",
    mac_address: "3C:52:82:11:78:CD",
    person_name: "Mohd. Danish Qureshi",
    phone_no: "+91 98110 33119",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842",
    address: "Netaji Subhash Marg, Daryaganj, Delhi - 110002",
    isp_loaction: "Daryaganj Central BTS Sector-01, Delhi"
  },

  // --- CLUSTER 3: BENGALURU RANSOMWARE & C2 EXTORTION CARTEL (Infrastructure-linked) ---
  {
    ip_address: "122.166.89.210",
    mac_address: "00:50:56:A1:B2:C3", // Shared Hypervisor / VPS MAC
    person_name: "Kartik Venkatesh",
    phone_no: "+91 99000 81234",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719",
    address: "4th Block, 80 Feet Road, Koramangala, Bengaluru, Karnataka - 560034",
    isp_loaction: "Koramangala DC-01 High-Speed Fiber Backbone, Bengaluru"
  },
  {
    ip_address: "122.166.89.215",
    mac_address: "00:50:56:A1:B2:C3", // Shared VPS Host MAC
    person_name: "Aditya Nair",
    phone_no: "+91 99000 45678",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    isp_loaction: "Indiranagar Optical Splitter Node-03, Bengaluru"
  },
  {
    ip_address: "122.166.89.230",
    mac_address: "00:50:56:C4:D5:E6",
    person_name: "Rohit 'Krypton' Sharma",
    phone_no: "+91 99000 90123",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719",
    address: "Phase 1, Electronic City, Hosur Road, Bengaluru - 560100",
    isp_loaction: "Electronic City Tech Park Gateway, Bengaluru"
  },
  {
    ip_address: "122.166.89.245",
    mac_address: "00:50:56:A1:B2:C3", // Shared VPS Host MAC
    person_name: "Siddharth Rao",
    phone_no: "+91 99000 12399",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719",
    address: "Sector 2, 27th Main, HSR Layout, Bengaluru, Karnataka - 560102",
    isp_loaction: "HSR Layout Telecom Exchange Hub, Bengaluru"
  }
];

// ==========================================
// 2. FIR_RECORDS TABLE MOCK
// Columns: fir_id, ip_address, fir, police_station, name, address, crpc_section, phone_no, crime_name
// ==========================================
export const fir_records = [
  // --- CLUSTER 1 (Jamtara) ---
  {
    fir_id: "FIR-0104",
    ip_address: "103.212.43.18",
    fir: "FIR/2026/0104",
    police_station: "Jamtara Cyber Crime Police Station (Jharkhand)",
    name: "Sunil Kumar Mondal",
    address: "Vill Karmatar, Post Jamtara, Jharkhand - 815351",
    crpc_section: "Sec 419, 420, 120B IPC & Sec 66C, 66D IT Act 2008",
    phone_no: "+91 98351 29401",
    crime_name: "Organized Banking KYC Phishing & OTP Interception Syndicate"
  },
  {
    fir_id: "FIR-0104",
    ip_address: "103.212.43.19",
    fir: "FIR/2026/0104",
    police_station: "Jamtara Cyber Crime Police Station (Jharkhand)",
    name: "Rahul Dev Mandal",
    address: "Station Road, Near Old Post Office, Jamtara - 815351",
    crpc_section: "Sec 420, 468 IPC & Sec 66D IT Act 2008",
    phone_no: "+91 98351 88392",
    crime_name: "Operation of Illicit VoIP Spoofing Call Center"
  },
  {
    fir_id: "FIR-0104",
    ip_address: "103.212.43.25",
    fir: "FIR/2026/0104",
    police_station: "Jamtara Cyber Crime Police Station (Jharkhand)",
    name: "Pankaj Saw",
    address: "Mihijam Market Complex, Jamtara, Jharkhand - 815354",
    crpc_section: "Sec 420, 120B IPC & Sec 65 IT Act",
    phone_no: "+91 98351 77104",
    crime_name: "Mule Account Cashout & SIM Box Cloning Gateway"
  },
  {
    fir_id: "FIR-0104",
    ip_address: "103.212.43.18",
    fir: "FIR/2026/0104",
    police_station: "Jamtara Cyber Crime Police Station (Jharkhand)",
    name: "Deepak Ansari",
    address: "Narayanpur Block, Jamtara District, Jharkhand - 815352",
    crpc_section: "Sec 66C, 66D IT Act & Sec 419 IPC",
    phone_no: "+91 98351 66205",
    crime_name: "Mass SMS Gateway Spoofing & Phishing APK Distribution"
  },

  // --- CLUSTER 2 (Delhi Hawala) ---
  {
    fir_id: "FIR-8842",
    ip_address: "182.73.192.44",
    fir: "FIR/2024/8842",
    police_station: "Special Cell & EOW Delhi Police (Mandir Marg PS)",
    name: "Harish Chand Aggarwal",
    address: "Shop 42, Kucha Ghasi Ram, Chandni Chowk, Delhi - 110006",
    crpc_section: "Sec 420, 120B, 467, 471 IPC & Sec 3/4 PMLA / FEMA Act",
    phone_no: "+91 98110 44821",
    crime_name: "Transnational Crypto-Hawala Settlement & USDT Laundering"
  },
  {
    fir_id: "FIR-8842",
    ip_address: "182.73.192.45",
    fir: "FIR/2024/8842",
    police_station: "Special Cell & EOW Delhi Police (Mandir Marg PS)",
    name: "Vikas Singhal",
    address: "114 Nai Sarak, Katra Rathi, Chandni Chowk, Delhi - 110006",
    crpc_section: "Sec 406, 420, 120B IPC & Sec 66D IT Act",
    phone_no: "+91 98110 77293",
    crime_name: "P2P Escrow Layering for Cyber Scam Proceeds"
  },
  {
    fir_id: "FIR-8842",
    ip_address: "182.73.192.98",
    fir: "FIR/2024/8842",
    police_station: "EOW Central Delhi Cyber Cell",
    name: "Rameshwar Nath Kapoor",
    address: "Level 4, Narain Manzil, Barakhamba Road, Connaught Place, New Delhi - 110001",
    crpc_section: "Sec 420, 467, 471, 120B IPC & Sec 132 Customs Act",
    phone_no: "+91 98110 99402",
    crime_name: "Cross-Border Shell Company Invoicing & USDT Smurfing"
  },
  {
    fir_id: "FIR-8842",
    ip_address: "182.73.192.110",
    fir: "FIR/2024/8842",
    police_station: "Chandni Chowk Police Station (Central District)",
    name: "Mohd. Danish Qureshi",
    address: "Netaji Subhash Marg, Daryaganj, Delhi - 110002",
    crpc_section: "Sec 120B, 420 IPC & Sec 3 PMLA",
    phone_no: "+91 98110 33119",
    crime_name: "Physical Angadia Cash Courier & Tokenized Crypto Swaps"
  },

  // --- CLUSTER 3 (Bengaluru Ransomware) ---
  {
    fir_id: "FIR-7719",
    ip_address: "122.166.89.210",
    fir: "FIR/2026/7719",
    police_station: "Cyber Crime Police Station (CID Karnataka, Bengaluru)",
    name: "Kartik Venkatesh",
    address: "4th Block, 80 Feet Road, Koramangala, Bengaluru, Karnataka - 560034",
    crpc_section: "Sec 43, 66, 66F (Cyber Terrorism) IT Act & Sec 384, 120B IPC",
    phone_no: "+91 99000 81234",
    crime_name: "Hospital Critical Infrastructure LockBit Ransomware Infiltration"
  },
  {
    fir_id: "FIR-7719",
    ip_address: "122.166.89.215",
    fir: "FIR/2026/7719",
    police_station: "Cyber Crime Police Station (CID Karnataka, Bengaluru)",
    name: "Aditya Nair",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    crpc_section: "Sec 66, 66E, 72A IT Act & Sec 384 IPC (Extortion)",
    phone_no: "+91 99000 45678",
    crime_name: "Exfiltration of Healthcare EHR Records to Dark Web Leaks"
  },
  {
    fir_id: "FIR-7719",
    ip_address: "122.166.89.230",
    fir: "FIR/2026/7719",
    police_station: "Cyber Crime Police Station (CID Karnataka, Bengaluru)",
    name: "Rohit 'Krypton' Sharma",
    address: "Phase 1, Electronic City, Hosur Road, Bengaluru - 560100",
    crpc_section: "Sec 43, 66, 66F IT Act 2008",
    phone_no: "+91 99000 90123",
    crime_name: "Zero-Day VPN Gateway Exploit & Cobalt Strike C2 Deployment"
  },
  {
    fir_id: "FIR-7719",
    ip_address: "122.166.89.245",
    fir: "FIR/2026/7719",
    police_station: "Cyber Crime Police Station (CID Karnataka, Bengaluru)",
    name: "Siddharth Rao",
    address: "Sector 2, 27th Main, HSR Layout, Bengaluru, Karnataka - 560102",
    crpc_section: "Sec 384, 120B IPC & Sec 66 IT Act",
    phone_no: "+91 99000 12399",
    crime_name: "Dark Web Tor Onion Negotiation & Monero Crypto Ransom Relay"
  }
];

// ==========================================
// 3. PERSON_DETAILS TABLE MOCK
// Columns: aadhar_no, ip_address, name, address, fir, fir_id
// CRITICAL SYSTEM INSTRUCTION: Strictly "[Aadhaar Redacted]" for all records.
// ==========================================
export const person_details = [
  // --- CLUSTER 1 (Jamtara) ---
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "103.212.43.18",
    name: "Sunil Kumar Mondal",
    address: "Vill Karmatar, Post Jamtara, Jharkhand - 815351",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "103.212.43.19",
    name: "Rahul Dev Mandal",
    address: "Station Road, Near Old Post Office, Jamtara - 815351",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "103.212.43.25",
    name: "Pankaj Saw",
    address: "Mihijam Market Complex, Jamtara, Jharkhand - 815354",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "103.212.43.18",
    name: "Deepak Ansari",
    address: "Narayanpur Block, Jamtara District, Jharkhand - 815352",
    fir: "FIR/2026/0104",
    fir_id: "FIR-0104"
  },

  // --- CLUSTER 2 (Delhi Hawala) ---
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "182.73.192.44",
    name: "Harish Chand Aggarwal",
    address: "Shop 42, Kucha Ghasi Ram, Chandni Chowk, Delhi - 110006",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "182.73.192.45",
    name: "Vikas Singhal",
    address: "114 Nai Sarak, Katra Rathi, Chandni Chowk, Delhi - 110006",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "182.73.192.98",
    name: "Rameshwar Nath Kapoor",
    address: "Level 4, Narain Manzil, Barakhamba Road, Connaught Place, New Delhi - 110001",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "182.73.192.110",
    name: "Mohd. Danish Qureshi",
    address: "Netaji Subhash Marg, Daryaganj, Delhi - 110002",
    fir: "FIR/2024/8842",
    fir_id: "FIR-8842"
  },

  // --- CLUSTER 3 (Bengaluru Ransomware) ---
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "122.166.89.210",
    name: "Kartik Venkatesh",
    address: "4th Block, 80 Feet Road, Koramangala, Bengaluru, Karnataka - 560034",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "122.166.89.215",
    name: "Aditya Nair",
    address: "100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "122.166.89.230",
    name: "Rohit 'Krypton' Sharma",
    address: "Phase 1, Electronic City, Hosur Road, Bengaluru - 560100",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719"
  },
  {
    aadhar_no: "[Aadhaar Redacted]",
    ip_address: "122.166.89.245",
    name: "Siddharth Rao",
    address: "Sector 2, 27th Main, HSR Layout, Bengaluru, Karnataka - 560102",
    fir: "FIR/2026/7719",
    fir_id: "FIR-7719"
  }
];

// ==========================================
// 4. SIMULATED CDR LOGS
// ==========================================
export const cdr_records = {
  "+91 98351 29401": [
    { timestamp: "2026-03-20 14:12:05", type: "OUTGOING", duration: "03m 42s", bts_tower: "Karmatar BTS-04 (Sector-2)", dialed_no: "+91 98351 88392", counterparty: "Rahul Dev Mandal (Co-Accused)", imei: "867204058192301", status: "ANSWERED" },
    { timestamp: "2026-03-20 15:45:10", type: "INCOMING", duration: "01m 15s", bts_tower: "Karmatar BTS-04 (Sector-1)", dialed_no: "+91 98351 77104", counterparty: "Pankaj Saw (Mule Runner)", imei: "867204058192301", status: "ANSWERED" },
    { timestamp: "2026-03-21 09:20:18", type: "OUTGOING", duration: "05m 50s", bts_tower: "Jamtara Main Tower-01", dialed_no: "+91 98351 66205", counterparty: "Deepak Ansari (SMS Gateway)", imei: "867204058192301", status: "ANSWERED" }
  ],
  "+91 98351 88392": [
    { timestamp: "2026-03-20 14:12:05", type: "INCOMING", duration: "03m 42s", bts_tower: "Jamtara Station BTS-02", dialed_no: "+91 98351 29401", counterparty: "Sunil Kumar Mondal", imei: "867204058192302", status: "ANSWERED" },
    { timestamp: "2026-03-21 11:05:44", type: "OUTGOING", duration: "02m 04s", bts_tower: "Jamtara Station BTS-02", dialed_no: "+91 98351 77104", counterparty: "Pankaj Saw", imei: "867204058192302", status: "ANSWERED" }
  ],
  "+91 98351 77104": [
    { timestamp: "2026-03-20 15:45:10", type: "OUTGOING", duration: "01m 15s", bts_tower: "Mihijam Tower-02", dialed_no: "+91 98351 29401", counterparty: "Sunil Kumar Mondal", imei: "867204058192303", status: "ANSWERED" },
    { timestamp: "2026-03-21 11:05:44", type: "INCOMING", duration: "02m 04s", bts_tower: "Mihijam Tower-02", dialed_no: "+91 98351 88392", counterparty: "Rahul Dev Mandal", imei: "867204058192303", status: "ANSWERED" }
  ],
  "+91 98351 66205": [
    { timestamp: "2026-03-21 09:20:18", type: "INCOMING", duration: "05m 50s", bts_tower: "Narayanpur BTS-03", dialed_no: "+91 98351 29401", counterparty: "Sunil Kumar Mondal", imei: "867204058192304", status: "ANSWERED" }
  ],

  "+91 98110 44821": [
    { timestamp: "2026-03-20 10:15:33", type: "OUTGOING", duration: "06m 12s", bts_tower: "Chandni Chowk OLT-09", dialed_no: "+91 98110 77293", counterparty: "Vikas Singhal (Escrow Handler)", imei: "359124089912041", status: "ANSWERED" },
    { timestamp: "2026-03-20 13:40:02", type: "INCOMING", duration: "04m 20s", bts_tower: "Chandni Chowk OLT-09", dialed_no: "+91 98110 99402", counterparty: "Rameshwar Nath Kapoor (Barakhamba)", imei: "359124089912041", status: "ANSWERED" },
    { timestamp: "2026-03-21 16:11:55", type: "OUTGOING", duration: "02m 45s", bts_tower: "Daryaganj BTS-01", dialed_no: "+91 98110 33119", counterparty: "Mohd. Danish Qureshi (Cash Smurf)", imei: "359124089912041", status: "ANSWERED" }
  ],
  "+91 98110 77293": [
    { timestamp: "2026-03-20 10:15:33", type: "INCOMING", duration: "06m 12s", bts_tower: "Connaught Place Sector-4", dialed_no: "+91 98110 44821", counterparty: "Harish Chand Aggarwal", imei: "359124089912042", status: "ANSWERED" },
    { timestamp: "2026-03-21 14:02:11", type: "OUTGOING", duration: "03m 18s", bts_tower: "Nai Sarak BTS-02", dialed_no: "+91 98110 99402", counterparty: "Rameshwar Nath Kapoor", imei: "359124089912042", status: "ANSWERED" }
  ],
  "+91 98110 99402": [
    { timestamp: "2026-03-20 13:40:02", type: "OUTGOING", duration: "04m 20s", bts_tower: "Barakhamba Gateway Hub", dialed_no: "+91 98110 44821", counterparty: "Harish Chand Aggarwal", imei: "359124089912043", status: "ANSWERED" },
    { timestamp: "2026-03-21 14:02:11", type: "INCOMING", duration: "03m 18s", bts_tower: "Barakhamba Gateway Hub", dialed_no: "+91 98110 77293", counterparty: "Vikas Singhal", imei: "359124089912043", status: "ANSWERED" }
  ],
  "+91 98110 33119": [
    { timestamp: "2026-03-21 16:11:55", type: "INCOMING", duration: "02m 45s", bts_tower: "Daryaganj BTS-01", dialed_no: "+91 98110 44821", counterparty: "Harish Chand Aggarwal", imei: "359124089912044", status: "ANSWERED" }
  ],

  "+91 99000 81234": [
    { timestamp: "2026-03-20 02:14:09", type: "OUTGOING", duration: "08m 40s", bts_tower: "Koramangala 4th Block DC-01", dialed_no: "+91 99000 45678", counterparty: "Aditya Nair (Exfiltration Lead)", imei: "869012041189401", status: "ANSWERED" },
    { timestamp: "2026-03-20 03:55:22", type: "INCOMING", duration: "04m 15s", bts_tower: "Koramangala 4th Block DC-01", dialed_no: "+91 99000 90123", counterparty: "Rohit Sharma (Zero-Day Access)", imei: "869012041189401", status: "ANSWERED" },
    { timestamp: "2026-03-21 04:10:00", type: "OUTGOING", duration: "05m 12s", bts_tower: "Koramangala DC-01", dialed_no: "+91 99000 12399", counterparty: "Siddharth Rao (Tor Ransom Relay)", imei: "869012041189401", status: "ANSWERED" }
  ],
  "+91 99000 45678": [
    { timestamp: "2026-03-20 02:14:09", type: "INCOMING", duration: "08m 40s", bts_tower: "Indiranagar 100ft Node-03", dialed_no: "+91 99000 81234", counterparty: "Kartik Venkatesh (C2 Lead)", imei: "869012041189402", status: "ANSWERED" },
    { timestamp: "2026-03-21 05:22:11", type: "OUTGOING", duration: "02m 50s", bts_tower: "Indiranagar 100ft Node-03", dialed_no: "+91 99000 12399", counterparty: "Siddharth Rao", imei: "869012041189402", status: "ANSWERED" }
  ],
  "+91 99000 90123": [
    { timestamp: "2026-03-20 03:55:22", type: "OUTGOING", duration: "04m 15s", bts_tower: "Electronic City Phase 1 Hub", dialed_no: "+91 99000 81234", counterparty: "Kartik Venkatesh", imei: "869012041189403", status: "ANSWERED" }
  ],
  "+91 99000 12399": [
    { timestamp: "2026-03-21 04:10:00", type: "INCOMING", duration: "05m 12s", bts_tower: "HSR Layout Sector 2 BTS", dialed_no: "+91 99000 81234", counterparty: "Kartik Venkatesh", imei: "869012041189404", status: "ANSWERED" },
    { timestamp: "2026-03-21 05:22:11", type: "INCOMING", duration: "02m 50s", bts_tower: "HSR Layout Sector 2 BTS", dialed_no: "+91 99000 45678", counterparty: "Aditya Nair", imei: "869012041189404", status: "ANSWERED" }
  ]
};

// ==========================================
// 5. QUERY HELPERS
// ==========================================
export function queryByIp(ip) {
  const masterRow = master.find((m) => m.ip_address === ip) || null;
  const firRow = fir_records.find((f) => f.ip_address === ip) || null;
  const personRow = person_details.find((p) => p.ip_address === ip) || null;

  return {
    master: masterRow,
    fir_records: firRow,
    person_details: personRow,
    aadhar_no: personRow?.aadhar_no || "[Aadhaar Redacted]"
  };
}

export function queryByPersonName(name) {
  const masterRow = master.find((m) => m.person_name.toLowerCase() === name.toLowerCase()) || null;
  const firRow = fir_records.find((f) => f.name.toLowerCase() === name.toLowerCase()) || null;
  const personRow = person_details.find((p) => p.name.toLowerCase() === name.toLowerCase()) || null;

  return {
    master: masterRow,
    fir_records: firRow,
    person_details: personRow,
    aadhar_no: personRow?.aadhar_no || "[Aadhaar Redacted]"
  };
}

export function queryCdrByPhone(phone) {
  if (!phone) return [];
  const cleaned = phone.replace(/\s+/g, "");
  for (const [key, logs] of Object.entries(cdr_records)) {
    if (key.replace(/\s+/g, "") === cleaned) {
      return logs;
    }
  }
  return [
    {
      timestamp: "2026-03-21 12:00:00",
      type: "INCOMING",
      duration: "01m 30s",
      bts_tower: "Local Exchange Tower",
      dialed_no: "+91 98351 00000",
      counterparty: "Suspect Network Node",
      imei: "867204000000000",
      status: "ANSWERED"
    }
  ];
}

// ==========================================
// 6. STREAM SEQUENCE
// ==========================================
export const SYNDICATE_STREAM_SEQUENCE = [
  // --- CLUSTER 1: JAMTARA PHISHING SYNDICATE ---
  {
    id: "JAM-01",
    ip: "103.212.43.18",
    name: "Sunil Kumar Mondal",
    phone: "+91 98351 29401",
    mac: "A4:C3:F0:89:12:DE",
    syndicate: "Jamtara Phishing Ring",
    syndicateKey: "JAMTARA",
    role: "Syndicate Kingpin / Primary Gateway",
    firId: "FIR-0104",
    riskScore: 98,
    clusterCenter: { x: -280, y: -180 },
    initialPos: { x: -280, y: -180 },
    linkedEdges: []
  },
  {
    id: "JAM-02",
    ip: "103.212.43.19",
    name: "Rahul Dev Mandal",
    phone: "+91 98351 88392",
    mac: "A4:C3:F0:89:12:DE",
    syndicate: "Jamtara Phishing Ring",
    syndicateKey: "JAMTARA",
    role: "VoIP Spoofing Operator",
    firId: "FIR-0104",
    riskScore: 94,
    clusterCenter: { x: -280, y: -180 },
    initialPos: { x: -200, y: -240 },
    linkedEdges: [
      { targetId: "JAM-01", label: "SHARED_MAC (A4:C3:F0)", type: "HARDWARE_MAC", weight: 0.95 }
    ]
  },
  {
    id: "JAM-03",
    ip: "103.212.43.25",
    name: "Pankaj Saw",
    phone: "+91 98351 77104",
    mac: "B8:27:EB:11:43:A9",
    syndicate: "Jamtara Phishing Ring",
    syndicateKey: "JAMTARA",
    role: "Mule Account Cashout & SIM Box",
    firId: "FIR-0104",
    riskScore: 91,
    clusterCenter: { x: -280, y: -180 },
    initialPos: { x: -350, y: -230 },
    linkedEdges: [
      { targetId: "JAM-01", label: "CO_ACCUSED (FIR-0104)", type: "LEGAL_FIR", weight: 0.9 },
      { targetId: "JAM-02", label: "CDR_CALL_CLUSTER", type: "TELEPHONY", weight: 0.85 }
    ]
  },
  {
    id: "JAM-04",
    ip: "103.212.43.18",
    name: "Deepak Ansari",
    phone: "+91 98351 66205",
    mac: "A4:C3:F0:89:12:DE",
    syndicate: "Jamtara Phishing Ring",
    syndicateKey: "JAMTARA",
    role: "Mass SMS Blast Operator",
    firId: "FIR-0104",
    riskScore: 93,
    clusterCenter: { x: -280, y: -180 },
    initialPos: { x: -280, y: -100 },
    linkedEdges: [
      { targetId: "JAM-01", label: "SHARED_GATEWAY_IP (103.212.43.18)", type: "SHARED_IP", weight: 0.98 },
      { targetId: "JAM-02", label: "SHARED_MAC_HARDWARE", type: "HARDWARE_MAC", weight: 0.95 }
    ]
  },

  // --- CLUSTER 2: DELHI HAWALA & USDT LAUNDERING ---
  {
    id: "DL-01",
    ip: "182.73.192.44",
    name: "Harish Chand Aggarwal",
    phone: "+91 98110 44821",
    mac: "D4:6A:91:BC:33:11",
    syndicate: "Delhi Crypto-Hawala Ring",
    syndicateKey: "DELHI_HAWALA",
    role: "OTC Desk Controller / Hawala Lead",
    firId: "FIR-8842",
    riskScore: 99,
    clusterCenter: { x: 280, y: -40 },
    initialPos: { x: 280, y: -40 },
    linkedEdges: []
  },
  {
    id: "DL-02",
    ip: "182.73.192.45",
    name: "Vikas Singhal",
    phone: "+91 98110 77293",
    mac: "E0:CB:4E:99:8A:20",
    syndicate: "Delhi Crypto-Hawala Ring",
    syndicateKey: "DELHI_HAWALA",
    role: "P2P Escrow Layering Specialist",
    firId: "FIR-8842",
    riskScore: 95,
    clusterCenter: { x: 280, y: -40 },
    initialPos: { x: 360, y: -100 },
    linkedEdges: [
      { targetId: "DL-01", label: "TRANSFERRED_USDT ($420k)", type: "CRYPTO_ESCROW", weight: 0.97 }
    ]
  },
  {
    id: "DL-03",
    ip: "182.73.192.98",
    name: "Rameshwar Nath Kapoor",
    phone: "+91 98110 99402",
    mac: "FC:34:97:55:12:AA",
    syndicate: "Delhi Crypto-Hawala Ring",
    syndicateKey: "DELHI_HAWALA",
    role: "Cross-Border Shell Invoicing Lead",
    firId: "FIR-8842",
    riskScore: 92,
    clusterCenter: { x: 280, y: -40 },
    initialPos: { x: 210, y: 30 },
    linkedEdges: [
      { targetId: "DL-01", label: "SHARED_BANK_MULE_ESCROW", type: "BANKING", weight: 0.94 },
      { targetId: "DL-02", label: "SWAPPED_TRC20_USDT", type: "CRYPTO_ESCROW", weight: 0.92 }
    ]
  },
  {
    id: "DL-04",
    ip: "182.73.192.110",
    name: "Mohd. Danish Qureshi",
    phone: "+91 98110 33119",
    mac: "3C:52:82:11:78:CD",
    syndicate: "Delhi Crypto-Hawala Ring",
    syndicateKey: "DELHI_HAWALA",
    role: "Physical Cash Angadia Courier",
    firId: "FIR-8842",
    riskScore: 90,
    clusterCenter: { x: 280, y: -40 },
    initialPos: { x: 350, y: 40 },
    linkedEdges: [
      { targetId: "DL-01", label: "ANGADIA_CASH_COLLECTION", type: "PHYSICAL_HAWALA", weight: 0.96 },
      { targetId: "DL-03", label: "CO_ACCUSED (FIR-8842)", type: "LEGAL_FIR", weight: 0.9 }
    ]
  },

  // --- CLUSTER 3: BENGALURU RANSOMWARE & C2 EXTORTION ---
  {
    id: "BLR-01",
    ip: "122.166.89.210",
    name: "Kartik Venkatesh",
    phone: "+91 99000 81234",
    mac: "00:50:56:A1:B2:C3",
    syndicate: "Bengaluru Ransomware Cartel",
    syndicateKey: "BLR_RANSOMWARE",
    role: "C2 Master & LockBit Operator",
    firId: "FIR-7719",
    riskScore: 99,
    clusterCenter: { x: -60, y: 220 },
    initialPos: { x: -60, y: 220 },
    linkedEdges: []
  },
  {
    id: "BLR-02",
    ip: "122.166.89.215",
    name: "Aditya Nair",
    phone: "+91 99000 45678",
    mac: "00:50:56:A1:B2:C3",
    syndicate: "Bengaluru Ransomware Cartel",
    syndicateKey: "BLR_RANSOMWARE",
    role: "Data Exfiltration & Dark Web Auctioneer",
    firId: "FIR-7719",
    riskScore: 96,
    clusterCenter: { x: -60, y: 220 },
    initialPos: { x: 30, y: 260 },
    linkedEdges: [
      { targetId: "BLR-01", label: "SHARED_CLOUD_VPS (00:50:56:A1)", type: "INFRA_VPS", weight: 0.99 }
    ]
  },
  {
    id: "BLR-03",
    ip: "122.166.89.230",
    name: "Rohit 'Krypton' Sharma",
    phone: "+91 99000 90123",
    mac: "00:50:56:C4:D5:E6",
    syndicate: "Bengaluru Ransomware Cartel",
    syndicateKey: "BLR_RANSOMWARE",
    role: "Zero-Day Exploitation & Weaponizer",
    firId: "FIR-7719",
    riskScore: 97,
    clusterCenter: { x: -60, y: 220 },
    initialPos: { x: -140, y: 270 },
    linkedEdges: [
      { targetId: "BLR-01", label: "COBALT_STRIKE_PAYLOAD_DROP", type: "INFRA_VPS", weight: 0.96 },
      { targetId: "BLR-02", label: "VPN_EXPLOIT_RELAY", type: "INFRA_VPS", weight: 0.94 }
    ]
  },
  {
    id: "BLR-04",
    ip: "122.166.89.245",
    name: "Siddharth Rao",
    phone: "+91 99000 12399",
    mac: "00:50:56:A1:B2:C3",
    syndicate: "Bengaluru Ransomware Cartel",
    syndicateKey: "BLR_RANSOMWARE",
    role: "Tor Onion Bridge & Extortion Negotiator",
    firId: "FIR-7719",
    riskScore: 94,
    clusterCenter: { x: -60, y: 220 },
    initialPos: { x: -60, y: 320 },
    linkedEdges: [
      { targetId: "BLR-01", label: "SHARED_VPS_HOST (00:50:56:A1)", type: "INFRA_VPS", weight: 0.99 },
      { targetId: "BLR-02", label: "TOR_ONION_RANSOM_RELAY", type: "CRYPTO_ESCROW", weight: 0.95 },
      { targetId: "BLR-03", label: "CO_ACCUSED (FIR-7719)", type: "LEGAL_FIR", weight: 0.92 }
    ]
  }
];
