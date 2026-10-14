# Day 3: Attack and Intrusion Analysis | تحليل الهجمات و الاختراق

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 3 focus:** Follow the attacker’s journey, recognize attack patterns and map evidence to security frameworks.

## ✦ Introduction to Attacks

| Term | Meaning |
| --- | --- |
| **Threat** | Something that could cause harm. |
| **Vulnerability** | A weakness that can be exploited. |
| **Attack** | An attempt to exploit the weakness. |
| **Incident** | A confirmed security impact. |

```text
Threat → Vulnerability → Attack → Incident
```
---
## 👁️ The SOC Analyst’s View
The analyst asks:
- What appears in the logs?
- What alert was generated?
- Which user and host are involved?
- Is the activity normal or suspicious?
- What is the impact?
---
## 🎭 Attackers & Motives

| Attacker | Motive |
| --- | --- |
| APT group | Espionage and long-term access |
| Cybercriminal | Financial gain |
| Insider | Money, revenge or mistakes |
| Hacktivist | Political or social cause |

---
## 🧭 Attacker Journey
```text
Reconnaissance → Initial Access → Execution → Persistence
→ Privilege Escalation → Credential Access
→ C2 → Exfiltration → Impact
```
Understanding the stages helps analysts detect the attack earlier and choose the correct response.
---
# 🔭 Reconnaissance & Scanning
Activities include:
- Port scanning
- Service enumeration
- Internal scanning
- External scanning
### Normal vs. Suspicious
- **Normal:** Approved scan during scheduled maintenance.
- **Suspicious:** Unknown tool, unauthorized time or unusual source.
### What the Analyst Sees
- Many short connections
- One source targeting many systems
- One source scanning many ports
- Activity outside the approved window
---
# 🔐 Password Attacks

| Attack | Pattern |
| --- | --- |
| Brute force | Many passwords against one account (not usually one account) |
| Password spraying | One password against many accounts |
| Credential stuffing | Leaked credentials tested on another service |

### Signs in Logs
- Multiple failed logins
- One IP targeting many accounts
- Failures followed by success
- Login from a new device or location
- Account lockouts
---
# 🎣 Phishing
## Common Methods
- Suspicious links
- Malicious attachments
- Sender or domain spoofing
- Credential-harvesting pages
### Types
- **General phishing:** Sent to many people
- **Spear phishing:** Targets a specific person
- **Whaling:** Targets executives
- **Vishing:** Uses phone calls
### Red Flags
- Lookalike domain: `micr0soft.com`
- Urgent language
- Displayed link leads elsewhere
- Unexpected attachment
- Recently created domain
- Request for sensitive information or money

An internal email can still be malicious if a colleague’s account is compromised.

---
# 🦠 Malware & C2

| Type | Purpose |
| --- | --- |
| Spyware | Monitors and collects information |
| Trojan | Pretends to be legitimate software |
| Ransomware | Encrypts files and demands payment |

### Analyst Observations
- File hash
- Process execution
- Suspicious external connection
- Modified or encrypted files
- Persistence mechanism
- Unusual behavior
### Command & Control
```text
Victim → Beaconing → C2 server
```
Beaconing is repeated communication with an attacker-controlled server.
### Infection Lifecycle
1. Delivery
2. Execution
3. Persistence
4. C2 communication
---
# 🌍 Web Attacks

| Attack | Meaning |
| --- | --- |
| SQL Injection | Malicious SQL inside an input |
| XSS | Malicious script inserted into a page |
| Directory Traversal | Attempts to access restricted files |
| Web Scanning | Searches for pages and vulnerabilities |

### Signs in Web Logs
- Suspicious input
- Repeated errors
- Path scanning
- Tool fingerprints
- High request rate
- Suspicious source
```text
' OR '1'='1  → Possible SQL injection
```
---
# 🗺️ MITRE ATT&CK
- **Tactic:** The attacker’s objective — *why?*
- **Technique:** The method used — *how?*
- **Benefit:** A shared language for mapping attacks and improving detections.
```text
Phishing → Initial Access
PowerShell → Execution
Scheduled Task → Persistence
```
### Common Tactics
Reconnaissance, Initial Access, Execution, Persistence, Privilege Escalation, Credential Access, Discovery, Lateral Movement, Command and Control, Exfiltration and Impact.
---
# 🧷 Indicators
## IOC vs. IOA

| IOC | IOA |
| --- | --- |
| Evidence of compromise | Evidence of attacker behavior |
| IP, domain, URL, hash or filename | Unusual command or process chain |
| Often easier to change | Usually harder to avoid |

---
## 🔺 Pyramid of Pain
From easiest to hardest for an attacker to change:
1. Hash values
2. IP addresses
3. Domain names
4. Network artifacts
5. Host artifacts
6. Tools
7. TTPs
---
# 📋 Attack Analysis Template
### Investigation Checklist
1. **Alert:** What was detected?
2. **Who:** Which user?
3. **Where:** Which host?
4. **What:** What happened?
5. **When:** What time?
6. **Evidence:** Which logs and IOCs?
7. **MITRE mapping:** Which tactic and technique?
8. **Classification:** TP, FP or suspicious?
9. **Severity/Priority:** What is the impact and urgency?
10. **Response:** What should be contained or escalated?
---
## 🧪 TryHackMe Labs
- [x] Cyber Kill Chain
- [x] Pyramid of Pain
- [x] Phishing Analysis Fundamentals
- [x] APT28 Inception
---
# 📖 Extra explanations \| شرح أعمق
## Think in a sequence, not one indicator
**Recon → Access → Execution → Persistence → Objective.** A port scan may be the first visible clue, followed by a login, process launch and outbound connection. One stage does not prove the others occurred. Build a timeline using exact times, accounts, hosts and the source of each observation.
## How the common attacks differ
- **Brute force:** Try many password candidates against an account or set of accounts. **Password spraying** tests a small number of passwords across many accounts; **credential stuffing** uses previously exposed credentials.
- **Phishing:** Trace email delivery → recipient interaction → browser visit or attachment execution → authentication or new process. A suspicious message does not prove the recipient clicked.
- **SQL injection:** Suspicious characters in a URL are only a clue. Examine request path, server response, application/database errors and whether data access actually changed.
- **Reconnaissance:** Many ports or hosts contacted in a short time can indicate scanning, but also an approved vulnerability scan. Check who initiated it and whether there is a change ticket.
## MITRE ATT&CK vs. Cyber Kill Chain
The Kill Chain is a broad sequence of attack phases; ATT&CK is a vocabulary for observed **tactics (why)** and **techniques (how)**. Mapping a PowerShell event to Execution describes behavior—it does **not** by itself identify a particular threat group.
## A useful evidence statement
“From 10:02–10:08 UTC, host A logged 23 failed sign-ins to user B from IP C; at 10:09 UTC one sign-in succeeded; at 10:11 UTC a new process started under B.” Then say what is **confirmed**, what is a **hypothesis**, and what further evidence you need.

**Clarification:** The earlier brute-force table's parenthetical “not usually one account” is misleading. Brute force can target one account; password spraying is specifically the pattern of one/few passwords across many accounts.
