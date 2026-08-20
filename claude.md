# 🧲 Magnet Link Agency — Business Management System (BMS)

## السياق
نظام إدارة أعمال لوكالة Magnet Link (Social Media Management, Design, Websites, Meta Ads, Campaign Optimization). يتتبّع: **Lead → Client → Projects → Invoices → Finance**.

---

## 🏗️ المعمارية: 15 وحدة ومكوّن مترابط

**1. CRM Module — الـ Leads**
بوابة دخول النظام: يتتبّع العميل المحتمل (Lead) من أول تواصل لحد ما يصير Client (Won) أو يضيع (Lost). جدول Leads بحقول أساسية (اسم/هاتف/مصدر/حالة/احتمال/سعر مقترح) + ميزات إدارة (فلاتر، +New Lead، View، Custom Fields، أزرار حالة).
📄 **التفاصيل الكاملة:** ملف `CRM.md` (الحقول الـ 9، قاموس الحالات، التعديلات الثلاثة، التكامل).

**2. Client Module — العملاء الفعليين**
العملاء المؤكّدين: أي Lead حالته Won → يتحوّل لـ Client تلقائياً (يرث Name/Phone/Email). كل Client له صفحة Profile بـ 3 تبويبات (OverView / Projects / Invoices) وحقول خاصة (شركة/مجال/حالة/مشاريع).
📄 **التفاصيل الكاملة:** ملف `Client.md` (الحقول، التحويل التلقائي، التعديلان 4 و 5، التكامل).

**3. Project Module — المشاريع**
كل مشروع مربوط بـ Client. الحقول: project, Client, Service_Requested, price, payment, Delivery, Start Date.
صفحة المشروع: 3 تبويبات (OverView / Invoices / Details). نظام الفواتير: كل مشروع له عدة Invoices، كل Invoice فيها Progress%، Due date، وتنقسم لدفعات (Payment 1,2,3) بنسب من المبلغ الكلي (المجموع = 100%). PDF Template بشعار Magnet Link.

**4. Finance Module — المالية**
4 تبويبات: Money In (الفواتير المحصلة + دفعات فرعية) / Money Out (المصاريف) / Salary (الرواتب) / Revenue (= Money In − Money Out − Salary، مع pie chart). كل شي مفلتر بالشهر.

**5. Team Module — الفريق والصلاحيات**
تبويبان: **Team** (الموظفين) و **Clients** (الكلاينتس اللي إلهم حسابات دخول — منفصلين تماماً عن Client Module). جدول الموظفين: Name, Email, Role, Salary, Join Date, Permissions, Status. 3 Roles للموظفين (Super Admin / Admin / Employee) + Rank واحد للكلاينت (Client). Super Admin و Admin مفتوح إلهم كل شي بدون عمود Permissions أصلاً. Employee إله صلاحيات مخصّصة على مستوى القسم (✓/✗). الكلاينت افتراضياً يشوف Social Media بس، قابل للزيادة أو الإلغاء. **3 أزرار إجراء لكل صف:** Pause (إيقاف للأبد لحد التفعيل اليدوي) / Time Out (حظر لمدة محددة، رجوع تلقائي) / Delete (حذف نهائي — شغل الموظف القديم يظل بالداتابيس باسم "مجهول"؛ حذف الكلاينت يلغي حساب دخوله بس، الكلاينت بـ Client Module يظل). هاي الوحدة هي المصدر الوحيد لأسماء الموظفين والـ Roles بكل النظام (الـ Salary tab بيسحب منها).
📄 **التفاصيل الكاملة:** ملف `Team.md` (التبويبات الـ 2، الـ 3 Roles + Client Rank، نظام الصلاحيات المتدرّج، أزرار الإجراءات، التكامل، النقاط المفتوحة).

**6. Social Media Module — إدارة سوشيال ميديا العملاء**
وحدة فيها **تبويبان**: `social` (السوشيال ميديا) و `ads` (Ads Manager). Social tab: سلكتور مشروع + 4 مؤشرات رئيسية (Followers/Engagement/Reach/Views) + فلتر مدة (period filter) + 3 كروت منصات (Facebook/Instagram/TikTok) بمؤشرات مختلفة + جدول تفاصيل المنشورات + منشورات قادمة + إجراءات سريعة. زر "⟳ مزامنة" يجلب البيانات من Meta Graph API (`fetchMetaStats`). Ads tab: `AdsManagerSubTab` — 4 منصات إعلانية (Meta/TikTok/Snapchat/LinkedIn) بمقاييس CPM/CPC/CTR/ROAS + campaigns بأهدافها + تقرير PDF (`printAdsReport`). تقرير Social PDF شهري بنفس آلية الفاتورة.
📄 **التفاصيل الكاملة:** ملف `SocialMedia.md`.

**7. Design & Content Module — الأصول البصرية والمكتوبة**
3 تبويبات: (1) **Design** — حالات: `under_modification` → `ready` → `published`؛ (2) **From Client** — مواد خام من العميل؛ (3) **Documents** — محتوى مكتوب بـ `pending/approved/rejected`. التصنيفات الافتراضية: `DC_DEFAULT_CATS = ['Poster','Video','Visual']`. **SharePoint عبر MSAL** (Scopes: `Sites.ReadWrite.All`, `Files.ReadWrite`) — `handleSpLogin/Logout/SetupFolders/Sync`. يستعيد الجلسة تلقائياً عند Mount. ينشئ هيكل مجلدات per-project في SharePoint عند Setup.
📄 **التفاصيل الكاملة:** ملف `DesignContent.md`.

**8. Web Services Module — خدمات الويب ✅ مُدمَج بالـ BMS**
وحدة مدموجة في `magnet-link-bms.html` (section key: `'web'`). 3 تبويبات: (1) **Overview** — 4 مؤشرات + تنبيهات استحقاق (دومين/استضافة ≤ 45 يوم) + كروت مشاريع؛ (2) **Website Building** — مراحل (Discovery→Design→Development→Review→Launch) + مهام + معلومات تقنية + وصولات + تسليمات + ملخّص مالي (من Invoices، عرض فقط)؛ (3) **SEO** — مؤشرات أداء + كلمات مفتاحية (بحجم/صعوبة/ترتيب) + مهام SEO + تقرير PDF. props: `{ projects, clients, invoices, teamMembers, webData, onSaveWebData }`.
📄 **التفاصيل الكاملة:** ملف `WebServices.md`.

**9. Tasks Module — إدارة المهام الداخلية للفريق**
وحدة لإدارة مهام الفريق داخلياً لكل مشروع بتصميم **Kanban** (لوحة سحب وإفلات). صفحة لكل مشروع (Project selector علوي)، مقسومة لـ 3 مستويات هرمية: **Department** (Design / Social Media / Website / + قابل للإضافة) → **Bucket** (Stage 1, 2, 3 / + قابل للإضافة) → **Task** (الكرت الفعلي). كل Task يفتح Overlay فيه: Title, Assignees (متعدد، من Team), Status (Not start / In Progress / Completed), Priority (Urgent 🔴 / Important 🟠 / Medium 🟢 / Low 🔵), Start/Due Date, Repeat (Daily / Weekdays / Weekly / Monthly / Yearly), Bucket, Checklist (مع `Show in board view` لإظهار البنود بالكرت)، Notes. الكرت يعرض ملخّص بصري سريع: عنوان + حالة + تواريخ + checklist preview + avatars + حدّ ملوّن أيسر حسب الأولوية. **التكامل:** Project → تبويب رابع Tasks (مع OverView/Invoices/Details). Team → Assign to يسحب الـ Active فقط (الـ Paused/Timed Out مستبعَدين، المحذوفين يصيروا "مجهول"). Permissions → كل Department يحترم صلاحيات الموظف (Department الممنوع يختفي تماماً). المهام المتكررة تتوّلد بنسخ مستقلة مع `parent_task_id` للربط. **اقتراحات مستقبلية:** Comments على المهمة، Attachments (SharePoint)، Notifications، Time Tracking، Subtasks، Templates للـ Bucket-sets، Dependencies (يحتاج Gantt view).
📄 **التفاصيل الكاملة:** ملف `Tasks.md` (المستويات الـ 3، حقول الـ Overlay، الترميز اللوني، منطق التكرار، بنية البيانات، التكامل، النقاط المفتوحة).

**10. Email Module — البريد الإلكتروني**
بريد Outlook / Microsoft 365 مدمج مباشرةً داخل النظام عبر Microsoft Graph API + MSAL. مجلدات: Inbox, Sent, Drafts, Deleted, Junk. إجراءات: Compose, Reply, Forward, Delete, Search. يتطلب تسجيل دخول Microsoft منفصل (Scopes: `Mail.ReadWrite`, `Mail.Send`). متاح لكل موظف إله صلاحية `email: { access: true }`.
📄 **التفاصيل الكاملة:** ملف `Email.md`.

**10b. Chat Module — Teams Chat**
Microsoft Teams Chat مدمج عبر نفس MSAL instance (Scopes: `Chat.ReadWrite`, `Chat.Create`). Section key: `'chat'`. يعرض قائمة المحادثات (top 50) مع رسائلها، يُحدّث كل 5 ثوانٍ. يدعم: إرسال رسائل نصية، إنشاء محادثة فردية (oneOnOne) أو جماعية (group)، تغيير اسم المجموعة، مغادرة المحادثة. صور المستخدمين من Graph API مخزّنة كـ blob URLs.
📄 **التفاصيل الكاملة:** ملف `Chat.md`.

**11. Announcements Module — الإعلانات**
إعلانات فورية تظهر للجميع أعلى الصفحة (AnnouncementBar حمراء). Admin/Super Admin فقط ينشئ إعلانات. مدة الظهور: 1س / 6س / 12س / 1ي / 3ي / أسبوع / دائم. حالات: نشط / منتهي / ملغى. مستثناة من نظام الصلاحيات — مرئية للجميع دائماً. مخزّنة في localStorage.
📄 **التفاصيل الكاملة:** ملف `Announcements.md`.

**12. Profile Overlay — الملف الشخصي**
Overlay يُفتح من أسفل القائمة الجانبية (مش قسم مستقل). 3 تبويبات: **Info** (بيانات شخصية + تغيير كلمة المرور) / **الحضور والراتب** (إحصائيات الشهر الحالي + تفاصيل الراتب + سجلات الدوام والغياب — للموظفين فقط) / **الصلاحيات** (عرض أقسام المسموحة). Admin يقدر يفتح ملف أي موظف من Team Module.
📄 **التفاصيل الكاملة:** ملف `Profile.md`.

**13. Roles (Team → تبويب الرتب) — نظام الرتب المخصصة**
التبويب الرابع داخل Team Module. نوعان من الرتب: System Roles (super_admin rank=**100** / admin rank=**90** / client rank=1 — ثابتة لا تُعدَّل) + Custom Roles (rank 2–89 — قابلة للإضافة/التعديل/الحذف). كل رتبة مخصصة إلها: اسم، rank، لون، أقسام مسموحة. `canManage(actor, target) = rank(actor) > rank(target)`.
📄 **التفاصيل الكاملة:** ملف `Roles.md`.

**14. Attendance (Team → تبويب الحضور) — نظام الحضور**
التبويب الثالث داخل Team Module. كل موظف يقدر يعمل Clock In/Out/Break/Resume. بيانات: attendance records + off_days + deductions + bonuses. Admin يضيف: خصومات يدوية، مكافآت، تسجيل غياب (أنواع: غياب/إجازة/إجازة مدفوعة/مرضية). الغياب والمرضية يُضيفوا خصماً يومياً تلقائياً. إحصائيات شهرية: حضور، ساعات، أوفر تايم، غياب، إجازة، مرضية.
📄 **التفاصيل الكاملة:** ملف `Attendance.md`.

**15. Salary (Finance → تبويب الرواتب) — الرواتب**
التبويب الثالث داخل Finance Module. يسحب الموظفين من Team (Active فقط). نوعان: Recurring (شهري من تاريخ بداية) / One-time (شهر بعينه). `صافي الراتب = الأساسي − خصومات الشهر + مكافآت الشهر`. رواتب الموظفين المحذوفين تظل بالسجل باسم "مجهول". الإجمالي يدخل في معادلة Revenue.
📄 **التفاصيل الكاملة:** ملف `Salary.md`.

**خريطة العلاقات**
`CRM Lead (Won) → Client (يرث Name/Phone/Email) → Projects → Invoices → Finance (Money In)`
`Team (Employees + Roles + Attendance) → Finance (Salary + Deductions + Bonuses) → Revenue`
`Team (Roles + Permissions) → كل الوحدات (canSee / canManage)`
`Client / Project → Social Media Module (لوحة سوشيال ميديا لكل عميل) → PDF Template (تقرير شهري)`
`Client / Project → Design & Content Module → SharePoint (تخزين الأصول) | Team (Designers) → حقل المصمم`
`Project → Web Services Module (لوحة لكل مشروع) → Invoices (الملخّص المالي + الاشتراك الشهري، عرض فقط) | Team (Employees) → الموظف المسؤول | SEO → PDF Template (تقرير شهري)`
`Project → Tasks Module (لوحة Kanban لكل مشروع: Department → Bucket → Task) | Team (Assignees + Permissions) → assign to + إخفاء Departments | Dashboard → مؤشرات الإنجاز والمتأخرات`
`Email Module ← Microsoft Graph API (MSAL) | Announcements → AnnouncementBar → كل المستخدمين`
`Profile Overlay ← Team (salary, join_date, role) + Attendance (records, deductions, bonuses) + Finance (salary calculation)`

---

## 📊 الوضع الحالي — خلصان

prototype تفاعلي كامل بملف HTML واحد (React 18 + Babel standalone + Tailwind، كله CDN — اسمه **magnet-link-bms.html**، يفتح بأي متصفح بدون تثبيت).

الجاهز: Dashboard بإحصائيات حية / CRM كامل (فلاتر، +New Lead، View مع Custom Fields، Show/Hide، أزرار الحالة) / تحويل Lead→Client تلقائي / Client Profile بـ 3 تبويبات / Project Detail بـ 3 تبويبات + جدول فواتير بدفعات فرعية / Invoice Form كامل (شركة + INV NO تلقائيين، بنود، Tax، Payment Breakdown) / PDF Invoice Template / Finance بـ 4 تبويبات + pie chart / Team بتبويباته الـ 4 (Team / Clients / Attendance / Roles) + نظام الصلاحيات + Profile Overlay / Email (Microsoft 365 + MSAL) / Announcements + AnnouncementBar / RTL كامل + تبديل لغة + Dark/Light mode.

البيانات بـ React state داخلي (تنمسح مع refresh — مافي حفظ دائم).

**Web Services Module** — جاهز كـ prototype منفصل بملف HTML واحد (**web-services-module.html**): 3 تبويبات + CRUD كامل (مشاريع/مهام/كلمات مفتاحية/دفعات/وصولات/تسليمات) + تخزين مؤقت عبر sessionStorage (يبقى أثناء الجلسة). جاهز للدمج مع الـ BMS الرئيسي.

---

## ✅ تعديلات CRM Module — مطبّقة

النطاق: **CRM فقط** (عدا التعديل 3 يلمس Project + Dashboard). باقي الوحدات ما بتتغيّر.

**1. تعديل مباشر (Inline)** ✅ — `InlineEdit` component عام. حفظ على blur/Enter، إلغاء على Escape.
**2. إظهار Notes_CRM كعمود** ✅ — `NotesCell` component مستقل. مقتطع 45 حرف، توسّع بالضغط، textarea للتعديل.
**3. تفعيل Price_quote_CRM** ✅ — Pipeline = Σ(price×prob/100) للـ active leads. `price_quote` موروث للـ Client.

📄 **التفاصيل الكاملة:** ملف `CRM.md`.

---

## ✅ تعديلات Client Module — مطبّقة

**4. تعديل بيانات الكلاينت عبر Overlay** ✅ — `ClientEditOverlay`. زر Edit بالجدول وبهيدر Profile. الحقول: name/phone/email/company_name/field/status_client. أزرار سريعة للحالة.
**5. تبويب OverView يعرض بيانات الكلاينت** ✅ — grid-cols-3: Client Info (1 عمود) + Financial Summary (2 عمود). الحقول الفاضية مخفية.

📄 **التفاصيل الكاملة:** ملف `Client.md`.

**6. زر Print + تفعيل تعديل الفاتورة (Project → Invoices)** ✅ مطبّق
- زر **Print** لكل فاتورة → `printInvoice()` → PDF بنافذة جديدة + طباعة تلقائية.
- تعديل الفاتورة: نفس `InvoiceFormOverlay` للإنشاء والتعديل (`isEdit = !!invoice`).
- **Full Invoice** = المبلغ الإجمالي + كل الدفعات. **Single Payment** = مبلغ الدفعة فقط + pill "Payment N فقط". لكل دفعة زر طباعة خاص.
- حالة الدفعة: `paid` / `partial` / `pending`. INV NO تنسيق: `INV-001`.

---

## ✅ وحدة Team + نظام الصلاحيات — مطبّقة

المصدر الوحيد لأسماء الموظفين والـ Roles بكل النظام.

**7. وحدة Team — جدول الموظفين + تاب Clients**
صفحة بتبويبين:
- **Team:** الموظفين (Super Admin / Admin / Employee). جدول بحقول Name, Email, Role, Salary, Join Date, Permissions, Status. زرّان +New Person و +New Project.
- **Clients:** الكلاينتس اللي إلهم حسابات دخول للنظام — **منفصلين تماماً عن Client Module** (ناس تانيين بنضيفهم يدوياً، مش بيتسحبوا تلقائياً). Rank ثابت واحد اسمه Client.

**3 أزرار إجراء لكل صف (موظف أو كلاينت):**
- 🟡 **Pause** — إيقاف للأبد لحد ما الأدمن يفعّله يدوياً.
- 🟠 **Time Out** — حظر لمدة محددة (مثلاً 3 أيام)، رجوع تلقائي بعد انتهاء المدة.
- 🔴 **Delete** — حذف نهائي. للموظف: شغله القديم (مهام/رواتب/مصاريف) يظل بالداتابيس بس اسمه يصير **"مجهول"** عشان إحصائيات الشهور القديمة ما تنكسر. للكلاينت: ينحذف حساب الدخول بس، الكلاينت بـ Client Module يظل زي ما هو.

> 💡 **قرار:** ألغينا فكرة Inactive Status — بدالها Delete + حفظ السجل باسم "مجهول". هاد بيغطّي نفس الهدف (حماية الإحصائيات القديمة) بدون حالة منفصلة.

**8. نظام الصلاحيات — على مستوى القسم**
صلاحيات على مستوى القسم الآن (إخفاء/إظهار قسم كامل)، **مع بنية جاهزة لترقية Field-Level لاحقاً بدون هدم**.
- **3 Roles للموظفين:** Super Admin (كل شي حتى الكود) / Admin (كل الأقسام بدون تدخّل تقني) / Employee (صلاحيات مخصّصة لكل موظف).
- **Rank واحد للكلاينت:** Client (افتراضياً يشوف Social Media بس — لوحته هو فقط؛ قابل للزيادة أو حتى الإلغاء الكامل).
- **Super Admin و Admin ما إلهم عمود Permissions أصلاً** بالجدول لأنهم مفتوحين على الكل تلقائياً. العمود يظهر للـ Employees والـ Clients بس.
- لكل موظف/كلاينت مفاتيح ✓/✗ لكل قسم. القسم الممنوع **يختفي تماماً** من القائمة الجانبية (مش رمادي).
- **التصميم التقني:** الصلاحيات تُخزّن ككائن متدرّج (nested) — لكل قسم `{ access, fields }`. اليوم يُستخدم `access` فقط و`fields` فاضية مستنية. + دالة فحص موحّدة `canSee(user, section, field)` يناديها كل النظام. ترقية Field-Level لاحقاً = تعبئة `fields` + شرط للدالة = إضافة طبقة فوق مش إعادة بناء.

**ملاحظة أمان:** بملف HTML واحد على المتصفح، الصلاحيات إخفاء بصري فقط — مش أمان حقيقي. مقبول للـ Prototype. الأمان الكامل بدّه Backend (سيرفر + قاعدة بيانات + تسجيل دخول) لاحقاً، والبنية المتدرّجة تنتقل معه جاهزة.

📄 **التفاصيل الكاملة:** ملف `Team.md`.

---

## ✅ تعديلات Finance Module — مطبّقة

**9. Money Out — مصاريف متكررة** ✅ — `generateOccurrences()`. خيارات: one_time/every_x_days/weekly/monthly/quarterly. حالة دفع لكل شهر عبر `paid_months[]`. مؤشر الشهر الحالي والماضي.

**10. Salary tab** ✅ — **Auto-salaries**: Team members بـ salary>0 يظهرون تلقائياً. Manual salaries إضافية. `netSalary = salary − deductions + bonuses` (من Attendance).

**11. Finance شهري** ✅ — افتراضي = الشهر الحالي. Native `<input type="month">`.

---

## ✅ Web Services Module — مُدمَج ✅

Web Services Module مدموج كاملاً في `magnet-link-bms.html`. Component: `WebServicesModule`, section key `'web'`.

**نقاط مفتوحة:**
**12. ربط Backend لبيانات SEO** — جلب الزيارات والكلمات المفتاحية تلقائياً من Google Analytics / Search Console عبر API بدل الإدخال اليدوي.
**13. التاريخ الشهري للـ SEO** — أرشفة أرقام SEO شهرياً لرسم منحنى التطوّر.
**14. ربط Design & Content** — استدعاء أصول الموقع من وحدة Design & Content / SharePoint.

📄 **التفاصيل الكاملة:** ملف `WebServices.md`.

---

## 💡 اقتراحات مطروحة (مش متفق عليها — تُنفّذ فقط لو طُلبت صراحةً)

- **ربط Money Out بمشروع:** حقل اختياري "Project" على المصروف → حساب ربح كل مشروع (فواتير المشروع − مصاريفه). يُنصح تصميم البيانات من الآن ليقبله.
- **Monthly Burn:** مجموع المصاريف المتكررة الشهرية + الرواتب = الحد الأدنى المطلوب شهرياً للتشغيل.
- **تنبيه استحقاق:** تنبيه بالـ Dashboard عند اقتراب موعد مصروف متكرر أو راتب.
- **Forecast بسيط:** Pipeline (دخل متوقع) + Monthly Burn (مصاريف ثابتة) = صافي متوقع للشهر الجاي.
- **مراقبة المنافسين (Web Services):** تتبّع ترتيب 2-3 مواقع منافسة لكل عميل ضمن تبويب SEO.
- **سجل النشاط (Web Services):** Timeline لكل مشروع — "مَن فعل ماذا ومتى".

---

## 🖥️ مكوّنات المنصة (Shell)

### LoginScreen
- لا كلمة مرور — grid من كروت المستخدمين (2 عمودين) يضم `teamMembers + teamClients`.
- الضغط على الكارت = تسجيل دخول مباشر.
- المستخدمون بحالة `paused` أو `timeout` يظهرون لكن معطّلون (cursor-not-allowed + badge تحذيري).
- الكارت يعرض: أول حرف من الاسم (gradient بلون الرتبة) + الاسم + الإيميل + شارة الرتبة.

### NotificationPanel (لوحة الإشعارات)
- تنزلق من اليمين (`position: absolute right-56`) بالضغط على أيقونة الجرس بالشريط العلوي.
- تصفّي الإشعارات بـ `n.userId === currentUserId`.
- أنواع (`NOTIF_META`): `task_assigned` / `task_updated` / `project_added` / `lead_won` / `client_added` / `member_added` / `general`
- الضغط على إشعار → `onMarkRead(id)` + `onNavigate(n.section)` + يغلق اللوحة.
- أزرار: "تعليم الكل مقروء" + إغلاق.
- `timeAgo(iso, lang)` لعرض الوقت النسبي: الآن / Xد / Xs / Xي.
- محفوظة بـ `localStorage.bms_notifications` (max 300 إشعار).

**متى يُولَّد كل نوع (`pushNotif`):**
| النوع | يُرسَل لـ | الحدث |
|-------|----------|-------|
| `lead_won` | كل من يرى CRM (عدا الفاعل) | Lead يتحوّل لـ Won |
| `client_added` | كل من يرى Clients (عدا الفاعل) | إضافة Client جديد |
| `project_added` | كل من يرى Projects (عدا الفاعل) | إضافة Project جديد |
| `member_added` | super_admin + admin فقط | إضافة موظف جديد |
| `task_assigned` | المُعيَّنين الجدد على المهمة | تعيين مهمة |
| `task_updated` | المُعيَّنين الحاليين (عدا الفاعل) | تحديث مهمة |

### Dashboard
**الثابت (4 كروت إحصاء):**
- Total Leads + Pipeline ($) + Converted + Lost

**ويدجتس قابلة للتخصيص (`dashShortcuts`):**
- `SECTION_WIDGET_DEFS`: تعريف ويدجت لكل قسم يعرض إحصاءاته المصغّرة.
- `DashboardCustomizeModal`: checkbox لكل ويدجت متاح (محكوم بـ `canSee`)، يحفظ `dashShortcuts` state.
- الويدجتس تظهر بالداشبورد كبطاقات قابلة للنقر تفتح القسم المقابل مباشرةً.
- الويدجتس المدعومة: crm / clients / projects / finance / team / design / social / web / tasks.

**قائمة آخر الـ Leads:**
- top 6 leads مرتّبة تنازلياً بـ `created`.

---

## 🗄️ البيانات والـ State

### ما يُحفظ في localStorage (يبقى بعد Refresh)

| المفتاح | المحتوى |
|---------|---------|
| `bms_page` | آخر قسم كان مفتوحاً (يُعاد عند فتح الملف) |
| `bms_theme_{userId}` | `'dark'` أو `'light'` لكل مستخدم |
| `bms_lang_{userId}` | `'ar'` أو `'en'` لكل مستخدم |
| `bms_dash_shortcuts_{userId}` | مصفوفة IDs لويدجتس الداشبورد لكل مستخدم |
| `bms_notifications` | مصفوفة الإشعارات |
| `bms_announcements` | مصفوفة الإعلانات |

> ⚠️ **كل بيانات الأعمال (leads, clients, projects, invoices, team, …) في React state فقط — تُعاد لـ INITIAL_ عند Refresh.**

### React State — خريطة البيانات (App component)

```
currentUser / page / theme / lang / toast
leads / clients / projects / invoices
teamMembers / teamClients / customRoles
expenses / salaries
attendance / offDays / deductions / bonuses
designAssets / clientAssets / dcDocuments
smStats / smPosts / smMessages / smAccounts / adsData
taskDepts / taskBuckets / taskTasks
webData
notifications / announcements / annBarDismissed
dashShortcuts
```

### ثوابت الأقسام

```js
const DEPT_KEYS = ['crm','clients','projects','finance','team','social','design','web','tasks'];
// email و chat و announcements مش بـ DEPT_KEYS (ليس إلها permissions)
```

إضافة قسم جديد → يُضاف لـ `DEPT_KEYS` + `DEPT_LABELS` + `DEFAULT_EMPLOYEE_PERMS` + `SECTION_WIDGET_DEFS`.

### Demo Data (INITIAL_*)

البيانات الأولية مبنية على دوال `getInitial*(TRANSLATIONS.ar)` تستخدم مفاتيح الترجمة لأسماء الأشخاص/الشركات — يعني أسماء الـ Demo بالعربي والإنجليزي تتغيّر مع اللغة.
- `INITIAL_CLIENTS` مُولَّدة تلقائياً من الـ leads التي حالتها `won`.
- `INITIAL_SALARIES = []` / `INITIAL_ATTENDANCE = []` / etc. تبدأ فارغة.

### Toast System

```js
showToast(msg, opts?)
// opts.onUndo   → callback — يضيف زر "تراجع"
// opts.undoLabel → نص الزر
// dismiss تلقائي: 3s عادي، 5s لو فيه onUndo
```

---

## ⚙️ قواعد العمل

- افهم السياق كامل قبل الرد. لا تقترح تغيير المعمارية إلا إذا طُلب صراحةً.
- حافظ على نفس تسميات الحقول (Name_CRM, Phone_CRM, ...).
- "قسم جديد" → اربطه فوراً بالوحدات الأربعة (وين بيندمج؟ شو الحقول المشتركة؟).
- "سيستم جديد" → امتداد للنظام مش بديل، فكّر بالتكامل.
- اللغة: عربي بالشرح، إنجليزي بأسماء الحقول والوحدات.
- الثيم: Dark mode افتراضياً.
- التقنية: React + JS بملف HTML واحد (CDN) — نفس البنية الحالية، يشتغل محلياً بدون build.
- لما تعدّل، اختبر الكود (ترجمة JSX + منطق الحسابات) قبل التسليم.
