from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class ClientManager(BaseUserManager):
    
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Clients must have an email address')

        email = self.normalize_email(email)
        client = self.model(email=email, username=username, **extra_fields)

        client.set_password(password)
        client.save()

        return client

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')

        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        if extra_fields.get('is_active') is not True:
            raise ValueError('Superuser must have is_active=True.')

        return self.create_user(email, username, password, **extra_fields)


class Client(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(max_length=255, unique=True)
    username = models.CharField(max_length=150, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = ClientManager()

    def __str__(self):
        return self.email



class ActiveSession(models.Model):
    user = models.OneToOneField(Client, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)


from django.contrib.postgres.fields import ArrayField

class PDFFile(models.Model):
    file = models.FileField(upload_to='pdf_files/')
    uploaded_by = models.ForeignKey(Client, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)    
    tokens = models.TextField(null=True, blank=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('signed', 'Signed'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.file.name} - {self.status}"

# models.py

from django.db import models

""" class SignedDocument(models.Model):
    pdf_file = models.ForeignKey(PDFFile, on_delete=models.CASCADE)
    pfx_file = models.FileField(upload_to='pfx_files/')
    password = models.CharField(max_length=100)
    signed_pdf = models.FileField(upload_to='signed_pdfs/', null=True, blank=True)
    uploaded_by = models.ForeignKey(Client, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signed Document {self.id}" """




