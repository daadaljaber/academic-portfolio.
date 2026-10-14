# Day 4: Logs: The basics

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 4 focus:** Understand where logs come from, how to read them, and how separate events become an investigation timeline.

## ✦ Event, Log, Alert & Incident

| Term | Meaning |
| --- | --- |
| **Event** | An activity happened, such as a login. |
| **Log** | A record of that activity. |
| **Alert** | A warning created by a detection rule. |
| **Incident** | A confirmed security issue that requires action. |

```text
Event → Log → Alert → Investigation → Incident
```
---
## ♻️ Log Lifecycle

**Generate**
Systems create logs.

**Collect**
Logs are gathered.

**Store**
Logs are retained.

**Analyze**
Analysts investigate.

### Main Log Sources
- Windows and Linux systems
- Active Directory
- Firewalls, IDS/IPS and VPN
- DNS and web servers
- Proxy and WAF
- EDR, antivirus and email security
---
## 🔎 Key Log Fields
- **Timestamp**
- **Source and destination IP**
- **Source and destination port**
- **Event ID**
- **Username and hostname**
- **Action or status**
- **Process name**
- **File hash**
### Reading a Log Line
```text
2026-09-09 14:20:05 user=sample_user src_ip=10.0.0.15 action=login status=failed
```
- **Time:** 14:20:05
- **User:** sample_user
- **Source:** 10.0.0.15
- **Result:** Failed login
---
## ⏰ Timestamps

**Why time matters:** It places events in order and connects activity across different systems.

- **Local time:** Time based on the system’s location.
- **UTC:** Standard time used to compare logs from different locations.
- **NTP:** Synchronizes device clocks.
```text
Failed logins → Successful login → PowerShell → External connection
```
---
# 🪟 Windows Logs
## Windows Log Channels
- **Security:** Login and account activity
- **System:** Services, drivers and system errors
- **Application:** Events created by applications
- **Specialized logs:** PowerShell, Defender and Sysmon
### Key Windows Event IDs

| Event ID | Meaning |
| --- | --- |
| 4624 | Successful login |
| 4625 | Failed login |
| 4648 | Login using explicit credentials |
| 4672 | Special privileges assigned |
| 4688 | New process created |
| 4720 | User account created |
| 4726 | User account deleted |
| 4740 | User account locked |
| 7045 | New service installed |

### Windows Logon Types

| Type | Meaning |
| --- | --- |
| 2 | Local login |
| 3 | Network login |
| 5 | Service login |
| 10 | Remote Desktop (RDP) |
| 11 | Cached login |

---
## 🛰️ Sysmon
**Sysmon** records detailed Windows system activity.

| Event ID | Meaning |
| --- | --- |
| 1 | Process creation |
| 3 | Network connection |
| 11 | File creation |
| 22 | DNS query |

- **Strength:** Detailed endpoint visibility.
- **Limitation:** Requires proper configuration and does not decide by itself if activity is malicious.
---
# 🐧 Linux Logs
### Authentication Logs
```text
/var/log/auth.log
/var/log/secure
```
- **Failed password:** Failed login
- **Accepted password:** Successful login
- **Invalid user:** Attempt using an account that does not exist
---
# 👥 Active Directory Logs
AD logs can show:
- Successful and failed sign-ins
- Account creation and deletion
- Users added to groups
- Password changes and resets
- Account lockouts
- Privileged account activity

Administrative and sensitive account activity needs extra attention.

---
# 🌐 Network Logs
## Firewall Logs
Main fields: timestamp, IP addresses, ports, protocol and action.
- **Allow:** Traffic was permitted.
- **Deny:** Traffic was rejected.
- **Drop:** Traffic was silently discarded.
## IDS vs. IPS

| IDS | IPS |
| --- | --- |
| Detects suspicious traffic | Detects and blocks traffic |
| Generates alerts | Can prevent the activity |

### VPN Logs
VPN provides secure remote access. Its logs may show:
- User and source IP
- Login time and result
- Session duration
- Device information
**Difference:** IDS/IPS logs show suspicious network activity, while VPN logs show remote access and authentication.
### DNS Logs
DNS logs may show:
- Requested domain
- Source device
- Resolved IP
- Query type and status
Investigate malicious domains, unusual subdomains and DNS tunneling patterns.
---
# 🌍 Web Logs
## Web Server Status Codes

| Code | Meaning |
| --- | --- |
| 200 | Request successful |
| 403 | Access forbidden |
| 404 | Page not found |
| 500 | Internal server error |

Repeated 404 errors across many paths may indicate web scanning.
## Proxy vs. WAF

| Proxy | WAF |
| --- | --- |
| Controls users’ web traffic | Protects web applications |
| Mainly outbound traffic | Mainly inbound web requests |
| Records visited websites | Detects attacks such as SQL injection and XSS |

---
# 🛡️ Security Logs
## EDR vs. Email Security

| EDR / Antivirus | Email Security |
| --- | --- |
| Protects endpoints | Protects the email gateway |
| Processes, files and connections | Senders, links and attachments |

---
# 🧠 Analyst Thinking
## Normal vs. Investigate
```text
Baseline → Observed activity → Analyst’s judgment
```
Investigate when activity:
- Happens at an unusual time or location.
- Uses an unexpected process.
- Targets many users or devices.
- Is unusual for the user’s role.
- Matches a known IOC or attacker behavior.
## IOC vs. IOA
- **IOC:** Evidence such as a malicious IP, domain or hash.
- **IOA:** Suspicious behavior such as Word launching PowerShell.

An unfamiliar IP is not automatically malicious. Always check the context.

---
# 🧩 Correlation & Timeline
**Log correlation** connects related events from multiple sources.
```text
Email gateway: Phishing delivered
→ Windows: Attachment opened
→ Sysmon: PowerShell executed
→ Firewall: Suspicious connection
```
### Building a Timeline
1. Normalize timestamps.
2. Find the first suspicious event.
3. Arrange events in order.
4. Connect users, hosts, IPs and processes.
5. Identify the impact.
> Not everything unusual is an attack.
---
# 🗄️ Centralized Logging
```text
Different log sources → Central collection → SIEM
```
A SIEM helps analysts search, correlate, alert and build timelines in one place.
---
## 🧪 TryHackMe Labs
- [x] Intro to Logs
- [x] Windows Logging for SOC
- [x] Linux logging for SOC

---
# 📖 Extra explanations \| شرح أعمق
## Read the log line in two passes
First extract **when / where / who / what / outcome**. Then inspect surrounding events for cause and impact. For `action=login status=failed`, you can confirm an attempted login failed—not that someone entered the host. Look for later successful logins, account lockout, unusual process launches or an approved maintenance reason.
## Build a reliable timeline
Normalize timestamps to one zone, record whether they are UTC or local, and consider unsynchronized clocks. NTP reduces clock drift but does not guarantee every log is correct. If a firewall says 14:20 UTC and a host says 17:21 at UTC+3, the one-minute discrepancy may be clock drift or different event timing; document it.
## Windows IDs work together
- **4625** = failed logon; group by user, source and time rather than counting alone.
- **4624** = successful logon; inspect Logon Type **10** for Remote Desktop and **3** for network access. A success is not automatically malicious.
- **4688 / Sysmon 1** = process started; follow parent process, command line and account.
- **4720 / 4740 / 7045** = account creation, lockout or new service installation; use with surrounding login evidence.
**Important distinction:** 7045 is normally from the **System** log (Service Control Manager), whereas the Security IDs listed above are from Security; availability depends on audit settings.
## Cross-source story
A phishing email in the email gateway, an opened attachment on the endpoint, a new process in Sysmon and an outbound connection in the firewall form a **hypothesis of compromise**. Confirm that the user, device and timestamps actually match before concluding.
## Normal vs. investigation
Baseline = expected activity for *this* user/device/time. A backup service contacting an external IP nightly may be normal; the same activity from a finance workstation after a new admin login merits investigation. Record why you judged it abnormal, not only that it “looks strange.”
