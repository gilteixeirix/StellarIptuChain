import zipfile
import re
import sys

def read_docx(filename):
    try:
        with zipfile.ZipFile(filename) as docx:
            xml_content = docx.read('word/document.xml').decode('utf-8')
            text = re.sub(r'<[^>]+>', ' ', xml_content)
            text = re.sub(r'\s+', ' ', text).strip()
            print(text)
    except Exception as e:
        print(f"Error: {e}")

read_docx('RT-IPTUChain.docx')
