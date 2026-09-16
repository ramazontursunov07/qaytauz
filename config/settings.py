from pathlib import Path
import os
import dj_database_url
from dotenv import load_dotenv
 
load_dotenv()
 
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
 
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.0/howto/deployment/checklist/
 
# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')
 
# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '.onrender.com']
 
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://qaytauz-4.onrender.com",
]
 
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://qaytauz-4.onrender.com",
]
 
# Application definition
 
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
 
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'drf_yasg',
    'corsheaders',
 
    'apps.chats',
    'apps.favorites',
    'apps.products',
    'apps.users'
 
]
 
AUTH_USER_MODEL = 'users.User'
 
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
 
ROOT_URLCONF = 'config.urls'
 
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
 
WSGI_APPLICATION = 'config.wsgi.application'
 
# Database
# https://docs.djangoproject.com/en/6.0/ref/settings/#databases
 
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        conn_max_age=600,
    )
}
 
# Password validation
# https://docs.djangoproject.com/en/6.0/ref/settings/#auth-password-validators
 
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
 
# Internationalization
# https://docs.djangoproject.com/en/6.0/topics/i18n/
 
LANGUAGE_CODE = 'en-us'
 
TIME_ZONE = 'UTC'
 
USE_I18N = True
 
USE_TZ = True
 
# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.0/howto/static-files/
 
STATIC_URL = '/static/'
 
STATIC_ROOT = BASE_DIR / 'staticfiles'
 
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
 
# Rasmlar Render'ning vaqtinchalik diskiga emas, ImageKit'ga saqlanadi —
# shunda server qayta ishga tushganda ham rasmlar yo'qolmaydi.
IMAGEKIT_PRIVATE_KEY = os.environ.get('IMAGEKIT_PRIVATE_KEY')
IMAGEKIT_PUBLIC_KEY = os.environ.get('IMAGEKIT_PUBLIC_KEY')
IMAGEKIT_URL_ENDPOINT = os.environ.get('IMAGEKIT_URL_ENDPOINT')
 
# MUHIM: Django 4.2 dan boshlab eski DEFAULT_FILE_STORAGE / STATICFILES_STORAGE
# sozlamalari o'rniga yangi STORAGES lug'ati ishlatiladi. Django 5.1+/6.x da
# eski sozlamalar butunlay e'tiborsiz qoldiriladi — shuning uchun ImageKit
# kalitlari to'g'ri kiritilgan bo'lsa ham, eski usulda yozilgan
# DEFAULT_FILE_STORAGE hech qachon amalda ishlamas edi.
if IMAGEKIT_PRIVATE_KEY and IMAGEKIT_PUBLIC_KEY and IMAGEKIT_URL_ENDPOINT:
    DEFAULT_FILE_BACKEND = 'config.storage_backends.ImageKitStorage'
else:
    DEFAULT_FILE_BACKEND = 'django.core.files.storage.FileSystemStorage'
 
STORAGES = {
    'default': {
        'BACKEND': DEFAULT_FILE_BACKEND,
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
 
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 100,
}
 
from datetime import timedelta
 
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}
