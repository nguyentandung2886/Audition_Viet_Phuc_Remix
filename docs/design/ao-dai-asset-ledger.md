# Ledger tài sản AI: lát cắt áo dài

Ledger này đi cùng [art direction áo dài](./ao-dai-asset-art-direction.md). Mỗi lần sinh/chỉnh sửa tạo một hàng mới; không ghi đè lịch sử. `version` dùng `vNNN`. `reviewStatus` chỉ nhận `draft`, `rejected` hoặc `approved`. Tên reviewer không được để `TBD` khi trạng thái là `approved`.

## Reference registry

| Reference ID | Đường dẫn dự kiến | Vai trò | Trạng thái |
| --- | --- | --- | --- |
| `REF-POSE-001` | `public/assets/characters/base_01/base.png` | Khóa danh tính, pose, anchor và canvas; không phải tham chiếu trang phục | Cần duyệt lại ở native resolution |
| `REF-GALLERY-001` | `artifacts/asset-source/ao-dai/gallery-master-v001.png` | Master đã duyệt để tạo phòng thử và tách plate | Chưa tạo |
| `REF-FITTING-001` | `artifacts/asset-source/ao-dai/fitting-master-v001.png` | Master phòng thử để tách plate | Chưa tạo |
| `REF-AODAI-RED-001` | `artifacts/asset-source/ao-dai/outfit-red-master-v001.png` | Composite đỏ đã duyệt để tách lớp và tạo màu lam chàm | Chưa tạo |

Các lớp áo dài cũ không nằm trong registry vì đã có lỗi hình ảnh và không được dùng làm quality/style reference.

## Production ledger

| Asset ID | Output derivative | Prompt | Reference và vai trò | Version | Kỹ thuật | Hình ảnh | Văn hóa | reviewStatus | Checksum SHA-256 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `SCN-GALLERY-BG` | `public/assets/scenes/gallery/background.png` | `P01` + tách background | `REF-GALLERY-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-GALLERY-MID` | `public/assets/scenes/gallery/midground.png` | `P01` + tách midground | `REF-GALLERY-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `SCN-GALLERY-FG` | `public/assets/scenes/gallery/foreground.png` | `P01` + tách foreground | `REF-GALLERY-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-GALLERY-LIGHT` | `public/assets/scenes/gallery/light.png` | `P01` + tách light | `REF-GALLERY-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-AODAI-BG` | `public/assets/scenes/ao_dai/background.png` | `P02` + tách background | `REF-GALLERY-001`: kiến trúc; `REF-FITTING-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-AODAI-MID` | `public/assets/scenes/ao_dai/midground.png` | `P02` + tách midground | `REF-FITTING-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `SCN-AODAI-FG` | `public/assets/scenes/ao_dai/foreground.png` | `P02` + tách foreground | `REF-FITTING-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-AODAI-LIGHT` | `public/assets/scenes/ao_dai/light.png` | `P02` + tách light | `REF-FITTING-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-GALLERY-MANIFEST` | `public/assets/scenes/gallery/scene.json` | N/A, metadata | Tất cả plate gallery đã duyệt | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-AODAI-MANIFEST` | `public/assets/scenes/ao_dai/scene.json` | N/A, metadata | Tất cả plate phòng thử đã duyệt | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `AODAI-RED-PANTS` | `public/assets/garments/ao_dai/red/pants.png` | `P03` + tách `pants` | `REF-POSE-001`: pose; `REF-AODAI-RED-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-RED-TORSO` | `public/assets/garments/ao_dai/red/torso.png` | `P03` + tách `torso` | `REF-POSE-001`: pose; `REF-AODAI-RED-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-RED-NECKLACE` | `public/assets/garments/ao_dai/red/necklace.png` | `P03` + tách `necklace` | `REF-POSE-001`: pose; `REF-AODAI-RED-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-RED-HEADPIECE` | `public/assets/garments/ao_dai/red/headpiece.png` | `P03` + tách `headpiece` | `REF-POSE-001`: pose; `REF-AODAI-RED-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-INDIGO-PANTS` | `public/assets/garments/ao_dai/indigo/pants.png` | `P04` + tách `pants` | `REF-AODAI-RED-001`: geometry/color edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-INDIGO-TORSO` | `public/assets/garments/ao_dai/indigo/torso.png` | `P04` + tách `torso` | `REF-AODAI-RED-001`: geometry/color edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-INDIGO-NECKLACE` | `public/assets/garments/ao_dai/indigo/necklace.png` | `P04` + tách `necklace` | `REF-AODAI-RED-001`: unchanged derivative | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-INDIGO-HEADPIECE` | `public/assets/garments/ao_dai/indigo/headpiece.png` | `P04` + tách `headpiece` | `REF-AODAI-RED-001`: geometry/color edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-RED-MANIFEST` | `public/assets/garments/ao_dai/red/garment.json` | N/A, metadata | Bốn lớp đỏ đã duyệt | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `AODAI-INDIGO-MANIFEST` | `public/assets/garments/ao_dai/indigo/garment.json` | N/A, metadata | Bốn lớp lam chàm đã duyệt | `v001` | TBD | TBD | TBD | `draft` | TBD |

## Nhật ký lượt tạo

Điền một dòng cho từng output của công cụ, kể cả output bị loại. `Tool mode` mặc định là `built-in image_gen`; chỉ ghi CLI khi người dùng đã chọn rõ workflow đó.

| Ngày giờ | Asset ID | Version | Tool mode | Prompt cuối cùng / thay đổi duy nhất | File nguồn sinh ra | Kết quả kiểm tra | Quyết định |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TBD | TBD | `v001` | `built-in image_gen` | TBD | TBD | TBD | `draft` |

## Chữ ký duyệt

| Vai trò | Phạm vi | Tên | Ngày | Kết quả / ghi chú |
| --- | --- | --- | --- | --- |
| Technical reviewer | kích thước, alpha, alignment, tái ghép, metadata, checksum | TBD | TBD | Chưa duyệt |
| Visual reviewer | phong cách, hierarchy, ánh sáng, crop desktop/mobile | TBD | TBD | Chưa duyệt |
| Cultural reviewer | tên gọi, silhouette, motif, phụ kiện, mọi claim văn hóa | TBD | TBD | Chưa duyệt |

Một hàng chỉ đổi sang `approved` khi technical và visual reviewer đã ký; các hàng có chi tiết trang phục/phụ kiện/display văn hóa còn cần cultural reviewer ký. Khi thay prompt, reference hoặc derivative, tăng version và duyệt lại thay vì sửa kết quả của version cũ.
