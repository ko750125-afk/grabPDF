import fitz
import os
from datetime import datetime
from PIL import Image
from utils import parse_range_string

class PDFProcessor:
    @staticmethod
    def get_total_pages(input_path):
        doc = fitz.open(input_path)
        total = len(doc)
        doc.close()
        return total

    @staticmethod
    def get_page_preview(input_path, page_num, width=400):
        doc = fitz.open(input_path)
        page = doc.load_page(page_num)
        zoom = width / page.rect.width
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        doc.close()
        return img

    @staticmethod
    def extract_pages(input_path, output_path, range_str):
        doc = fitz.open(input_path)
        max_pages = len(doc)
        page_indices = parse_range_string(range_str, max_pages)
        
        if not page_indices:
            raise ValueError("유효하지 않은 페이지 범위입니다.")
            
        doc.select(page_indices)
        new_doc = fitz.open()
        new_doc.insert_pdf(doc)
        new_doc.save(output_path)
        new_doc.close()
        doc.close()

    @staticmethod
    def merge_pdfs(file_list, output_path):
        if not file_list:
            raise ValueError("병합할 파일이 없습니다.")
        new_doc = fitz.open()
        for file_path in file_list:
            doc = fitz.open(file_path)
            new_doc.insert_pdf(doc)
            doc.close()
        new_doc.save(output_path)
        new_doc.close()
