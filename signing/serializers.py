# serializers.py
from rest_framework import serializers
from .models import Client
from .models import PDFFile
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ('id', 'email', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Client.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user
    
import os
from rest_framework import serializers
from .models import PDFFile
from datetime import datetime

class PDFFileSerializer(serializers.ModelSerializer):
    uploaded_at = serializers.SerializerMethodField()

    class Meta:
        model = PDFFile
        fields = ['id', 'file', 'uploaded_by', 'uploaded_at', 'status']

    def get_uploaded_at(self, obj):
        return obj.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Extract the file name from the full file path
        file_name = os.path.basename(representation['file'])
        representation['file'] = file_name
        return representation


# serializers.py

from rest_framework import serializers
#from .models import SignedDocument

""" class SignedDocumentSerializer(serializers.ModelSerializer):
    created_at = serializers.SerializerMethodField()
    class Meta:
        model = SignedDocument
        fields = '__all__'

    def get_created_at(self, obj):
        return obj.created_at.strftime("%Y-%m-%d %H:%M:%S")
        
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Extract the file name from the full file path
        file_name = os.path.basename(representation['signed_pdf'])
        representation['signed_pdf'] = file_name
        return representation """