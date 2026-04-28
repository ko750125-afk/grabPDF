import sys
import os

# Add src to python path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from main import GrabPDFApp

if __name__ == "__main__":
    try:
        app = GrabPDFApp()
        app.mainloop()
    except Exception as e:
        print(f"Critical Error: {e}")
        input("Press Enter to exit...")
