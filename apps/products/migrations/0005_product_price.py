from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('products', '0004_product_free_delivery'),
    ]

    operations = [
        migrations.AlterField(
            model_name='product',
            name='price',
            field=models.DecimalField(max_digits=14, decimal_places=2),
        ),
    ]
