import re
import sys
import datetime
import tkinter as tk
from tkinter import messagebox, simpledialog
from endesive import pdf, hsm
import PyKCS11 as PK11

dllpath = r'c:\windows\system32\eTPKCS11.dll'

class Signer(hsm.HSM):
    def certificate(self):
        print("Fetching certificates from HSM...")
        self.login("My Token", "Hilyxl4s#")
        try:
            pk11objects = self.session.findObjects([(PK11.CKA_CLASS, PK11.CKO_CERTIFICATE)])
            all_attributes = [
                PK11.CKA_VALUE,
                PK11.CKA_ID,
            ]

            certificate_list = []
            for pk11object in pk11objects:
                try:
                    attributes = self.session.getAttributeValue(pk11object, all_attributes)
                except PK11.PyKCS11Error as e:
                    continue

                attrDict = dict(list(zip(all_attributes, attributes)))
                cert = bytes(attrDict[PK11.CKA_VALUE])
                key_id = attrDict.get(PK11.CKA_ID)

                subject_attr = self.session.getAttributeValue(pk11object, [PK11.CKA_SUBJECT])
                subject_str = bytes(subject_attr[0]).decode('utf-8', errors='replace')
                last_symbol_index = max(re.finditer(r'[^a-zA-Z\s]', subject_str), key=lambda match: match.start(), default=None)
                if last_symbol_index:
                    last_subject_part = subject_str[last_symbol_index.end():].strip()
                else:
                    last_subject_part = subject_str.strip()

                if key_id:
                    certificate_list.append((bytes(key_id), cert, last_subject_part))
            
            if len(certificate_list) > 0:
                root = tk.Tk()
                root.withdraw()  # Hide the main window

                choices = ["Choose certificate {} to sign with : {}".format(idx + 1, cert_subject) for idx, (_, _, cert_subject) in enumerate(certificate_list)]
                choice = simpledialog.askinteger("Select Certificate", "\n".join(choices),
                                                 minvalue=1, maxvalue=len(certificate_list))

                root.destroy()  # Close the temporary tkinter window
                
                if choice:
                    print("Selected certificate:", certificate_list[choice - 1][2])
                    selected_certificate = certificate_list[choice - 1]
                    return selected_certificate[0], selected_certificate[1]
        finally:
            self.logout()
        print("No certificate selected.")
        return None, None

    def sign(self, keyid, data, mech):
        print("Signing data...")
        self.login("My Token", "Hilyxl4s#")
        try:
            private_keys = self.session.findObjects([(PK11.CKA_CLASS, PK11.CKO_PRIVATE_KEY)])
            for privKey in private_keys:
                keyid_attr = self.session.getAttributeValue(privKey, [PK11.CKA_ID])
                if bytes(keyid_attr[0]) == keyid:
                    mech = getattr(PK11, 'CKM_%s_RSA_PKCS' % mech.upper())
                    sig = self.session.sign(privKey, data, PK11.Mechanism(mech, None))
                    return bytes(sig)
        finally:
            self.logout()
        print("Signing failed.")
        return None
    
def main(file_path):
    print("Starting PDF signing process...")
    date = datetime.datetime.utcnow() - datetime.timedelta(hours=12)
    date = date.strftime('%Y%m%d%H%M%S+00\'00\'')
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
    }
    print("Initializing signer...")
    clshsm = Signer(dllpath)
    print("Reading PDF file...")
    datau = open(file_path, 'rb').read()

    selected_certificate = clshsm.certificate()
    selected_private_key = None

    if selected_certificate:
        print("Certificate selected. Attempting to sign PDF...")
        selected_private_key = clshsm.sign(selected_certificate[0], datau, 'sha256')

    if selected_certificate and selected_private_key:
        print("Signing successful. Adding signature to PDF...")
        datas = pdf.cms.sign(datau, dct, selected_certificate[1], selected_private_key, [], 'sha256', clshsm)
        signed_file_path = file_path.replace('.pdf', '-signed.pdf')

        with open(signed_file_path, 'wb') as fp:
            fp.write(datau)
            fp.write(datas)
        print("Signature added to PDF. Signed file saved as:", signed_file_path)
    else:
        print("Signing process failed.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Please provide the path to the PDF file as a command-line argument.')
        sys.exit(1)
    pdf_file_path = sys.argv[1]
    main(pdf_file_path)
