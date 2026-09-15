from django.conf import settings
from django.core.files.storage import Storage
from django.utils.deconstruct import deconstructible
from imagekitio import ImageKit
 
 
@deconstructible
class ImageKitStorage(Storage):
    """
    Django uchun ImageKit'ga asoslangan fayl saqlash tizimi.
 
    Render kabi bepul serverlarda oddiy fayl tizimi (local disk) vaqtinchalik
    bo'ladi — server qayta ishga tushganda yoki qayta deploy qilinganda undagi
    barcha fayllar (shu jumladan yuklangan rasmlar) o'chib ketadi. Shuning uchun
    rasmlarni ImageKit'ning doimiy bulutli xotirasiga yuklaymiz.
    """
 
    def __init__(self):
        self.client = ImageKit(
            private_key=settings.IMAGEKIT_PRIVATE_KEY,
            public_key=settings.IMAGEKIT_PUBLIC_KEY,
            url_endpoint=settings.IMAGEKIT_URL_ENDPOINT,
        )
 
    def _save(self, name, content):
        content.seek(0)
        file_bytes = content.read()
 
        folder = "/"
        file_name = name
        if "/" in name:
            folder_part, file_name = name.rsplit("/", 1)
            folder = "/" + folder_part
 
        result = self.client.upload_file(
            file=file_bytes,
            file_name=file_name,
            options={
                "folder": folder,
                # False qilib qo'yamiz, shunda ImageKit nomni o'zgartirmaydi va
                # Django modeldagi fayl manzili bilan haqiqiy URL bir xil bo'ladi.
                "use_unique_file_name": False,
            },
        )
 
        # MUHIM: SDK yuklash muvaffaqiyatsiz bo'lganda ham xatolik
        # ko'tarmasligi (exception tashlamasligi) mumkin — shuning uchun
        # natijani o'zimiz tekshiramiz. Aks holda Django "fayl saqlandi" deb
        # hisoblab, aslida ImageKit'da mavjud bo'lmagan manzilni bazaga
        # yozib qo'yadi, va rasm sahifada hech qachon ko'rinmaydi.
        response_metadata = getattr(result, "response_metadata", None)
        http_status = getattr(response_metadata, "http_status_code", None)
        upload_url = getattr(result, "url", None)
 
        if not upload_url or (http_status is not None and http_status >= 300):
            raw = getattr(response_metadata, "raw", None)
            raise IOError(
                "ImageKit'ga rasm yuklash muvaffaqiyatsiz bo'ldi. "
                f"HTTP holat: {http_status}. Javob: {raw}. "
                "IMAGEKIT_PRIVATE_KEY / IMAGEKIT_PUBLIC_KEY / IMAGEKIT_URL_ENDPOINT "
                "qiymatlarini tekshiring."
            )
 
        return name
 
    def exists(self, name):
        # use_unique_file_name=False bo'lgani uchun bir xil nom bilan qayta
        # yuklansa, ImageKit eskisining ustidan yozadi — bu muammo emas.
        # Shuning uchun har doim "mavjud emas" deb aytamiz, Django nomni
        # o'zgartirmasdan to'g'ridan-to'g'ri saqlashda davom etadi.
        return False
 
    def url(self, name):
        return f"{settings.IMAGEKIT_URL_ENDPOINT.rstrip('/')}/{name.lstrip('/')}"
 
    def delete(self, name):
        # ImageKit'dan faylni o'chirish uchun avval fileId'ni qidirib topish
        # kerak bo'ladi (API orqali). Hozircha bu funksiya soddalashtirilgan —
        # mahsulot/rasm o'chirilganda ImageKit'dagi fayl saqlanib qoladi,
        # bu esa ilovaning ishlashiga ta'sir qilmaydi.
        pass
 
    def size(self, name):
        return 0
 
    def _open(self, name, mode='rb'):
        raise NotImplementedError(
            "ImageKitStorage fayllarni to'g'ridan-to'g'ri ochish uchun mo'ljallanmagan, "
            "faqat yuklash (upload) va URL yaratish uchun ishlatiladi."
        )
