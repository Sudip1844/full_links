# 🚨 CRITICAL SECURITY WARNING

## ⚠️ আপনার Supabase Keys Exposed হয়েছে!

### সমস্যা কি?
আপনার Supabase credentials (anon key এবং service role key) ভুলক্রমে code এ expose হয়ে গিয়েছিল। যদিও এখন সেগুলো সরিয়ে ফেলা হয়েছে, তবুও security ঝুঁকি থেকে যায়।

### এখনই করণীয়:

#### 1. ⚡ Supabase Keys Rotate করুন (সবচেয়ে জরুরি!)

1. Supabase Dashboard এ যান: https://supabase.com/dashboard
2. আপনার project select করুন
3. **Settings → API** তে যান
4. নিচের keys গুলো rotate/regenerate করুন:
   - ✅ `anon` (public) key
   - ✅ `service_role` key

#### 2. 🔄 নতুন Keys Update করুন

নতুন keys পাওয়ার পর:

**Netlify এ:**
- Site Settings → Environment Variables
- `VITE_SUPABASE_ANON_KEY` update করুন

**Render এ:**
- Environment → Variables
- `SUPABASE_ANON_KEY` এবং `SUPABASE_SERVICE_ROLE_KEY` update করুন

**Local Development এ:**
- `client/.env` এবং `server/.env` ফাইলে নতুন keys দিন
- এই files কখনও git এ commit করবেন না (already .gitignore এ আছে)

#### 3. ✅ Verify করুন

- [ ] Supabase dashboard থেকে নতুন keys generate করেছেন
- [ ] Netlify environment variables update করেছেন
- [ ] Render environment variables update করেছেন
- [ ] Local .env files update করেছেন
- [ ] পুরনো keys আর কোথাও ব্যবহার হচ্ছে না

---

## 📋 কেন এটা গুরুত্বপূর্ণ?

**Service Role Key** খুবই powerful - এটা দিয়ে:
- ✗ Database এ সব data access/modify করা যায়
- ✗ Row Level Security (RLS) bypass করা যায়
- ✗ Admin operations করা যায়

যদি কেউ এই key পেয়ে যায়, তারা আপনার পুরো database compromise করতে পারবে।

---

## ✅ ভবিষ্যতে সতর্কতা

1. **কখনও** sensitive credentials code এ লিখবেন না
2. শুধুমাত্র deployment dashboards (Netlify/Render) এ credentials রাখুন
3. `.env` files git এ commit করবেন না (`.gitignore` check করুন)
4. `.env.example` files শুধু placeholder values রাখুন

---

## 📞 সাহায্য দরকার?

যদি key rotation নিয়ে কোনো সমস্যা হয়:
1. Supabase documentation দেখুন: https://supabase.com/docs/guides/api
2. Support contact করুন

**এই warning ঠিক করার আগে production এ deploy করবেন না!** 🛑
