from rest_framework import serializers
from .models import Product, ProductImage, Category, AttributeType, ProductAttributeValue
from django.db import transaction


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']


class ProductListSerializer(serializers.ModelSerializer):
    main_image = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'price', 'condition', 'category_name', 'region', 'main_image', 'created_at',
                  'free_delivery', 'status', 'extra_info']

    def get_main_image(self, obj):
        images = getattr(obj, 'prefetched_images', None)
        if images is None:  # fallback, agar prefetch qilinmagan bo'lsa (masalan boshqa joydan chaqirilsa)
            images = list(obj.images.all())
        if not images:
            return None
        main = next((img for img in images if img.is_main), images[0])
        return main.image.url


class AttributeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttributeType
        fields = ['id', 'name', 'category']


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source='attribute_type.name', read_only=True)

    class Meta:
        model = ProductAttributeValue
        fields = ['id', 'attribute_type', 'attribute_name', 'value']


class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    attribute_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'title', 'description', 'price', 'condition', 'category', 'category_name', 'owner',
                  'owner_username', 'region', 'status', 'views_count', 'images', 'attribute_values', 'created_at',
                  'updated_at', 'extra_info', 'free_delivery']
        read_only_fields = ['id', 'owner', 'views_count', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    # multipart/form-data orqali yuborilganda (rasmlar bilan birga) attribute_values
    # ham matn (JSON string) sifatida keladi, shuning uchun ProductUpdateSerializer
    # dagi kabi oddiy JSONField(binary=True) ishlatiladi (nested serializer emas).
    attribute_values = serializers.JSONField(required=False, binary=True)
    # multipart/form-data orqali yuborilganda extra_info matn (JSON string) sifatida keladi,
    # shuning uchun binary=True bilan uni avtomatik dict'ga aylantiramiz.
    extra_info = serializers.JSONField(required=False, binary=True)
    # Bazada hali kategoriya yaratilmagan yoki mos kelmagan bo'lishi mumkin, shuning uchun ixtiyoriy.
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = ['title', 'description', 'price', 'condition', 'category', 'region', 'extra_info',
                  'free_delivery', 'attribute_values']

    def validate(self, attrs):
        attributes_data = attrs.get('attribute_values')
        if attributes_data is not None:
            category = attrs.get('category')
            if category is None:
                raise serializers.ValidationError(
                    {'attribute_values': 'Attributlarni saqlash uchun avval kategoriya tanlash kerak.'})
            valid_type_ids = set(
                AttributeType.objects.filter(category=category).values_list('id', flat=True)
            )
            for item in attributes_data:
                attr_type_id = item.get('attribute_type')
                if attr_type_id not in valid_type_ids:
                    raise serializers.ValidationError(
                        {'attribute_values': f'attribute_type={attr_type_id} bu kategoriya uchun mavjud emas.'})
        return attrs

    def create(self, validated_data):
        attributes_data = validated_data.pop('attribute_values', None) or []
        validated_data['owner'] = self.context['request'].user
        product = Product.objects.create(**validated_data)

        ProductAttributeValue.objects.bulk_create([
            ProductAttributeValue(
                product=product,
                attribute_type_id=attr['attribute_type'],
                value=attr.get('value', '')
            )
            for attr in attributes_data if attr.get('attribute_type')
        ])

        return product


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Mavjud e'lonni ('Tahrirlash' sahifasi) tahrirlash uchun.

    - multipart/form-data orqali kelganda `extra_info` va `attribute_values`
      matn (JSON string) sifatida keladi, shuning uchun binary=True bilan
      avtomatik dict/list'ga aylantiramiz.
    - `attribute_values` ataylab oddiy JSONField qilib olindi (nested
      serializer emas), chunki multipart/form-data'da nested ro'yxatlarni
      to'g'ridan-to'g'ri parslash qiyin — buning o'rniga [{"attribute_type":
      id, "value": "..."}, ...] ko'rinishidagi ro'yxatni o'zimiz qo'lda
      qayta ishlaymiz (pastga qarang, `update()`).
    - `remove_image_ids` — o'chirilishi kerak bo'lgan mavjud rasm id'lari.
    - `main_image_id` — asosiy (birinchi) rasm sifatida belgilanadigan rasm id.
    """

    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), required=False, allow_null=True
    )
    extra_info = serializers.JSONField(required=False, binary=True)
    attribute_values = serializers.JSONField(required=False, binary=True)
    remove_image_ids = serializers.JSONField(required=False, binary=True)
    main_image_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['title', 'description', 'price', 'condition', 'category', 'region',
                  'extra_info', 'free_delivery', 'attribute_values',
                  'remove_image_ids', 'main_image_id']
        # DIQQAT: 'status' bu yerda YO'Q. Holatni egasi PATCH orqali o'zgartira olmaydi;
        # 'Sotildi' uchun alohida MarkSoldView, bloklash/tasdiqlash esa faqat admin endpointida.

    def validate(self, attrs):
        attributes_data = attrs.get('attribute_values')
        if attributes_data is not None:
            category = attrs.get('category') or (self.instance.category if self.instance else None)
            if category is None:
                raise serializers.ValidationError(
                    {'attribute_values': 'Attributlarni saqlash uchun avval kategoriya tanlash kerak.'})
            valid_type_ids = set(
                AttributeType.objects.filter(category=category).values_list('id', flat=True)
            )
            for item in attributes_data:
                attr_type_id = item.get('attribute_type')
                if attr_type_id not in valid_type_ids:
                    raise serializers.ValidationError(
                        {'attribute_values': f'attribute_type={attr_type_id} bu kategoriya uchun mavjud emas.'})
        return attrs

    def update(self, instance, validated_data):
        attributes_data = validated_data.pop('attribute_values', None)
        remove_ids = validated_data.pop('remove_image_ids', None)
        main_image_id = validated_data.pop('main_image_id', None)

        with transaction.atomic():
            for field, value in validated_data.items():
                setattr(instance, field, value)
            instance.save()

            if attributes_data is not None:
                instance.attribute_values.all().delete()
                ProductAttributeValue.objects.bulk_create([
                    ProductAttributeValue(
                        product=instance,
                        attribute_type_id=attr['attribute_type'],
                        value=attr.get('value', '')
                    )
                    for attr in attributes_data if attr.get('attribute_type')
                ])

            if remove_ids:
                instance.images.filter(id__in=remove_ids).delete()

            if main_image_id:
                instance.images.update(is_main=False)
                instance.images.filter(id=main_image_id).update(is_main=True)

        return instance
