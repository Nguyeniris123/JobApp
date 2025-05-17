from google.cloud import vision
import requests

def verify_image_with_google_vision(image_url):
    """
    Xác minh ảnh công ty có phải ảnh thật (môi trường làm việc) hay ảnh mạng (stock).
    """
    client = vision.ImageAnnotatorClient()

    # Tải ảnh từ URL (Cloudinary hoặc ảnh trên mạng)
    response = requests.get(image_url)
    content = response.content

    # Gửi ảnh vào Google Vision API
    image = vision.Image(content=content)

    # Phân tích Web Detection (ảnh từng xuất hiện trên internet chưa)
    web_detection = client.web_detection(image=image).web_detection

    # Nếu là ảnh mạng, ta vẫn tiếp tục kiểm tra nội dung label
    is_stock_photo = web_detection.full_matching_images or web_detection.pages_with_matching_images

    # Phân tích Label Detection (ảnh chứa nội dung gì)
    label_response = client.label_detection(image=image)
    labels = label_response.label_annotations
    keywords = [label.description.lower() for label in labels]

    # Debug log
    print("🧠 Labels from Vision API:", keywords)

    trusted_keywords = {"office", "workspace", "building", "desk", "employee"}
    matched_keywords = trusted_keywords.intersection(set(keywords))

    print("✅ Matched trusted keywords:", matched_keywords)

    # Trường hợp 1: ảnh mạng + không có nhãn văn phòng → loại
    if is_stock_photo and not matched_keywords:
        print("❌ Ảnh mạng và không có nội dung đáng tin.")
        return {
            "is_real": False,
            "reason": "Image appears on the internet and has no trusted office-related content"
        }

    # Trường hợp 2: ảnh mạng nhưng có nội dung đáng tin → chấp nhận
    if is_stock_photo and matched_keywords:
        print("⚠️ Ảnh mạng nhưng có nội dung văn phòng. Cho qua.")
        return {
            "is_real": True,
            "reason": f"Image is on the internet, but contains trusted content: {matched_keywords}"
        }

    # Trường hợp 3: ảnh mới, có nội dung văn phòng → chấp nhận
    if matched_keywords:
        print("✅ Ảnh mới, có nội dung văn phòng.")
        return {
            "is_real": True,
            "reason": f"Detected trusted keywords: {matched_keywords}"
        }

    # Trường hợp 4: ảnh mới, nhưng không có nội dung đáng tin → loại
    print("❌ Ảnh không đáng tin (không có nhãn văn phòng).")
    return {
        "is_real": False,
        "reason": "No trusted office-related keywords found"
    }
