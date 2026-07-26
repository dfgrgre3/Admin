# دليل تطهير تاريخ Git من الأسرار والسكربتات المباشرة (Git History Cleanup Guide)

> **إرشادات أمنية عالية الأهمية (P0 - Security Standard Operating Procedure)**  
> **الهدف:** إزالة كافة ملفات المفاتيح والأسرار والسكربتات المباشرة التي تعدل قاعدة البيانات نهائيًا من مستودع Git التاريخي.

---

## 1. الأدوات المطلوبة (Prerequisites)

- [git-filter-repo](https://github.com/newren/git-filter-repo) (الأداة الرسمية الموصى بها من مجتمع Git)
- Python 3.8+
- صلاحيات Admin على مستودع GitHub/GitLab

---

## 2. خطوات التطهير (Step-by-Step Execution)

### الخطوة 1: إنتاج نسخة احتياطية كاملة (Mirror Backup)

```bash
# إنشاء مجلد منفصل للنسخة الاحتياطية
cd /tmp
git clone --mirror https://github.com/your-org/admin-panel.git admin-panel-backup.git
```

### الخطوة 2: تشغيل `git-filter-repo` لإزالة ملفات البيئة المتسربة

```bash
# الانتقال للمستودع الرئيسي
cd /path/to/your/admin-repo

# التأكد من تثبيت الأداة
pip install git-filter-repo

# تشغيل عملية التطهير لملفات البيئة
git filter-repo --invert-paths \
  --path .env \
  --path .env.local \
  --path .env.production \
  --path .env.production.local \
  --path .env.test \
  --path .env.vercel \
  --path update-envs.ps1
```

### الخطوة 3: إزالة السكربتات المباشرة التي تلتف على قاعدة البيانات

```bash
git filter-repo --invert-paths \
  --path test-admin-login.ps1 \
  --path test-login.ps1 \
  --path test-proxy.ps1 \
  --path fix-admin-access.ps1 \
  --path fix-user-role.js \
  --path fix-user-role.sql \
  --path fix-admin-mfa.ps1 \
  --path fix-admin-mfa.sql
```

### الخطوة 4: إعادة ربط Remote ورفع التغييرات بالقوة (Force Push)

```bash
# إعادة إضافة remote origin
git remote add origin https://github.com/your-org/admin-panel.git

# رفع التغييرات إلى المستودع
git push origin --force --all
git push origin --force --tags
```

---

## 3. تدوير المفاتيح (Secret Rotation Checklist)

بعد تنفيذ عملية التطهير، **يجب فورًا** تدوير وتغيير المفاتيح التالية في لوحات التحكم الرسمية:

1. **Supabase Service Role Key:** إلغاء المفتاح المتسرب وتوليد مفتاح جديد من لوحة تحكم Supabase.
2. **Database Password:** تغيير كلمة مرور قاعدة بيانات PostgreSQL وتحديث الـ Connection String في Vercel.
3. **JWT Secret:** تحديث `JWT_SECRET` في بيئة Backend لإنهاء وتجديد كل الجلسات.
4. **Redis Password:** تغيير كلمة مرور Redis.
5. **AI & OpenRouter API Keys:** تغيير مفاتيح الخدمات الخارجية.

---

## 4. التحقق والحماية المستمرة (Verification & Prevention)

1. تشغيل `git log -S "SUPABASE_SERVICE_ROLE_KEY"` للتأكد من عدم وجود أي بقايا للمفتاح.
2. تفعيل **GitHub Secret Scanning** و **Push Protection** على مستوى المستودع لمنع رفع أسرار مستقبلاً.
