## OpenSpec: News → Incident Flow

### 1. Input

- **Nguồn dữ liệu tin tức**
  - **News item ID**: định danh duy nhất của tin trong hệ thống (string).
  - **Tiêu đề**: ví dụ `"Xe container bốc cháy trên cao tốc Long Thành – Dầu Giây"` (string, bắt buộc).
  - **Mô tả / nội dung rút gọn**: đoạn mô tả chi tiết hơn (string, tùy chọn).
  - **Link gốc**: URL bài báo (string, bắt buộc).
  - **Thời gian xuất bản**: `publishedAt`/`pubDate` ISO string (tùy chọn).
  - **Thông tin địa lý (nếu có)**:
    - `lat` / `lng` (number, tùy chọn).
    - `placeName` (string, tùy chọn, ví dụ: `"Cao tốc Long Thành – Dầu Giây"`).

- **Ngữ cảnh UI**
  - Người dùng đang ở **MapPage**, tab **Tin tức**.
  - Người dùng thực hiện thao tác **nhấn chuột phải (context menu)** trên một item tin tức trong danh sách.
  - Bản đồ 2D/3D đang hiển thị với center/zoom bất kỳ.

### 2. Output

- **Sự cố mới (Incident) được tạo trong hệ thống**
  - **Incident ID**: sinh mới từ backend (string).
  - **Title**: mặc định lấy từ `news.title`, cho phép người dùng chỉnh sửa trước khi submit.
  - **Description**: gợi ý từ `news.description` hoặc rỗng, cho phép chỉnh sửa.
  - **Source**:
    - `sourceType = 'news'`.
    - `sourceId = news.id`.
    - `sourceUrl = news.link`.
  - **Location**:
    - Nếu trích xuất được tọa độ: `lat`, `lng` (number).
    - Nếu không trích xuất được: tạm thời `lat`/`lng` = `null`, yêu cầu người dùng chọn trên bản đồ.
  - **Severity / Category**: giá trị mặc định theo config (ví dụ `severity = 'medium'`, `category = 'traffic'`), người dùng có thể sửa trong form.

- **Cập nhật UI**
  - Hiển thị **modal / side-panel "Tạo sự kiện"**:
    - Pre-fill các trường từ tin tức.
    - Hiển thị cảnh báo/note nếu chưa có vị trí.
  - **Đặt marker sự cố trên bản đồ**:
    - Nếu có `lat`/`lng`: hiển thị icon sự cố ngay tại tọa độ đó (3D hoặc 2D tùy mode hiện tại).
    - Nếu chưa có `lat`/`lng`: hiển thị trạng thái “đang chờ chọn vị trí” và chỉ hiển thị marker sau khi người dùng click chọn.

### 3. Business Logic

- **3.1. Trigger tạo sự cố**
  - Sự kiện khởi tạo: người dùng **right-click** vào 1 news item trên UI.
  - Hệ thống:
    - Lấy đầy đủ object tin tức từ state (`id`, `title`, `description`, `link`, `lat`, `lng`, `placeName`, `publishedAt`, `source`, ...).
    - Gửi sự kiện nội bộ `OPEN_INCIDENT_CREATE_FROM_NEWS(news)` cho layer domain/UI.

- **3.2. Trích xuất tọa độ / địa điểm**
  - **Nếu news đã có `lat`/`lng`**:
    - Dùng trực tiếp các giá trị này cho incident location.
    - Map fly-to: camera dịch đến `[lng, lat]` với zoom tối thiểu (ví dụ `zoom >= 10`).
  - **Nếu news chưa có `lat`/`lng` nhưng có `placeName`**:
    - Thực hiện geocoding best-effort (nếu hệ thống có geo service):
      - Gọi service `geocode(placeName)` → trả về `(lat, lng)` hoặc `null`.
      - Nếu thành công: dùng kết quả để pre-fill vị trí.
      - Nếu thất bại: rơi xuống nhánh “không có địa điểm rõ ràng”.
  - **Nếu không có địa điểm rõ ràng**:
    - Không gọi bất kỳ geocoding nào khác ngoài scope (tránh chậm UI).
    - Đặt cờ `needsManualLocation = true`.
    - Không lưu incident cho đến khi người dùng chọn vị trí hợp lệ.

- **3.3. Mở form "Tạo sự kiện"**
  - Khi nhận `OPEN_INCIDENT_CREATE_FROM_NEWS`:
    - Hiển thị form với:
      - `title` = `news.title`.
      - `description` = `news.description` (nếu có).
      - `sourceUrl` = `news.link`.
      - `location`:
        - Nếu đã có `(lat, lng)` từ bước trích xuất/geocoding: hiển thị dưới dạng text + marker trên map.
        - Nếu `needsManualLocation = true`: hiển thị cảnh báo “Chưa có vị trí, hãy click chọn trên bản đồ”.
    - Trạng thái submit:
      - Nút **"Lưu sự cố"** chỉ enable khi:
        - `title` không rỗng.
        - Có `(lat, lng)` hợp lệ.

- **3.4. Đánh dấu icon sự cố trên bản đồ**
  - **Khi đã có tọa độ**:
    - Tạo một marker/feature mới với:
      - Loại: `incident`.
      - Icon: theo severity/category (ví dụ: cảnh báo giao thông màu cam/đỏ).
      - Liên kết với `incidentId` (sau khi lưu) hoặc trạng thái tạm nếu chưa lưu.
    - Map behavior:
      - Nếu đang ở chế độ 3D: render marker trên bề mặt globe/terrain.
      - Nếu đang ở chế độ 2D: render marker trên map thường.
  - **Khi chưa có tọa độ (manual mode)**:
    - Đăng ký listener cho **click trên map**:
      - Click đầu tiên trên map:
        - Gán `lat`/`lng` cho incident draft.
        - Hiển thị preview marker tại vị trí đó.
        - Enable nút “Lưu sự cố”.
      - Cho phép user đổi vị trí bằng cách click lại (tùy yêu cầu tương lai).

- **3.5. Ràng buộc / điều kiện đặc biệt**
  - Nếu tin tức không có địa điểm rõ ràng (không tọa độ, không geocode được từ `placeName`):
    - **Bắt buộc** người dùng click chọn vị trí trên map trước khi cho phép lưu.
    - Không được ghi nhận incident với tọa độ `(0,0)` hay giá trị mặc định vô nghĩa.
  - Nếu backend trả lỗi khi tạo incident:
    - Không xóa marker tạm ngay, cho phép người dùng chỉnh sửa và gửi lại.
    - Hiển thị thông báo lỗi chi tiết (ví dụ: thiếu field bắt buộc, quyền hạn, v.v.).

### 4. UI Constraints

- **4.1. Trải nghiệm người dùng**
  - Từ lúc right-click đến lúc form “Tạo sự kiện” hiển thị phải **nhanh, không block map**.
  - Không yêu cầu người dùng đi qua nhiều màn hình: thao tác tối đa trong **1 modal / side-panel** + map hiện tại.
  - Khi yêu cầu chọn vị trí thủ công:
    - Có hướng dẫn rõ ràng: “Click lên bản đồ để chọn vị trí sự cố”.
    - Nên có highlight/animation nhẹ ở khu vực map để user hiểu cần thao tác ở đâu.

- **4.2. Bố cục UI**
  - **Context menu** khi right-click trên news item:
    - Ít nhất có action: **“Tạo sự cố từ tin này”**.
  - **Form "Tạo sự kiện"**:
    - Trường bắt buộc: `Tiêu đề`, `Vị trí`.
    - Trường gợi ý: `Mô tả`, `Mức độ nghiêm trọng`, `Loại sự cố`.
    - Hiển thị read-only: `Nguồn tin` (tên báo) và `Link bài gốc` (click mở tab mới).
  - **Bản đồ 3D/2D**:
    - Không che khuất hoàn toàn map khi mở form; form nên là panel cạnh/overlay nửa màn hình.
    - Marker sự cố phải dễ phân biệt với marker tin tức thông thường (màu sắc/shape khác).

- **4.3. Khả năng mở rộng**
  - Cho phép sau này:
    - Gắn nhiều incident vào cùng một news (nếu tin mô tả nhiều sự cố).
    - Gắn nhiều news vào cùng một incident (nhiều báo viết về cùng sự kiện).
  - OpenSpec này chỉ mô tả **luồng đơn giản 1 news → 1 incident**; các quan hệ phức tạp hơn sẽ được mô tả ở spec khác.
