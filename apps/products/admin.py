from django.contrib import admin
from django.utils import timezone
from django.utils.html import format_html
from .models import (
    Category,
    Product,
    ProductImage,
    AttributeType,
    ProductAttributeValue,
    ProductViewHistory,
    FlashSale,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'parent']
    list_filter = ['parent']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'is_main', 'preview']
    readonly_fields = ['preview']

    def preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="height:60px;border-radius:6px;object-fit:cover;" />',
                obj.image.url,
            )
        return "-"

    preview.short_description = "Ko'rinishi"


class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'price', 'category', 'owner',
        'condition', 'status', 'views_count', 'created_at',
    ]
    list_filter = ['status', 'condition', 'category', 'created_at']
    search_fields = ['title', 'description', 'owner__username', 'owner__email']
    list_editable = ['status']
    autocomplete_fields = ['owner', 'category']
    readonly_fields = ['views_count', 'created_at', 'updated_at']
    date_hierarchy = 'created_at'
    inlines = [ProductImageInline, ProductAttributeValueInline]

    fieldsets = (
        (None, {'fields': ('title', 'description', 'category', 'owner')}),
        ('Narx va holat', {'fields': ('price', 'condition', 'status', 'region')}),
        ("Qo'shimcha ma'lumot", {'fields': ('extra_info',)}),
        ('Statistika', {'fields': ('views_count', 'created_at', 'updated_at')}),
    )

    actions = ['mark_as_active', 'mark_as_sold', 'mark_as_blocked']

    @admin.action(description="Tanlangan e'lonlarni 'Faol' qilish")
    def mark_as_active(self, request, queryset):
        queryset.update(status=Product.ACTIVE)

    @admin.action(description="Tanlangan e'lonlarni 'Sotildi' qilish")
    def mark_as_sold(self, request, queryset):
        queryset.update(status=Product.SOLD)

    @admin.action(description="Tanlangan e'lonlarni bloklash")
    def mark_as_blocked(self, request, queryset):
        queryset.update(status=Product.BLOCKED)


@admin.register(AttributeType)
class AttributeTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'category']
    list_filter = ['category']
    search_fields = ['name']


@admin.register(ProductAttributeValue)
class ProductAttributeValueAdmin(admin.ModelAdmin):
    list_display = ['product', 'attribute_type', 'value']
    list_filter = ['attribute_type']
    search_fields = ['product__title', 'value']
    autocomplete_fields = ['product', 'attribute_type']


class ActiveFilter(admin.SimpleListFilter):
    title = 'Holati'
    parameter_name = 'active_status'

    def lookups(self, request, model_admin):
        return [('active', 'Faol'), ('inactive', 'Nofaol')]

    def queryset(self, request, queryset):
        now = timezone.now()
        if self.value() == 'active':
            return queryset.filter(start_time__lte=now, end_time__gte=now)
        if self.value() == 'inactive':
            return queryset.exclude(start_time__lte=now, end_time__gte=now)


@admin.register(FlashSale)
class FlashSaleAdmin(admin.ModelAdmin):
    list_display = ['product', 'discount_percentage', 'start_time', 'end_time', 'is_active_display']
    list_filter = [ActiveFilter]
    search_fields = ['product__title']
    autocomplete_fields = ['product']

    @admin.display(description="Faolmi", boolean=True)
    def is_active_display(self, obj):
        return obj.is_active


@admin.register(ProductViewHistory)
class ProductViewHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'viewed_at']
    list_filter = ['viewed_at']
    search_fields = ['user__username', 'product__title']
    autocomplete_fields = ['user', 'product']
