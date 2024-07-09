import datetime
import os
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomUserSerializer
from django.contrib.auth import authenticate

class UserRegistrationView(APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                "user": serializer.data,
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from django.db import IntegrityError
class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(email=email, password=password)
        if user:
            try:
                # Check if there is an existing active session for the user
                active_session = ActiveSession.objects.get(user=user)
                # If found, delete the existing session
                active_session.delete()
            except ActiveSession.DoesNotExist:
                pass  # No active session found, continue login process

            # Generate refresh and access tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            # Save the access token in the ActiveSession table
            try:
                active_session = ActiveSession.objects.create(user=user, token=access_token)
            except IntegrityError:
                # Handle case where the user already has an active session
                active_session = ActiveSession.objects.get(user=user)
                active_session.token = access_token
                active_session.save()

            # Extract expiration time of the access token
            access_token_exp = refresh.access_token.payload['exp']
            expiration_time = datetime.datetime.utcfromtimestamp(access_token_exp)
            current_time = datetime.datetime.now()
            # Construct the response data
            response_data = {
                "success": True,
                "token": access_token,
                "expiration_time": expiration_time,
                "current_time": current_time,
                "refresh_token": str(refresh),
                "user": {
                    "_id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

from rest_framework.permissions import IsAuthenticated
from .models import ActiveSession
from rest_framework.permissions import AllowAny
class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        token = request.data.get('token')

        # Check if token is provided
        if not token:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Delete the active session associated with the token
        try:
            session = ActiveSession.objects.get(token=token)
            session.delete()
            return Response({"success": True, "msg": "Token revoked"}, status=status.HTTP_200_OK)
        except ActiveSession.DoesNotExist:
            return Response({"error": "No active session found for the provided token"}, status=status.HTTP_404_NOT_FOUND)
        


from rest_framework.parsers import MultiPartParser, FormParser



from .serializers import PDFFileSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import PDFFileSerializer

class FileUploadView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        # Check if files are included in the request
        files = request.FILES.getlist('file')
        if not files:
            return Response({"error": "No files were uploaded."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Populate uploaded_by field with the authenticated user
        uploaded_by = request.user.id  # Assuming request.user is the authenticated user's instance
        
        success_responses = []
        error_responses = []
        
        for file in files:
            # Create a new request data dictionary for each file
            file_data = {'file': file, 'uploaded_by': uploaded_by}
            
            # Save the file with the original filename
            file_data['file'].name = file_data['file'].name.replace(' ', '_')  # Replace spaces with underscores
            serializer = PDFFileSerializer(data=file_data)
            if serializer.is_valid():
                serializer.save()
                success_responses.append(serializer.data)
            else:
                error_responses.append(serializer.errors)
        
        if error_responses:
            return Response({"errors": error_responses}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(success_responses, status=status.HTTP_201_CREATED)


from rest_framework.authentication import TokenAuthentication
from .models import PDFFile
class UserPDFListView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        pdf_files = PDFFile.objects.filter(uploaded_by=user)

        serializer = PDFFileSerializer(pdf_files, many=True)
        return Response(serializer.data)            


from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from cryptography.hazmat import backends
from cryptography.hazmat.primitives.serialization import pkcs12
from endesive.pdf import cms

class DownloadPDFView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            pdf_file = PDFFile.objects.get(pk=pk, uploaded_by=request.user)
            file_path = pdf_file.file.path

            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="{}"'.format(pdf_file.file.name)
                return response
        except PDFFile.DoesNotExist:
            return Response({'error': 'PDF file not found'}, status=404)




from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko.keys import load_cert_from_pemder
from pyhanko_certvalidator import ValidationContext
import os
from django.core.files.base import ContentFile
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.views.decorators.csrf import csrf_exempt

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko.keys import load_cert_from_pemder
from pyhanko_certvalidator import ValidationContext
from django.core.files.uploadedfile import InMemoryUploadedFile
import os

import os
from django.core.files.base import ContentFile
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko_certvalidator import ValidationContext
from pyhanko.keys import load_cert_from_pemder
from cryptography.hazmat.primitives.serialization import pkcs12


import datetime
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko_certvalidator import ValidationContext
from pyhanko.keys import load_cert_from_pemder

# utils.py
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko_certvalidator import ValidationContext

# utils.py
import os
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko_certvalidator import ValidationContext

import os
import tempfile
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import PDFFile
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps
from pyhanko.sign.fields import SigSeedSubFilter
from pyhanko.keys import load_cert_from_pemder
from pyhanko_certvalidator import ValidationContext

import os
import tempfile
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from .models import PDFFile
from pyhanko.pdf_utils.incremental_writer import IncrementalPdfFileWriter
from pyhanko.sign import signers, timestamps, fields
from pyhanko.keys import load_cert_from_pemder
from pyhanko_certvalidator import ValidationContext
from pyhanko.pdf_utils import images
from pyhanko import stamp
from django.core.files.uploadedfile import InMemoryUploadedFile


def sign_pdf_with_pfx(pfx_file: InMemoryUploadedFile, password: str, pdf_file: InMemoryUploadedFile, output_file_path: str, image_file: InMemoryUploadedFile = None):
    # Define a function to load certificates from the application directory
    def load_cert_from_app_dir(filename):
        app_dir = os.path.dirname(__file__)
        file_path = os.path.join(app_dir, filename)
        return load_cert_from_pemder(file_path)

    # Load signer key material from uploaded PKCS#12 file
    with tempfile.NamedTemporaryFile(delete=False) as temp_pfx_file, \
         tempfile.NamedTemporaryFile(delete=False) as temp_pdf_file:
        for chunk in pfx_file.chunks():
            temp_pfx_file.write(chunk)
        for chunk in pdf_file.chunks():
            temp_pdf_file.write(chunk)

    signer = signers.SimpleSigner.load_pkcs12(
        pfx_file=temp_pfx_file.name, passphrase=password.encode("utf-8")
    )

    # Set up a timestamping client to fetch timestamps tokens
    timestamper = timestamps.HTTPTimeStamper(
        url='http://timestamp.sectigo.com'
    )

    # Load trust roots using load_cert_from_app_dir
    arpce_root_ca = load_cert_from_app_dir('arpce_root_ca.pem')
    tsa_root_cert = load_cert_from_app_dir('root_tsa.cer')

    # Create a ValidationContext with the trust roots
    validation_context = ValidationContext(
        trust_roots=[arpce_root_ca, tsa_root_cert],
        allow_fetching=True
    )

    # Settings for PAdES-LTA
    signature_meta = signers.PdfSignatureMetadata(
        field_name='Signature', md_algorithm='sha256',
        subfilter=fields.SigSeedSubFilter.PADES,
        validation_context=validation_context,
        embed_validation_info=True,
        use_pades_lta=True
    )

    # Define the stamp style
    if image_file:
        with tempfile.NamedTemporaryFile(delete=False) as temp_image_file:
            for chunk in image_file.chunks():
                temp_image_file.write(chunk)
        image = images.PdfImage(temp_image_file.name)
        stamp_style = stamp.TextStampStyle(
            stamp_text='',
            background=image,
            background_opacity=1,
            border_width=0
        )
    else:
        stamp_style = stamp.TextStampStyle(
            stamp_text='',
            background_opacity=1,
            border_width=0
        )

    with open(temp_pdf_file.name, 'rb') as inf:
        w = IncrementalPdfFileWriter(inf, strict=False)
        with open(output_file_path, 'wb') as outf:
            signers.PdfSigner(
                signature_meta=signature_meta,
                signer=signer,
                timestamper=timestamper,
                stamp_style=stamp_style,
                new_field_spec=fields.SigFieldSpec(
                    sig_field_name='Signature',
                    box=(420, 50, 550, 150)  # Adjust the box coordinates as needed
                )
            ).sign_pdf(w, output=outf)

    # Delete the temporary files
    os.unlink(temp_pfx_file.name)
    os.unlink(temp_pdf_file.name)
    if image_file:
        os.unlink(temp_image_file.name)


@csrf_exempt
def sign_pdf(request):
    if request.method == 'POST':
        pfx_file = request.FILES.get('pfx')
        password = request.POST.get('password')
        pdf_id = request.POST.get('pdf_id')
        image_file = request.FILES.get('image') if 'image' in request.FILES else None

        pdf_file_instance = get_object_or_404(PDFFile, id=pdf_id)

        if isinstance(pfx_file, InMemoryUploadedFile):
            try:
                original_filename = os.path.basename(pdf_file_instance.file.name)
                signed_pdf_name = original_filename.replace('.pdf', '_signed.pdf')
                output_file_path = os.path.join(os.path.dirname(pdf_file_instance.file.path), signed_pdf_name)
                
                sign_pdf_with_pfx(pfx_file, password, pdf_file_instance.file, output_file_path, image_file)

                with open(output_file_path, 'rb') as signed_file:
                    pdf_file_instance.file.save(signed_pdf_name, signed_file, save=True)
                
                pdf_file_instance.status = 'signed'
                pdf_file_instance.save()

                os.remove(output_file_path)  # Clean up the signed file after saving

                return JsonResponse({'message': 'PDF signed successfully'}, status=200)
            except Exception as e:
                return JsonResponse({'error': str(e)}, status=400)
        else:
            return JsonResponse({'error': 'Invalid file format'}, status=400)
    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)






import tempfile
from django.core.files import File

import io
import datetime
from django.http import HttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from cryptography.hazmat import backends
from cryptography.hazmat.primitives.serialization import pkcs12
from endesive.pdf import cms
#from .models import SignedDocument
#from .serializers import SignedDocumentSerializer
from django.core.files.base import ContentFile
""" def sign_document(password, certificate, pdf):
    date = datetime.datetime.utcnow() - datetime.timedelta(hours=12)
    date = date.strftime("D:%Y%m%d%H%M%S+00'00'")
    dct = {
        "aligned": 0,
        "sigflags": 3,
        "sigflagsft": 132,
        "sigpage": 0,
        "sigbutton": True,
        "sigfield": "Signature1",
        "auto_sigfield": True,
        "sigandcertify": True,
        "signaturebox": (470, 840, 570, 640),
        "signature": "AECE Digital Signature",
        "contact": "",
        "location": "Algiers",
        "signingdate": date,
        "reason": "Test",
        "password": password,
    }
    p12 = pkcs12.load_key_and_certificates(
        certificate.read(), password.encode("ascii"), backends.default_backend()
    )
    data = pdf.read()
    dates = cms.sign(data, dct, p12[0], p12[1], p12[2], "sha256")
    return data, dates

class SignPDF(APIView):
    def post(self, request):
        pdf_id = request.data.get('pdf_id')  # Get the ID of the PDF file
        pfx_file = request.FILES.get('pfx')
        password = request.data.get('password')

        try:
            # Retrieve the PDFFile instance using the provided ID
            pdf_file_instance = PDFFile.objects.get(id=pdf_id)

            # Sign the document using the retrieved PDF file
            data, dates = sign_document(password, pfx_file, pdf_file_instance.file)

            # Save signed PDF data back to the original PDF file instance, replacing the original file
            original_filename = os.path.basename(pdf_file_instance.file.name)
            signed_pdf_name = f'{original_filename}_signed.pdf'
            pdf_file_instance.file.save(signed_pdf_name, ContentFile(data + dates), save=True)

            # Update the status to signed
            pdf_file_instance.status = 'signed'
            pdf_file_instance.save()  # Save the instance to update the status field

            # Optionally, you can return some response with details of the updated PDF file instance
            return Response({'message': 'PDF file signed and updated successfully'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST) """



""" class SignedPDFListView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        pdf_files = SignedDocument.objects.filter(uploaded_by=user)

        serializer = SignedDocumentSerializer(pdf_files, many=True)
        return Response(serializer.data)   """         


""" class DownloadSignedPDFView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            signed_pdf_file = SignedDocument.objects.get(pk=pk, uploaded_by=request.user)
            
            signed_file_path = signed_pdf_file.signed_pdf.path

            with open(signed_file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="{}"'.format(signed_pdf_file.signed_pdf.name)
                return response
        except PDFFile.DoesNotExist:
            return Response({'error': 'PDF file not found'}, status=404) """
        

class DownloadPDFView(APIView):
    #permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            pdf_file = PDFFile.objects.get(pk=pk, uploaded_by=request.user)
            file_path = pdf_file.file.path

            with open(file_path, 'rb') as f:
                response = HttpResponse(f.read(), content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="{}"'.format(pdf_file.file.name)
                return response
        except PDFFile.DoesNotExist:
            return Response({'error': 'PDF file not found'}, status=404)        


from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.http import JsonResponse
import json

import json
from django.http import JsonResponse
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.contrib.auth.decorators import login_required
import secrets


from django.shortcuts import get_object_or_404
from .models import PDFFile
import secrets

from django.http import JsonResponse
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import PDFFile
import json
import secrets

import json
import secrets
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.core.mail import EmailMultiAlternatives
from django.views.decorators.csrf import csrf_exempt
from .models import PDFFile

@csrf_exempt
def send_email(request, pdf_file_id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            recipient_emails = data.get('to', [])
            subject = 'Document Signing'

            if not recipient_emails:
                return JsonResponse({'error': 'You must enter the recipient of the email'}, status=400)

            sender = settings.EMAIL_HOST_USER
            pdf_file = get_object_or_404(PDFFile, id=pdf_file_id)

            token = secrets.token_urlsafe(8)
            signing_url = f'http://192.168.1.129:3000/email-signature?tokens={token}'

            if pdf_file.tokens:
                pdf_file.tokens += f',{token}'
            else:
                pdf_file.tokens = token
            pdf_file.save()

            html_content = f"""
            <div style="background-color: #1E4CA1; padding: 20px;">
                <table align="center" cellpadding="10" cellspacing="0" style="border-radius: 4px;">
                    <tr>
                        <td align="center">
                            <p style="color: white;">{request.user.username} sent you a document to review and sign.</p>
                            <a href="{signing_url}" target="_blank" style="background-color: #ffd700; color: #000000; display: inline-block; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; text-align: center; text-decoration: none; padding: 10px 20px; border-radius: 4px;">
                                Review Document
                            </a>
                            <p style="color: white; font-size: 12px; margin-top: 10px;">
                                This email contains a secure link to Wa9i3Doc. Please do not share this link with others.
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            """

            for email in recipient_emails:
                email_obj = EmailMultiAlternatives(subject, '', sender, [email])
                email_obj.attach_alternative(html_content, "text/html")
                email_obj.send()

            return JsonResponse({'message': 'Emails sent successfully'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)



       

from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PDFFile
from .serializers import PDFFileSerializer

class PublicPDFListView(APIView):
    def get(self, request, token):
        try:
            # Query PDF files based on the provided token
            pdf_files = PDFFile.objects.filter(tokens__contains=token)

            # Serialize the filtered PDF files
            serializer = PDFFileSerializer(pdf_files, many=True)
            
            # Return the serialized data
            return Response(serializer.data)
        except PDFFile.DoesNotExist:
            return Response({'error': 'No PDF files found for the provided token'}, status=404)


from django.shortcuts import get_object_or_404
from django.http import JsonResponse

@csrf_exempt
def delete_pdf(request, pdf_file_id):
    if request.method == 'POST':
        pdf_file = get_object_or_404(PDFFile, pk=pdf_file_id)
        pdf_file.delete()
        return JsonResponse({'message': 'PDF file deleted successfully.'})
    else:
        return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)            
    
    
    
from django.core.mail import send_mail
from django.http import HttpResponse
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_email_view(request):
    subject = 'Test Email'
    message = 'This is a test email message.'
    from_email = settings.EMAIL_HOST_USER  # Use the configured SMTP email
    recipient_list = ['naimdikki@gmail.com']

    try:
        send_mail(subject, message, from_email, recipient_list)
        logger.info(f"Email sent successfully to {recipient_list}")
        return HttpResponse("Email sent successfully!")
    except Exception as e:
        logger.error(f"Error sending email: {str(e)}")
        return HttpResponse(f"Error sending email: {str(e)}", status=500)
    