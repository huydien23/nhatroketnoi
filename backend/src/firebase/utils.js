import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";

import {
  set,
  ref,
  get,
  push,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
} from "firebase/database";

import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { auth, database, storage } from "./config";

// AUTH FUNCTIONS
export const registerUser = async (email, password, userData) => {
  try {
    // Tạo tài khoản mới
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Cập nhật thông tin người dùng (displayName, photoURL nếu có)
    await updateProfile(user, {
      displayName: userData.displayName,
      photoURL: userData.photoURL || null,
    });

    // Lưu thông tin chi tiết vào Realtime Database
    const userDbRef = ref(database, `users/${user.uid}`);
    await set(userDbRef, {
      ...userData,
      uid: user.uid,
      email: user.email,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Gửi email xác thực nếu cần
    if (userData.sendVerificationEmail) {
      await sendEmailVerification(user);
    }

    return { success: true, user };
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return { success: false, error: error.code, message: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Cập nhật thời gian đăng nhập cuối
    const userDbRef = ref(database, `users/${user.uid}`);
    await update(userDbRef, {
      lastLogin: Date.now(),
    });

    return { success: true, user };
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return { success: false, error: error.code, message: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    return { success: false, error: error.code, message: error.message };
  }
};

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Lỗi reset password:", error);
    return { success: false, error: error.code, message: error.message };
  }
};

// DATABASE FUNCTIONS
export const addDocument = (collection, data) => {
  try {
    const collectionRef = ref(database, collection);
    const newDocRef = push(collectionRef);
    set(newDocRef, {
      ...data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      id: newDocRef.key,
    });
    return { success: true, id: newDocRef.key };
  } catch (error) {
    console.error("Lỗi thêm dữ liệu:", error);
    return { success: false, error };
  }
};

export const setDocument = (path, data) => {
  try {
    const docRef = ref(database, path);
    set(docRef, {
      ...data,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Lỗi đặt dữ liệu:", error);
    return { success: false, error };
  }
};

export const updateDocument = (path, data) => {
  try {
    const docRef = ref(database, path);
    update(docRef, {
      ...data,
      updatedAt: Date.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Lỗi cập nhật dữ liệu:", error);
    return { success: false, error };
  }
};

export const deleteDocument = (path) => {
  try {
    const docRef = ref(database, path);
    remove(docRef);
    return { success: true };
  } catch (error) {
    console.error("Lỗi xóa dữ liệu:", error);
    return { success: false, error };
  }
};

export const getDocument = async (path) => {
  try {
    const docRef = ref(database, path);
    const snapshot = await get(docRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, data: null };
    }
  } catch (error) {
    console.error("Lỗi đọc dữ liệu:", error);
    return { success: false, error };
  }
};

export const queryDocuments = async (path, fieldName, value) => {
  try {
    const collectionRef = ref(database, path);
    const queryRef = query(
      collectionRef,
      orderByChild(fieldName),
      equalTo(value)
    );
    const snapshot = await get(queryRef);

    if (snapshot.exists()) {
      // Chuyển đổi snapshot thành mảng
      const data = [];
      snapshot.forEach((childSnapshot) => {
        data.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      return { success: true, data };
    } else {
      return { success: true, data: [] };
    }
  } catch (error) {
    console.error("Lỗi truy vấn dữ liệu:", error);
    return { success: false, error };
  }
};

export const listenToDocument = (path, callback) => {
  const docRef = ref(database, path);
  const unsubscribe = onValue(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({ success: true, data: snapshot.val() });
      } else {
        callback({ success: false, data: null });
      }
    },
    (error) => {
      callback({ success: false, error });
    }
  );

  // Trả về hàm để hủy lắng nghe
  return unsubscribe;
};

// STORAGE FUNCTIONS
export const uploadFile = async (path, file, metadata = {}) => {
  try {
    const fileRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file, metadata);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Tiến trình upload
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload progress: " + progress + "%");
        },
        (error) => {
          // Xử lý lỗi
          console.error("Upload error:", error);
          reject({ success: false, error });
        },
        async () => {
          // Hoàn thành
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            url: downloadURL,
            path: path,
            metadata: uploadTask.snapshot.metadata,
          });
        }
      );
    });
  } catch (error) {
    console.error("Lỗi upload file:", error);
    return { success: false, error };
  }
};

export const deleteFile = async (path) => {
  try {
    const fileRef = storageRef(storage, path);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error("Lỗi xóa file:", error);
    return { success: false, error };
  }
};

export const getFileURL = async (path) => {
  try {
    const fileRef = storageRef(storage, path);
    const url = await getDownloadURL(fileRef);
    return { success: true, url };
  } catch (error) {
    console.error("Lỗi lấy URL file:", error);
    return { success: false, error };
  }
};
