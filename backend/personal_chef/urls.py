from django.urls import path
from .views import generate_recipe

urlpatterns = [
    path("recipe/", generate_recipe),
]