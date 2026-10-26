from django.contrib import admin
#from django.contrib.auth.admin import UserAdmin
from  .models import Users, Shift,Category,Order,OrderItem,Product,CafeTable,Inventory,SpecialOffer,DailyMenu

#Username: cafe
#password:cafe2026
# Register your models here.

admin.site.register(Users)
admin.site.register(Product)
admin.site.register(Category)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(CafeTable)
admin.site.register(Shift)
admin.site.register(Inventory)
admin.site.register(DailyMenu)
admin.site.register(SpecialOffer)