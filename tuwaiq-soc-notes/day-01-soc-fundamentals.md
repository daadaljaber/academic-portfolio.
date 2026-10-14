# Day 1: SOC Fundamentals

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 1 focus:** Understand the SOC, classify alerts, and investigate common security scenarios.

## ✦ What Is a SOC?
A **Security Operations Center (SOC)** monitors, detects, investigates and responds to cybersecurity threats.

**People**
Analysts, responders and managers

**Processes**
Investigation and escalation procedures

**Tools**
SIEM, EDR, firewall and IDS/IPS

### Why Organizations Need a SOC
- Continuous monitoring
- Threat detection
- Alert investigation
- Incident containment and response
- Reporting and documentation

A firewall controls traffic, but a SOC monitors the complete environment and responds to incidents.

---
## 🖥️ SOC vs. SIEM

| SOC | SIEM |
| --- | --- |
| Security team/function | Security tool |
| People, processes and technology | Collects and analyzes logs |
| Investigates and responds | Generates and organizes alerts |

---
## 🚨 Severity vs. Priority

**Severity**
The technical impact: Low, Medium, High or Critical.

**Priority**
How quickly the SOC responds: P1, P2, P3 or P4.

A medium-severity incident may still be **P1** if it affects a critical asset or executive.
---
## ✅ Alert Classification

| Type | Meaning |
| --- | --- |
| **True Positive (TP)** | Real malicious activity generated an alert. |
| **False Positive (FP)** | Legitimate activity generated an alert. |
| **False Negative (FN)** | Malicious activity happened without an alert. |
| **True Negative (TN)** | No attack and no alert. |

---
## ✈️ Impossible Travel
The same account logs in from distant locations within an impossible travel time.
### What to Check
1. User and role
2. Login times and locations
3. IP addresses
4. VPN or proxy usage
5. Device and MFA
6. Confirmation from the user
Possible causes: stolen credentials, VPN usage, shared accounts or incorrect IP location.
---
# 🔍 Investigation Scenarios
### Confirmed Malicious Activity
- **Classification:** True Positive
- **Severity:** Critical
- **Priority:** P1
- Validate, contain, escalate and document.
### Suspicious Login
Check:
- Who is the user?
- Is the account privileged?
- Is the IP or device known?
- Is the location expected?
- Did the user confirm it?
If malicious: restrict the account, revoke sessions, reset the password and escalate.
### Executive Phishing Email
1. Check the sender and domain.
2. Review headers, SPF, DKIM and DMARC.
3. Examine links and attachments safely.
4. Verify the request separately.
5. Search for other recipients.
6. Block and remove the email.
7. Reset credentials if needed.
### Encoded PowerShell
Check:
- User and device
- Parent process and command line
- Decoded command
- Files and network connections
- Whether the action was authorized
If suspicious: preserve evidence, isolate the device, block indicators and escalate.
---
## ⚠️ Threats to Recognize
- **Beaconing:** Repeated communication with a C2 server.
- **Password guessing:** Repeated password attempts.
- **Suspicious PowerShell:** Encoded or unexpected commands.
- **Unauthorized USB:** Possible malware delivery or data theft.
- **Malware:** Software designed to steal, damage or gain access.
- **Failed logins:** May indicate brute force.
- **Privilege escalation:** Gaining higher permissions.
---
# 📖 Extra explanations \| شرح أعمق
## How an alert becomes a decision
**Event → Detection rule → Alert → Triage → Investigation → Decision.** An event is a record of activity, not automatically a threat. The rule identifies a pattern and creates an alert; the analyst checks whether the pattern actually happened and whether it is authorized. An *incident* is declared according to the organization's criteria when response is warranted; the exact threshold can vary.
**مثال:** 15 failed logins to one account may be a forgotten password, a test, or password guessing. Compare the source IP, time, device, past behavior and any successful login before choosing a classification.
## First five questions at triage
1. **What triggered the rule?** Read the rule logic and raw event, not just its title.
2. **Who and what are affected?** Identify the account, host, asset owner and criticality.
3. **When did it begin?** Choose a time window and normalize time zones.
4. **What happened before and after?** Look for related logins, processes and connections.
5. **What action is allowed?** Follow your SOC's playbook and escalation path; do not isolate a device without authorization.
## Close, monitor or escalate?
- **Close with evidence** when you can explain the activity as legitimate and document the confirming source.
- **Keep investigating** when key context is missing; unknown does not equal safe.
- **Escalate quickly** when compromise is credible, a sensitive asset is affected, or containment is needed.
**Severity** describes potential harm; **priority** is the response order after considering urgency, exposure and business importance. A detection's default severity is only a starting point.
## Threat examples in practice
Repeated outbound connections at regular intervals might be C2 *beaconing*, but an update service can look similar. An encoded PowerShell command may be administrative automation or abuse; inspect its parent process, script content, signer and whether the activity was approved.
