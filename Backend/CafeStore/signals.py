from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Product, Inventory


@receiver(post_save, sender=Product)
def create_product_inventory(sender, instance, created, **kwargs):
    if created:
        Inventory.objects.get_or_create(
            product=instance,
            defaults={
                "item_name": instance.name,
                "quantity": 0,
                "unit": "units",
                "low_stock_threshold": 10,
            },
        )