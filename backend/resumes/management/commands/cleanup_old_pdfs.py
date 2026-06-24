import os
import time

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Deletes temporarily cached PDF files older than 24 hours"

    def handle(self, *args, **options):
        cache_dir = getattr(settings, "PDF_CACHE_DIR", None)
        if not cache_dir:
            cache_dir = os.path.join(settings.BASE_DIR, "pdf_cache")

        if not os.path.isdir(cache_dir):
            self.stdout.write(f"PDF cache directory does not exist: {cache_dir}")
            return

        now = time.time()
        cutoff = 86400
        removed = 0

        for filename in os.listdir(cache_dir):
            filepath = os.path.join(cache_dir, filename)
            if os.path.isfile(filepath) and filename.endswith(".pdf"):
                age = now - os.path.getmtime(filepath)
                if age > cutoff:
                    os.remove(filepath)
                    removed += 1

        if removed:
            self.stdout.write(self.style.SUCCESS(f"Removed {removed} expired PDF(s) from {cache_dir}"))
        else:
            self.stdout.write("No expired PDFs to remove")
