# Day 5: SIEM Systems | أنظمة SIEM

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 5 focus:** Understand how a SIEM collects and processes logs, supports searches, detects suspicious activity, and creates alerts.

# 1. SIEM Fundamentals
## From Logs to SIEM
**Scattered logs → Central collection → SIEM**
A firewall, endpoint, server and application each generate separate logs. A SIEM brings them together so analysts can investigate activity from one place.
## What is SIEM?
**SIEM = Security Information and Event Management**

| Part | Meaning | Purpose |
| --- | --- | --- |
| **SIM** | Security Information Management | Long-term storage, reporting and analysis |
| **SEM** | Security Event Management | Real-time monitoring, detection and alerts |

A SIEM:
1. **Collects** logs from different systems.
2. **Parses and normalizes** the data.
3. **Correlates** related events.
4. **Detects** suspicious activity.
5. **Generates alerts** for analysts.
## Why do we need SIEM?
- Firewalls and security tools work separately.
- SIEM provides one unified view.
- It reduces manual searching.
- It connects events that may look harmless alone.
- It supports investigations, compliance and archiving.
## Log Management vs. SIEM

| Log Management | SIEM |
| --- | --- |
| Collects and stores logs | Collects, analyzes and correlates logs |
| Mainly used for retention and searching | Mainly used for security detection and investigation |
| Usually does not create advanced alerts | Uses rules to generate security alerts |

<details>
<summary>🎯 SIEM’s role in a SOC</summary>
- Unified visibility — **الرؤية الموحدة**
- Automated detection — **الكشف الآلي**
- Investigation
- Event correlation — **الربط**
- Compliance
- Archiving — **الأرشفة**
</details>
# 2. How SIEM Works
**Collection → Parsing → Normalization → Enrichment → Indexing**

| Stage | Meaning |
| --- | --- |
| **Collection** | Gathering logs from data sources |
| **Parsing** | Turning raw text into searchable fields |
| **Normalization** | Giving similar fields standard names |
| **Enrichment** | Adding useful context |
| **Indexing** | Organizing data for fast searching |

## SIEM Data Sources
Common sources include:
- Windows and Linux systems
- Firewalls, IDS/IPS and VPN
- DNS, proxy and web servers
- EDR/antivirus
- Email security
- Active Directory
- Cloud services and applications
## Collection Methods

| Method | Description |
| --- | --- |
| **Agent** | Software is installed on the device to collect and forward logs |
| **Agentless** | Logs are collected remotely without installing software |
| **Syslog** | Standard protocol used to send logs; commonly UDP/TCP port **514** |
| **Log collector** | A central system that receives and forwards logs from multiple sources |

## Parsing — التحليل
Parsing converts raw log text into fields such as:
- `timestamp`
- `username`
- `src_ip`
- `dest_ip`
- `action`
- `process`
**Why it matters:** Parsed data becomes searchable and usable by detection rules.
## Normalization — التوحيد
Different tools may use `src`, `source_ip` or `client_ip`. Normalization maps them to one standard field such as `src_ip`.
**Why it matters:** Standard fields allow comparison and correlation across different sources.
## Data Enrichment
Enrichment adds context, including:
- Geographic location — **الموقع الجغرافي**
- IP or domain reputation
- User identity and department
- Asset owner and criticality
- Threat-intelligence information
## Indexing
Indexing organizes processed events so the SIEM can search and retrieve them quickly.
# 3. Search Fundamentals
## Core Concepts

| Term | Meaning |
| --- | --- |
| **Host** | Device that generated or forwarded the event |
| **Source** | Location or input the data came from |
| **Sourcetype** | Format or category of the data |
| **Fields** | Extracted values used for searching |

## Time Range
Always select the correct time range. A search can miss evidence if the range is too narrow, or become slow if it is too broad.
## Searching by Fields
Examples:
- By IP: `src_ip="10.10.10.5"`
- By user: `user="Administrator"`
- By host: `host="THM-PC"`
- By event ID: `EventCode=4625`
## Boolean Operators

| Operator | Use |
| --- | --- |
| **AND** | Both conditions must match |
| **OR** | Either condition may match |
| **NOT** | Excludes a condition |

## Wildcards
The symbol `*` represents any characters.
Example: `user="admin*"` may match `admin` and `administrator`.

Use wildcards carefully. Broad wildcard searches may return too many results and slow the search.

## Search vs. Filtering
- **Search:** Retrieves matching events from the SIEM.
- **Filter:** Narrows the displayed results.
## Broad → Narrow
**Broad search → Filter → Summarize → Find evidence**
## Raw Event vs. Parsed Fields

| Raw Event | Parsed Fields |
| --- | --- |
| Original log message | Extracted values |
| Useful for complete context | Easier to search, compare and summarize |

# 4. Detection and Correlation
## Correlation in SIEM
Correlation links related events from different sources to reveal a larger security story.
**Example:** Many failed logins followed by one successful login from the same IP.
## Correlation Rule
A correlation rule:
1. Connects multiple events.
2. Applies conditions or thresholds.
3. Generates an alert when the conditions match.
## Detection Rule Types

| Rule type | Example |
| --- | --- |
| **Threshold** | More than 10 failed logins in five minutes |
| **Sequence** | Failures followed by a successful login |
| **Matching** | File hash matches known malware |
| **Anomaly** | A process or behavior is rare for the environment |

## Common SIEM Use Cases
- Brute-force attacks
- Privilege escalation
- Data exfiltration
- Impossible travel
- C2 communication
- Malware execution
## Splunk SPL Examples
**Brute-force detection**
```text
index=windows EventCode=4625
| stats count by src_ip, user
| where count > 10
```
**Success after failures**
```text
index=windows (EventCode=4625 OR EventCode=4624)
| transaction user maxspan=5m
| search EventCode=4624
```
**Top external destinations**
```text
index=firewall action=allowed
| top limit=10 dest_ip
```
**Rare processes**
```text
index=sysmon EventCode=1
| rare limit=10 Image
```

**Log → Event → Detection → Alert**

# 5. Alerts and Dashboards
## What is an Alert?
An alert is a notification created when a detection rule finds activity that meets its conditions.
## Alert Components
- Detection rule
- Timestamp
- Entities: user, host, IP or process
- Related events
- Severity and status
## Alert Lifecycle
**Triggered → Triaged → Investigated → Escalated or Closed**
## Severity Levels

| Severity | Meaning |
| --- | --- |
| **Critical** | Immediate and major risk |
| **High** | Serious activity requiring fast investigation |
| **Medium** | Suspicious activity requiring review |
| **Low** | Limited risk or informational activity |

## True vs. False Positive
- **True Positive:** The alert correctly identifies malicious activity.
- **False Positive:** The alert is triggered by legitimate activity.
## Dashboards
Dashboards provide:
- Trends at a glance
- Continuous monitoring
- Metrics for different audiences
- Visibility into alerts and system health
**Dashboard vs. Search:** Dashboards are for quick monitoring; searches are for detailed investigation.
# 6. Investigation Workflow
**Alert → Review rule → Search events → Correlate evidence → Decide → Escalate or close**
## Investigation Questions
1. What triggered the alert?
2. Which user, host and IP are involved?
3. Where did the activity originate?
4. What happened before and after it?
5. Is the activity normal, suspicious or malicious?
6. What response is required?
# 7. Open-Source SIEM
## Advantages
- Free and flexible
- Large communities
- Customizable rules and integrations
## Challenges
- Requires technical knowledge
- Setup and maintenance take effort
- The organization manages the infrastructure
## Examples

| Platform | Main use |
| --- | --- |
| **Wazuh** | Endpoint monitoring, log analysis and detection |
| **Elastic Security** | Search, analytics and SIEM |
| **Graylog** | Centralized log management and analysis |
| **Security Onion** | Network security monitoring and threat hunting |

# Theory Summary
- SIEM collects, processes and centralizes security data.
- Parsing creates fields; normalization standardizes them.
- Enrichment adds context; indexing enables fast search.
- Correlation and detection rules turn events into alerts.
- Dashboards support monitoring; searches support investigation.
- Open-source SIEM tools are flexible but require expertise.
# Hands-on Lab 🧪

---
# 📖 Extra explanations \| شرح أعمق
## Follow one event through the SIEM
Raw line: `user=sample_user src=10.0.0.15 action=failed`. **Parsing** extracts fields; **normalization** maps `src` and `client_ip` to a consistent field such as `src_ip`; **enrichment** adds device owner or IP reputation; **indexing** makes it searchable. A rule may then count repeated failures and open an alert. The raw event remains important when a parsed field looks wrong.
## What a search actually proves
`EventCode=4625 | stats count` counts matching records in the **selected index and time range**; it does not count unique attackers or prove brute force. Change the range, field extraction or data source and the result may change. Use `| stats count by src_ip, user` to see which source/user pairs drive the count, then inspect raw events.
## Why correlation needs care
“10 failures followed by success” is suspicious only if user, source, host and times plausibly relate. A legitimate user could log in after mistakes while an unrelated scanner fails nearby. A simple `transaction user` search can merge unrelated IPs; check sequence and source before interpreting the result.
## Detection rule vs. alert
A **rule** describes what to look for; an **alert** is one instance where the rule matched. Thresholds trade noise against missed activity: too low yields many false positives; too high may miss quieter attacks. Test against your baseline before making changes.
## Dashboard vs. investigation
A dashboard answers “What changed across our environment?” A search answers “What happened to this user/host/IP?” Start broad, narrow by time and entities, and document the exact query and time zone so someone else can reproduce the result.
## Lab note
The SPL snippets above are **examples**. Actual field names, indexes and permissions vary; no result should be copied from an example without running it on the lab dataset.
