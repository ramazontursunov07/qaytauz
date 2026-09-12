from django.contrib import admin
from .models import Chat, Message


class MessageInline(admin.TabularInline):
    model = Message  # bu yerda qaysi modelga bog'lanishi
    extra = 0  # bu yerda esa yangi bo'sh joy qoldirmaydi
    readonly_fields = ['sender', 'text', 'created_at']  # admin shu ustundagi ma'lumotlarni faqat o'qiy oladi
    can_delete = False  # adminda o'chirish imkoniyati yo'q


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'created_at']
    list_filter = ['created_at']
    search_fields = ['product__title', 'participants__username']
    autocomplete_fields = ['product', 'participants']
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['sender', 'chat', 'text', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['sender__username', 'text']
    autocomplete_fields = ['sender', 'chat']
