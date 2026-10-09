# Viet Phuc Remix - Architecture & AI Pipeline Design

## 1. Mục tiêu và Kiến trúc Tổng quan (Architecture Overview)

Dự án là một trải nghiệm web tương tác kết hợp hoạt hình (UI/UX Animation) để trình diễn Việt Phục, đồng thời có một công cụ nội bộ (AI Pipeline) để sản xuất tài nguyên đồ họa tự động.

Hệ thống được chia làm hai phần tách biệt nhưng giao tiếp với nhau qua chuẩn dữ liệu (Metadata):

1.  **Phần Sinh Tài Nguyên (AI Asset Generation Pipeline):** Một bộ công cụ chạy bằng Python để tạo, tách nền, căn chỉnh và kiểm duyệt (validate) các layer trang phục anime dựa trên một Base Character cố định.
2.  **Phần Trải Nghiệm Người Dùng (Frontend Application):** Ứng dụng Next.js kết hợp GSAP và Framer Motion, cung cấp không gian "phòng trưng bày" ảo và hệ thống thay đồ mượt mà (Outfit Customization).

## 2. Thiết kế AI Asset Pipeline (Python)

### 2.1. Cấu trúc Pipeline
Pipeline bao gồm các module tuần tự:
*   **Asset Generator:** Kết nối với API tạo ảnh của Gemini để sinh Base Character (nhân vật nữ, góc nhìn thẳng, phong cách anime) và các mảnh trang phục (áo dài, mấn, quần...).
*   **Background Remover:** Sử dụng thư viện `rembg` để loại bỏ nền tự động, tạo ảnh PNG trong suốt (Alpha channel).
*   **Anchor Aligner:** Dùng OpenCV/Pillow nhận diện hoặc đọc mốc tọa độ (anchors: cổ, vai, eo...) để đảm bảo layer trang phục nằm đúng vị trí trên Base Character.
*   **Asset Validator:** Kiểm tra độ phân giải, kênh Alpha, và loại bỏ ảnh lỗi, sinh báo cáo (Validation Report).
*   **Metadata Exporter:** Xuất ảnh PNG cùng file `garment.json` chứa tọa độ và `renderOrder` (thứ tự lớp) để Frontend sử dụng.

### 2.2. Base Character & Anchor System
Sẽ có một nhân vật gốc (Base Character) với khung hình cố định (ví dụ: 1024x1536).
Mọi trang phục sinh ra phải tuân theo hệ trục tọa độ tương đối [0,1] của nhân vật này.
*Ví dụ:* `neck: {x: 0.5, y: 0.18}`. Cổ áo sinh ra phải khớp chính xác với điểm này.

### 2.3. Cấu trúc lưu trữ Asset (Output)
```text
public/assets/
  ├── characters/
  │   └── base_female_01/
  │       ├── base.png
  │       └── character.json (chứa anchors)
  └── garments/
      └── ao_dai/
          └── red/
              ├── inner.png
              ├── torso.png
              ├── sleeves.png
              └── garment.json (chứa renderOrder, offsets)
```

## 3. Thiết kế Frontend UI/UX (Next.js + GSAP)

### 3.1. Cấu trúc Không Gian (Spatial Rooms)
Hệ thống navigation sẽ không dùng chuyển trang vật lý (page load) mà di chuyển camera giữa các cảnh:
*   **Hallway (Sảnh):** Chứa các lựa chọn trang phục.
*   **Fitting Room (Phòng Thử Đồ):** Background tĩnh tập trung vào một loại trang phục. Khi chuyển phòng, GSAP sẽ tạo hiệu ứng trượt (slide) hoặc zoom mượt mà, background elements sẽ có hiệu ứng parallax.

### 3.2. Outfit Composer Component
Một component trung tâm làm nhiệm vụ "mặc" quần áo cho nhân vật:
*   Đọc `character.json` và `garment.json`.
*   Render các thẻ `<img />` xếp chồng lên nhau dựa trên `renderOrder` (z-index).
*   **Animation khi thay đổi:** Khi user chọn áo màu khác hoặc thêm nón/mấn, Framer Motion sẽ xử lý hiệu ứng `AnimatePresence` (fade-in, slide-down mượt mà thay vì chớp ảnh).

## 4. Kế hoạch triển khai (MVP)

Để đảm bảo hiệu quả, quá trình phát triển bắt đầu bằng việc chứng minh Pipeline có thể sinh và khớp nối 1 bộ trang phục hoàn hảo trước:

1.  **Bước 1 (Base Asset Generation):** Viết script Python gọi Gemini sinh 1 Base Character anime và 1 mảnh Áo Dài + 1 Mấn (phụ kiện).
2.  **Bước 2 (Processing):** Cấu hình `rembg` và logic căn chỉnh (Pillow) để tách nền và khớp Áo Dài vào Base Character. Xuất ra thư mục chuẩn.
3.  **Bước 3 (Frontend Boilerplate):** Setup Next.js, Framer Motion, GSAP.
4.  **Bước 4 (Render & Animate):** Code component Outfit Composer để hiển thị Base Character + Áo Dài vừa tạo. Thêm UI chọn trang phục có hiệu ứng transition chuyển cảnh.

## 5. Rủi ro & Giải pháp
*   *AI tạo hình sai lệch:* Gemini sinh đồ không khớp hoàn toàn tư thế. -> Giải pháp: Sử dụng prompt kỹ thuật nghiêm ngặt, cho phép chỉnh sửa tọa độ (offset) thủ công bằng JSON nếu AI chưa hoàn hảo.
*   *Tách nền lẹm vào nhân vật:* -> Giải pháp: Điều chỉnh thông số alpha matting của `rembg`.
