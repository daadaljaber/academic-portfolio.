# Day 6: Interactive Review & SIEM Labs | مراجعة تفاعلية | alert investigator 

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 6 focus:** مراجعة تفاعلية للأيام 1–5، ثم تطبيق عملي على SIEM وSplunk. اسأل: *ماذا حدث؟ ما الدليل؟ وما القرار؟*

# 🧠 Interactive Review \| مراجعة الأيام الخمسة
## Day 1 — SOC workflow
- **دور المحلل:** فرز التنبيهات، جمع الأدلة، تحديد الأثر، وتوثيق القرار.
- **أول خطوة مع Alert:** اقرأ القاعدة والوقت والكيانات المتأثرة، ثم تحقق من الأحداث الأصلية والسياق.
- **Event / Alert / Incident:** الحدث تسجيل لنشاط؛ التنبيه إشارة من قاعدة كشف؛ الحادث نشاط ضار أو خطر مؤكد يستلزم استجابة.
- **Close vs Escalate:** أغلق مع السبب والأدلة إذا كان نشاطًا مشروعًا؛ صعّد عند وجود دليل اختراق أو أثر محتمل يتجاوز صلاحياتك.
- **Severity ≠ Priority:** الشدة تصف خطورة الحدث، والأولوية تحدد سرعة التعامل معه بحسب الأثر وأهمية الأصل والسياق.
## Day 2 — Networking for SOC
- **Source IP → Destination IP:** من بدأ الاتصال، وإلى أين؟ أضف المنفذ والبروتوكول والوقت قبل الحكم.
- **TCP vs UDP:** TCP يتتبع الاتصال والتسليم؛ UDP لا يضمن التسليم بالطريقة نفسها وأخف من حيث الحمل.
- **Internal vs External:** العنوان الداخلي يخص شبكة خاصة؛ الخارجي قد يشير إلى خدمة أو جهة خارج المؤسسة، لكنه ليس دليل هجوم وحده.
- **Windows / Linux logs:** راجع Windows Security/Sysmon وLinux `auth.log` أو `secure`، ثم اربطها بسجلات الشبكة.
- **فسّر الاتصال:** المستخدم + الجهاز + العملية + IP/port + الوقت + الاتجاه + هل هذا متوقع؟
## Day 3 — Cyberattacks

| Attack | اسأل نفسك: ما الأثر في السجلات؟ |
| --- | --- |
| **SQL injection** | طلبات ويب غير طبيعية أو أخطاء قاعدة بيانات مرتبطة بالطلب. |
| **Brute force** | محاولات دخول فاشلة متكررة، وربما نجاح بعدها. |
| **Phishing** | رسالة أو رابط مريب، ثم فتح الرابط أو تنفيذ ملف أو دخول غير معتاد. |
| **Reconnaissance** | فحص منافذ أو مسارات أو خدمات قبل محاولة الاستغلال. |

## Day 4 — Logs: The Basics
- دورة السجل: **توليد → جمع → تخزين → تحليل**. الحقول المهمة: الوقت، المصدر والوجهة، المستخدم، الإجراء، العملية وEvent ID.
- **Windows:** `4625` فشل دخول، `4624` نجاح، و`4688` إنشاء عملية؛ **Sysmon:** `1` عملية، `3` اتصال شبكة، `11` ملف، `22` استعلام DNS.
- **Linux / Network:** `auth.log` أو `secure` للدخول؛ Firewall وDNS وWeb/Proxy لتتبع الاتصال. وحّد المنطقة الزمنية قبل بناء الخط الزمني.
## Day 5 — SIEM
- **Logs متفرقة → تجميع → Parsing → Normalization → Correlation → Alert.**
- ابحث ضمن **فترة زمنية صحيحة**، صفِّ حسب IP/مستخدم/جهاز، ثم قارن الأحداث بالسجل الخام.
- **Correlation** يربط أدلة من مصادر متعددة؛ التنبيه بداية التحقيق وليس إثباتًا نهائيًا.
---
# 🧪 Today's TryHackMe Labs

| # | Room | التركيز |
| --- | --- | --- |
| 1 | **Introduction to SIEM** | المصادر، التجميع، وتسلسل الكشف والربط. |
| 2 | **Splunk Basics** | البحث والعدّ ضمن فترة زمنية. |
| 3 | **Splunk: Exploring SPL** | Filter وstats وtop وربط محاولات الدخول. |
| 4 | **Investigating with Splunk** | استخراج المستخدم وIP والخط الزمني والنشاط اللاحق. |

<details>
<summary>1️⃣ Introduction to SIEM - أسئلة تطبيقية</summary>
1. لماذا نستخدم SIEM بدل مراجعة كل Log منفصل؟ **رؤية موحدة وربط أسرع للأحداث.**
2. اذكر 3 مصادر: **Windows، Firewall، Linux** (أمثلة).
3. رتّب المراحل: **Log → Event → Detection → Alert.**
4. نفس IP في Firewall وWindows: ما اسم ربط الحدثين؟ **Correlation — الربط.**
</details>
<details>
<summary>2️⃣ Splunk Basics - ابحث داخل Splunk</summary>
- عدد الأحداث في الفترة المحددة: `| stats count`
- عدد أحداث فشل الدخول: `EventCode=4625 | stats count`
- أكثر Source IP تكرارًا: `| top limit=1 src_ip`
- فشل دخول مستخدم محدد: `user=administrator AND status=failure`
**ملاحظة:** الأعداد وIP الفعلي تعتمد على بيانات المعمل والفترة المختارة؛ لا تملأها بالتخمين.
</details>
<details>
<summary>3️⃣ Exploring SPL - أسئلة تطبيقية</summary>
- اعرض الفشل فقط: `status=failure`
- احسب الأحداث لكل عنوان مصدر: `| stats count by src_ip`
- أكثر مستخدم ظهورًا: `| top user`
- هل فشل دخول مستخدم ثم نجح في الفترة نفسها؟ طابق **user + الوقت + src_ip**، ثم افحص أحداث النجاح والفشل بالترتيب.
</details>
<details>
<summary>4️⃣ Investigating with Splunk - سجل نتائجك</summary>
- من صاحب أكبر عدد محاولات فاشلة؟ **المستخدم:** 
- من أي Source IP جاءت المحاولات؟ **IP:** 
- متى أول Successful Login بعد سلسلة الفشل؟ **الوقت والمنطقة الزمنية:** 
- ما العملية/النشاط بعد الدخول الناجح؟ **Process / Evidence:** 
</details>

**طريقة العمل:** حدّد الوقت والـindex → ابدأ ببحث واسع → صفِّ حسب المستخدم أو IP → رتّب الأحداث زمنيًا → افتح Raw Event للتأكد → وثّق استنتاجك.

---
# 📖 Extra explanations \| مراجعة خطوة بخطوة
## One practice scenario across Days 1–5
**Scenario:** A user has repeated failed sign-ins, then one success, then a new process and an external connection.
1. **Day 1 — Triage:** Check the alert rule, affected user and host; do not call it an incident yet.
2. **Day 2 — Network:** Identify source/destination, port, protocol and whether VPN/NAT changed the apparent source.
3. **Day 3 — Attack pattern:** Failures followed by success suggest password guessing, but could have a legitimate explanation.
4. **Day 4 — Logs:** Compare Security `4625` with `4624`, Sysmon process events and firewall/VPN logs. Normalize time zones.
5. **Day 5 — SIEM:** Search broadly, filter on the user/IP, build the timeline, then report what is confirmed and what is still uncertain.
## How to answer the Splunk practice questions
- For `| stats count`, choose the intended **index + time range** first; copy the returned count, not the number of visible rows.
- For `| top limit=1 src_ip`, record the top source only **after** confirming the relevant event filter.
- To find failure → success, sort by time and compare the **same user and source IP**; investigate changes in IP rather than assuming all events belong together.
- To find activity after a successful login, note the success time and search process logs for that host/user shortly afterward; open the raw events.
**No dataset values are prefilled:** the user, IP, timestamps and process must come from your own lab results.

**Exam shortcut:** Tell the story as *alert → evidence → context → decision*. If a link is missing, mark it as unknown rather than guessing.
