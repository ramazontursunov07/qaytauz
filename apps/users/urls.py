from django.urls import path
from .views import (
    RegisterView, ProfileView, NotificationListView,
    AdminUserListView, AdminUserUpdateView,
    AdminReportListView, AdminReportResolveView,
    AdminReviewListView, AdminDashboardStatsView, PublicUserProfileView,
    ReportCreateView, BlockUserView, UnblockUserView, BlockStatusView,
    SubscribeToggleView, ReviewCreateView, SellerReviewListView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('notification/', NotificationListView.as_view(), name='notifications'),
    path('public/<int:id>/', PublicUserProfileView.as_view(), name='public-user-profile'),
    path('reports/create/', ReportCreateView.as_view(), name='report-create'),
    path('block/', BlockUserView.as_view(), name='block-user'),
    path('block/<int:id>/', UnblockUserView.as_view(), name='unblock-user'),
    path('block-status/<int:id>/', BlockStatusView.as_view(), name='block-status'),
    path('subscribe/<int:id>/', SubscribeToggleView.as_view(), name='subscribe-toggle'),
    path('reviews/create/', ReviewCreateView.as_view(), name='review-create'),
    path('reviews/seller/<int:seller_id>/', SellerReviewListView.as_view(), name='seller-review-list'),

    # Admin API
    path('admin/stats/', AdminDashboardStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserUpdateView.as_view(), name='admin-user-update'),
    path('admin/reports/', AdminReportListView.as_view(), name='admin-report-list'),
    path('admin/reports/<int:pk>/', AdminReportResolveView.as_view(), name='admin-report-resolve'),
    path('admin/reviews/', AdminReviewListView.as_view(), name='admin-review-list'),
]
