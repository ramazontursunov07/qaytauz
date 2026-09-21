from rest_framework import views
from .serializers import RegisterSerializer, UserProfileSerializer, NotificationSerializer, PublicUserSerializer, \
    ReportCreateSerializer, BlockUserSerializer, ReviewCreateSerializer, SellerReviewSerializer
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .models import Notification, BlockedUser, Subscription
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Report, Review
from .serializers import AdminUserSerializer, AdminReportSerializer, AdminReviewSerializer
from apps.products.models import Product

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class ProfileView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class ReviewCreateView(generics.CreateAPIView):
    """Xaridor sotuvchiga (aynan bitta e'lon bo'yicha) baho va sharh qoldiradi."""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Sotuvchi clientdan emas, e'lon egasidan olinadi
        product = serializer.validated_data['product']
        serializer.save(reviewer=self.request.user, seller=product.owner)


class SellerReviewListView(generics.ListAPIView):
    """Berilgan sotuvchiga qoldirilgan barcha sharhlar (hammaga ochiq)."""
    serializer_class = SellerReviewSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Review.objects.filter(seller_id=self.kwargs['seller_id'])


class BlockUserView(generics.CreateAPIView):
    """Chat ekranidan "Foydalanuvchini bloklash" — bloklangandan so'ng
    ikki tomon bir-biriga xabar yoza olmaydi (MessageSerializer.validate)."""
    serializer_class = BlockUserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UnblockUserView(views.APIView):
    """"Blokdan chiqarish" tugmasi uchun."""
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        BlockedUser.objects.filter(blocker=request.user, blocked_id=id).delete()
        return Response(status=204)


class BlockStatusView(views.APIView):
    """Chat ochilganda, ikkala tomon bo'yicha ham bloklash holatini tekshirish uchun:
    men uni bloklaganmanmi (blocked_by_me) va u meni bloklaganmi (blocked_me)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        blocked_by_me = BlockedUser.objects.filter(blocker=request.user, blocked_id=id).exists()
        blocked_me = BlockedUser.objects.filter(blocker_id=id, blocked=request.user).exists()
        return Response({'blocked_by_me': blocked_by_me, 'blocked_me': blocked_me})


class ReportCreateView(generics.CreateAPIView):
    """E'lon haqida shikoyat yuborish (Shikoyat qilish tugmasi)."""
    serializer_class = ReportCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubscribeToggleView(views.APIView):
    """Profil sahifasidagi "Obuna bo'lish" / "Obunani bekor qilish" tugmasi."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        target = get_object_or_404(User, id=id)
        if target == request.user:
            return Response({'detail': "O'zingizga obuna bo'la olmaysiz."}, status=400)
        Subscription.objects.get_or_create(subscriber=request.user, target=target)
        return Response({'subscribed': True, 'subscribers_count': target.subscribers.count()})

    def delete(self, request, id):
        Subscription.objects.filter(subscriber=request.user, target_id=id).delete()
        count = User.objects.get(id=id).subscribers.count() if User.objects.filter(id=id).exists() else 0
        return Response({'subscribed': False, 'subscribers_count': count})


class PublicUserProfileView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = PublicUserSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class AdminUserListView(generics.ListAPIView):
    """Faqat admin: barcha foydalanuvchilar ro'yxati"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminUserUpdateView(generics.RetrieveUpdateDestroyAPIView):
    """Faqat admin: foydalanuvchini bloklash/aktivlashtirish, staff qilish, o'chirish"""
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

    def update(self, request, *args, **kwargs):
        target_user = self.get_object()
        if target_user.id == request.user.id:
            if request.data.get('is_staff') is False:
                return Response(
                    {"detail": "O'zingizni admin (staff) holatidan chiqara olmaysiz."},
                    status=400,
                )
            if request.data.get('is_active') is False:
                return Response(
                    {"detail": "O'zingizni bloklay olmaysiz."},
                    status=400,
                )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        target_user = self.get_object()
        if target_user.id == request.user.id:
            return Response(
                {"detail": "O'zingizni o'chira olmaysiz."},
                status=400,
            )
        return super().destroy(request, *args, **kwargs)


class AdminReportListView(generics.ListAPIView):
    """Faqat admin: barcha shikoyatlar"""
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = AdminReportSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminReportResolveView(generics.UpdateAPIView):
    """Faqat admin: shikoyatni ko'rib chiqilgan deb belgilash"""
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminReviewListView(generics.ListAPIView):
    """Faqat admin: barcha sharhlar"""
    queryset = Review.objects.all().order_by('-created_at')
    serializer_class = AdminReviewSerializer
    permission_classes = [permissions.IsAdminUser]


class AdminDashboardStatsView(APIView):
    """Faqat admin: umumiy statistika"""
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        return Response({
            'total_users': User.objects.count(),
            'total_products': Product.objects.count(),
            'active_products': Product.objects.filter(status=Product.ACTIVE).count(),
            'pending_products': Product.objects.filter(status=Product.PENDING).count(),
            'blocked_products': Product.objects.filter(status=Product.BLOCKED).count(),
            'unresolved_reports': Report.objects.filter(is_resolved=False).count(),
            'total_reviews': Review.objects.count(),
        })
