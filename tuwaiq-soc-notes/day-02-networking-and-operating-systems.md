# Day 2: Networking for SOC Analysts

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 2 focus:** Understand network communication and connect traffic to devices, processes and users.

## ✦ Why Networking Matters
The network connects the organization’s systems. SOC analysts use network knowledge to trace traffic, understand alerts and identify suspicious connections.
---
## 🏷️ Addresses
### Public vs. Private IP

| Public IP | Private IP |
| --- | --- |
| Used on the internet | Used inside a local network |
| Globally routable | Not directly internet-routable |
| Assigned by ISP/cloud provider | Usually assigned by DHCP/router |

**Private ranges:** `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
### MAC vs. IP

| MAC Address | IP Address |
| --- | --- |
| Layer 2 | Layer 3 |
| Used mainly in the local network | Used across networks |
| Associated with the NIC | Logical network address |
| Can be spoofed | Can change between networks |

---
## 🧩 Subnet, CIDR & Ports
- **Subnet:** A smaller section of a network.
- **CIDR:** Shows network size, such as `192.168.1.0/24`.
- **Port:** Identifies the service running on a device.
```text
192.168.1.10:443
IP address → Device
Port 443   → HTTPS service
```
### Key Ports

| Port | Service | Use |
| --- | --- | --- |
| 20/21 | FTP | File transfer |
| 22 | SSH | Secure remote access |
| 25 | SMTP | Email |
| 53 | DNS | Name resolution |
| 80 | HTTP | Web traffic |
| 88 | Kerberos | Authentication |
| 123 | NTP | Time synchronization |
| 389 | LDAP | Directory services |
| 443 | HTTPS | Encrypted web traffic |
| 445 | SMB | Windows file sharing |
| 3389 | RDP | Windows remote desktop |

---
## 🚚 TCP vs. UDP

| TCP | UDP |
| --- | --- |
| Connection-oriented | Connectionless |
| Reliable | Faster |
| Confirms delivery | No delivery confirmation |
| HTTP/S, SSH, email | DNS, streaming, VoIP |

### TCP Three-Way Handshake
```text
Client → SYN     → Server
Client ← SYN-ACK ← Server
Client → ACK     → Server
```
### Connection Scenarios
- **Open:** SYN → SYN-ACK → ACK
- **Half-open scan:** SYN → SYN-ACK → RST
- **Closed:** SYN → RST
- **Filtered:** SYN → No response
---
## 🪜 OSI Model

| Layer | Name | Main role |
| --- | --- | --- |
| 7 | Application | User-facing network services |
| 6 | Presentation | Formatting and encryption |
| 5 | Session | Manages sessions |
| 4 | Transport | TCP, UDP and ports |
| 3 | Network | IP addressing and routing |
| 2 | Data Link | MAC addresses and frames |
| 1 | Physical | Cables and signals |

> **Mnemonic:** All People Seem To Need Data Processing.
---
## 📡 Network Devices
### Devices Overview

| Device | Purpose |
| --- | --- |
| Router | Connects different networks using IP addresses |
| Switch | Connects devices in a LAN using MAC addresses |
| Firewall | Allows or blocks traffic |
| VPN | Creates an encrypted remote-access tunnel |
| Proxy | Acts between a user and the internet |
| Access Point | Connects wireless devices to a network |

---
## 🔥 Firewall & NAT
### Firewall Basics
A rule checks:
- Inbound or outbound direction
- Source and destination IP
- Port and protocol
- Allow, deny or drop action
```text
Allow TCP from Internet → Web Server on port 443
```
### How NAT Works
NAT translates private addresses into public addresses.
```text
192.168.1.20:51000
→ NAT public IP
→ Website:443
```
**NAT translates addresses; a firewall applies security rules.**
---
# 💻 Operating Systems for SOC
Alerts may involve:
- Users and privileges
- Processes and services
- Files and folders
- Registry changes
- Network connections
- Applications and devices
### Windows Fundamentals
- **Users:** Standard, administrator, domain and service accounts
- **Processes:** Running programs with PIDs
- **Services:** Background programs
- **Files:** Name, path, owner, timestamps and hash
- **Registry:** Windows configuration and persistence locations
- **Tools:** Task Manager, Event Viewer, CMD and PowerShell
### Linux Fundamentals
- **Root:** Highest-privileged user, UID 0
- **sudo:** Runs an authorized command with elevated privileges
- **Processes:** `ps aux`
- **Permissions:** read `r`, write `w`, execute `x`
- **Services:** Managed using `systemctl`
- **Important paths:** `/home`, `/etc`, `/var/log`, `/tmp`, `/proc`
---
## ⌨️ Commands Learned

| Task | Linux | Windows |
| --- | --- | --- |
| Network configuration | `ip a` | `ipconfig /all` |
| Connectivity | `ping` | `ping` |
| Connections | `ss -tulnp` | `netstat -ano` |
| Processes | `ps aux` | `tasklist` |
| DNS lookup | `nslookup` | `nslookup` |
| Current user | `whoami` | `whoami` |
| Files | `ls`, `find`, `cat` | `dir`, `type` |

---
## 🔗 From Connection to Host
```text
Source/Destination → Connection → Process → User → Host
```
The analyst connects the IP and port to a PID, process, user account and affected device.
---
## 🧪 TryHackMe Labs
- [x] What Is Networking?
- [x] Windows Basics
- [x] Linux Fundamentals Part 1
- [x] Network Traffic Basics
---
# 📖 Extra explanations \| شرح أعمق
## Read one connection like an analyst
Example: `10.0.0.15:51500 → 203.0.113.8:443 TCP`. The left side is the observed source endpoint; the right side is the destination endpoint; **443** commonly carries HTTPS but does not prove the traffic is benign. Ask who owns `10.0.0.15`, which process opened the connection, when it happened and whether the destination is expected. `203.0.113.8` is an example address, not a real IOC.
## Source and destination need context
In a firewall log, the source is the sender for that recorded flow—not necessarily the original human behind a VPN, proxy or NAT. DHCP can change a device's IP over time. Match the timestamp and DHCP/VPN/Proxy records before attributing an IP to a user.
## TCP and UDP in practical terms
TCP establishes a connection and handles ordering/retransmission. UDP sends datagrams without these guarantees at the protocol level; an application may add its own reliability. **UDP is not always faster in practice**, and a port number alone does not confirm an application. DNS often uses UDP but can use TCP; modern web traffic can use UDP via QUIC.
## Where would I look?
- **Connection:** Firewall, VPN, proxy, DNS and web logs.
- **Windows host:** Security log for logins; Sysmon/EDR for process and network context.
- **Linux host:** Authentication logs and service/process logs, depending on configuration.
**Example:** If a firewall shows `internal host → external IP:443`, check DNS for the name, proxy for the URL, then endpoint logs for the initiating process and user. A single network event is not a verdict.
## Private vs. public
RFC1918 addresses (`10/8`, `172.16/12`, `192.168/16`) are private; “not private” does not automatically mean “malicious” or even “publicly reachable.” Cloud, VPN and NAT can obscure the actual path.
