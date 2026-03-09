## OpenSpec: Video Tab → Carousel + Player

### 1. Input

- **Nguồn dữ liệu video**
  - **Video item ID**: định danh duy nhất của video (string).
  - **Tiêu đề**: tiêu đề video (string, bắt buộc).
  - **Thumbnail URL**: ảnh đại diện 16:9 chất lượng đủ lớn (string, bắt buộc nếu có).
  - **Nguồn**: tên nguồn (YouTube, TikTok, MXH khác…) (string).
  - **URL phát video**: link đầy đủ tới video (string, bắt buộc).
  - **Thời gian xuất bản**: `publishedAt` ISO string (tùy chọn).
  - **Thông tin địa lý (nếu có)**:
    - `lat` / `lng` (number, tùy chọn).
    - `placeName` (string, tùy chọn, mô tả vị trí video).

- **Ngữ cảnh UI**
  - Người dùng đang ở **MapPage**, tab **Video** được chọn.
  - Bản đồ đang hiển thị với các marker video (nếu có tọa độ).
  - Kích thước viewport có thể thay đổi (desktop, laptop; tối ưu trước cho desktop).

### 2. Output

- **Giao diện tab Video mới**
  - **Thay vì danh sách chữ dọc**, UI hiển thị:
    - Một **dải Carousel ngang** (thanh trượt) nằm ở **đáy màn hình**, chiếm chiều rộng gần full width.
    - Mỗi item trong Carousel hiển thị thumbnail lớn, tiêu đề ngắn gọn, nguồn, thời gian.
  - **Hành vi hover**:
    - Khi rê chuột vào một thumbnail, player preview dạng nhỏ phát **tự động**:
      - Không có âm thanh (`muted = true`).
      - Loop ngắn, hoặc ảnh động/snapshot nếu nguồn không hỗ trợ preview.
  - **Hành vi click**:
    - Khi người dùng click vào một video:
      - Bản đồ **flyTo** đến vị trí video nếu `lat/lng` có sẵn.
      - Một **Video Player hiện đại** xuất hiện ở giữa màn hình.
      - Nền phía sau bị làm tối + mờ (`backdrop blur`) để tạo hiệu ứng điện ảnh.

- **Trạng thái hệ thống**
  - State UI lưu:
    - `selectedVideoId` hoặc `activeVideo` (video đang được focus/chơi).
    - Trạng thái mở/đóng player full-screen overlay.
  - Không yêu cầu thay đổi thêm API backend, sử dụng cùng dữ liệu `VideoItem` hiện có.

### 3. Business Logic

- **3.1. Chuyển tab sang Video**
  - Khi `tab = 'video'`:
    - Thay vì render danh sách `<button>` dọc, render **Carousel component**:
      - Nhận vào mảng `videos: VideoItem[]`.
      - Quản lý index hiện tại (scroll ngang).
    - Nếu không có video:
      - Hiển thị message nhẹ nhàng “Chưa có video trong khoảng thời gian này”.

- **3.2. Hover để xem preview**
  - Khi hover một item video:
    - UI:
      - Tăng nhẹ scale/đổ bóng thumbnail để tạo cảm giác focus.
      - Kích hoạt preview:
        - Nếu player hỗ trợ (ví dụ `<video>` với source preview hoặc ảnh động):
          - Tự động play ở chế độ muted, auto-loop.
        - Nếu không, có thể fallback:
          - Hiển thị overlay icon “play” + animate shimmer trên thumbnail.
    - Business rule:
      - Hover rời khỏi item → dừng preview (pause hoặc hide overlay).
      - Không auto-fetch thêm thông tin nặng nề (tránh gọi API mới chỉ vì hover).

- **3.3. Click để mở player + flyTo**
  - Khi click vào một video item trong Carousel:
    - Cập nhật state:
      - `selectedId = video.id`.
      - `activeVideo = video` (hoặc chỉ `selectedId` để lấy lại từ list).
      - `playerOpen = true`.
    - **Map behavior**:
      - Nếu video có `lat/lng`:
        - Gọi `map.flyTo({ center: [lng, lat], zoom ≥ 8 })` trên MapLibre map.
        - Tùy chọn: highlight marker video đó (border/size khác).
      - Nếu không có `lat/lng`:
        - Không flyTo, chỉ mở player.

- **3.4. Player overlay**
  - Khi `playerOpen = true`:
    - Render overlay toàn màn hình:
      - Lớp nền mờ + tối: `backdrop-filter: blur(...)`, `background: rgba(15,23,42,0.75)` (hoặc tương đương).
      - Khối player chính ở giữa:
        - Tỉ lệ 16:9, responsive theo viewport.
        - Hiển thị:
          - Video embed (YouTube iframe, HTML5 `<video>`, v.v.).
          - Tiêu đề video.
          - Nguồn + thời gian xuất bản.
      - Nút đóng (close) rõ ràng (góc trên bên phải hoặc trên player).
    - Logic:
      - Click nút đóng hoặc click ra ngoài (vùng nền) → `playerOpen = false`.
      - ESC key cũng nên đóng player (nếu khả thi).
      - Không dừng map; map vẫn có thể pan/zoom phía sau nhưng bị mờ.

- **3.5. Điều kiện / ràng buộc nghiệp vụ**
  - Không autoplay video full player khi chuyển tab Video lần đầu (chỉ autoplay khi user click).
  - Preview hover **luôn muted**, không tự bật âm thanh.
  - Khi network chậm hoặc embed không load:
    - Hiển thị trạng thái loading/thông báo lỗi trong vùng player thay vì để trống.

### 4. UI Constraints

- **4.1. Bố cục Carousel**
  - Vị trí:
    - Nằm ở **phần dưới màn hình**, không che khuất hoàn toàn bản đồ.
    - Chiều cao vừa phải (ví dụ 220–280px trên desktop).
  - Layout:
    - Các thumbnail sắp xếp ngang, có thể scroll bằng:
      - Wheel (shift+scroll), drag, hoặc nút điều hướng trái/phải.
    - Luôn hiển thị 1–3 video nổi bật ở giữa (tùy chiều rộng màn hình).

- **4.2. Trải nghiệm “điện ảnh”**
  - Màu sắc:
    - Nền tối, gradient, đổ bóng nhẹ để tạo cảm giác depth.
  - Animation:
    - Hover thumbnail: scale ~1.03–1.05, transition mượt (150–200ms).
    - Mở/đóng player:
      - Fade-in + scale-in nhẹ cho player.
      - Fade-out mượt khi đóng.

- **4.3. Khả năng tương thích**
  - Ưu tiên desktop Chrome/Edge/Firefox mới.
  - Trên màn hình nhỏ hoặc khi không đủ chiều cao:
    - Carousel có thể chuyển sang dạng list dọc đơn giản hơn (fallback), nhưng vẫn giữ:
      - Click = mở player overlay.
      - FlyTo map khi có tọa độ.

- **4.4. Khả năng mở rộng**
  - Sau này có thể:
    - Hỗ trợ **auto-play playlist** (khi xem xong video này, gợi ý video tiếp theo trong Carousel).
    - Thêm tag/filter ngay trên Carousel (theo nguồn, chủ đề…).
  - OpenSpec này chỉ mô tả **luồng UI/UX chính**: tab Video → Carousel → preview hover → click mở player + flyTo.
