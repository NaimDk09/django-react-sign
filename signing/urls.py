from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.LogoutView.as_view(), name='user-logout'),
    path('upload/', views.FileUploadView.as_view(), name='pdf_file_upload'),
    path('pdfs/', views.UserPDFListView.as_view(), name='user_pdfs'),
    path('pdfs/<int:pk>/download/', views.DownloadPDFView.as_view(), name='download_pdf'),
    path('sign-pdf/', views.sign_pdf, name='sign-pdf'),
    #path('signed-pdfs/', views.SignedPDFListView.as_view(), name='signed-pdfs'),
    #path('signed-pdfs/<int:pk>/download/', views.DownloadSignedPDFView.as_view(), name='download_signed_pdf'),
    path('send-email/<int:pdf_file_id>/', views.send_email, name='send_email'),
    path('pdfs-email/<str:token>/', views.PublicPDFListView.as_view(), name='public_pdf_list'),
    path('delete/<int:pdf_file_id>/', views.delete_pdf, name='delete_pdf'),
    
    
    
    path('send-email-test/', views.send_email_view, name='send_email_test'),
]
