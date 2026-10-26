
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from rest_framework.response import Response

from .models import (
    Users,
    Category,
    Product,
    Order,
    OrderItem,
    CafeTable,
    Inventory,
    Shift,
    SpecialOffer,
    DailyMenu,
)
from .serializers import (
    UserSerializer,
    CategorySerializer,
    ProductSerializer,
    InventorySerializer,
    CafeTableSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
    ShiftSerializer,
    SpecialOfferSerializer,
    DailyMenuSerializer
)
from .permissions import IsCafeAdmin


# --------------------------------------------------
# HOME
# --------------------------------------------------

def Home(request):
    return HttpResponse("This is the CafeStore home page.")


# --------------------------------------------------
# USERS
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def usersViews(request):
    if request.method == "GET":
        users = Users.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    serializer = UserSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def userview(request, pk):
    user = get_object_or_404(Users, pk=pk)

    if request.method == "GET":
        serializer = UserSerializer(user)
        return Response(serializer.data)

    # Prevent ordinary users from editing other accounts.
    if (
        request.user.pk != user.pk
        and not request.user.is_staff
        and not request.user.is_superuser
    ):
        return Response(
            {"detail": "You cannot modify this user."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method in ["PUT", "PATCH"]:
        serializer = UserSerializer(
            user,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Only staff/admin users can delete accounts.
    if not (
        request.user.is_staff
        or request.user.is_superuser
    ):
        return Response(
            {"detail": "Administrator permission required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# Keep this alias only if your urls.py still imports userviews.
# Both names point to the same GET/POST endpoint.
userviews = usersViews


# --------------------------------------------------
# CATEGORIES
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def CategoryViews(request):
    if request.method == "GET":
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    # Creating categories is restricted to cafe admins.
    if not (
        request.user.is_authenticated
        and (
            request.user.is_staff
            or request.user.is_superuser
        )
    ):
        return Response(
            {"detail": "Administrator permission required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = CategorySerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsCafeAdmin])
def CategoryDetailView(request, pk):
    category = get_object_or_404(Category, pk=pk)

    if request.method == "GET":
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = CategorySerializer(
            category,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    category.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------
# PRODUCTS
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def ProductViews(request):
    if request.method == "GET":
        products = Product.objects.select_related("category").all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    if not (
        request.user.is_authenticated
        and (
            request.user.is_staff
            or request.user.is_superuser
        )
    ):
        return Response(
            {"detail": "Administrator permission required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = ProductSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsCafeAdmin])
def ProductDetailView(request, pk):
    product = get_object_or_404(
        Product.objects.select_related("category"),
        pk=pk,
    )

    if request.method == "GET":
        serializer = ProductSerializer(product)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    product.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------
# INVENTORY
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def InventoryView(request):
    if request.method == "GET":
        inventory = Inventory.objects.all()
        serializer = InventorySerializer(inventory, many=True)
        return Response(serializer.data)

    if not (
        request.user.is_authenticated
        and (
            request.user.is_staff
            or request.user.is_superuser
        )
    ):
        return Response(
            {"detail": "Administrator permission required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Accept either one object or a list of objects.
    many = isinstance(request.data, list)
    serializer = InventorySerializer(
        data=request.data,
        many=many,
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# --------------------------------------------------
# CAFE TABLES
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def CafeTabeleView(request):
    if request.method == "GET":
        tables = CafeTable.objects.all()
        serializer = CafeTableSerializer(tables, many=True)
        return Response(serializer.data)

    if not (
        request.user.is_authenticated
        and (
            request.user.is_staff
            or request.user.is_superuser
        )
    ):
        return Response(
            {"detail": "Administrator permission required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    many = isinstance(request.data, list)
    serializer = CafeTableSerializer(
        data=request.data,
        many=many,
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated, IsCafeAdmin])
def CafeTableDetailView(request, pk):
    table = get_object_or_404(CafeTable, pk=pk)

    if request.method == "GET":
        serializer = CafeTableSerializer(table)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        serializer = CafeTableSerializer(
            table,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    table.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# --------------------------------------------------
# ORDERS
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def OrderView(request):

    # CREATE ORDER
    if request.method == "POST":
        serializer = OrderCreateSerializer(
            data=request.data,
            context={"request": request}
        )

        if serializer.is_valid():
            order = serializer.save()

            # Return the complete order with its items.
            response_serializer = OrderSerializer(
                order,
                context={"request": request}
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # LIST ORDERS
    orders = Order.objects.prefetch_related("items__product")

    # Admin and staff can see all orders.
    # Other authenticated users can see only their orders.
    if not (
        request.user.is_staff
        or request.user.is_superuser
    ):
        orders = orders.filter(user=request.user)

    orders = orders.order_by("-created_at")

    serializer = OrderSerializer(
        orders,
        many=True,
        context={"request": request}
    )

    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["POST"])
@permission_classes([IsAdminUser])
def confirm_order(request, order_id):
    table_id = request.data.get("table")

    if not table_id:
        return Response(
            {"table": "Please select a table before confirming."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(
                id=order_id,
                status="pending",
            )

            table = CafeTable.objects.select_for_update().get(
                id=table_id,
            )

            if table.status != "vacant":
                return Response(
                    {"table": "This table is already occupied. Please select another."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            order.table = table
            order.status = "confirmed"
            order.save(update_fields=["table", "status"])

            table.status = "occupied"
            table.save(update_fields=["status"])

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )

    except Order.DoesNotExist:
        return Response(
            {"error": "Pending order not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    except CafeTable.DoesNotExist:
        return Response(
            {"table": "The selected table does not exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )




@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def OrderDetailView(request, pk):
    order = get_object_or_404(
        Order.objects.prefetch_related("items__product"),
        pk=pk,
    )

    is_admin = (
        request.user.is_staff
        or request.user.is_superuser
    )

    if not is_admin and order.user_id != request.user.pk:
        return Response(
            {"detail": "You do not have permission to access this order."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "GET":
        serializer = OrderSerializer(order)
        return Response(serializer.data)

    if request.method in ["PUT", "PATCH"]:
        if not is_admin:
            return Response(
                {"detail": "Only an administrator can update an order."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = OrderSerializer(
            order,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Customers may delete only their own pending orders.
    if not is_admin and order.status != "pending":
        return Response(
            {"detail": "Only pending orders can be deleted."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def ConfirmOrderView(request, pk):
    table_id = request.data.get("table")

    if not table_id:
        return Response(
            {"table": "Please select a table before confirming the order."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=pk)

            if order.status != "pending":
                return Response(
                    {"detail": "Only pending orders can be confirmed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            table = CafeTable.objects.select_for_update().get(pk=table_id)

            if table.status != "vacant":
                return Response(
                    {"table": "This table is already occupied. Please select another."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Assign the table and confirm the order
            order.table = table
            order.status = "confirmed"
            order.save(update_fields=["table", "status"])

            # Mark the selected table as occupied
            table.status = "occupied"
            table.save(update_fields=["status"])

        return Response(
            {
                "message": "Order confirmed successfully.",
                "order_id": order.pk,
                "status": order.status,
                "table": table.pk,
                "table_number": table.table_number,
            },
            status=status.HTTP_200_OK,
        )

    except Order.DoesNotExist:
        return Response(
            {"detail": "Order not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    except CafeTable.DoesNotExist:
        return Response(
            {"table": "The selected table does not exist."},
            status=status.HTTP_400_BAD_REQUEST,
        )


@api_view(["POST"])
@permission_classes([IsAdminUser])
def ConfirmPendingOrdersView(request):
    with transaction.atomic():
        pending_orders = Order.objects.filter(status="pending")
        count = pending_orders.count()
        pending_orders.update(status="confirmed")

    return Response({
        "message": f"{count} pending order(s) confirmed successfully.",
        "count": count,
    })


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def DeletePendingOrdersView(request):
    pending_orders = Order.objects.filter(status="pending")
    count = pending_orders.count()
    pending_orders.delete()

    return Response({
        "message": f"{count} pending order(s) deleted successfully.",
        "count": count,
    })


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def DeleteOrderView(request, pk):
    order = get_object_or_404(Order, pk=pk)
    order_id = order.pk
    order.delete()

    return Response({
        "message": f"Order #{order_id} deleted successfully."
    })


# --------------------------------------------------
# ORDER ITEMS
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def orderItems(request):
    if request.method == "GET":
        items = OrderItem.objects.select_related("order", "product")

        if not (
            request.user.is_staff
            or request.user.is_superuser
        ):
            items = items.filter(order__user=request.user)

        serializer = OrderItemSerializer(items, many=True)
        return Response(serializer.data)

    if not (
        request.user.is_staff
        or request.user.is_superuser
    ):
        return Response(
            {"detail": "Order items should be created through the order endpoint."},
            status=status.HTTP_403_FORBIDDEN,
        )

    many = isinstance(request.data, list)
    serializer = OrderItemSerializer(
        data=request.data,
        many=many,
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# --------------------------------------------------
# SHIFTS
# --------------------------------------------------

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def ShiftView(request):
    if request.method == "GET":
        if not (
            request.user.is_staff
            or request.user.is_superuser
        ):
            return Response(
                {"detail": "Administrator permission required."},
                status=status.HTTP_403_FORBIDDEN,
            )

        shifts = Shift.objects.all()
        serializer = ShiftSerializer(shifts, many=True)
        return Response(serializer.data)

    if not (
        request.user.is_staff
        or request.user.is_superuser
    ):
        return Response(
            {"detail": "Administrator permission required."},
            status=status.HTTP_403_FORBIDDEN,
        )

    many = isinstance(request.data, list)
    serializer = ShiftSerializer(
        data=request.data,
        many=many,
    )

    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(["GET"])
@permission_classes([IsAdminUser])
def vacant_tables(request):
    tables = CafeTable.objects.filter(status="vacant").order_by("table_number")

    data = [
        {
            "id": table.id,
            "table_number": table.table_number,
            "capacity": table.capacity,
            "status": table.status,
        }
        for table in tables
    ]

    return Response(data)


# 1. Public: List active special offers
@api_view(["GET"])
@permission_classes([AllowAny])
def SpecialOfferListView(request):
    now = timezone.now()

    all_offers = SpecialOffer.objects.select_related("product")

    active_offers = all_offers.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now,
    ).order_by("end_date")

    serializer = SpecialOfferSerializer(
        active_offers,
        many=True,
        context={"request": request},
    )

    return Response(serializer.data, status=status.HTTP_200_OK)


# 2. Admin: List all offers and create an offer
@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def SpecialOfferAdminView(request):

    if request.method == "GET":
        offers = SpecialOffer.objects.select_related("product").all()
        serializer = SpecialOfferSerializer(offers, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = SpecialOfferSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


# 3. Admin: Retrieve, update, or delete one offer
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([IsAdminUser])
def SpecialOfferDetailView(request, pk):
    offer = get_object_or_404(
        SpecialOffer.objects.select_related("product"),
        pk=pk,
    )

    if request.method == "GET":
        serializer = SpecialOfferSerializer(offer)
        return Response(serializer.data)

    elif request.method in ["PUT", "PATCH"]:
        serializer = SpecialOfferSerializer(
            offer,
            data=request.data,
            partial=(request.method == "PATCH"),
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    elif request.method == "DELETE":
        offer.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


# Customers can only see published menus.
@api_view(["GET"])
@permission_classes([AllowAny])
def DailyMenuListView(request):
    menus = DailyMenu.objects.filter(
        is_published=True
    ).prefetch_related("products")

    serializer = DailyMenuSerializer(menus, many=True)
    return Response(serializer.data)


# Only staff/admin users can manage menus.
@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def DailyMenuAdminView(request):
    if request.method == "GET":
        menus = DailyMenu.objects.all().prefetch_related("products")
        return Response(DailyMenuSerializer(menus, many=True).data)

    serializer = DailyMenuSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["PATCH", "DELETE"])
@permission_classes([IsAdminUser])
def DailyMenuDetailView(request, pk):
    menu = get_object_or_404(DailyMenu, pk=pk)

    if request.method == "PATCH":
        serializer = DailyMenuSerializer(
            menu,
            data=request.data,
            partial=True,
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    menu.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)