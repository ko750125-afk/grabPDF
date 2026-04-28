import re

def parse_range_string(range_str, max_pages):
    """
    Parses a range string like '1-3, 5, 8-10' into a list of 0-indexed page numbers.
    """
    pages = set()
    parts = re.split(r'[,\s]+', range_str.strip())
    
    for part in parts:
        if not part:
            continue
        if '-' in part:
            try:
                start, end = map(int, part.split('-'))
                # Handle 1-based to 0-based conversion
                for p in range(start, end + 1):
                    if 1 <= p <= max_pages:
                        pages.add(p - 1)
            except ValueError:
                continue
        else:
            try:
                p = int(part)
                if 1 <= p <= max_pages:
                    pages.add(p - 1)
            except ValueError:
                continue
                
    return sorted(list(pages))
