from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MaxValueValidator
from django.contrib.auth.models import User
# Create your models here.

class Users(User):
    ROLE_CHOICES = [('admin', 'Admin'), ('staff', 'Staff'), ('customer', 'Customer')]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='customer')
    def __str__(self):
        return f"{self.username }- {self.role}"

class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    def __str__(self):
        return f"{self.name}"

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=6, decimal_places=2)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name}"
    
class CafeTable(models.Model):
    STATUS_CHOICES = [
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
    ]
    table_number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField(default=2)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='vacant')

    def __str__(self):
        return f"Table {self.table_number} ({self.status})"


class SpecialOffer(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    product = models.ForeignKey(
        "Product",
        on_delete=models.CASCADE,
        related_name="special_offers",
    )

    discount_percentage = models.PositiveIntegerField(
        default=10,
        validators=[MaxValueValidator(100)],
    )

    start_date = models.DateTimeField(default=timezone.localdate)
    end_date = models.DateTimeField(default=timezone.localdate)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    @property
    def discounted_price(self):
        discount = (
            self.product.price
            * self.discount_percentage
            / 100
        )
        return self.product.price - discount

    @property
    def is_current(self):
        now = timezone.now()

        return (
            self.is_active
            and self.start_date <= now <= self.end_date
        )

class Order(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    table = models.ForeignKey(
        "CafeTable",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    total_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00
    )

    status = models.CharField(
        max_length=15,
        choices=[
            ("pending", "Pending"),
            ("confirmed", "Confirmed"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
        ],
        
        default='pending'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.status}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=6, decimal_places=2)


class Inventory(models.Model):
    product = models.OneToOneField(
        "CafeStore.Product",
        on_delete=models.CASCADE,
        related_name="inventory",
        null=True,
        blank=True,
    )
    item_name = models.CharField(max_length=200, unique=True)
    quantity = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        help_text="Current stock quantity",
    )
    unit = models.CharField(
        max_length=20,
        default="units",
        help_text="e.g., grams, ml, units, kg",
    )
    low_stock_threshold = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=10.00,
    )

    class Meta:
        verbose_name_plural = "Inventories"

    def __str__(self):
        return f"{self.item_name} ({self.quantity} {self.unit})"




class Shift(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shifts')
    clock_in = models.DateTimeField(auto_now_add=True)
    clock_out = models.DateTimeField(null=True, blank=True)
    cash_drawer_start = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    cash_drawer_end = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"Shift for {self.user.username} on {self.clock_in.strftime('%Y-%m-%d')}"


class DailyMenu(models.Model):
    date = models.DateField(default=timezone.localdate, unique=True)
    title = models.CharField(max_length=150, default="Daily Menu")
    description = models.TextField(blank=True)
    products = models.ManyToManyField(
        "Product",
        related_name="daily_menus",
        blank=True,
    )
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self):
        return f"{self.title} - {self.date}"