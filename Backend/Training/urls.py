from django.contrib import admin
from django.urls import path,include

urlpatterns = [
    path('',include('CafeStore.urls')),
    path('admin/', admin.site.urls),
]
