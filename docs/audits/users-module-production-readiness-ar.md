# تدقيق جاهزية موديول المستخدمين للإنتاج

**النطاق:** لوحة `Admin`، Next.js/TypeScript، وواجهة الـ Go API الظاهرة في المستودع.  
**تاريخ التدقيق:** 2026-07-24.  
**حدود الدليل:** لم يُفحص مستودع Go أو قاعدة البيانات أو إعدادات Supabase/النشر، لذلك تُصنّف البنود الخاصة بها كـ «يتطلب تحققاً» وليست تأكيداً للتنفيذ.

## 1. الملخص التنفيذي

**الحكم:** الموديول غير جاهز للإنتاج. لا يجوز معالجة بيانات مستخدمين فعلية أو قُصَّر قبل إغلاق عناصر P0 أدناه والتحقق من الـ backend وقاعدة البيانات.

أخطر عشر مشكلات مثبتة أو عالية الاحتمال:

1. `.env.vercel` متتبّع في Git، وسجل التاريخ يحتوي commits بعنوان إزالة سر؛ حذف الملف في commit لاحق لا يمحو التاريخ.
2. صور وملفات محتمل أن تكون شخصية متتبّعة تحت `public/uploads` ومتاحة علناً عبر مسارات ثابتة.
3. سكربتات مباشرة لتعديل وصول المديرين والأدوار وMFA (`fix-admin-*`, `fix-user-role.*`) تتجاوز مسار التطبيق والتدقيق.
4. endpoint catch-all للمستخدمين يمرّر body والمسار للـ Go API بلا Zod validation محلي أو allowlist للـ paths.
5. API client يرسل كلمة مرور نصية في CSV bulk-create ويتيح reset-password بتعيين كلمة مرور مباشرة.
6. `updateMany` ينفذ `Promise.allSettled` لكل مستخدم؛ لا transaction أو idempotency أو صف انتظار أو تقرير صفّي موحد.
7. التصدير يتم في المتصفح بعد جلب البيانات، فلا يحقق server-side authorization ولا روابط موقعة ولا تدقيق موثوق.
8. مصدر الأدوار غير موحّد: enum لا يحتوي `SUPER_ADMIN` أو `SUPPORT` أو `USER`، بينما middleware/guards/UI تستخدمها.
9. صلاحيات الواجهة لا تثبت صلاحيات backend؛ تعيين المسار المطلوب يجب مراجعته، وguard الحالي لا يمنع كل سيناريوهات رفع الامتياز.
10. فشل type-check حالياً (موثق في `tsc-output.txt`) ولا دليل على أن CI يمنع الدمج عند الفشل.

أول خمسة إصلاحات بالترتيب:

1. إيقاف النشر والعمليات الحساسة، تدوير الأسرار، تنظيف تاريخ Git بطريقة معتمدة، وجعل المستودع خاصاً إلى اكتمال الاستجابة للحادث.
2. حذف الأصول الشخصية من Git والتاريخ، نقل الملفات إلى storage خاص مع signed URLs قصيرة العمر وسياسة وصول.
3. تعطيل السكربتات المباشرة واستبدالها بعمليات backend محكومة بصلاحية، سبب، MFA step-up، وتدقيق.
4. توحيد RBAC في schema/back-end/front-end ثم فرض permission وfield policy في الـ backend لكل endpoint.
5. بناء jobs للخدمات الثقيلة (bulk/import/export) قبل إعادة تفعيلها، ثم إصلاح type-check وإضافة بوابات CI.

## 2. جدول الفجوات

| المجال | الموجود المرصود | الناقص/الخطر | الأولوية | التوصية |
|---|---|---|---|---|
| الأسرار | `.gitignore` يتجاهل معظم env الآن | `.env.vercel` متتبّع وتاريخ إزالة سر | P0 | rotate ثم `git filter-repo` مع clone جديد وsecret scan |
| الوسائط | `public/uploads` | صور متتبعة وعامة، لا إثبات signed URLs | P0 | quarantine/delete من التاريخ، bucket خاص وURL موقّع |
| API | proxy إلى Go وpermission helper | لا Zod/allowlist/error envelope/request ID عند طبقة Users | P0 | contracts وتحقيق backend مستقل لكل route |
| RBAC | `permissions.ts` وmiddleware وguards | أدوار متضاربة وغياب field/resource policy موحّد | P0 | role/permission registry واحد وpolicy tests |
| كلمات المرور | schema عميل أساسي | CSV بكلمة مرور، لا breach/history policy مثبتة | P0 | invite أو one-time secret؛ validation بالخادم فقط |
| bulk | bulk endpoints و`Promise.allSettled` | لا job/idempotency/progress/audit/partial report | P0 | queue + job ledger + outbox + result artifact |
| export/import | CSV client-side وdialog بسيط | تسريب/CSV injection، لا preview أو dry-run أو signed file | P0 | server jobs مع column policy وescaping |
| profile 360 | tabs وAPI client جزئي | endpoints/data contracts لكثير من tabs غير مثبتة | P1 | contract test لكل tab وstates موحّدة |
| الجلسات/2FA | client methods وبعض hooks | لا lifecycle أو step-up أو recovery/audit مثبت | P1 | session/device/2FA endpoints وسياسات واضحة |
| قائمة المستخدمين | بحث وفلاتر أساسية وTanStack | advanced filters/views/URL state/column persistence | P1 | query schema + saved views + virtualization |
| البيانات | أنواع UI فقط | schema/relations/RLS/indexes/retention غير متاحة | P1 | migrations موثقة وERD وسياسات RLS |
| الخصوصية | لا دليل عن data subject workflows | deletion/export/consent/minor safeguards/retention | P1 | privacy service وDPIA/retention matrix |
| UX/a11y | مكونات dialog/skeleton موجودة | لا تغطية متسقة tabs/errors/RTL/accessibility | P2 | component state checklist وaxe E2E |
| الأداء | React Query/BullMQ dependencies | لا server jobs أو limits/search indexes/cache policy مثبتة | P1 | caps، cursor pagination، index plan وSLOs |
| الاختبار | tests محدودة وE2E CRUD موجود | لا security/permission/export/import/load coverage | P1 | test pyramid وبوابات CI |
| DevOps | scripts lint/test/type-check | type-check فاشل ولا evidence CI/scans/monitoring | P0 | required checks, secret/dependency scans, alerts |
| التوثيق | وثائق متفرقة | لا OpenAPI/ERD/RBAC/audit/runbook مكتمل | P2 | docs-as-code وowner/review cadence |

## 3. خطة المعالجة الأمنية

### خلال 24 ساعة

- اعتبر كل قيمة قد تكون في `.env.vercel` أو أي commit تاريخي مكشوفة؛ **لا تطبعها ولا تعاينها في ticket أو logs**. ألغِ/دوّر مفاتيح DB, Supabase service role, JWT, Redis, OpenRouter وأي credential ذي صلة.
- عطّل مفاتيح الخدمة القديمة، الجلسات الإدارية ذات الصلة، webhooks/tokens المتأثرة، وافحص access logs لاستخدام غير معتاد.
- أزل صلاحية التشغيل عن سكربتات `fix-admin-access.ps1`, `fix-admin-mfa.ps1/.sql`, `fix-user-role.js/.sql` وانقلها إلى مجلد incident evidence غير قابل للتشغيل أو احذفها بعد حفظ موافقة incident owner.
- اجعل repository خاصاً، وقم بتعليق export/import/bulk/impersonation إلى حين اكتمال enforcement على الخادم.

### تنظيف التاريخ (ينفذه مالك المستودع بعد backup وموافقة الفريق)

```powershell
# نفّذ في clone نظيف فقط؛ لا تشغّل الأمر قبل توثيق قائمة الملفات والمراجع المتأثرة.
git filter-repo --path .env.vercel --path-glob 'public/uploads/*' --invert-paths
git push --force --mirror
```

بعد ذلك: أخبر كل المتعاونين بإعادة الاستنساخ، احذف forks/caches/releases/artifacts التي احتوت الأسرار، فعّل secret scanning وpush protection، ثم افحص **كل المراجع** بأداة secrets scanner. لا يكفي `git rm` ولا force-push بدون rotate.

### Checklist P0

- [ ] Incident owner، نطاق التعرض، timestamps، وقرار قانوني موثّقون.
- [ ] كل الأسرار المعرضة دُوِّرت وتأكدت التطبيقات من القيم الجديدة.
- [ ] تاريخ Git والنسخ المنشورة نُقّيا، وrepo/forks/artifacts راجعت.
- [ ] RLS مفعّل ومختبر، ولا service-role في browser bundle.
- [ ] rate limits وCSRF/origin checks وstep-up MFA على العمليات الحساسة.
- [ ] audit immutable/redacted لكل فعل إداري حساس.
- [ ] لا PII في logs أو exports بلا permission/approval.

## 4. المتطلبات الوظيفية ومعايير القبول

### قصص المستخدم

- كمسؤول مفوّض، أبحث وأرشح المستخدمين عبر URL قابل للمشاركة، ولا أرى إلا الحقول التي أملك صلاحيتها.
- كمسؤول دعم، أدير مستخدماً ضمن نطاق مدرستي/شركتي فقط، ولا أستطيع تعديل حساب أعلى أو حسابي أو منحه امتيازاً أعلى.
- كمسؤول، أدعو مستخدماً عبر رابط منتهي الصلاحية بدلاً من معرفة كلمة مروره؛ أول دخول يتطلب التحقق وتغيير السر عند استخدام temporary password.
- كمسؤول مفوض، أبدأ job للاستيراد/التصدير/التعديل الجماعي، أرى preview/progress/errors، وأستلم رابطاً آمناً أو تقريراً.
- كمسؤول أمن، أراجع الجلسات/الأجهزة وattempts وأوقف جلسة أو كلها، وكل فعل لديه reason وaudit.

### Acceptance criteria مشتركة

- كل command حساس يمر بالخادم عبر: authenticate → resource/field authorization → Zod validation → rate limit → idempotency عند اللزوم → transaction/job → redacted audit.
- كل mutation يرجع envelope موحداً: `{ data, requestId }` أو `{ error:{ code,message,fields? }, requestId }`؛ لا يعيد stack/PII.
- create/edit: تحقق email/username uniqueness بالخادم، هاتف E.164، تواريخ سليمة وعمر/guardian policy، timezone/currency/country من allowlists، وdirty-leave guard.
- status/role: reason إلزامي، expiry اختياري مضبوط، منع self-action وpeer/higher action وgrant أعلى من actor؛ التأثير على الجلسات محدد صراحة.
- import: template versioned، MIME/size/row caps، CSV formula neutralization، preview + dry-run، row errors، idempotency، invite-only افتراضياً، ولا password plaintext.
- export: job server-side، snapshot للفلاتر والأعمدة، field filtering بالخادم، approval عند PII عالي الحساسية، signed URL قصير، expiry/download audit.

حالات حافة إلزامية: مستخدم محذوف soft-delete، email/phone متكرر، batch يعيد نفس idempotency key، job جزئي الفشل، انتهاء صلاحية suspension، actor impersonating، session expired، target خارج tenant، صف CSV Unicode/RTL/صيغة Excel، وطلب GDPR مع invoices محفوظة قانونياً.

## 5. UI/UX

### Wireframe نصي

```text
Breadcrumbs / Users                         [Saved view] [Columns] [Export]
[Search: name/email/phone/id...] [Role] [Status] [More filters] [Clear]
Tabs: All | Active | Invited | Suspended | Banned | Deleted | by role
Bulk bar (after selection): action + required reason + preview + start job
Table (virtualized): identity | role | status | verification | subscription | last login | actions
Footer: total | page size | cursor/page | retry state

Profile: Header + quick actions; URL tab state
Overview | Learning | Billing* | Security* | Notes* | Activity | Audit*
* guarded per field permission; each tab: skeleton / empty / error+retry / forbidden
```

مكونات مطلوبة: `UsersFilterSchema`, `SavedViewMenu`, `ColumnPreferences`, `BulkJobDialog`, `JobProgressDrawer`, `SensitiveActionDialog`, `FieldGate`, `ProfileTabState`, `PhoneInput`, `AvatarUpload` (signed upload only). كل dialog حساس يستقبل `reason`, `confirmPhrase?`, `isLoading`, `onConfirm` ويعطّل التكرار. اختبر RTL، keyboard navigation، focus return، ARIA labels، contrast، وmobile layout.

## 6. مواصفة API المختصرة

| العملية | المسار | الصلاحية |
|---|---|---|
| list/create/get/update/delete | `/api/admin/users`, `/api/admin/users/:id` | `users:view/create/update/delete` |
| status | `/:id/activate|deactivate|suspend|ban|unban` | permission منفصل لكل فعل |
| security | `/:id/sessions`, `/:id/login-attempts`, `/:id/disable-2fa`, `/:id/unlock` | `users:view_sessions`, `users:terminate_sessions`, ... |
| roles/permissions | `/:id/roles`, `/:id/permissions` | `users:assign_roles/manage_permissions` |
| profile resources | `/:id/enrollments|payments|wallet|...|audit-logs` | permission/field-specific |
| bulk/import/export | `/bulk-*`, `/import`, `/export`, `/:jobId` | `users:import/export` + action permission |
| privacy | `/:id/anonymize|data-export|merge` | dedicated + approval |
| impersonation | `/:id/impersonate`, `/impersonation/stop|logs` | `users:impersonate` + step-up |

لا تستخدم catch-all بلا policy. أنشئ allowlisted handlers أو dispatch table يحدد method، body schema، permission، rate bucket، audit event، وإمكانية job. مثال عقد command:

```ts
const suspendUserInput = z.object({
  reason: z.string().trim().min(10).max(500),
  expiresAt: z.string().datetime().optional(),
  notifyUser: z.boolean().default(true),
}).strict();
// الخادم فقط: authorize(actor, 'users:suspend', target); audit في transaction/outbox.
```

يُمرر `Idempotency-Key` في كل command جماعي، وتُحفظ hash(request+actor+key)، الحالة، counts، row errors، وartifact URI. ضع cap صارماً للـ limit، allowlist للـ sort، cursor pagination للبيانات الكبيرة، و`AbortSignal` في client queries.

## 7. نموذج البيانات

أنشئ migrations وليس تعديلات يدوية. جدول `users` يتضمن الحقول الواردة في طلب النطاق، مع فصل secrets عن الصف العام: `password_hash` و`two_factor_secret` وbackup codes في جداول/أعمدة مشفرة لا تقرأها واجهات الإدارة. أضف على الأقل:

- `roles`, `permissions`, `role_user`, `permission_user`, `permission_role` مع `granted_by`, `reason`, `expires_at`.
- `user_sessions`, `user_devices`, `user_login_attempts`, `user_invitations`, `user_notes`, tags/groups/custom-fields.
- `user_audit_logs` append-only، `user_impersonation_logs`, `user_data_requests`, `user_consents`, `user_merge_logs`.
- `admin_jobs` و`admin_job_items` للـ bulk/import/export، وoutbox للwebhooks.

علاقات: user↔roles/permissions many-to-many؛ user→sessions/devices/attempts/audit one-to-many؛ parent/company/school مفاتيح أجنبية مقيدة tenant. Indexes مبدئية: `(tenant_id, status, created_at desc)`, `(tenant_id, role)`, lower(email), normalized phone، `(tenant_id,last_login_at)`, job `(actor_id,idempotency_key)` unique، audit `(target_user_id,created_at desc)`؛ index/filter إضافي بعد قياس query plans. فعّل RLS لكل جدول tenant، ولا تسمح service role إلا في worker server-side محدود.

Enums الرسمية المقترحة: `SUPER_ADMIN, ADMIN, MODERATOR, SUPPORT, TEACHER, STUDENT, PARENT, COMPANY, GUEST`، أو احذف ما لا يوجد له نموذج عمل. لا يبقى `USER` إلا إذا عُرِّف رسمياً كسلوك وصلاحيات. مصدر الحقيقة يولَّد منه Go/TS/OpenAPI/docs.

## 8. RBAC ومصفوفة القيود

| الدور | أمثلة صلاحيات | قيود |
|---|---|---|
| SUPER_ADMIN | كل ما عدا العمليات المعتمدة ثنائياً | لا self-grant؛ MFA/approval للامتيازات والتصدير الحساس |
| ADMIN | إدارة users ضمن tenant، تقارير محددة | لا يلمس SUPER_ADMIN ولا يمنح أعلى منه |
| MODERATOR | status/reports/tickets | لا مالية، لا roles، لا auth secrets |
| SUPPORT | view محدود، notes، reset link وفق policy | masking للماليات/الدرجات، لا delete/export |
| TEACHER | طلابه/صفوفه فقط | resource scope؛ لا بيانات أمنية أو مالية |
| STUDENT/PARENT/COMPANY/GUEST | وظائف domain منفصلة | لا admin endpoints |

صلاحيات منفصلة مطلوبة: create/update/delete/ban/suspend/activate/unban/reset_password/send_invite/impersonate/assign_roles/manage_permissions/export/import/view_activity/view_sessions/terminate_sessions/view_financial/manage_wallet/manage_subscription/issue_certificate/revoke_certificate/add_note/delete_note/view_audit_log/anonymize/merge/manage_custom_fields/manage_tags/manage_groups.  
Field gates: `financial`, `grades`, `contact`, `auth_metadata` (لا secrets)، `behavioral`, `documents`, `notes`, `audit`. تُطبّق عند read/search/filter/export/logs لا في إخفاء UI فقط.

## 9. الاختبارات وDevOps

- Unit: role hierarchy، field/resource policies، schemas، CSV escaping/parser، idempotency، audit redaction.
- Integration: كل endpoint مع 401/403/404/409/422/429، RLS/tenant isolation، transaction وjob retry، signed URL expiry.
- Component: users table/filter URL/saved view/bulk dialog/create-edit/tabs لكل loading-empty-error-forbidden.
- E2E: admin login، create invite، search/filter، lifecycle status، sessions/2FA، import dry-run/job، export download، impersonation banner/stop.
- Security: IDOR/BOLA، privilege escalation، CSRF/origin، XSS/CSV injection، rate-limit bypass، secret/PII log scan، dependency/SAST/DAST مصرح.
- Performance: list p95، cursor scan، 100k export، 10k import، bulk retry؛ عرّف SLOs وقياساً قبل التحسين.

بوابات CI المطلوبة: `npm run lint`, `npm run type-check`, `npm test`, E2E smoke، production build، secret scan، dependency/SBOM scan، Docker build، migration/RLS tests. يجب أن تصبح required checks. أصلح أخطاء `tsc-output.txt` قبل الإصدار؛ لا توجد أخطاء Users مؤكدة في الجزء المرصود، لكن failure كلي يمنع شهادة الإصدار.

## 10. خطة التنفيذ

| المرحلة | المخرجات | تقدير أولي* |
|---|---|---|
| P0 (1-2 أسبوع) | incident/secrets/history/media، RBAC contract، تعطيل flows الخطر، CI type/scan | 2-3 أشخاص |
| P1 (3-5 أسابيع) | backend contracts/RLS/audit، invite/sessions/2FA، jobs import/export/bulk، profile API | 3-5 أشخاص |
| P2 (2-4 أسابيع) | filters/views/table UX، privacy workflows، a11y/RTL، observability | 2-4 أشخاص |
| P3 (مستمر) | custom roles، advanced segmentation، command palette، optimization tuning | 1-2 أشخاص |

\* التقدير يحتاج discovery لمستودع Go، schema، مزود الهوية، والمتطلبات القانونية في الدول المستهدفة. Dependencies: مالك backend، DBA/Supabase، security/DevOps، product/privacy owner.

## 11. Audit log وDefinition of Done

سجل append-only للأحداث: `user.created/updated/deleted/anonymized/merged/role_changed/permission_changed/status_changed/banned/unbanned/suspended/activated/password_reset_by_admin/password_changed/email_changed/phone_changed/2fa_enabled/2fa_disabled/sessions_terminated/impersonated/exported/imported/note_added/note_deleted/wallet_adjusted/subscription_changed/certificate_issued/certificate_revoked/data_export_requested/data_deleted`. لكل حدث: event ID، actor/role، target، action، before/after مقنّعان، reason، IP، user agent، timestamp، result، request ID، job ID/impersonation ID حيث ينطبق. حظر تعديل السجل من التطبيق العادي واضبط retention/access review.

يُعد الموديول مكتملاً فقط عند تحقق كل ما يلي: لا أسرار/أصول شخصية مكشوفة في current/history/artifacts وتم rotate؛ contracts وRLS وRBAC/field policies مطبقة ومختبرة بالخادم؛ كل tabs تتلقى بيانات حقيقية وتملك states مكتملة؛ كل mutation حساس مدقق ومحدود؛ bulk/export/import jobs آمنة؛ privacy/minor policies معتمدة؛ type/lint/unit/integration/E2E/security/performance gates خضراء؛ OpenAPI/ERD/RBAC matrix/runbooks منشورة ومملوكة.

## أدلة المستودع المستخدمة

- `.env.vercel` وملفات `public/uploads/*` تظهر في `git ls-files`، وسجل المسار يتضمن commits بعنوان `Remove secret`.
- `src/lib/api/admin-users-api.ts`: `bulkCreate` يقبل `password`، و`updateMany` يستخدم `Promise.allSettled`، والتصدير تنفذه صفحة المستخدمين في المتصفح.
- `src/app/api/admin/users/[...path]/route.ts`: proxy عام يعيد توجيه المسار والـ body.
- `src/types/enums.ts` مقابل `middleware.ts` و`user-action-guards.ts` وصفحات create/edit: اختلاف الأدوار.
- `tsc-output.txt`: أخطاء TypeScript قائمة وقت التدقيق.
