# Day 10: Full Incident Handling & Final Report | معالجة حالة كاملة

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

> Export note: one embedded item was unavailable from Notion and is not included. The available text and lab checklist are preserved.

**Day 10 focus:** معالجة حالة أمنية كاملة من لحظة ظهور التنبيه حتى التحقيق والاحتواء والإغلاق، ثم كتابة تقرير نهائي مبني على الأدلة.

# Security Goals \| أهداف الأمن السيبراني
## CIA Triad
الهدف الأساسي هو حماية **Confidentiality, Integrity, and Availability** معًا. قد يؤثر الحادث في عنصر واحد أو أكثر.
### 1. Confidentiality \| السرية
منع الوصول أو الإفصاح غير المصرح به عن المعلومات.
**أمثلة على الخطر:**
- سرقة بيانات العملاء.
- قراءة بريد أو ملفات دون صلاحية.
- تسريب Credentials أو API keys.
**ضوابط الحماية:** Access Control، Encryption، MFA، Data Classification وDLP.
### 2. Integrity \| السلامة والتكامل
ضمان أن البيانات والأنظمة لم تُعدّل أو تُحذف بطريقة غير مصرح بها، وأن المعلومات صحيحة وموثوقة.
**أمثلة على الخطر:**
- تعديل سجل مالي.
- تغيير إعدادات Security Control.
- العبث بالسجلات لإخفاء النشاط.
**ضوابط الحماية:** Hashing، Digital Signatures، File Integrity Monitoring، Change Control وAudit Logs.
### 3. Availability \| التوافر
ضمان وصول المستخدمين المصرح لهم إلى الأنظمة والبيانات عند الحاجة.
**أمثلة على الخطر:**
- DDoS أو Ransomware.
- تعطل خادم أو حذف خدمة.
- استهلاك موارد النظام بالكامل.
**ضوابط الحماية:** Redundancy، Backups، Load Balancing، Disaster Recovery، Monitoring وPatching.

**Impact question:** أثناء التحقيق اسألي دائمًا: هل الحادث كشف البيانات، غيّرها، أم منع الوصول إليها؟

## Concepts That Complement the CIA Triad
### Non-Repudiation \| عدم الإنكار
وجود دليل يمنع الشخص من إنكار تنفيذ الإجراء، مثل Digital Signature أو سجل تدقيق موثوق يثبت من أرسل أو وافق أو غيّر.
### Authentication \| المصادقة
التحقق من هوية المستخدم أو الجهاز قبل منحه الوصول، باستخدام Password أو MFA أو Certificate أو Token.
### Accountability \| المساءلة
إمكانية ربط كل إجراء بفاعل محدد من خلال Unique Accounts وAudit Logs وTimestamps. تساعد المساءلة في التحقيق وتحديد المسؤولية.

**العلاقة:** Authentication يثبت الهوية، Accountability يربط الهوية بالأفعال، وNon-Repudiation يقوّي الدليل بحيث يصعب إنكار الفعل.

# Full Case Handling Workflow \| معالجة حالة كاملة
1. **Receive & Triage:** افهمي التنبيه، القاعدة، الوقت، المستخدم والأصل المتأثر.
2. **Validate:** تحققي هل التنبيه حقيقي، وهل النشاط Failed أو Successful أو Blocked.
3. **Collect Evidence:** اجمعي Host، Identity، Network، Process، File وThreat Intelligence evidence.
4. **Build the Timeline:** رتّبي ما قبل التنبيه وأثناءه وما بعده في منطقة زمنية واحدة.
5. **Scope the Incident:** ابحثي عن أجهزة وحسابات ومؤشرات أخرى مرتبطة.
6. **Assess CIA Impact:** حددي أثر الحادث على السرية والسلامة والتوافر.
7. **Classify & Prioritize:** اختاري Classification وSeverity وPriority وConfidence.
8. **Contain:** اعزلي الجهاز أو الحساب أو الاتصال وفق الصلاحيات والـPlaybook.
9. **Eradicate & Recover:** أزيلي السبب الجذري، استعيدي الخدمة وراقبي عودة النشاط.
10. **Escalate or Close:** سلّمي الحالة مع الأدلة أو أغلقيها بسبب واضح.
11. **Write the Final Report:** لخّصي القصة والقرار والتوصيات بصورة قابلة للمراجعة.
# Final Report Structure \| هيكل التقرير النهائي
## 1. Executive Summary \| الملخص
اشرحي باختصار ما حدث، من وما المتأثر، النتيجة، والتصنيف النهائي.
## 2. Incident Details \| تفاصيل الحادث
- Alert / Incident ID.
- Detection source and rule.
- First seen / Last seen.
- Affected user, host and asset criticality.
- Classification، Severity، Priority وConfidence.
## 3. Timeline \| الخط الزمني
لكل حدث اكتبي: **الوقت — الفعل — الفاعل — الأصل — النتيجة — مصدر الدليل**.
## 4. Key Evidence \| الأدلة الرئيسية
اذكري السجلات والحقول والاستعلامات والملفات والمؤشرات التي دعمت القرار، مع الفصل بين **Confirmed Facts** و**Analyst Assessment**.
## 5. CIA Impact Assessment \| تقييم الأثر
- **Confidentiality:** هل تم الوصول إلى بيانات أو إخراجها؟
- **Integrity:** هل تم تعديل بيانات أو إعدادات أو سجلات؟
- **Availability:** هل تعطلت خدمة أو تأثر الوصول؟
- **Authentication / Accountability / Non-Repudiation:** هل يمكن إثبات الهوية وربط الأفعال بها؟
## 6. Response Actions \| إجراءات الاستجابة
وثّقي الاحتواء والاستئصال والاستعادة، ومن وافق على كل إجراء ونتيجته.
## 7. Conclusion & Recommendations \| الخلاصة والتوصيات
اكتبي القرار النهائي، Closure Reason، ما تبقى من Follow-up، والتحسينات المطلوبة في Detection أو Logging أو Access Control.

**قاعدة التقرير:** التقرير الجيد يوضح ما نعرفه، كيف أثبتناه، ما الذي فعلناه، وما الذي يجب أن يحدث بعد ذلك.

# Hands-on Labs \| التطبيقات العملية
- [ ] **SOC Alert Triaging — Tinsel Triage**
- [x] **SOC Role in Blue Team**
- [ ] **IR Timeline Analysis**

**Progress:** **1/3 completed**.

# Course Resource \| مصدر الدورة
## [SOC-L1-Course](https://github.com/alqarni2/SOC-L1-Course)
SOC Analyst L1 course materials, labs, Splunk exercises, incident investigation scenarios, and practical resources.
- **Repository owner:** `alqarni2`
- **Use:** مراجعة مواد SOC L1، التدرب على Splunk، وتنفيذ سيناريوهات التحقيق وكتابة التقارير.
