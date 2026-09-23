# qaytauz
Bu e'lonlarni bir joyda jamlab foydalanuvchilar uchun ancha qulayliklarga ega bo'lgan e'lon berish sayti.

## Deploy qilish (Render)

1. `.env.example` faylidagi barcha o'zgaruvchilarni Render Dashboard -> Environment bo'limiga kiriting.
2. Birinchi deploy paytida `build.sh` avtomatik `migrate` va `bootstrap_superuser` buyruqlarini ishga tushiradi.
3. `bootstrap_superuser` faqat superuser hali mavjud bo'lmagandagina uni yaratadi. Superuser allaqachon
   mavjud bo'lsa (masalan ikkinchi deploydan keyin), bu buyruq hech narsa o'zgartirmaydi — ya'ni
   `DJANGO_SUPERUSER_PASSWORD` o'zgaruvchisini keyinchalik o'zgartirish eski superuserning parolini
   qayta yozib yubormaydi. Parolni admin panel orqali o'zgartiring.
