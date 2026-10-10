# Art direction tài sản AI: lát cắt áo dài

Trạng thái: **sẵn sàng cho sản xuất, chưa có tài sản nào được duyệt**. Tài liệu này triển khai Task 3 của [kế hoạch demo](../superpowers/plans/2026-10-10-immersive-viet-phuc-demo.md), theo [hệ thống thiết kế](../../design-system/viet-phuc-remix/MASTER.md) và [đặc tả cảnh](./immersive-scenes.md). Phạm vi chỉ gồm một lát cắt áo dài: nhân vật cố định, phòng trưng bày, phòng thử, hai màu và hai phụ kiện.

Các mô tả màu sắc, nội thất và cách phối dưới đây là chỉ đạo hình ảnh đương đại. Không dùng chúng như dữ kiện lịch sử. Mọi chi tiết được trình bày là đặc trưng văn hóa phải qua người duyệt văn hóa và có nguồn trước khi xuất hiện trong giao diện.

## 1. Hướng hình ảnh đã khóa

- Chủ đề: **Atelier bên ô cửa**, căn phòng đương đại lấy ánh sáng ban ngày xanh dịu làm trục thị giác.
- Phong cách: minh họa anime 2D cel shading; nét viền tiết chế; hai đến ba mảng sáng tối; chất liệu lụa thể hiện bằng nếp gấp lớn, không bằng nhiễu ảnh hoặc độ bóng nhựa.
- Bảng màu nền: Ink `#20334A`, Porcelain `#F3F7FA`, Indigo `#354D80`, Jade `#356557`, Lacquer `#8D3D50`, Brass `#B18A46`.
- Kiến trúc phòng là bối cảnh minh họa, không phải phục dựng một nội thất lịch sử. Không đặt chữ, nút, nhãn, logo hoặc watermark vào ảnh.
- Một nguồn sáng chính từ cửa sổ phía trái. Hướng sáng, độ dày nét và góc nhìn phải đồng nhất giữa gallery, phòng thử, nhân vật và trang phục.
- Không dùng hạt bay lặp vô hạn, vầng sáng giả, gradient trang trí hoặc biểu tượng văn hóa chung chung để lấp khoảng trống.

## 2. Canvas và tư thế chuẩn

### 2.1 Nhân vật và trang phục

Mọi lớp nhân vật/trang phục dùng đúng canvas trong schema hiện tại: **1024×1536 px, RGBA, không đổi tỷ lệ 2:3**. Không cắt riêng từng lớp theo bounding box.

Tư thế chuẩn:

- Nữ sinh viên trẻ, phong cách anime, nhìn gần chính diện; thân người thẳng, trọng lượng chia đều hai chân.
- Đầu không nghiêng quá 3°, vai cân; hai cánh tay buông tự nhiên nhưng cách thân áo tối thiểu 48 px; bàn tay nhìn thấy trọn vẹn và không đè lên tà áo.
- Hai chân song song tự nhiên, bàn chân nằm trọn trong canvas. Tóc không che cổ áo, kiềng hoặc đường vai.
- Biểu cảm bình tĩnh, thân thiện; không cầm đạo cụ; không có gió thổi tóc hoặc tà áo. Đây là pose đăng ký lớp, không phải keyframe chuyển động.
- Vùng nội dung mục tiêu: `x=260..764`, `y=72..1480`. Không có pixel nhìn thấy ngoài vùng an toàn 24 px từ mép canvas.

Các anchor bắt buộc, lấy từ `base_01/character.json`:

| Anchor | Tỷ lệ | Pixel chuẩn |
| --- | --- | --- |
| Đầu | `(0.50, 0.12)` | `(512, 184)` |
| Cổ | `(0.50, 0.28)` | `(512, 430)` |
| Vai trái | `(0.40, 0.31)` | `(410, 476)` |
| Vai phải | `(0.60, 0.31)` | `(614, 476)` |
| Eo | `(0.50, 0.49)` | `(512, 753)` |
| Hông | `(0.50, 0.60)` | `(512, 922)` |

`public/assets/characters/base_01/base.png` là **tham chiếu pose và danh tính**. Không dùng các lớp áo dài hiện có làm tham chiếu chất lượng vì chúng đã được ghi nhận có lỗi sọc/cạnh. Nếu phải tạo lại nhân vật chuẩn, ảnh mới phải được duyệt trước rồi mới sinh mọi lớp trang phục; không trộn lớp từ hai bản nhân vật.

### 2.2 Cảnh phòng

Mọi plate phòng dùng **1600×1000 px**. Không raster hóa điều khiển vào plate.

- Vùng nhân vật trong phòng thử: `x=584`, `y=200`, `w=432`, `h=648`; đây là phép thu đồng nhất `0.421875` từ canvas 1024×1536.
- Tâm nhân vật: `(800, 524)`. Gương và đường phối cảnh phải hướng về tâm này.
- Không đặt đồ vật foreground lên mặt, cổ, bàn tay, tà áo hoặc bàn chân.
- Tất cả plate của một cảnh phải xuất từ cùng một master composite và có cùng canvas; không tạo bốn góc máy độc lập rồi ghép.

## 3. Phân lớp và ranh giới alpha

### 3.1 Cảnh gallery và phòng thử

| Lớp | Render | Nội dung được phép | Nội dung không được phép |
| --- | ---: | --- | --- |
| `background` | 0 | Tường xanh sứ, cửa sổ trái, sàn, bóng môi trường tĩnh | Giá treo, mannequin, nhân vật, chữ |
| `midground` | 10 | Gallery: ba bệ/trưng bày; phòng thử: khung gương, bàn may phía sau | Đồ vật che nhân vật, chữ hoặc nút |
| `foreground` | 30 | Mép vải/rèm ở 10% ngoài cùng và góc bàn thấp | Mặt, cổ, tay, thân áo, đường viền tà |
| `light` | 35 | Mảng sáng cửa sổ mềm, alpha thấp | Đổi sắc màu trang phục, hạt chuyển động |

`background.png` là RGB/RGBA nhưng phải phủ kín canvas. Ba plate còn lại phải có alpha thật; pixel ngoài vật thể có alpha 0, không dùng nền caro được vẽ vào ảnh.

### 3.2 Nhân vật và trang phục

| Layer ID | Render | Ranh giới bắt buộc |
| --- | ---: | --- |
| `base` | 20 | Da, mặt, tóc, bàn tay, bàn chân và lớp nền kín đáo. Không chứa áo dài, quần, kiềng hoặc mấn. |
| `pants` | 25 | Quần từ eo đến mắt cá/bàn chân, nằm sau hai tà áo. Alpha 0 phía trên eo và ngoài quần. |
| `torso` | 40 | Cổ áo, tay áo, thân và hai tà dài. Không chứa da, tóc, bàn tay, quần hoặc phụ kiện. Mép cổ/vai/eo khớp anchor. |
| `necklace` | 50 | Chỉ kiềng và bóng đổ nội tại rất nhẹ; không chứa cổ, da hoặc cổ áo. |
| `headpiece` | 60 | Chỉ mấn và bóng tiếp xúc; không chứa tóc, trán hoặc nền. |

Hai lớp `pants` và `torso` là bắt buộc. `necklace` và `headpiece` là hai lựa chọn độc lập. Khi tắt cả hai, áo và quần vẫn tạo thành một bản phối hoàn chỉnh, kín đáo.

## 4. Bộ tài sản xuất bản

Tệp nguồn/generation master nằm ngoài `public/`. Chỉ derivative đã duyệt mới được đưa vào các đường dẫn dưới đây.

### 4.1 Plate cảnh

```text
public/assets/scenes/gallery/background.png
public/assets/scenes/gallery/midground.png
public/assets/scenes/gallery/foreground.png
public/assets/scenes/gallery/light.png
public/assets/scenes/gallery/scene.json

public/assets/scenes/ao_dai/background.png
public/assets/scenes/ao_dai/midground.png
public/assets/scenes/ao_dai/foreground.png
public/assets/scenes/ao_dai/light.png
public/assets/scenes/ao_dai/scene.json
```

`scene.json` phải ghi `sceneId`, canvas 1600×1000, từng layer với `assetPath`, `renderOrder`, `width`, `height`, và crop mobile. Gallery giữ toàn bộ khung 16:10. Phòng thử dùng crop 4:5 cố định:

```json
{
  "desktopCrop": { "x": 0, "y": 0, "width": 1600, "height": 1000 },
  "mobileCrop": { "x": 400, "y": 0, "width": 800, "height": 1000 },
  "characterBounds": { "x": 584, "y": 200, "width": 432, "height": 648 }
}
```

### 4.2 Hai màu áo dài

Giữ ID hiện có `ao_dai/red`; thêm biến thể `ao_dai/indigo` ở bước schema/runtime sau.

```text
public/assets/garments/ao_dai/red/pants.png
public/assets/garments/ao_dai/red/torso.png
public/assets/garments/ao_dai/red/necklace.png
public/assets/garments/ao_dai/red/headpiece.png
public/assets/garments/ao_dai/red/garment.json

public/assets/garments/ao_dai/indigo/pants.png
public/assets/garments/ao_dai/indigo/torso.png
public/assets/garments/ao_dai/indigo/necklace.png
public/assets/garments/ao_dai/indigo/headpiece.png
public/assets/garments/ao_dai/indigo/garment.json
```

- `red`: nhãn UI đề xuất **Đỏ son**, màu chủ đạo gần Lacquer `#8D3D50`; quần Porcelain. Không gắn ý nghĩa lịch sử cho màu.
- `indigo`: nhãn UI đề xuất **Lam chàm**, màu chủ đạo gần Indigo `#354D80`; quần Porcelain. Đây là lựa chọn phối đương đại cho demo.
- Hình dáng, nếp gấp và motif giữa hai màu phải trùng nhau ở cấp pixel; chỉ vùng vật liệu/màu được thay đổi. Không dùng CSS `hue-rotate`.
- Hai phụ kiện: **Kiềng bạc tối giản** (`necklace`) và **mấn đồng màu** (`headpiece`). Tên cuối cùng cần người duyệt văn hóa xác nhận; không dùng từ “hoàng gia”, triều đại hoặc phẩm cấp khi chưa có nguồn.

## 5. Quy trình tạo và prompt chuẩn

Sử dụng công cụ image generation tích hợp, một lời gọi cho mỗi tài sản/biến thể. Với ảnh local dùng làm reference/edit target, xem ảnh trước bằng `view_image`. Xuất bản không phá hủy: tạo tên phiên bản mới trong vùng nguồn, chỉ thay derivative sau khi qua gate.

### P01 — master gallery

```text
Use case: stylized-concept
Asset type: master cảnh gallery website, dùng để tách plate
Primary request: căn atelier Việt phục đương đại trong ánh sáng ban ngày xanh dịu, có ba vùng trưng bày cân bằng cho áo dài, áo Nhật Bình và áo giao lĩnh; riêng vùng áo dài ở tâm xấp xỉ 22% chiều rộng
Scene/backdrop: tường xanh sứ, cửa sổ bên trái, sàn sạch, giá/bệ trưng bày thanh mảnh, khoảng trống rõ cho nhãn DOM ở y=84%
Style/medium: anime 2D cel shading cao cấp, nét viền tiết chế, mảng sáng tối phẳng
Composition/framing: 1600×1000, góc máy ngang tầm mắt, phối cảnh nông; ba display zone rộng 20% và cao 62% quanh các tâm (22%,54%), (50%,48%), (78%,54%)
Lighting/mood: ban ngày yên tĩnh, ánh sáng chính từ trái
Color palette: #F3F7FA #20334A #354D80 #356557, chi tiết đồng #B18A46 tiết chế
Constraints: không có người; không có chữ, logo, watermark; kiến trúc đương đại, không tuyên bố phục dựng lịch sử; giữ vùng trung tâm từng trang phục sạch
Avoid: motif văn hóa trang trí tùy tiện, hạt sáng, neon, gradient, đồ vật che display zone
```

Từ master đã duyệt, tách `background`, `midground`, `foreground`, `light` bằng các lượt precise-object-edit/background-extraction. Lặp lại invariant: giữ nguyên canvas, phối cảnh, màu và vị trí; thay đổi duy nhất phạm vi lớp cần tách.

### P02 — master phòng thử áo dài

```text
Use case: precise-object-edit
Asset type: master phòng thử áo dài website, dùng để tách plate
Primary request: chuyển vùng áo dài của master gallery thành phòng thử cùng kiến trúc; thêm khung gương và bàn may phía sau, giữ một trường sạch cho nhân vật
Input images: Image 1 là master gallery đã duyệt, tham chiếu bắt buộc về kiến trúc, góc máy, bảng màu và hướng sáng
Scene/backdrop: atelier bên ô cửa; gương hướng về tâm (800,524); đồ vật nằm ngoài characterBounds x=584 y=200 w=432 h=648
Style/medium: giữ nguyên anime 2D cel shading của Image 1
Composition/framing: 1600×1000; mọi nội dung chính vẫn đọc được trong crop mobile x=400 y=0 w=800 h=1000
Constraints: thay đổi không gian trưng bày thành phòng thử; giữ kiến trúc, camera, ánh sáng và palette; không vẽ nhân vật, trang phục, chữ, logo hoặc watermark
Avoid: foreground che characterBounds, gương phản chiếu một nhân vật giả, đổi góc máy
```

### P03 — composite áo dài đỏ trên pose chuẩn

```text
Use case: identity-preserve
Asset type: composite chuẩn để tách lớp trang phục 1024×1536
Primary request: mặc cho nhân vật một bản phối áo dài đỏ son với quần sáng màu, kiềng bạc tối giản và mấn đồng màu
Input images: Image 1 là base_01, edit target và reference bắt buộc về danh tính, tỷ lệ cơ thể, pose, anchor và canvas
Subject: giữ nguyên mặt, tóc, da, tay, chân, tư thế và biểu cảm; áo cổ cao gọn, tay dài, thân áo và hai tà dài rõ ràng, mặc ngoài quần
Style/medium: anime 2D cel shading, nét và hướng sáng khớp Image 1
Composition/framing: 1024×1536, toàn thân, không crop, mọi bộ phận ở đúng vị trí Image 1
Color palette: áo gần #8D3D50; quần gần #F3F7FA; phụ kiện bạc trung tính
Constraints: thay đổi duy nhất trang phục/phụ kiện; không đổi camera, pose, cơ thể, mặt, tóc hoặc canvas; không chữ, logo, watermark
Avoid: cổ áo giao lĩnh, mảng trang trí phẩm cấp/triều đại chưa kiểm chứng, giáp fantasy, tay che tà áo, nếp vải nhiễu, lỗi thừa ngón
```

Sau khi composite được duyệt, tách bốn lớp theo bảng ranh giới alpha. Không yêu cầu mô hình tự “vẽ lại” từng lớp độc lập. So sánh composite tái ghép với composite nguồn ở native resolution.

### P04 — biến thể lam chàm

```text
Use case: precise-object-edit
Asset type: biến thể màu áo dài 1024×1536
Primary request: đổi riêng vật liệu áo từ đỏ son sang lam chàm #354D80
Input images: Image 1 là composite áo dài đỏ đã duyệt, edit target; Image 2 là base_01, reference khóa pose và danh tính
Constraints: chỉ đổi màu vùng torso và mấn; giữ nguyên từng pixel về pose, silhouette, đường may, nếp gấp, motif đã duyệt, quần, kiềng, da, tóc, ánh sáng và alpha; không chữ, logo, watermark
Avoid: hue spill lên da/quần/phụ kiện, thay hình dáng, thêm motif
```

Nếu P04 làm lệch silhouette quá 1 px hoặc đổi chi tiết, loại kết quả và thực hiện recolor có mask trên derivative đã duyệt; không sửa runtime bằng bộ lọc màu.

## 6. Hướng dẫn crop và responsive

- Desktop/tablet gallery: dùng toàn bộ `0,0,1600,1000` theo contain; vùng letterbox dùng Porcelain.
- Mobile gallery dưới 768 px: vẫn hiển thị toàn bộ khung 16:10; các nút trang phục nằm trong DOM bên dưới, không nằm trong ảnh.
- Mobile phòng thử: dùng crop `400,0,800,1000` (4:5). Nhân vật phải hiện toàn thân trong crop. Gương, ánh sáng chính và ít nhất một dấu hiệu nhận diện căn phòng phải nằm trong crop này.
- Không tự động crop theo face detection. Tất cả plate và lớp nhân vật dùng chung transform. Không phóng to riêng áo/phụ kiện để bù sai alignment.
- Ở stage thấp, `max-height: 55svh`; nội dung có thể thu đồng nhất nhưng không cắt tà áo hoặc bàn chân.

## 7. Guard văn hóa

- Không gọi căn phòng là cung đình, nhà Nguyễn hoặc phục dựng lịch sử.
- Không ghi một màu, motif hay phụ kiện là “truyền thống”, “hoàng gia”, “đúng thời Nguyễn” nếu chưa có nguồn và review tương ứng.
- Giữ silhouette áo dài dễ nhận biết: cổ gọn, thân dài, hai tà và quần tách lớp rõ. Mọi thay đổi làm mất các dấu hiệu này phải hiện cảnh báo ngữ cảnh, không gắn nhãn phán xét người dùng.
- Không trộn cổ giao lĩnh, bố cục áo Nhật Bình, huy hiệu phẩm cấp, giáp fantasy hoặc biểu tượng tôn giáo vào lát cắt này.
- Motif hoa chỉ được duyệt như trang trí minh họa nếu không có tuyên bố nguồn gốc/ý nghĩa. Không dùng motif thay cho thông tin văn hóa có nguồn.
- Người duyệt hình ảnh kiểm tra thẩm mỹ và kỹ thuật; người duyệt văn hóa kiểm tra tên gọi, silhouette, motif, phụ kiện và mọi câu chữ. Hai vai trò phải ký độc lập trong ledger.

## 8. Gate nghiệm thu ở native resolution

Một tài sản chỉ chuyển `approved` khi tất cả mục sau đạt:

1. **Kích thước:** room đúng 1600×1000; nhân vật/lớp đúng 1024×1536; không có resize lẻ.
2. **Alpha:** lớp trong suốt có alpha thật; bốn góc alpha 0; không viền trắng/đen, halo hoặc nền caro; `background` phủ kín.
3. **Alignment:** cổ, vai, eo lệch tối đa 1 px giữa hai màu; không hở base ở đường cổ/vai/eo; quần nằm sau tà; phụ kiện không ăn vào da/tóc.
4. **Tái ghép:** composite từ `base + pants + torso + necklace + headpiece` khớp master đã duyệt; không có khe, double edge hoặc phần cơ thể bị nhân đôi.
5. **Chất lượng:** xem ở 100% và 200%; không sọc kéo dài, banding, pixel rác, bộ phận thừa, chữ giả hoặc watermark.
6. **Khác biệt màu:** đỏ son và lam chàm phân biệt rõ cả ở thumbnail; silhouette/motif/nếp gấp không đổi.
7. **Crop:** desktop, gallery mobile 16:10 và fitting mobile 4:5 đều giữ vùng bắt buộc; không che hoặc cắt trang phục.
8. **Văn hóa:** cultural reviewer đã duyệt tên gọi và chi tiết nhìn thấy hoặc đánh dấu rõ nội dung còn pending, không xuất copy lịch sử pending ra UI.
9. **Metadata:** mọi file được tham chiếu tồn tại; `sceneId`, garment/variant ID, `layerId`, render order, canvas và đường dẫn khớp schema.
10. **Truy vết:** ledger có prompt ID, reference với vai trò, version, checksum, người duyệt và ngày duyệt.

## 9. Thứ tự sản xuất

1. Chốt/duyệt pose `base_01` và test anchor.
2. Tạo master gallery, duyệt composition desktop/mobile, rồi tách plate.
3. Dựa trên master gallery để tạo master phòng thử, duyệt crop 4:5, rồi tách plate.
4. Tạo composite áo dài đỏ trên pose chuẩn; cultural review silhouette/motif; tách bốn lớp và kiểm tra tái ghép.
5. Tạo màu lam chàm từ composite đỏ đã duyệt; tách cùng ranh giới; kiểm tra sai khác ngoài vùng màu.
6. Điền checksum và reviewer vào [ledger](./ao-dai-asset-ledger.md); chỉ copy derivative `approved` vào `public/assets`.
