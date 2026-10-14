# Day 9: SOC Scenarios | سيناريوهات SOC

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 9 focus:** تطبيق مهارات محلل SOC من خلال سيناريوهات عملية تشمل فهم أساسيات مركز العمليات الأمنية وكتابة تقارير تنبيهات L1.

# Hands-on Labs \| التطبيقات العملية
- [x] **SOC Fundamentals**
- [x] **SOC L1 Alert Reporting**
- [ ] **Splunk Practice: Failed Logins Investigation**
## Skills Practiced \| المهارات المطبقة
- فهم دور محلل SOC وسير عمل التنبيه.
- فرز التنبيهات وجمع المعلومات الأساسية.
- التمييز بين الحدث والتنبيه والحادث.
- توثيق الأدلة وكتابة تقرير L1 واضح.
- تحديد النتيجة والخطوة التالية أو الحاجة إلى التصعيد.

**Progress:** **2/3 completed** — Splunk Practice remains.

# Splunk Practice \| تدريب Splunk عملي
## Scenario
وصل تنبيه عن عدد كبير من محاولات تسجيل الدخول الفاشلة إلى حساب مستخدم، ثم ظهر تسجيل دخول ناجح. المطلوب استخدام Splunk للتحقق هل النشاط **Brute Force / Password Spraying** أم نشاط مشروع.

**Goal:** حددي المستخدم المستهدف، مصدر المحاولات، هل حدث نجاح بعد الفشل، والأجهزة المتأثرة، ثم اكتبي تقرير L1 مختصرًا.

## Step 1 — Review the Events
ابدئي ببحث واسع يعرض محاولات الدخول الفاشلة والناجحة بالترتيب الزمني:
```text
index=windows (EventCode=4625 OR EventCode=4624)
| table _time EventCode user src_ip host
| sort 0 _time
```
- **4625:** Failed logon.
- **4624:** Successful logon.
- راجعي الـTime Range وتأكدي أنه يغطي الفترة المطلوبة.
## Step 2 — Count Failed Logins
```text
index=windows EventCode=4625
| stats count AS failed_attempts by src_ip user
| sort - failed_attempts
```
أجيبي:
1. أي مستخدم لديه أكبر عدد من المحاولات الفاشلة؟
2. ما الـSource IP الذي أرسل معظم المحاولات؟
3. هل حاول المصدر نفسه الدخول إلى مستخدم واحد أم عدة مستخدمين؟
## Step 3 — Find the Top Source IP
```text
index=windows EventCode=4625
| top limit=10 src_ip
```
ثم ابحثي عن كل نشاط المصدر الأكثر تكرارًا:
```text
index=windows src_ip="<SUSPICIOUS_IP>"
| table _time EventCode user src_ip host
| sort 0 _time
```
استبدلي `<SUSPICIOUS_IP>` بالقيمة التي وجدتها.
## Step 4 — Find Failures and Successes in the Same Window

> This aggregation identifies co-occurrence, not event order. Use the sorted timeline in Step 5 to verify that success followed failures; indexes and field names depend on the lab dataset.
```text
index=windows (EventCode=4625 OR EventCode=4624)
| eval result=if(EventCode=4624,"Success","Failure")
| stats count(eval(result="Failure")) AS failures
        count(eval(result="Success")) AS successes
        earliest(_time) AS first_seen
        latest(_time) AS last_seen
        values(host) AS affected_hosts
        by user src_ip
| where failures>=5 AND successes>=1
| convert ctime(first_seen) ctime(last_seen)
```
تحققي:
- هل يوجد **Successful Login** بعد سلسلة الفشل؟
- هل المستخدم والـSource IP متطابقان؟
- ما الجهاز أو الأجهزة المتأثرة؟
- هل التوقيت أو الموقع أو الجهاز معتاد للمستخدم؟
## Step 5 — Build the Timeline
استخدمي القيم المشبوهة لبناء خط زمني واضح:
```text
index=windows user="<USER>" src_ip="<SUSPICIOUS_IP>"
(EventCode=4625 OR EventCode=4624)
| eval result=case(EventCode=4625,"Failed Login",
                   EventCode=4624,"Successful Login")
| table _time result user src_ip host
| sort 0 _time
```
## Step 6 — Investigation Questions
- ما أول وآخر وقت للنشاط؟
- كم عدد محاولات الفشل؟
- هل حدث دخول ناجح؟
- هل استُهدف حساب واحد أم عدة حسابات؟
- هل الـIP داخلي أم خارجي؟
- هل ظهر نشاط مشبوه بعد الدخول، مثل PowerShell أو اتصال خارجي؟
- ما التصنيف الأنسب: Benign، Suspicious، أم True Positive؟
- ما Severity وPriority المناسبان؟ ولماذا؟
## Step 7 — L1 Alert Report
اكتبي تقريرًا مختصرًا باستخدام القالب:
- **Alert:** Multiple failed logins followed by success
- **Time range:** …
- **Targeted user:** …
- **Source IP:** …
- **Affected host:** …
- **Failed attempts:** …
- **Successful login:** Yes / No
- **Evidence:** …
- **Classification:** …
- **Severity / Priority:** …
- **Recommended action:** Close / Monitor / Investigate / Escalate
- **Reason:** …

إذا لم تظهر حقول `user` أو `src_ip` أو `host`، افتحي حدثًا واحدًا وتحققي من أسماء الحقول في بياناتك. قد تظهر باسم `Account_Name` أو `Source_Network_Address` أو `ComputerName`.

# Scenario 2 — Suspicious Process Chain \| سلسلة عمليات مشبوهة
## Scenario
فتح المستخدم ملفًا باستخدام Microsoft Word، ثم ظهر تشغيل PowerShell. المطلوب تحليل العلاقة بين العمليات وتحديد هل النشاط طبيعي أم يشير إلى **Phishing / Malware Execution**.
## Investigation Questions
1. **ما أول حدث غير طبيعي؟** حددي أول عملية أو ملف أو اتصال خرج عن سلوك المستخدم المعتاد.
2. **ما علاقة ****`winword.exe`**** بـ****`powershell.exe`****؟** تحققي هل Word هو الـParent Process الذي أنشأ PowerShell كـChild Process.
3. **ما الأمر الذي نفذه PowerShell؟** افحصي الـCommand Line بحثًا عن تنزيل ملف، Encoded Command، Execution Policy Bypass، أو رابط خارجي.
4. **ماذا حدث بعد تشغيل PowerShell؟** ابحثي عن ملف جديد، اتصال شبكي، Persistence، أو عملية Child إضافية.

ظهور `winword.exe → powershell.exe` علاقة **Parent–Child** غير معتادة وغالبًا ترتبط بمستند ضار أو Macro، لكنها تحتاج إلى Command Line وسياق المستخدم واتصالات الشبكة قبل إصدار الحكم النهائي.

## Step 1 — Find the Process Chain
```text
index=sysmon EventCode=1
(Image="*\\WINWORD.EXE" OR ParentImage="*\\WINWORD.EXE"
 OR Image="*\\powershell.exe")
| table _time user host ParentImage Image CommandLine ProcessId ParentProcessId ProcessGuid
| sort 0 _time
```
## Step 2 — Confirm Word Spawned PowerShell
```text
index=sysmon EventCode=1
ParentImage="*\\WINWORD.EXE" Image="*\\powershell.exe"
| table _time user host ParentImage Image CommandLine ProcessGuid
```
راجعي:
- هل PowerShell شُغّل مباشرة من Word؟
- هل توجد أوامر مثل `-enc` أو `-EncodedCommand` أو `-ExecutionPolicy Bypass`؟
- هل يحتوي الأمر على `http` أو `DownloadString` أو `Invoke-WebRequest`؟
## Step 3 — Search for Network Activity
إذا كانت بيانات Sysmon Event ID 3 متوفرة، ابحثي عن اتصالات PowerShell:
```text
index=sysmon EventCode=3 Image="*\\powershell.exe"
| table _time user host Image DestinationIp DestinationPort DestinationHostname
| sort 0 _time
```
## Step 4 — Search for Created Files
إذا كانت بيانات Sysmon Event ID 11 متوفرة:
```text
index=sysmon EventCode=11
| search TargetFilename="*.exe" OR TargetFilename="*.dll"
         OR TargetFilename="*.ps1" OR TargetFilename="*.bat"
| table _time user host Image TargetFilename
| sort 0 _time
```
## SOC Ticket Template \| قالب تذكرة SOC
- **Ticket / Alert ID:** …
- **Alert title:** Word spawned PowerShell
- **Detection time:** …
- **Affected user:** …
- **Affected host:** …
- **Parent process:** `winword.exe`
- **Child process:** `powershell.exe`
- **Command line:** …
- **Network destination:** …
- **Created file / hash:** …
- **Initial classification:** Benign / Suspicious / True Positive
- **Severity / Priority:** …
- **Confidence:** Low / Medium / High
- **Assigned analyst:** …
- **Current status:** Open / Investigating / Escalated / Closed
## Investigation Notes \| ملاحظات التحقيق
اكتبي الملاحظات بالترتيب التالي:
1. **Observation:** ماذا أظهر التنبيه أو البحث؟
2. **Evidence:** ما السجل أو الحقل الذي يثبت ذلك؟
3. **Assessment:** ماذا يعني الدليل؟ وهل توجد تفسيرات بديلة؟
4. **Action:** ما الإجراء الذي اتُّخذ؟
5. **Next step:** ما السؤال أو البحث التالي؟
**مثال:**
> أظهر Sysmon Event ID 1 أن `WINWORD.EXE` أنشأ `powershell.exe` على الجهاز PC-01. احتوى الـCommand Line على رابط خارجي وأمر تنزيل. التقييم: تنفيذ مشبوه ناتج عن مستند محتمل الضرر، بثقة عالية. تم طلب عزل الجهاز وتصعيد الحالة إلى L2.
## Action / Closure Decision \| الإجراء وقرار الإغلاق
### Escalate / Contain
صعّدي الحالة أو اطلبي الاحتواء إذا:
- احتوى PowerShell على أمر مشفر أو تنزيل خارجي.
- ظهر اتصال إلى IP أو domain ضار.
- تم إنشاء ملف مشبوه أو Persistence.
- تكرر النشاط على أكثر من جهاز.
- الحساب أو الأصل حساس.
### Close as Benign or False Positive
يمكن الإغلاق فقط إذا:
- كان التشغيل مصرحًا به وله سبب عمل واضح.
- تطابق الأمر مع برنامج أو Script معروف.
- لم يظهر ملف ضار أو اتصال غير معتاد.
- تم توثيق دليل التحقق وسبب الإغلاق.
### Recommended Closure Statement
- **Final classification:** …
- **Action taken:** …
- **Closure reason:** …
- **Evidence supporting closure:** …
- **Follow-up required:** Yes / No
- **Owner and due date:** …

لا تغلقي التنبيه لأن العملية “Blocked” فقط. تحققي مما حدث قبل الحظر وبعده، وهل نجح جزء آخر من سلسلة الهجوم.

# Six-Step Investigation Workflow \| خطوات التحقيق الست
يُستخدم هذا التسلسل للتحقق من نشاط Remote أو أوامر إدارية قد تكون ضارة أو مصرحًا بها.
## 1. Check the Starting Point \| فحص نقطة البداية
ابدئي من أول حدث معروف بدل التركيز على آخر Alert فقط:
- ما التنبيه أو القاعدة التي بدأت التحقيق؟
- ما أول Host وUser وSource IP ظهر؟
- ما أول Timestamp موثوق؟
- هل سبق الحدث Phishing أو Failed Logins أو تشغيل ملف؟
- ما مصدر السجل: EDR، Windows Security، VPN، Firewall أم SIEM؟
**الهدف:** تحديد نقطة الدخول المحتملة وبداية الـTimeline.
## 2. Check the Remote Connection \| فحص الاتصال البعيد
تحققي من:
- نوع الاتصال: RDP أو SSH أو VPN أو Remote Management.
- Source IP وDestination Host وPort.
- اسم الحساب ونجاح أو فشل المصادقة.
- هل الـIP داخلي أم خارجي؟ وهل الجهاز معروف؟
- هل توجد MFA أو Session Logs تدعم الحدث؟
**Windows evidence examples:**
- **4624:** Successful logon؛ راجعي **Logon Type 10** لاتصال RDP.
- **4625:** Failed logon.
- **4648:** Logon using explicit credentials.
- **4778 / 4779:** RDP session reconnect / disconnect.
- **Port 3389:** منفذ RDP المعتاد.
## 3. Check Discovery Commands \| فحص أوامر الاستكشاف
ابحثي بعد الاتصال عن أوامر يجمع بها المستخدم أو المهاجم معلومات عن النظام، مثل:
- `whoami` — معرفة هوية المستخدم وصلاحياته.
- `hostname` و`systeminfo` — معلومات الجهاز والنظام.
- `ipconfig /all` و`arp -a` و`route print` — معلومات الشبكة.
- `net user` و`net localgroup administrators` — المستخدمون والمجموعات.
- `tasklist` و`sc query` — العمليات والخدمات.
- `nltest` أو `net view` — اكتشاف الـDomain والأجهزة.
راجعي **Event ID 4688** أو **Sysmon Event ID 1** لمعرفة Process، Parent Process، User وCommand Line.

أوامر Discovery ليست ضارة وحدها؛ قد يستخدمها مسؤول نظام. الحكم يعتمد على الحساب، الجهاز، التوقيت، عدد الأوامر، وما حدث بعدها.

## 4. Check the Process Outcome \| فحص ناتج العملية
لا تكتفي برؤية الأمر؛ تحققي مما نتج عنه:
- هل أنشأ Child Process؟
- هل تم إنشاء أو تعديل ملف؟
- هل ظهر اتصال Network جديد؟
- هل تغيرت خدمة أو Registry Key أو Scheduled Task؟
- هل نجح الأمر أم فشل؟
- هل ظهرت Persistence أو Privilege Escalation أو Lateral Movement؟
**مهم:** سجلات Process Creation تسجل غالبًا أن العملية بدأت، لكنها لا تعرض دائمًا النص الذي ظهر للمستخدم. استخدمي File وNetwork وRegistry وEDR telemetry لتأكيد النتيجة.
## 5. Verify Approval / Change \| التحقق من الموافقة أو التغيير
قارني النشاط مع:
- Change Request أو Maintenance Ticket معتمد.
- اسم المنفذ واسم صاحب الموافقة.
- الأنظمة والأوامر المشمولة في الطلب.
- نافذة التنفيذ المعتمدة.
- حساب الـAdmin أو Vendor المتوقع.
- نتيجة التواصل مع System Owner أو Change Management.
**Approved لا يعني تلقائيًا Benign:** إذا تجاوز النشاط النطاق أو الوقت أو استخدم حسابًا غير مذكور، استمري في التحقيق وصعّدي عند الحاجة.
## 6. Compare the Timing \| مقارنة التوقيت
قارني بين:
- وقت الـRemote Login.
- وقت تشغيل أوامر Discovery.
- وقت إنشاء الملفات أو الاتصالات.
- وقت نافذة التغيير المعتمدة.
- وقت إرسال التنبيه ووصول السجل إلى الـSIEM.
تحققي من:
- توحيد المنطقة الزمنية إلى UTC أو المنطقة المعتمدة.
- Clock Drift أو تأخر وصول السجلات.
- هل بدأ النشاط قبل الموافقة أو استمر بعدها؟
- هل تسلسل الأحداث منطقي ويخص الجلسة نفسها؟
## Decision Logic \| منطق القرار
- **Authorized / Benign:** الحساب والجهاز والأوامر والتوقيت كلها ضمن Change معتمد ولا يوجد أثر ضار.
- **Policy Violation:** النشاط مشروع ظاهريًا لكنه خارج النافذة أو الصلاحية أو الإجراء المعتمد.
- **Suspicious:** توجد اختلافات أو أدلة ناقصة تحتاج تحقيقًا أعمق.
- **True Positive:** اتصال غير مصرح به يتبعه Discovery أو تنفيذ أو Persistence أو حركة جانبية.

**قاعدة التحقيق:** Remote connection + Discovery commands لا تكفي وحدها للحكم. اربطيها بالموافقة، التوقيت، هوية الحساب، وناتج العمليات.

# Final Report \| التقرير النهائي
يجب أن يكون التقرير مختصرًا، مبنيًا على الأدلة، ويتيح لمحلل آخر فهم ما حدث والقرار الذي تم اتخاذه.
## 1. Summary \| الملخص
اكتبي فقرة قصيرة تجيب عن:
- ما التنبيه أو النشاط الذي تم التحقيق فيه؟
- من المستخدم وما الجهاز المتأثر؟
- ماذا اكتشف التحقيق؟
- ما التصنيف النهائي ودرجة الخطورة؟
**Template:**
> تم التحقيق في تنبيه **\[اسم التنبيه\]** على الجهاز **\[Host\]** المرتبط بالمستخدم **\[User\]**. أظهر التحليل **\[أهم نتيجة\]**. تم تصنيف الحالة كـ**\[Classification\]** بدرجة خطورة **\[Severity\]** وثقة **\[Confidence\]**.
## 2. Timeline \| الخط الزمني
رتّبي الأحداث من الأقدم إلى الأحدث، واستخدمي منطقة زمنية واحدة:
- **\[Time\]:** الحدث الأول — المصدر والنتيجة.
- **\[Time\]:** النشاط المشبوه — العملية أو الحساب أو الاتصال.
- **\[Time\]:** النشاط اللاحق — ملف أو اتصال أو عملية جديدة.
- **\[Time\]:** إجراء المحلل — احتواء أو تصعيد أو إغلاق.
**Example:**
- **10:01:** فتح المستخدم مستند Word.
- **10:02:** أنشأ `winword.exe` عملية `powershell.exe`.
- **10:03:** نفّذ PowerShell أمر تنزيل من عنوان خارجي.
- **10:04:** ظهر اتصال Outbound من الجهاز إلى IP مشبوه.
- **10:10:** تم تصعيد الحالة وطلب عزل الجهاز.
## 3. Key Evidence \| الأدلة الرئيسية
اذكري الأدلة التي دعمت القرار، مع مصدر كل دليل:
- **Process evidence:** Parent Process، Child Process، Command Line، Process ID.
- **Network evidence:** Destination IP أو domain أو port ووقت الاتصال.
- **File evidence:** اسم الملف ومساره وhash ووقت الإنشاء.
- **Identity evidence:** المستخدم، محاولات الدخول والجلسات.
- **Correlation:** العلاقة الزمنية والمنطقية بين الأدلة.
- **Threat intelligence:** سمعة المؤشر وحداثة النتيجة.
**Example:**
- Sysmon Event ID 1: `WINWORD.EXE → powershell.exe`.
- احتوى الـCommand Line على رابط خارجي وأمر تنزيل.
- Sysmon Event ID 3: اتصال PowerShell بعنوان خارجي مشبوه.
- Sysmon Event ID 11: إنشاء ملف جديد بعد تشغيل PowerShell.
## 4. Final Action \| الإجراء النهائي
وثّقي القرار وما نُفذ وسبب ذلك:
- **Classification:** Benign / False Positive / Suspicious / True Positive.
- **Action:** Close / Monitor / Contain / Escalate.
- **Containment:** عزل الجهاز، تعطيل الحساب، حظر IOC، أو إنهاء الجلسات.
- **Escalated to:** الفريق أو الشخص المستلم.
- **Closure reason:** سبب الإغلاق مدعومًا بالدليل.
- **Follow-up:** الإجراء المتبقي، المسؤول عنه، والموعد.
**Template:**
> تم **\[الإجراء\]** بسبب **\[السبب\]**. تم تصعيد الحالة إلى **\[الجهة\]** / إغلاقها كـ**\[Closure Reason\]**. الإجراء المتبقي هو **\[Follow-up\]** ومسؤوله **\[Owner\]** بتاريخ **\[Due Date\]**.

**قاعدة التقرير:** اكتبي ما أثبتته السجلات، ثم اذكري تقييمك منفصلًا. لا تستخدمي كلمات مثل “اختراق مؤكد” دون دليل كافٍ.
