# API — Guest / Member Check-in, Reservation, QR Token

Tài liệu này mô tả toàn bộ API liên quan đến luồng **check-in** cho khách vãng lai (Guest) và khách hội viên (Member) qua QR token, cùng với API đặt chỗ (Reservation).

> Phần **check-out** (Guest lẫn Member) thuộc phạm vi của nhóm khác, không nằm trong tài liệu này.

## Quy ước chung

- Tất cả endpoint yêu cầu header `Authorization: Bearer <accessToken>`.
- Các endpoint check-in dùng `multipart/form-data` vì luôn kèm ảnh chụp.
- **5 ảnh bắt buộc** cho mỗi lần check-in: `front`, `back`, `left`, `right`, `driverFace` (kiểu file, jpg/png/webp, tối đa 5MB).
- `plateNumber` được so khớp sau khi chuẩn hoá: bỏ hết ký tự không phải chữ/số và viết hoa (VD: `51f-123.45` → `51F12345`).
- Các endpoint dưới `ReservationController` bọc response trong `ApiResponse<T>`:
  ```json
  { "code": 200, "message": "Success", "result": { ... } }
  ```
- Các endpoint Guest/Member checking, QR token trả thẳng object (không bọc `ApiResponse`).
- Khi lỗi, response body dạng:
  ```json
  { "code": <errorCode>, "message": "<mô tả lỗi>" }
  ```

---

## 1. Guest Checking (khách vãng lai — không có tài khoản)

Base path: `/api/guest-checking`
Quyền: `STAFF`, `MANAGER`, `ADMIN`

Guest **không chọn slot cụ thể**. Hệ thống chỉ kiểm tra còn chỗ hay không bằng cách đếm số slot còn hoạt động (không phải `MAINTENANCE`/`LOCKED`) trong floor có `guestAllowed = true`, so với số Guest đang gửi (`ACTIVE`) cùng loại xe.

### 1.1. Check-in

```
POST /api/guest-checking/check-in
Content-Type: multipart/form-data
```

**Form fields:**

| Field | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `plateNumber` | string | ✅ | Biển số xe |
| `vehicleCategory` | enum | ✅ | `CAR` hoặc `MOTORCYCLE` |
| `gateCode` | string | ✅ | Mã cổng vào |
| `front` | file | ✅ | Ảnh mặt trước xe |
| `back` | file | ✅ | Ảnh mặt sau xe |
| `left` | file | ✅ | Ảnh hông trái |
| `right` | file | ✅ | Ảnh hông phải |
| `driverFace` | file | ✅ | Ảnh mặt tài xế |

**Response `201 Created`:**

```json
{
  "sessionId": 123,
  "ticketCode": "GUEST-A1B2C3D4",
  "plateNumber": "51F12345",
  "entryGate": "GATE-A",
  "status": "ACTIVE",
  "entryTime": "2026-08-24T09:00:00"
}
```

> ⚠️ `ticketCode` là **chứng từ duy nhất** khách cầm để check-out (in vé/gửi cho khách). FE phải hiển thị/lưu giá trị này để dùng ở bước check-out.

**Lỗi có thể gặp:**
| Code | Ý nghĩa |
|---|---|
| `NO_SLOT_AVAILABLE` (1034) | Floor dành cho Guest đã hết chỗ cho loại xe này |
| `GUEST_SESSION_ACTIVE_EXISTS` (1049) | Biển số này đang có 1 phiên Guest ACTIVE khác chưa checkout |

---

## 2. Reservation (đặt chỗ trước — dành cho Member)

Base path: `/api`
Quyền: `DRIVER`

### 2.1. Tạo Reservation

```
POST /api/vehicles/{vehicleId}/reservations
Content-Type: application/json
```

**Body:**

```json
{
  "slotId": 10,
  "startTime": "2026-08-24T09:00:00",
  "endTime": "2026-08-24T18:00:00"
}
```

| Field | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `slotId` | number | ✅ | Slot muốn đặt |
| `startTime` | datetime | ✅ | Giờ bắt đầu |
| `endTime` | datetime | ❌ | Giờ kết thúc (nếu bỏ trống, hệ thống áp dụng thời gian ân hạn 1 giờ kể từ `startTime` để tự huỷ nếu không check-in) |

**Response `201 Created`** (bọc `ApiResponse`):

```json
{
  "code": 200,
  "message": "Success",
  "result": {
    "id": 55,
    "vehicleId": 3,
    "plateNumber": "51F12345",
    "userId": 7,
    "slotId": 10,
    "slotCode": "A-01",
    "zoneCode": "Z1",
    "floorCode": "F1",
    "subscriptionId": 2,
    "hasActiveSubscription": true,
    "startTime": "2026-08-24T09:00:00",
    "endTime": "2026-08-24T18:00:00",
    "status": "CONFIRMED",
    "createdAt": "2026-08-23T20:00:00",
    "message": "Reservation confirmed (subscription covers this session)",
    "success": true
  }
}
```

> - `status = CONFIRMED` nếu xe có subscription ACTIVE còn hạn tại thời điểm đặt → được phép tạo QR check-in ngay.
> - `status = PENDING` nếu xe **chưa có subscription active** → chưa thể tạo QR. Khi subscription của xe được kích hoạt sau đó (thanh toán thành công), hệ thống **tự động nâng cấp** reservation này lên `CONFIRMED` (không cần FE gọi thêm API nào).
> - Nếu reservation `PENDING` quá hạn (`endTime` đã qua, hoặc không có `endTime` và quá 1 giờ kể từ `startTime`) mà vẫn chưa có subscription → hệ thống tự động chuyển sang `EXPIRED` và giải phóng slot (chạy ngầm mỗi 5 phút).

**Lỗi có thể gặp:** `VEHICLE_NOT_EXISTED`, `VEHICLE_NOT_ACTIVE` (1061 — xe bị banned/inactive), `RESERVATION_ACTIVE_EXISTS`, `SLOT_NOT_EXISTED`, `SLOT_NOT_AVAILABLE`, `VEHICLE_TYPE_NOT_EXISTED`.

### 2.2. Danh sách Reservation của tôi

```
GET /api/reservations
```

**Response `200 OK`:** `ApiResponse<List<ReservationResponse>>` (cấu trúc từng phần tử giống mục 2.1).

### 2.3. Huỷ Reservation

```
PUT /api/reservations/{reservationId}/cancel
```

**Response `200 OK`:** `ApiResponse<ReservationResponse>` với `status = CANCELLED`, slot được trả về `AVAILABLE`.

**Lỗi có thể gặp:** `RESERVATION_NOT_EXISTED`, `ACCESS_DENIED` (không phải chủ reservation), `RESERVATION_CANNOT_CANCEL` (1035 — reservation đã `USED`/`EXPIRED`/`CANCELLED`, không thể huỷ nữa).

---

## 3. QR Token (Member dùng để check-in)

Base path: `/api/reservations`
Quyền: `DRIVER`

### 3.1. Tạo QR token để check-in

```
POST /api/reservations/{reservationId}/qr-token
```

**Điều kiện:** reservation phải `CONFIRMED`, có subscription `ACTIVE` còn hạn, và thời gian hiện tại phải nằm trong khoảng `[startTime, endTime)` của reservation.

**Response `201 Created`:**

```json
{
  "token": "b3f1c9a0-....-uuid",
  "reservationId": 55,
  "vehicleId": 3,
  "plateNumber": "51F12345",
  "expiresAt": "2026-08-24T09:05:00"
}
```

> ⚠️ **QR token chỉ sống 5 phút và dùng được đúng 1 lần.** FE nên hiển thị QR ngay lập tức và có countdown 5 phút; hết hạn phải gọi lại API này để tạo token mới.

**Lỗi có thể gặp:**
| Code | Ý nghĩa |
|---|---|
| `RESERVATION_NOT_EXISTED` (1032) | Reservation không tồn tại hoặc không thuộc về user |
| `SUBSCRIPTION_NOT_ACTIVE` (1031) | Xe chưa có subscription active phù hợp |
| `RESERVATION_NOT_IN_TIME_WINDOW` (1062) | Chưa đến giờ hoặc đã quá giờ check-in của reservation |

---

## 4. Member Checking (check-in bằng QR — staff thao tác tại cổng)

Base path: `/api/member-checking`
Quyền: `STAFF`, `MANAGER`, `ADMIN`

### 4.1. Check-in

```
POST /api/member-checking/check-in?entryGate=GATE-A
Content-Type: multipart/form-data
```

**Query param:** `entryGate` (bắt buộc) — mã cổng vào.

**Form fields:**

| Field | Kiểu | Bắt buộc | Ghi chú |
|---|---|---|---|
| `qrToken` | string | ✅ | QR mà Member vừa tạo/quét |
| `currentPlateNumber` | string | ✅ | Biển số staff đọc thực tế tại cổng (so khớp với biển số đã đăng ký) |
| `front` | file | ✅ | |
| `back` | file | ✅ | |
| `left` | file | ✅ | |
| `right` | file | ✅ | |
| `driverFace` | file | ✅ | |

**Response `201 Created`:**

```json
{
  "sessionId": 200,
  "ticketCode": "MEMBER-9F8E7D6C",
  "reservationId": 55,
  "vehicleId": 3,
  "registeredPlateNumber": "51F12345",
  "currentPlateNumber": "51F12345",
  "plateMatchStatus": "MATCHED",
  "slotId": 10,
  "entryGate": "GATE-A",
  "status": "ACTIVE",
  "entryTime": "2026-08-24T09:01:00"
}
```

**Lỗi có thể gặp:**
| Code | Ý nghĩa |
|---|---|
| `QR_TOKEN_NOT_EXISTED` (1051) | Token sai/không tồn tại |
| `QR_TOKEN_EXPIRED` (1052) | Token đã quá 5 phút |
| `QR_TOKEN_ALREADY_USED` (1053) | Token đã được dùng để check-in trước đó |
| `RESERVATION_NOT_EXISTED` (1032) | Reservation gắn với token không hợp lệ/không CONFIRMED |
| `SLOT_NOT_AVAILABLE` (1043) | Slot của reservation không ở trạng thái RESERVED |
| `RESERVATION_ACTIVE_EXISTS` (1033) | Reservation này đã có 1 session ACTIVE khác |
| `VEHICLE_NOT_ACTIVE` (1061) | Xe đang bị banned/inactive |
| `SUBSCRIPTION_NOT_ACTIVE` (1031) | Subscription hết hạn ngay tại thời điểm check-in (double-check) |
| `PLATE_MISMATCH` (1054) | Biển số thực tế không khớp biển số đã đăng ký |

---

## 5. Bảng mã lỗi liên quan (ErrorCode)

| Code | Tên | HTTP Status | Ý nghĩa |
|---|---|---|---|
| 1010 | `VEHICLE_NOT_EXISTED` | 404 | Xe không tồn tại / không thuộc về user |
| 1031 | `SUBSCRIPTION_NOT_ACTIVE` | 404 | Không có subscription active phù hợp |
| 1032 | `RESERVATION_NOT_EXISTED` | 404 | Reservation không tồn tại/không hợp lệ |
| 1033 | `RESERVATION_ACTIVE_EXISTS` | 400 | Xe/reservation đã có phiên active khác |
| 1034 | `NO_SLOT_AVAILABLE` | 400 | Hết chỗ phù hợp |
| 1035 | `RESERVATION_CANNOT_CANCEL` | 400 | Không thể huỷ ở trạng thái hiện tại |
| 1043 | `SLOT_NOT_AVAILABLE` | 409 | Slot không ở trạng thái phù hợp |
| 1049 | `GUEST_SESSION_ACTIVE_EXISTS` | 400 | Guest với biển số này đang có phiên active |
| 1051 | `QR_TOKEN_NOT_EXISTED` | 404 | QR token không tồn tại |
| 1052 | `QR_TOKEN_EXPIRED` | 400 | QR token hết hạn (>5 phút) |
| 1053 | `QR_TOKEN_ALREADY_USED` | 400 | QR token đã được dùng |
| 1054 | `PLATE_MISMATCH` | 400 | Biển số không khớp |
| 1061 | `VEHICLE_NOT_ACTIVE` | 400 | Xe bị banned/inactive |
| 1062 | `RESERVATION_NOT_IN_TIME_WINDOW` | 400 | Ngoài khung giờ check-in của reservation |

---

## 6. Ghi chú vận hành cho FE

- **Guest**: chỉ cần biển số + loại xe, không chọn slot. `ticketCode` trả về sau check-in là chứng từ của phiên gửi xe (dùng cho các bước sau, kể cả check-out do nhóm khác xử lý).
- **Member**: luồng là `tạo Reservation` → `tạo QR token` (khi tới giờ, còn hạn 5 phút) → `staff quét QR + đọc biển số thực tế để check-in`.
- Ảnh luôn là 5 file bắt buộc theo đúng field name, thiếu 1 trong 5 sẽ bị từ chối (lỗi `INVALID_IMAGE` — 1015).
- Ảnh được lưu trên Cloudinary, `file_path` trả về (nếu FE có endpoint xem ảnh sau này) sẽ là URL `https://...cloudinary.../...`, không phải path nội bộ server.
