# cafe/serializers.py
from rest_framework import serializers
from .models import Users, Shift, Category, Order, OrderItem, Product, CafeTable, Inventory,SpecialOffer,DailyMenu

# 1. USER SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only =True)
    class Meta:
        model = Users
        fields = "__all__"
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Users(**validated_data)
        user.set_password(password)
        user.save()
        return user

# 2. SHIFT SERIALIZER
class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = "__all__"

# 3. CATEGORY SERIALIZER
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

# 4. PRODUCT SERIALIZER
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "category",
            "price",
            "is_available",
        ]


# 5. ORDER SERIALIZERS

class OrderItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(is_available=True)
    )
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True
    )

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "unit_price",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    customer_name = serializers.SerializerMethodField()

    customer_username = serializers.CharField(
        source="user.username",
        read_only=True,
        allow_null=True,
    )

    table_number = serializers.IntegerField(
        source="table.table_number",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "customer_name",
            "customer_username",  
            "items",
            "table",
            "table_number",
            "total_amount",
            "status",
            "created_at",
        ]
        read_only_fields = fields

    def get_customer_name(self, obj):
        if not obj.user:
            return "Guest Customer"

        full_name = obj.user.get_full_name().strip()
        return full_name or obj.user.username


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemCreateSerializer(many=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError(
                "Add at least one product to your order."
            )

        product_ids = [item["product"].id for item in items]

        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError(
                "Each product should appear only once. "
                "Increase its quantity instead."
            )

        return items

    def create(self, validated_data):
        request = self.context.get("request")

        if request is None or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "An authenticated user is required to place an order."
            )

        items_data = validated_data["items"]

        # Calculate all prices using the database values.
        total = sum(
            item["product"].price * item["quantity"]
            for item in items_data
        )

        # Create the order and its items as one transaction.
        from django.db import transaction

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                total_amount=total,
                status="pending",
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product=item["product"],
                    quantity=item["quantity"],
                    unit_price=item["product"].price,
                )
                for item in items_data
            ])

        return order


# 7. CAFE TABLE SERIALIZER
class CafeTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = CafeTable
        fields = "__all__"

# 8. INVENTORY SERIALIZER
class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventory
        fields = "__all__"


class SpecialOfferSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    product_id = serializers.IntegerField(
        source="product.id",
        read_only=True,
    )

    original_price = serializers.DecimalField(
        source="product.price",
        max_digits=8,
        decimal_places=2,
        read_only=True,
    )

    discounted_price = serializers.DecimalField(
        max_digits=8,
        decimal_places=2,
        read_only=True,
    )

    is_current = serializers.BooleanField(read_only=True)

    def validate(self, attrs):
        start_date = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None),
        )
        end_date = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None),
        )
        discount = attrs.get(
            "discount_percentage",
            getattr(self.instance, "discount_percentage", 10),
        )

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({
                "end_date": "The end date must be after the start date."
            })

        if not 0 <= discount <= 100:
            raise serializers.ValidationError({
                "discount_percentage": "Discount must be between 0 and 100."
            })

        return attrs

    class Meta:
        model = SpecialOffer
        fields = [
            "id",
            "title",
            "description",
            "product",
            "product_id",
            "product_name",
            "original_price",
            "discount_percentage",
            "discounted_price",
            "start_date",
            "end_date",
            "is_active",
            "is_current",
        ]
        read_only_fields = [
            "id",
            "product_id",
            "product_name",
            "original_price",
            "discounted_price",
            "is_current",
        ]



class DailyMenuSerializer(serializers.ModelSerializer):
    products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
    )
    product_details = ProductSerializer(
        source="products",
        many=True,
        read_only=True,
    )

    class Meta:
        model = DailyMenu
        fields = [
            "id",
            "date",
            "title",
            "description",
            "products",
            "product_details",
            "is_published",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]