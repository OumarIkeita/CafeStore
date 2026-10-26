
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from CafeStore.authentication import CafeTokenObtainPairSerializer
from . import views


class CafeTokenObtainPairView(TokenObtainPairView):
    serializer_class = CafeTokenObtainPairSerializer


urlpatterns = [
    # Home
    path("home/", views.Home, name="home"),

    # Authentication
    path("login/", CafeTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Users
    path("users/", views.usersViews, name="users"),
    path("users/<int:pk>/", views.userview, name="user-detail"),

    # Categories
    path("categories/", views.CategoryViews, name="categories"),
    path("categories/<int:pk>/", views.CategoryDetailView, name="category-detail"),

    # Products
    path("products/", views.ProductViews, name="products"),
    path("products/<int:pk>/", views.ProductDetailView, name="product-detail"),

    # Inventory
    path("inventory/", views.InventoryView, name="inventory"),

    # Cafe tables
    path("cafe-tables/", views.CafeTabeleView, name="cafe-tables"),
    path("cafe-tables/<int:pk>/", views.CafeTableDetailView, name="cafe-table-detail"),

    # Orders
    path("orders/", views.OrderView, name="orders"),
    path("orders/<int:pk>/", views.OrderDetailView, name="order-detail"),

    # Order actions
    path("orders/<int:pk>/confirm/", views.ConfirmOrderView, name="confirm-order"),
    path("orders/confirm-pending/", views.ConfirmPendingOrdersView, name="confirm-pending"),
    path("orders/delete-pending/", views.DeletePendingOrdersView, name="delete-pending"),
    path("orders/<int:pk>/delete/", views.DeleteOrderView, name="delete-order"),
    
    # Order items
    path("order-items/", views.orderItems, name="order-items"),

    # Shifts
    path("shifts/", views.ShiftView, name="shifts"),
    path("tables/vacant/", views.vacant_tables, name="vacant-tables"),

    path("special-offers/",views.SpecialOfferListView,name="special-offers"),
    path("admin/special-offers/",views.SpecialOfferAdminView,name="admin-special-offers"),
    path("admin/special-offers/<int:pk>/",views.SpecialOfferDetailView,name="admin-special-offer-detail"),

    path("daily-menu/", views.DailyMenuListView, name="daily-menu"),
    path("admin/daily-menu/", views.DailyMenuAdminView, name="admin-daily-menu"),
    path("admin/daily-menu/<int:pk>/",views.DailyMenuDetailView,name="admin-daily-menu-detail"),  
]
