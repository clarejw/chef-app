from django.urls import path, include
 
urlpatterns = [
    path("api/", include("personal_chef.urls")),
]