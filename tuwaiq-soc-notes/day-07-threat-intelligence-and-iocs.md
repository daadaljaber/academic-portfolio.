# Day 7: Threat Intelligence & IOCs | استخبارات التهديدات

[Back to the 10-day index](README.md)

Personal study notes by Daad Aljaber from the Tuwaiq Academy SOC program. Examples are for learning and authorized lab environments; they are not records of real incidents.

**Day 7 focus:** حوّلي مؤشرًا ظهر في السجلات إلى استخبارات مفيدة: تحققي من المصدر، أضيفي السياق، ثم وثّقي القرار.

# 1. Threat Intelligence \| استخبارات التهديدات
**Threat Intelligence** ليست مجرد قائمة IOCs؛ هي معلومات عن تهديد بعد إضافة **السياق والتحليل** بحيث تساعد محلل الـSOC في اتخاذ قرار.
**Data → Information → Context → Intelligence**
مثال: ظهر IP في Firewall → عرفنا الجهاز الذي اتصل به → وجدنا تحميل ملف بعد الاتصال → أصبح لدينا سبب واضح للتحقيق.
## لماذا تهم محلل الـSOC؟
- **Enrichment:** إضافة سياق للتنبيه.
- **Prioritization:** تحديد ما يحتاج متابعة أسرع.
- **Detection:** تحسين قواعد الكشف.
- **Response:** دعم قرار التصعيد أو الاحتواء.
**جودة المعلومة = الدقة + الحداثة + الصلة ببيئتنا + القابلية للتنفيذ.**
## المصادر

| المصدر | مثال | ما الذي يقدمه؟ |
| --- | --- | --- |
| **Internal** | SIEM وEDR وDNS والحوادث السابقة | ما حدث في بيئتنا فعلًا |
| **OSINT** | تقارير وأدوات بحث عامة | سياق مفتوح يحتاج تحققًا |
| **Commercial** | تقارير وخلاصات مزودين | تغطية إضافية، وليست حكمًا قطعيًا |

لا يوجد مصدر شامل: قارني أكثر من مصدر ثم عودي إلى السجلات الداخلية.

# 2. Four Intelligence Levels

| المستوى | السؤال | مثال |
| --- | --- | --- |
| **Strategic** | ما المخاطر التي تهم المؤسسة؟ | اتجاه التهديدات في القطاع |
| **Operational** | ما هدف الحملة ومن تستهدف؟ | حملة تستهدف حسابات موظفين |
| **Tactical** | كيف يعمل المهاجم؟ | TTPs مثل أساليب التصيد |
| **Technical** | بماذا نبحث أو نطابق؟ | IP وdomain وURL وhash |

**Technical vs. Tactical:** المؤشرات التقنية سهلة البحث والحظر لكنها تتغير سريعًا؛ أساليب التنفيذ أطول عمرًا نسبيًا وأفيد لبناء كشف يصعب على المهاجم تجاوزه بتغيير IP أو ملف.
# 3. Intelligence Lifecycle 🔄
**Planning → Collection → Processing → Analysis → Dissemination → Feedback**
1. **Planning:** ابدئي بسؤال واضح: «هل هذا النطاق مرتبط بالتنبيه؟»
2. **Collection:** اجمعي البيانات التي تخدم السؤال؛ لا تجمعي كل شيء.
3. **Processing:** نظّفي البيانات ونظّميها للمقارنة.
4. **Analysis:** اختبري فرضية وارْبطي الأدلة؛ نسخ نتيجة الأداة ليس تحليلًا.
5. **Dissemination:** شاركي النتيجة بالشكل المناسب: تنبيه، قاعدة كشف أو ملخص.
6. **Feedback:** هل ساعدت النتيجة؟ ما الذي يمكن تحسينه؟
# 4. Indicators of Compromise \| IOCs
**IOC:** أثر قد يدل على نشاط ضار، لكنه ليس دليلًا كافيًا وحده.

| النوع | ما الذي أتحقق منه؟ |
| --- | --- |
| **IP** | السمعة، وقت الاتصال، المنفذ، والأجهزة المتصلة به |
| **Domain** | تسجيل النطاق، استعلامات DNS، وعلاقته بعناوين أخرى |
| **URL** | النطاق + المسار + المعاملات؛ ليس اسم النطاق وحده |
| **File hash** | تطابق الملف، مكان ظهوره، وهل نُفّذ؟ |
| **Email** | المرسل، الروابط، المرفقات، والمستلمين |
| **Host indicators** | أسماء الأجهزة، مسارات الملفات، والعمليات |

**IOC vs. IOA vs. TTP:** الـIOC أثر محدد؛ الـIOA سلوك يوحي بهجوم؛ والـTTP طريقة المهاجم. في **Pyramid of Pain** يصعب على المهاجم تغيير أسلوب عمله مقارنةً بتغيير عنوان أو hash.
**IOC aging:** تحققي من وقت أول وآخر ظهور؛ المؤشر القديم قد يفقد قيمته. قيّمي الثقة **Low / Medium / High** بناءً على جودة الأدلة وتوافقها، لا على سمعة مصدر واحد.
# 5. Enrichment Tools \| أدوات الإثراء

| الأداة | الاستخدام |
| --- | --- |
| [VirusTotal](https://docs.virustotal.com/docs/how-it-works) | بحث عن ملف أو hash أو نطاق أو URL ومقارنة إشارات الفحص |
| [AbuseIPDB](https://docs.abuseipdb.com/) | مراجعة البلاغات ودرجة الثقة المرتبطة بـIP |
| [urlscan.io](https://docs.urlscan.io/pages/visibility) | فحص صفحة ويب وروابطها مع الانتباه لمستوى ظهور الفحص |
| WHOIS / RDAP | بيانات تسجيل النطاق عند توفرها |
| AlienVault OTX | مؤشرات وتقارير تهديدات إضافية |

**Privacy & OPSEC:** لا ترفعي ملفًا سريًا أو رابطًا يحتوي بيانات حساسة لخدمة عامة. افحصي إعدادات الخصوصية أولًا؛ توجد خيارات [فحص خاص في VirusTotal](https://docs.virustotal.com/docs/private-scanning) و[مستويات ظهور مختلفة في urlscan](https://docs.urlscan.io/pages/visibility).

# 6. From Indicator to Verdict \| من المؤشر إلى القرار
**مصدر أول → مصدر ثانٍ → سياق داخلي → قرار موثّق**
## Context questions
- **متى وأين ظهر؟** DNS أو Proxy أو Firewall أو EDR؟
- **من تأثر؟** المستخدم، الجهاز، وأهمية الأصل؟
- **ماذا حدث قبله وبعده؟** استعلام فقط، أم اتصال وتحميل وتنفيذ؟
- **هل تتفق المصادر؟** وهل المعلومات حديثة؟
- **هل يوجد تفسير مشروع؟** مثل عنوان استضافة مشتركة؟
## Pivoting & automated enrichment
انتقلي بين **IP ↔ Domain ↔ URL ↔ ملف ↔ جهاز/مستخدم** لبناء القصة. قد يسرّع SIEM/SOAR جمع هذا السياق عبر playbooks، لكن الحكم النهائي يحتاج مراجعة الأدلة.
## أخطاء شائعة 🚫
- **Bad reputation ≠ حظر فوري.**
- **0 detections ≠ آمن.**
- بلد الـIP ليس بالضرورة بلد المهاجم.
- إشارة واحدة أو IP مشترك لا يكفيان لاتهام جهة.
## Evidence: strong vs. weak
- **أضعف:** تقرير سمعة منفرد أو موقع جغرافي للعنوان.
- **أقوى:** مصادر مستقلة متوافقة **مع** سجل داخلي يظهر التسلسل والسلوك والأصل المتأثر.
# 7. Enrichment Note Template 📝
- **IOC type / value:** …
- **First seen / Last seen:** …
- **Sources and findings:** …
- **Internal context:** المستخدم، الجهاز، DNS، Proxy، Firewall…
- **Supporting evidence / alternative explanation:** …
- **Confidence:** Low / Medium / High — ولماذا؟
- **Decision & next step:** متابعة / تصعيد / إغلاق مبرر
# 🧪 TryHackMe Labs
- [x] intro to cyber threat intelligence 
- [ ] threat intelligence tools
---
# 📖 Extra explanations \| شرح أعمق
## Data versus intelligence
A domain name is **data**. “A laptop queried that domain at 14:02 UTC” is **information**. “The query followed a phishing click by a privileged user and the domain was seen in recent malicious reports” adds **context**. “Investigate this account and host now, preserving the timeline and checking for credential use” is **actionable intelligence**. The decision depends on the quality of each link.
## Tactical versus technical example
If a campaign rotates its malicious IPs daily, a blocklist may catch only yesterday's infrastructure. If its phishing emails still cause a browser to launch an unusual child process followed by a new outbound connection, a behavior-based detection can remain useful. A TTP is not magically unique to one actor; attribution needs much more evidence.
## Which IOC is more specific?
An **IP** may be shared by unrelated sites; a **domain** narrows the name; a full **URL** includes its path and parameters; a **hash** identifies exact file bytes but changes if the file changes. None should be judged without first/last-seen times and internal observations.
## Confidence is not severity
**High confidence** means the assessment is well supported; **high severity** means potential impact is high. You can have high confidence in a low-impact test connection, or low confidence in a potentially severe alert. Record both separately.
## Safe enrichment workflow
Start with existing reputation information rather than uploading sensitive samples. Compare two independent sources, then look in DNS, proxy, firewall and endpoint logs for who actually interacted with the indicator. Before submitting a URL, check whether it includes a personal token or internal hostname and whether the scan will be public.
## Verdict example
“External source reports this IP; our firewall shows one blocked attempt and no successful connection from the affected host.” This supports **monitoring or further checks**, not an automatic claim that the host was compromised. Document the evidence, uncertainty, confidence, owner and next step.
---
# 8. Email Authentication \| مصادقة البريد الإلكتروني
تساعد **SPF وDKIM وDMARC** في اكتشاف انتحال البريد الإلكتروني، لكنها تعمل بطرق مختلفة. نقرأ نتائجها مع عنوان المرسل، الروابط، المرفقات وسياق الرسالة قبل اتخاذ القرار.
## SPF
يتحقق **Sender Policy Framework** مما إذا كان عنوان الـIP الذي أرسل الرسالة مسموحًا له بإرسال بريد باسم النطاق.
**مثال — سجل SPF للنطاق ****`example.com`****:**
```text
v=spf1 ip4:198.51.100.0/24 -all
```
- الرسالة من `198.51.100.10` → **SPF Pass**؛ لأن العنوان داخل النطاق المسموح `198.51.100.0/24`.
- الرسالة من `203.0.113.90` → **SPF Fail**؛ لأن العنوان غير مسموح، و`-all` تعني رفض بقية المصادر.

**مهم:** SPF يفحص عادةً نطاق الإرسال التقني في `Return-Path`، وليس اسم المرسل الظاهر وحده. إعادة توجيه الرسالة قد تسبب SPF Fail رغم أن الرسالة الأصلية مشروعة.

## DKIM
يضيف **DomainKeys Identified Mail** توقيعًا رقميًا إلى الرسالة. يسترجع خادم الاستقبال المفتاح العام من DNS ليتأكد أن التوقيع صحيح وأن الأجزاء الموقّعة من الرسالة لم تتغير.
**مثال:**
```text
DKIM-Signature: v=1;
 a=rsa-sha256; d=example.com;
 s=mail; bh=...; b=Sig...
```
- `d=example.com` → النطاق الذي وقّع الرسالة.
- `s=mail` → **Selector** يحدد مكان المفتاح العام في DNS.
- التوقيع صحيح والمحتوى الموقّع لم يتغير → **DKIM Pass**.
- التوقيع غير صحيح أو تغير المحتوى الموقّع → **DKIM Fail**.

DKIM Fail قد ينتج عن عبث بالرسالة، لكنه قد يحدث أيضًا بسبب تعديل مشروع من بوابة بريد أو قائمة بريدية؛ لذلك افحصي السياق.

## DMARC
يعتمد **Domain-based Message Authentication, Reporting and Conformance** على SPF وDKIM، ويتحقق من **Alignment**: هل النطاق الذي نجح في المصادقة يتوافق مع النطاق الظاهر للمستخدم في خانة `From`؟
**مثال على سجل DMARC:**
```text
v=DMARC1; p=reject; rua=mailto:dmarc@example.com
```
- `p=none` → مراقبة وجمع تقارير فقط.
- `p=quarantine` → التعامل مع الرسالة كمشبوهة، وغالبًا إرسالها إلى Spam.
- `p=reject` → طلب رفض الرسالة التي تفشل DMARC.
- `rua` → العنوان الذي يستقبل التقارير المجمعة.
DMARC يمكن أن ينجح إذا نجح **SPF أو DKIM** مع تحقق الـAlignment المطلوب؛ ليس شرطًا أن ينجح الاثنان معًا.
## Reading Authentication Results \| قراءة النتائج
القيم الشائعة:
- **Pass:** تحقق الاختبار.
- **Fail:** لم يتحقق الاختبار.
- **None:** لم توجد سياسة أو توقيع مناسب لإجراء الاختبار.
**مثال على سطر النتائج:**
```text
Authentication-Results: mx.example.com;
 spf=fail;
 dkim=fail;
 dmarc=fail
```

**SPF Fail + DKIM Fail + DMARC Fail** مؤشر قوي جدًا على انتحال محتمل ويستوجب التصعيد والتحقق، خصوصًا إذا كانت الرسالة تطلب كلمة مرور أو تحويلًا ماليًا أو فتح مرفق.

ومع ذلك، النتائج الثلاث الفاشلة ليست حكمًا نهائيًا وحدها؛ قد توجد مشكلة إعداد أو إعادة توجيه. تحققي من `From` و`Return-Path` و`Reply-To`، وسياق الرسالة، والروابط والمرفقات، ثم وثّقي سبب التصعيد.
