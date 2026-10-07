# Audition_Viet_Phuc_Remix (Việt Phục Remix)

Dự án số hóa nghệ thuật trang phục truyền thống Việt Nam kết hợp phòng thử trang phục tương tác và phối màu di sản (Remix Studio).

## Tính năng chính (Giai đoạn 1 - MVP)

- **Phòng Thử Trang Phục Tương Tác**:
  - Dựng silhouette đa tầng các cổ phục truyền thống: **Áo Nhật Bình (Triều Nguyễn)**, **Áo Tấc (Áo Tay Thụng)**, **Áo Ngũ Thân Tay Chẽn**.
  - Cơ chế tách lớp và phủ màu di sản bằng CSS `mix-blend-mode: multiply` trên nền vector silhouette.
- **Phối Màu Di Sản (Remix Studio)**:
  - Bảng màu truyền thống tự nhiên: Đỏ Son, Xanh Lục, Vàng Kim, Xanh Chàm, Tím Huế, Trắng Ngà, Than Chì, Hồng Đào.
  - Tùy chọn phối màu ngẫu nhiên hoặc đặt lại màu gốc.
- **Phong Cách Thiết Kế Báo Chí Cao Cấp (Editorial)**:
  - Tông màu giấy ngà (`#F9F6F0`), mực than chì (`#1C1F1E`), chi tiết đỏ son (`#A62B2B`).

## Công nghệ sử dụng

- **Framework**: Next.js (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Kiểm thử (TDD)**: Jest, React Testing Library

## Cài đặt & Chạy dự án

```bash
# Cài đặt dependencies
npm install

# Khởi chạy máy chủ phát triển
npm run dev

# Chạy kiểm thử tự động
npm test

# Build ứng dụng
npm run build
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm ứng dụng.
