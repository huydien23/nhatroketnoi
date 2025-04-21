// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe63NDqYR2A-hUOu22S5Kr1g6vclkIcGw",
  authDomain: "nhatroketnoi-9390a.firebaseapp.com",
  projectId: "nhatroketnoi-9390a",
  storageBucket: "nhatroketnoi-9390a.appspot.com",
  messagingSenderId: "249753111607",
  appId: "1:249753111607:web:3f6d0ddaa27e34fc6683b2",
  measurementId: "G-219LR643DB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Lớp quản lý người dùng
class UserManager {
  // Lấy thông tin người dùng hiện tại
  static getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          resolve(user);
        },
        reject
      );
    });
  }

  // Lấy thông tin chi tiết người dùng từ Firestore
  static async getUserDetail(userId) {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      throw error;
    }
  }

  // Cập nhật thông tin người dùng
  static async updateUserProfile(userId, userData) {
    try {
      await updateDoc(doc(db, "users", userId), userData);
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      throw error;
    }
  }
}

// Lớp quản lý phòng trọ
class RoomManager {
  // Thêm phòng trọ mới
  static async addRoom(roomData) {
    try {
      // Thêm timestamp
      roomData.createdAt = serverTimestamp();
      roomData.updatedAt = serverTimestamp();

      // Thêm vào Firestore
      const docRef = await addDoc(collection(db, "rooms"), roomData);
      return docRef.id;
    } catch (error) {
      console.error("Lỗi khi thêm phòng trọ:", error);
      throw error;
    }
  }

  // Lấy danh sách phòng trọ
  static async getRooms(
    filters = {},
    sortBy = "createdAt",
    sortDirection = "desc",
    limit = 10,
    lastDoc = null
  ) {
    try {
      // Tạo truy vấn cơ bản
      let q = collection(db, "rooms");

      // Thêm điều kiện lọc
      const conditions = [];
      if (filters.city) {
        conditions.push(where("city", "==", filters.city));
      }
      if (filters.district) {
        conditions.push(where("district", "==", filters.district));
      }
      if (filters.minPrice && filters.maxPrice) {
        conditions.push(where("price", ">=", filters.minPrice));
        conditions.push(where("price", "<=", filters.maxPrice));
      }
      if (filters.status) {
        conditions.push(where("status", "==", filters.status));
      }

      // Thêm điều kiện sắp xếp
      conditions.push(orderBy(sortBy, sortDirection));

      // Giới hạn số lượng kết quả
      conditions.push(limit(limit));

      // Thêm phân trang nếu có
      if (lastDoc) {
        conditions.push(startAfter(lastDoc));
      }

      // Xây dựng truy vấn
      q = query(q, ...conditions);

      // Thực hiện truy vấn
      const querySnapshot = await getDocs(q);
      const rooms = [];

      // Lấy kết quả
      querySnapshot.forEach((doc) => {
        rooms.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Trả về kết quả và tài liệu cuối cùng cho phân trang
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      return {
        rooms,
        lastVisible,
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng trọ:", error);
      throw error;
    }
  }

  // Lấy chi tiết phòng trọ
  static async getRoomDetail(roomId) {
    try {
      const roomDoc = await getDoc(doc(db, "rooms", roomId));
      if (roomDoc.exists()) {
        return {
          id: roomDoc.id,
          ...roomDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết phòng trọ:", error);
      throw error;
    }
  }

  // Cập nhật thông tin phòng trọ
  static async updateRoom(roomId, roomData) {
    try {
      // Thêm thời gian cập nhật
      roomData.updatedAt = serverTimestamp();

      await updateDoc(doc(db, "rooms", roomId), roomData);
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật phòng trọ:", error);
      throw error;
    }
  }

  // Xóa phòng trọ
  static async deleteRoom(roomId) {
    try {
      await deleteDoc(doc(db, "rooms", roomId));
      return true;
    } catch (error) {
      console.error("Lỗi khi xóa phòng trọ:", error);
      throw error;
    }
  }

  // Tải hình ảnh lên Firebase Storage
  static async uploadRoomImage(file, roomId) {
    try {
      // Tạo reference đến vị trí lưu trữ
      const storageRef = ref(
        storage,
        `rooms/${roomId}/${Date.now()}_${file.name}`
      );

      // Tải file lên
      const snapshot = await uploadBytes(storageRef, file);

      // Lấy URL download
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Lỗi khi tải hình ảnh:", error);
      throw error;
    }
  }
}

// Lớp quản lý đánh giá
class ReviewManager {
  // Thêm đánh giá mới
  static async addReview(reviewData) {
    try {
      // Thêm timestamp
      reviewData.createdAt = serverTimestamp();

      // Thêm đánh giá vào Firestore
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      return docRef.id;
    } catch (error) {
      console.error("Lỗi khi thêm đánh giá:", error);
      throw error;
    }
  }

  // Lấy đánh giá của một phòng trọ
  static async getRoomReviews(roomId) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("roomId", "==", roomId),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const reviews = [];

      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return reviews;
    } catch (error) {
      console.error("Lỗi khi lấy đánh giá:", error);
      throw error;
    }
  }
}

// Lớp quản lý tin tức
class NewsManager {
  // Thêm tin tức mới
  static async addNews(newsData) {
    try {
      // Thêm timestamp
      newsData.createdAt = serverTimestamp();
      newsData.updatedAt = serverTimestamp();
      newsData.views = 0;

      // Thêm tin tức vào Firestore
      const docRef = await addDoc(collection(db, "news"), newsData);
      return docRef.id;
    } catch (error) {
      console.error("Lỗi khi thêm tin tức:", error);
      throw error;
    }
  }

  // Lấy danh sách tin tức theo danh mục
  static async getNewsByCategory(category, limitCount = 10, lastDoc = null) {
    try {
      let q = query(
        collection(db, "news"),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const news = [];

      querySnapshot.forEach((doc) => {
        news.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      return {
        news,
        lastVisible,
      };
    } catch (error) {
      console.error("Lỗi khi lấy tin tức:", error);
      throw error;
    }
  }

  // Lấy chi tiết tin tức
  static async getNewsDetail(newsId) {
    try {
      const newsDoc = await getDoc(doc(db, "news", newsId));
      if (newsDoc.exists()) {
        // Cập nhật lượt xem
        await updateDoc(doc(db, "news", newsId), {
          views: (newsDoc.data().views || 0) + 1,
        });

        return {
          id: newsDoc.id,
          ...newsDoc.data(),
        };
      }
      return null;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết tin tức:", error);
      throw error;
    }
  }
}

// Firebase Database Utils
// File này chứa các hàm tiện ích để tương tác với Firebase Realtime Database

// Kiểm tra xem Firebase đã được khởi tạo chưa
function checkFirebaseInit() {
  if (typeof firebase === "undefined" || !firebase.database) {
    console.error("Firebase chưa được khởi tạo hoặc thiếu module database!");
    return false;
  }
  return true;
}

// Lấy reference đến database
function getDatabase() {
  if (!checkFirebaseInit()) return null;
  return firebase.database();
}

// --- USER OPERATIONS ---

// Lấy thông tin người dùng bằng ID
async function getUserById(userId) {
  if (!checkFirebaseInit()) return null;

  try {
    const snapshot = await firebase
      .database()
      .ref(`users/${userId}`)
      .once("value");
    return snapshot.val();
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
}

// Cập nhật thông tin người dùng
async function updateUserProfile(userId, userData) {
  if (!checkFirebaseInit()) return false;

  try {
    await firebase.database().ref(`users/${userId}`).update(userData);
    return true;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin người dùng:", error);
    return false;
  }
}

// --- ROOM OPERATIONS ---

// Lấy tất cả phòng trọ
async function getAllRooms() {
  if (!checkFirebaseInit()) return [];

  try {
    const snapshot = await firebase.database().ref("rooms").once("value");
    const roomsData = snapshot.val();

    // Convert từ object sang array và thêm id vào mỗi phòng
    if (!roomsData) return [];

    return Object.keys(roomsData).map((key) => ({
      id: key,
      ...roomsData[key],
    }));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng:", error);
    return [];
  }
}

// Lấy thông tin chi tiết phòng từ ID
async function getRoomById(roomId) {
  if (!checkFirebaseInit()) return null;

  try {
    const snapshot = await firebase
      .database()
      .ref(`rooms/${roomId}`)
      .once("value");
    const roomData = snapshot.val();

    if (!roomData) return null;

    return {
      id: roomId,
      ...roomData,
    };
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin phòng ${roomId}:`, error);
    return null;
  }
}

// Thêm phòng mới
async function addNewRoom(roomData) {
  if (!checkFirebaseInit()) return null;

  try {
    // Thêm timestamp khi tạo
    roomData.createdAt = firebase.database.ServerValue.TIMESTAMP;

    // Tạo key mới và lưu dữ liệu
    const newRoomRef = firebase.database().ref("rooms").push();
    await newRoomRef.set(roomData);

    return newRoomRef.key; // Trả về ID của phòng vừa tạo
  } catch (error) {
    console.error("Lỗi khi thêm phòng mới:", error);
    return null;
  }
}

// Cập nhật thông tin phòng
async function updateRoom(roomId, roomData) {
  if (!checkFirebaseInit()) return false;

  try {
    // Thêm timestamp khi cập nhật
    roomData.updatedAt = firebase.database.ServerValue.TIMESTAMP;

    await firebase.database().ref(`rooms/${roomId}`).update(roomData);
    return true;
  } catch (error) {
    console.error(`Lỗi khi cập nhật phòng ${roomId}:`, error);
    return false;
  }
}

// Xóa phòng
async function deleteRoom(roomId) {
  if (!checkFirebaseInit()) return false;

  try {
    await firebase.database().ref(`rooms/${roomId}`).remove();
    return true;
  } catch (error) {
    console.error(`Lỗi khi xóa phòng ${roomId}:`, error);
    return false;
  }
}

// --- REVIEWS/RATINGS ---

// Thêm đánh giá mới cho phòng
async function addReview(roomId, userId, reviewData) {
  if (!checkFirebaseInit()) return null;

  try {
    // Thêm thông tin người đánh giá và timestamp
    reviewData.userId = userId;
    reviewData.createdAt = firebase.database.ServerValue.TIMESTAMP;

    // Tạo key mới và lưu đánh giá
    const newReviewRef = firebase
      .database()
      .ref(`rooms/${roomId}/reviews`)
      .push();
    await newReviewRef.set(reviewData);

    // Cập nhật rating trung bình của phòng
    await updateAverageRating(roomId);

    return newReviewRef.key; // Trả về ID của đánh giá vừa tạo
  } catch (error) {
    console.error(`Lỗi khi thêm đánh giá cho phòng ${roomId}:`, error);
    return null;
  }
}

// Tính và cập nhật rating trung bình của phòng
async function updateAverageRating(roomId) {
  if (!checkFirebaseInit()) return false;

  try {
    const snapshot = await firebase
      .database()
      .ref(`rooms/${roomId}/reviews`)
      .once("value");
    const reviews = snapshot.val();

    if (!reviews) {
      // Không có đánh giá nào, reset về 0
      await firebase.database().ref(`rooms/${roomId}/averageRating`).set(0);
      await firebase.database().ref(`rooms/${roomId}/reviewCount`).set(0);
      return true;
    }

    // Tính trung bình rating từ tất cả đánh giá
    const reviewsArray = Object.values(reviews);
    const sum = reviewsArray.reduce(
      (total, review) => total + (review.rating || 0),
      0
    );
    const average = sum / reviewsArray.length;

    // Cập nhật vào thông tin phòng
    await firebase.database().ref(`rooms/${roomId}/averageRating`).set(average);
    await firebase
      .database()
      .ref(`rooms/${roomId}/reviewCount`)
      .set(reviewsArray.length);

    return true;
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật rating trung bình cho phòng ${roomId}:`,
      error
    );
    return false;
  }
}

// --- SAVED/FAVORITE ROOMS ---

// Lưu phòng vào danh sách yêu thích của người dùng
async function saveRoom(userId, roomId) {
  if (!checkFirebaseInit()) return false;

  try {
    await firebase
      .database()
      .ref(`users/${userId}/savedRooms/${roomId}`)
      .set(true);
    return true;
  } catch (error) {
    console.error(`Lỗi khi lưu phòng ${roomId} vào yêu thích:`, error);
    return false;
  }
}

// Xóa phòng khỏi danh sách yêu thích
async function unsaveRoom(userId, roomId) {
  if (!checkFirebaseInit()) return false;

  try {
    await firebase
      .database()
      .ref(`users/${userId}/savedRooms/${roomId}`)
      .remove();
    return true;
  } catch (error) {
    console.error(`Lỗi khi xóa phòng ${roomId} khỏi yêu thích:`, error);
    return false;
  }
}

// Lấy danh sách phòng yêu thích của người dùng
async function getSavedRooms(userId) {
  if (!checkFirebaseInit()) return [];

  try {
    const snapshot = await firebase
      .database()
      .ref(`users/${userId}/savedRooms`)
      .once("value");
    const savedRooms = snapshot.val();

    if (!savedRooms) return [];

    // Lấy thông tin chi tiết của các phòng đã lưu
    const roomIds = Object.keys(savedRooms);
    const roomPromises = roomIds.map((id) => getRoomById(id));

    const rooms = await Promise.all(roomPromises);
    // Lọc ra những phòng hợp lệ (không null)
    return rooms.filter((room) => room !== null);
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách phòng yêu thích của người dùng ${userId}:`,
      error
    );
    return [];
  }
}

// Export các module để sử dụng trong các file khác
export {
  db,
  auth,
  storage,
  UserManager,
  RoomManager,
  ReviewManager,
  NewsManager,
};

// Export các hàm để sử dụng trong các file khác
window.dbUtils = {
  getUserById,
  updateUserProfile,
  getAllRooms,
  getRoomById,
  addNewRoom,
  updateRoom,
  deleteRoom,
  addReview,
  saveRoom,
  unsaveRoom,
  getSavedRooms,
};
