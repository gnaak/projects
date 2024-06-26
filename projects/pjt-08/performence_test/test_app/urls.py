from django.urls import path
from . import views

urlpatterns = [
    path('normal_sort/', views.normal_sort),
    path('priority_queue/', views.priority_queue),
    path('bubble_sort/', views.bubble_sort),
    path('read_csv/', views.read_csv),
    path('isna/', views.isna),
    path('algo_data/', views.algo_data)
]

