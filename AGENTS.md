# Superpowers Development Framework

Tập hợp skills từ [obra/superpowers](https://github.com/obra/superpowers) được cấu hình cho dự án:

## Quy trình làm việc cốt lõi (Workflow)

1. **Khởi tạo tính năng / Thay đổi chức năng**:
   - Bắt buộc kích hoạt skill `brainstorming` trước khi viết code.
   - Làm rõ yêu cầu, xác nhận thiết kế với người dùng trước khi triển khai.

2. **Lập kế hoạch**:
   - Sử dụng skill `writing-plans` để chia nhỏ task thành các bước rõ ràng, độc lập.

3. **Thực thi kế hoạch**:
   - Sử dụng `subagent-driven-development` hoặc `executing-plans`.
   - Với các task độc lập, cân nhắc `dispatching-parallel-agents`.

4. **Sửa lỗi (Debugging)**:
   - Sử dụng skill `systematic-debugging` để tìm nguyên nhân gốc rễ (root cause) thay vì sửa mò.

5. **Phát triển theo kiểm thử (TDD)**:
   - Sử dụng skill `test-driven-development` (Red -> Green -> Refactor).

6. **Code Review & Kiểm định**:
   - Yêu cầu review với `requesting-code-review` / `receiving-code-review`.
   - Chạy `verification-before-completion` trước khi thông báo hoàn tất công việc.

## Quy tắc công cụ (Tool Mapping trong Antigravity)
- Tham khảo hướng dẫn chi tiết tại `.agents/skills/using-superpowers/references/antigravity-tools.md`.
- Subagent dispatch: Sử dụng `invoke_subagent` (`self` cho full task, `research` cho read-only).
- Checklist / Task tracking: Sử dụng task artifact (`write_to_file` với `ArtifactType: "task"`).
