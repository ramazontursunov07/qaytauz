import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('products', '0005_product_price'),
        ('users', '0004_subscription'),
    ]

    operations = [
        migrations.AddField(
            model_name='review',
            name='product',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                                    related_name='reviews', to='products.product'),
        ),
        migrations.AlterModelOptions(
            name='review',
            options={'ordering': ['-created_at']},
        ),
        migrations.AddConstraint(
            model_name='review',
            constraint=models.UniqueConstraint(condition=models.Q(('product__isnull', False)),
                                               fields=('reviewer', 'product'),
                                               name='unique_review_per_reviewer_product'),
        ),
    ]
