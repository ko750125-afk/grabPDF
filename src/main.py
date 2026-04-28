import customtkinter as ctk
import os
import threading
import tempfile
from tkinter import filedialog, messagebox
from PIL import Image
from pdf_processor import PDFProcessor

class GrabPDFApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("grabPDF - 고성능 PDF 편집 도구")
        self.geometry("1100x850")
        
        ctk.set_appearance_mode("Dark")
        ctk.set_default_color_theme("blue")

        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        self.tabview = ctk.CTkTabview(self, segmented_button_fg_color="#1f1f1f", segmented_button_selected_color="#3b8ed0")
        self.tabview.grid(row=0, column=0, padx=15, pady=10, sticky="nsew")
        
        self.tab_extract = self.tabview.add("📄 페이지 추출")
        self.tab_merge = self.tabview.add("🔗 PDF 병합")

        self.merge_file_list = []
        self.extract_selected_pages = set()
        self.preview_images = {}

        self.setup_extract_tab()
        self.setup_merge_tab()

        self.status_bar = ctk.CTkLabel(self, text="준비됨", anchor="w", font=("Malgun Gothic", 12))
        self.status_bar.grid(row=1, column=0, padx=20, pady=5, sticky="we")

    def log_status(self, message):
        self.status_bar.configure(text=f"상태: {message}")

    # ============ 페이지 추출 탭 ============
    def setup_extract_tab(self):
        self.tab_extract.grid_columnconfigure(0, weight=1)
        self.tab_extract.grid_rowconfigure(2, weight=1)
        
        ctrl_frame = ctk.CTkFrame(self.tab_extract, fg_color="transparent")
        ctrl_frame.grid(row=0, column=0, pady=10, padx=15, sticky="ew")

        self.extract_file_path = ctk.StringVar(value="선택된 파일 없음")
        file_btn = ctk.CTkButton(ctrl_frame, text="📁 PDF 파일 선택", command=self.select_extract_file, height=40)
        file_btn.pack(side="left", padx=10)
        
        self.range_entry = ctk.CTkEntry(ctrl_frame, placeholder_text="직접 입력 (예: 1-5)", width=200, height=40)
        self.range_entry.pack(side="left", padx=10)

        action_btn = ctk.CTkButton(ctrl_frame, text="🖨️ 인쇄 (PDF 생성)", command=self.run_extraction, 
                                   fg_color="#2ecc71", hover_color="#27ae60", height=40, font=("Malgun Gothic", 14, "bold"))
        action_btn.pack(side="right", padx=10)

        self.guide_label = ctk.CTkLabel(self.tab_extract, text="파일을 선택하세요. (클릭하여 페이지 선택)", font=("Malgun Gothic", 13), text_color="#aaaaaa")
        self.guide_label.grid(row=1, column=0, pady=5)

        self.preview_scroll = ctk.CTkScrollableFrame(self.tab_extract, label_text="페이지 미리보기")
        self.preview_scroll.grid(row=2, column=0, padx=15, pady=10, sticky="nsew")
        
        self.preview_container = ctk.CTkFrame(self.preview_scroll, fg_color="transparent")
        self.preview_container.pack(fill="both", expand=True)
        self.preview_container.grid_columnconfigure((0,1,2,3), weight=1)

    def select_extract_file(self):
        path = filedialog.askopenfilename(filetypes=[("PDF 파일", "*.pdf")])
        if path:
            self.extract_file_path.set(path)
            self.guide_label.configure(text=f"현재 파일: {os.path.basename(path)}")
            self.extract_selected_pages.clear()
            self.range_entry.delete(0, "end")
            self.clear_previews()
            threading.Thread(target=self.load_thumbnails, args=(path,), daemon=True).start()

    def clear_previews(self):
        for widget in self.preview_container.winfo_children():
            widget.destroy()
        self.preview_images.clear()

    def load_thumbnails(self, path):
        try:
            total_pages = PDFProcessor.get_total_pages(path)
            self.log_status("로딩 중...")
            for i in range(total_pages):
                pil_img = PDFProcessor.get_page_preview(path, i, width=400)
                ctk_img = ctk.CTkImage(light_image=pil_img, dark_image=pil_img, size=(160, 220))
                self.preview_images[i] = ctk_img
                self.after(0, self.add_thumbnail_to_grid, i, ctk_img)
            self.log_status("완료")
        except Exception as e:
            self.after(0, lambda: messagebox.showerror("오류", str(e)))

    def add_thumbnail_to_grid(self, page_num, img):
        # 위젯 1개(버튼)로 통합하여 스크롤 성능 향상
        btn = ctk.CTkButton(self.preview_container, image=img, text=f"{page_num + 1}P", 
                            compound="bottom", fg_color="#2b2b2b", hover_color="#3d3d3d",
                            border_width=0, corner_radius=8, text_color="white", font=("Malgun Gothic", 12, "bold"))
        btn.grid(row=page_num // 4, column=page_num % 4, padx=10, pady=10, sticky="n")
        btn.configure(command=lambda p=page_num, b=btn: self.toggle_page_selection(p, b))

    def toggle_page_selection(self, page_num, widget):
        if page_num in self.extract_selected_pages:
            self.extract_selected_pages.remove(page_num)
            widget.configure(border_width=0, fg_color="#2b2b2b")
        else:
            self.extract_selected_pages.add(page_num)
            widget.configure(border_width=3, border_color="#3b8ed0", fg_color="#3d3d3d")
        
        sorted_pages = sorted([p + 1 for p in self.extract_selected_pages])
        self.range_entry.delete(0, "end")
        self.range_entry.insert(0, ", ".join(map(str, sorted_pages)))

    def run_extraction(self):
        input_path = self.extract_file_path.get()
        range_str = self.range_entry.get()
        if input_path == "선택된 파일 없음" or not range_str:
            messagebox.showwarning("알림", "파일과 페이지 범위를 선택해주세요.")
            return

        try:
            fd, temp_path = tempfile.mkstemp(suffix=".pdf", prefix="grabPDF_")
            os.close(fd)
            PDFProcessor.extract_pages(input_path, temp_path, range_str)
            os.startfile(temp_path)
            messagebox.showinfo("완료", "결과 파일이 열렸습니다.\n인쇄: Ctrl+P  |  저장: Ctrl+S")
        except Exception as e:
            messagebox.showerror("오류", str(e))

    # ============ PDF 병합 탭 ============
    def setup_merge_tab(self):
        self.tab_merge.grid_columnconfigure(0, weight=1)
        ctk.CTkLabel(self.tab_merge, text="PDF 병합", font=("Malgun Gothic", 20, "bold")).pack(pady=20)
        btn_frame = ctk.CTkFrame(self.tab_merge, fg_color="transparent")
        btn_frame.pack(pady=10)
        ctk.CTkButton(btn_frame, text="➕ 파일 추가", command=self.add_merge_files).grid(row=0, column=0, padx=10)
        ctk.CTkButton(btn_frame, text="🗑️ 목록 비우기", command=self.clear_merge_list, fg_color="#e74c3c").grid(row=0, column=1, padx=10)
        self.merge_listbox_frame = ctk.CTkScrollableFrame(self.tab_merge, width=650, height=400, label_text="병합 목록")
        self.merge_listbox_frame.pack(pady=10, padx=20, fill="both", expand=True)
        ctk.CTkButton(self.tab_merge, text="🖨️ 병합 후 인쇄", command=self.run_merge, fg_color="#3498db", height=50, font=("Malgun Gothic", 14, "bold")).pack(pady=20)

    def add_merge_files(self):
        paths = filedialog.askopenfilenames(filetypes=[("PDF 파일", "*.pdf")])
        for p in paths:
            if p not in self.merge_file_list:
                self.merge_file_list.append(p)
        self.refresh_merge_list()

    def clear_merge_list(self):
        self.merge_file_list = []
        self.refresh_merge_list()

    def refresh_merge_list(self):
        for w in self.merge_listbox_frame.winfo_children():
            w.destroy()
        for i, p in enumerate(self.merge_file_list):
            item = ctk.CTkFrame(self.merge_listbox_frame)
            item.pack(fill="x", pady=2, padx=5)
            ctk.CTkLabel(item, text=f"{i+1}. {os.path.basename(p)}", anchor="w").pack(side="left", padx=10, fill="x", expand=True)
            ctk.CTkButton(item, text="제거", width=60, fg_color="#e74c3c", command=lambda path=p: self.remove_from_merge_list(path)).pack(side="right", padx=5)

    def remove_from_merge_list(self, path):
        if path in self.merge_file_list:
            self.merge_file_list.remove(path)
        self.refresh_merge_list()

    def run_merge(self):
        if len(self.merge_file_list) < 2:
            messagebox.showwarning("알림", "2개 이상의 파일을 추가해주세요.")
            return
        try:
            fd, temp_path = tempfile.mkstemp(suffix=".pdf", prefix="grabPDF_merge_")
            os.close(fd)
            PDFProcessor.merge_pdfs(self.merge_file_list, temp_path)
            os.startfile(temp_path)
            messagebox.showinfo("완료", "결과 파일이 열렸습니다.\n인쇄: Ctrl+P  |  저장: Ctrl+S")
        except Exception as e:
            messagebox.showerror("오류", str(e))

if __name__ == "__main__":
    app = GrabPDFApp()
    app.mainloop()
