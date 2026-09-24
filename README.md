# QaytaUz

QaytaUz — ishlatilgan buyumlarni sotish va sotib olish uchun mo'ljallangan onlayn e'lonlar platformasi.
Foydalanuvchilar e'lon joylashtirishi, boshqa foydalanuvchilar bilan chat orqali muzokara olib borishi,
sharh qoldirishi va sevimli e'lonlarni saqlab qo'yishi mumkin.

## Asosiy imkoniyatlar

- Ro'yxatdan o'tish va login (JWT autentifikatsiya)
- E'lon joylashtirish, tahrirlash, kategoriya va rasm bilan
- Qidiruv va filtrlash (kategoriya, narx, hudud bo'yicha)
- Xaridor va sotuvchi o'rtasida real vaqtli chat
- Bitim tugagandan keyin sotuvchiga sharh qoldirish
- Sevimlilar ro'yxati va sotuvchilarga obuna bo'lish
- Admin panel orqali e'lonlarni moderatsiya qilish (tasdiqlash/bloklash)

## Texnologiyalar

**Backend:** Django, Django REST Framework, PostgreSQL, JWT (SimpleJWT)
**Frontend:** React, Vite
**Fayl saqlash:** AWS S3 (production) / lokal media papka (development)
**Deploy:** Render, Docker

## Lokal o'rnatish

### Backend

\`\`\`bash
git clone https://github.com/ramazontursunov07/qaytauz.git
cd qaytauz
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env            # so'ng .env ichidagi qiymatlarni to'ldiring
python manage.py migrate
python manage.py runserver
\`\`\`

### Frontend

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Test

\`\`\`bash
python manage.py test apps.tests
\`\`\`

## Muallif

Ramazon Tursunov
