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
| `SCN-AODAI-BG` | `public/assets/approved/scenes/ao_dai/background.png` | `P02` + chuẩn hóa | imagegen call 1: processing input | `v001` | 1600×1000, checksum đã ghi trong manifest; chờ review | Nguồn được nhận làm processing input | Chờ duyệt | `draft` | `acc82c2b976e686c1e7f968c4e8bf586920a6e07853ad25f94096d48c80acc05` |
| `SCN-AODAI-MID` | `public/assets/scenes/ao_dai/midground.png` | `P02` + tách midground | `REF-FITTING-001`: edit target | `v001` | TBD | TBD | TBD | `draft` | TBD |
| `SCN-AODAI-FG` | `public/assets/approved/scenes/ao_dai/foreground.png` | `P02` + chuẩn hóa | imagegen call 2: processing input | `v001` | 1600×1000, alpha thật; chờ review | Nguồn được nhận làm processing input | Chờ duyệt | `draft` | `7f28f95c373935ff48b82849ec36044a20cd0f5d9ebc36ff6ecdd4d448577d97` |
| `SCN-AODAI-LIGHT` | `public/assets/scenes/ao_dai/light.png` | `P02` + tách light | `REF-FITTING-001`: edit target | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-GALLERY-MANIFEST` | `public/assets/scenes/gallery/scene.json` | N/A, metadata | Tất cả plate gallery đã duyệt | `v001` | TBD | TBD | N/A | `draft` | TBD |
| `SCN-AODAI-MANIFEST` | `public/assets/approved/scenes/ao_dai/scene.json` | N/A, metadata | Hai derivative phòng thử hiện có | `v001` | Kích thước, crop, render order, provenance và checksum đã ghi; chờ review | Chờ duyệt | Chờ duyệt | `draft` | Xem checksum từng layer trong manifest |
| `AODAI-RED-PANTS` | `public/assets/approved/garments/ao_dai/red/pants.png` | Nguồn nền trắng + matte | imagegen call 8: processing input | `v001` | 1024×1536, box chuẩn hóa đã ghi; chờ review | Chờ duyệt | Chờ duyệt | `draft` | `a9a4569c059f781b35f3b2bf1b3a68b64ba6ad6e1a95bd35fe40210a28df19c3` |
| `AODAI-RED-TORSO` | `public/assets/approved/garments/ao_dai/red/torso.png` | `P03` + matte trắng | imagegen call 7: nguồn nền trắng khóa anchor | `v001` | 1024×1536, alpha sạch, box chuẩn hóa đã ghi; chờ review alignment | Chờ duyệt derivative | Chờ duyệt | `draft` | `17f2644a8fb6e4715004f32d74d1bc480bc78c271a2c8815f09ee2122679b530` |
| `AODAI-RED-NECKLACE` | `public/assets/approved/garments/ao_dai/red/necklace.png` | Nguồn nền trắng + matte | imagegen call 9: processing input | `v001` | 1024×1536, box chuẩn hóa đã ghi; chờ review | Chờ duyệt | Chờ duyệt | `draft` | `c90082313d93fe52c91db19cb08c7f29218d4d8001cd666f4641eeb2ad259376` |
| `AODAI-RED-HEADPIECE` | `public/assets/approved/garments/ao_dai/red/headpiece.png` | Nguồn nền trắng + matte | imagegen call 10: processing input | `v001` | 1024×1536, box chuẩn hóa đã ghi; chờ review | Chờ duyệt | Chờ duyệt | `draft` | `ed81c2a75a7132676c96f484946901db8c46887953243efb4535e53ac140b27b` |
| `AODAI-INDIGO-PANTS` | `public/assets/approved/garments/ao_dai/indigo/pants.png` | Dùng chung derivative hình học với đỏ | nguồn pants call 8 | `v001` | Alpha và pixel trùng bản đỏ; chờ review | Chờ duyệt | Chờ duyệt | `draft` | `a9a4569c059f781b35f3b2bf1b3a68b64ba6ad6e1a95bd35fe40210a28df19c3` |
| `AODAI-INDIGO-TORSO` | `public/assets/approved/garments/ao_dai/indigo/torso.png` | `P04` + masked recolor | derivative đỏ: cùng alpha/geometry | `v001` | 1024×1536, alpha byte-identical với đỏ; chờ review | Chờ duyệt derivative | Chờ duyệt | `draft` | `73cd9f78dd886de1b6624d767d71cb3b4f94274a14d31f314c7c176e37cd82fc` |
| `AODAI-INDIGO-NECKLACE` | `public/assets/approved/garments/ao_dai/indigo/necklace.png` | Dùng chung derivative hình học với đỏ | nguồn necklace call 9 | `v001` | Alpha và pixel trùng bản đỏ; chờ review | Chờ duyệt | Chờ duyệt | `draft` | `c90082313d93fe52c91db19cb08c7f29218d4d8001cd666f4641eeb2ad259376` |
| `AODAI-INDIGO-HEADPIECE` | `public/assets/approved/garments/ao_dai/indigo/headpiece.png` | Masked recolor | nguồn headpiece call 10, cùng alpha/geometry | `v001` | Alpha byte-identical với đỏ; chờ review | Chờ duyệt | Chờ duyệt | `draft` | `c490de9e86e59a39bd1383eae88e57cc16fd990495a765cbec4cd3608d4f533f` |
| `AODAI-RED-MANIFEST` | `public/assets/approved/garments/ao_dai/red/garment.json` | N/A, metadata | Torso derivative hiện có | `v001` | Canvas, target box, anchor contract, provenance và checksum đã ghi; chờ review | Chờ duyệt | Chờ duyệt | `draft` | Xem checksum layer trong manifest |
| `AODAI-INDIGO-MANIFEST` | `public/assets/approved/garments/ao_dai/indigo/garment.json` | N/A, metadata | Torso derivative hiện có | `v001` | Canvas, target box, anchor contract, provenance và checksum đã ghi; chờ review | Chờ duyệt | Chờ duyệt | `draft` | Xem checksum layer trong manifest |

## Nhật ký lượt tạo

Điền một dòng cho từng output của công cụ, kể cả output bị loại. `Tool mode` mặc định là `built-in image_gen`; chỉ ghi CLI khi người dùng đã chọn rõ workflow đó.

| Ngày giờ | Asset ID | Version | Tool mode | Prompt cuối cùng / thay đổi duy nhất | File nguồn sinh ra | Kết quả kiểm tra | Quyết định |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-10 | `SCN-AODAI-BG` | `v001` | `built-in image_gen` | Tạo background phòng thử, không nhân vật/chữ | `exec-bb8b7b53-cab8-451f-ba87-39b2ae3f5c99.png` | Bố cục được nhận làm đầu vào xử lý; kiểm tra kỹ thuật derivative còn pending | `draft` |
| 2026-10-10 | `SCN-AODAI-FG` | `v001` | `built-in image_gen` | Tách foreground cùng phối cảnh phòng | `exec-c6a960a5-7a9e-413c-aad8-0c5fae169555.png` | Alpha và bố cục được nhận làm đầu vào xử lý; kiểm tra kỹ thuật derivative còn pending | `draft` |
| 2026-10-10 | `AODAI-RED-TORSO` | `v001` | `built-in image_gen` | Tạo torso đỏ nền trong suốt | `exec-98ddcd61-9c39-4bc3-9c24-ccba5cff2d27.png` | Có quầng đỏ/halo quanh silhouette | `rejected` |
| 2026-10-10 | `AODAI-RED-TORSO` | `v002` | `built-in image_gen` | Edit bỏ quầng sáng | `exec-6a42f606-7e14-45ba-8e82-feec1b306391.png` | Halo vẫn còn và hình học bị lệch | `rejected` |
| 2026-10-10 | `AODAI-RED-TORSO` | `v003` | `built-in image_gen` | Tạo torso đỏ trên nền trắng để matte | `exec-2f5871b5-226c-4875-a416-68fc3a6bd152.png` | Quá khổ, không khớp anchor mục tiêu | `rejected` |
| 2026-10-10 | `AODAI-RED-TORSO` | `v004` | `built-in image_gen` | Tách nền từ bản torso trắng | `exec-265c05a3-b939-4b70-8dff-b8e752666bdb.png` | Quầng sáng quay lại và hình học bị lệch | `rejected` |
| 2026-10-10 | `AODAI-RED-TORSO` | `v005` | `built-in image_gen` | Tạo nguồn nền trắng có ràng buộc anchor và target box | `exec-c00f0a8f-331c-415a-bd91-3c2842d6e63d.png` | Nhận làm đầu vào xử lý tất định; duyệt kỹ thuật, hình ảnh và văn hóa còn pending | `draft` |
| 2026-10-10 | `AODAI-RED-PANTS` | `v001` | `built-in image_gen` | Tạo quần sáng màu trên nền trắng để matte | `exec-c5fd06fb-6663-4eb5-b284-b09ecda762dc.png` | Nhận làm đầu vào xử lý; duyệt kỹ thuật, hình ảnh và văn hóa còn pending | `draft` |
| 2026-10-10 | `AODAI-RED-NECKLACE` | `v001` | `built-in image_gen` | Tạo kiềng bạc trên nền trắng để matte | `exec-460b6579-6208-4db8-b94b-847230eed3cf.png` | Nhận làm đầu vào xử lý; duyệt kỹ thuật, hình ảnh và văn hóa còn pending | `draft` |
| 2026-10-10 | `AODAI-RED-HEADPIECE` | `v001` | `built-in image_gen` | Tạo mấn đỏ trên nền trắng để matte và recolor | `exec-57e02536-0ec8-441c-b716-783a71779f1b.png` | Nhận làm đầu vào xử lý; duyệt kỹ thuật, hình ảnh và văn hóa còn pending | `draft` |

## Chữ ký duyệt

| Vai trò | Phạm vi | Tên | Ngày | Kết quả / ghi chú |
| --- | --- | --- | --- | --- |
| Technical reviewer | kích thước, alpha, alignment, tái ghép, metadata, checksum | TBD | TBD | Chưa duyệt |
| Visual reviewer | phong cách, hierarchy, ánh sáng, crop desktop/mobile | TBD | TBD | Chưa duyệt |
| Cultural reviewer | tên gọi, silhouette, motif, phụ kiện, mọi claim văn hóa | TBD | TBD | Chưa duyệt |

Một hàng chỉ đổi sang `approved` khi technical và visual reviewer đã ký; các hàng có chi tiết trang phục/phụ kiện/display văn hóa còn cần cultural reviewer ký. Khi thay prompt, reference hoặc derivative, tăng version và duyệt lại thay vì sửa kết quả của version cũ.
