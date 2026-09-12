from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Review, Report, Notification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'phone_number', 'region', 'is_staff', 'date_joined']
    search_fields = ['username', 'email', 'phone_number']
    list_filter = ['is_active', 'is_staff', 'region', 'date_joined']
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Qo'shimcha ma'lumot", {'fields': ('phone_number', 'region', 'avatar')}),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['reviewer', 'seller', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['reviewer__username', 'seller__username']
    autocomplete_fields = ['reviewer', 'seller']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['product', 'reporter', 'is_resolved', 'created_at']
    list_filter = ['is_resolved', 'created_at']
    search_fields = ['product__title', 'reporter__username']
    autocomplete_fields = ['product', 'reporter']
    actions = ['mark_resolved']

    @admin.action(description="Tanlanganlarni 'Ko'rib chiqilgan' deb belgilash")
    def mark_resolved(self, request, queryset):
        queryset.update(is_resolved=True)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'text', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['user__username', 'text']
    autocomplete_fields = ['user']
