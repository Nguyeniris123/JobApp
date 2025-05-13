# Hướng dẫn khắc phục Chat với Firestore Rules mới

## Vấn đề

Khi cấu hình Firestore Rules để tăng cường bảo mật, chúng ta đã thay đổi cấu trúc quyền truy cập dữ liệu chat. Tuy nhiên, điều này dẫn đến một số vấn đề trong việc truy cập dữ liệu từ ứng dụng client:

- Các quy tắc mới sử dụng subcollection `participants` để kiểm tra quyền truy cập thay vì mảng `participants` đơn giản
- Các hàm truy vấn không hoạt động đúng với cấu trúc quy tắc mới

## Giải pháp

1. Sử dụng phiên bản `ChatService.fixed.js` của chat service:

   ```javascript
   // Thay vì import từ original file
   import ChatService from "../../services/ChatService"; 
   
   // Sử dụng fixed version
   import ChatService from "../../services/ChatService.fixed"; 
   ```

2. Cập nhật các màn hình `ChatScreen.js` cho candidate và recruiter bằng cách sử dụng phiên bản `ChatScreen.improved.js`.

   - Bạn có thể đổi tên hoặc thay thế các file hiện tại

3. Thay đổi chính trong ChatService.fixed.js:

   - Đảm bảo tạo subcollection `participants` trong phòng chat để phù hợp với Firestore rules
   - Thêm xử lý lỗi và logging để dễ debug
   - Tối ưu hóa cách truy vấn dữ liệu

## Cấu trúc dữ liệu

Cấu trúc dữ liệu mới trong Firestore:

```
chatRooms/
  {roomId}/
    recruiterId: string
    candidateId: string
    jobId: string (optional)
    lastMessage: string
    lastMessageTimestamp: timestamp
    lastSenderId: string
    
    participants/
      {userId1}/
        type: "recruiter" | "candidate"
        userId: string
        joinedAt: timestamp
      
      {userId2}/
        type: "recruiter" | "candidate" 
        userId: string
        joinedAt: timestamp
    
    messages/
      {messageId}/
        senderId: string
        text: string
        sender: "recruiter" | "candidate"
        timestamp: timestamp
        read: boolean
```

## Quy tắc Firestore mới

```
match /chatRooms/{roomId} {
  allow read, write: if request.auth != null && 
    (exists(/databases/$(database)/documents/chatRooms/$(roomId)/participants/$(request.auth.uid)));
  
  // Cho phép đọc/ghi tin nhắn trong phòng
  match /messages/{messageId} {
    allow read: if request.auth != null && 
      exists(/databases/$(database)/documents/chatRooms/$(roomId)/participants/$(request.auth.uid));
    allow create: if request.auth != null && 
      exists(/databases/$(database)/documents/chatRooms/$(roomId)/participants/$(request.auth.uid)) &&
      request.resource.data.senderId == request.auth.uid;
  }
  
  // Quản lý danh sách người tham gia
  match /participants/{userId} {
    allow read: if request.auth != null && 
      (request.auth.uid == userId || 
      exists(/databases/$(database)/documents/chatRooms/$(roomId)/participants/$(request.auth.uid)));
  }
}
```

## Kiểm tra hoạt động

1. Kiểm tra kết nối giữa ứng viên và nhà tuyển dụng
2. Kiểm tra gửi và nhận tin nhắn
3. Kiểm tra danh sách chat hiển thị đúng cho từng người dùng
