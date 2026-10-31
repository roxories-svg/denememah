import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  query, 
  orderBy, 
  limit,
  onSnapshot, 
  serverTimestamp,
  increment,
  getDocs,
  where
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { teacherProfile } from './data/teacherProfile';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCsZXdiGUxZ1oqdSkkDRhbLdTMblmxHEcA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mahirsengun-portal.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mahirhoca-75dce",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mahirhoca-75dce.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "488533930975",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:488533930975:web:4c18659ab33f3cbc2f4a6a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HLJ93ZN5JE"
};

export const isRealFirebaseConfigured = true;

let app;
let auth;
let db;
let storage;
let analytics;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined') {
    isSupported().then((yes) => {
      if (yes) analytics = getAnalytics(app);
    }).catch(() => {});
  }
} catch (err) {
  console.warn("Firebase initialization warning:", err);
}

export { app, auth, db, storage, analytics };

const SESSION_USER_KEY = 'mahirsengun_portal_session_user';

function normalizeGradeClass(gradeClass, fallback = '11-A') {
  const match = String(gradeClass || '').trim().match(/^(9|10|11|12)\s*-\s*([A-Z])/i);
  return match ? `${match[1]}-${match[2].toUpperCase()}` : fallback;
}

// Öğrenci Giriş ve Aktivite Loglama
export async function logStudentLogin(userData, activityData = null) {
  if (!userData || userData.role === 'teacher') return;

  const logPayload = {
    studentName: userData.displayName || userData.fullName || 'Öğrenci',
    studentEmail: userData.email || 'E-posta Yok',
    uid: userData.uid,
    gradeClass: normalizeGradeClass(userData.gradeClass),
    loginAt: new Date().toISOString(),
    loginDateFormatted: new Date().toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    activity: activityData || 'Portala Giriş Yapıldı',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
  };

  if (isRealFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'login_logs'), {
        ...logPayload,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn("Log kaydedilemedi:", e);
    }
  }
}

// Canlı Log Dinleyici (Admin Paneli İçin)
export function subscribeToLoginLogs(callback) {
  if (isRealFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'login_logs'), orderBy('timestamp', 'desc'), limit(150));
      return onSnapshot(q, (snapshot) => {
        const logs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        callback(logs);
      }, () => callback([]));
    } catch (err) {
      callback([]);
    }
  }
  callback([]);
  return () => {};
}

export function subscribeToStudentAccounts(callback) {
  if (!db) {
    callback([]);
    return () => {};
  }

  try {
    return onSnapshot(collection(db, 'student_accounts'), (snapshot) => {
      callback(snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        gradeClass: docSnap.data().gradeClass
      })));
    }, (error) => {
      console.error('Öğrenci kayıtları alınamadı:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Öğrenci kayıtlarına abone olunamadı:', error);
    callback([]);
    return () => {};
  }
}

// Nickname Normalizasyonu
const normalizeNickname = (nickname) => nickname.trim().toLowerCase().replace(/\s+/g, '');

async function connectFirebaseAuthAccount(email, password, displayName) {
  if (!auth || !email || !password) return;

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (signInError) {
    if (!['auth/user-not-found', 'auth/invalid-credential'].includes(signInError.code)) {
      if (['auth/operation-not-allowed', 'auth/network-request-failed'].includes(signInError.code)) return;
      throw signInError;
    }

    try {
      credential = await createUserWithEmailAndPassword(auth, email, password);
    } catch (createError) {
      if (['auth/email-already-in-use', 'auth/operation-not-allowed', 'auth/network-request-failed'].includes(createError.code)) return;
      throw createError;
    }
  }

  if (credential?.user && displayName && credential.user.displayName !== displayName) {
    try {
      await updateProfile(credential.user, { displayName });
    } catch (error) {
      console.warn('Firebase Auth profil adı güncellenemedi:', error);
    }
  }
}

export async function updateStudentProfile(userData, profileData) {
  const nickname = normalizeNickname(userData?.nickname || '');
  const fullName = String(profileData?.fullName || '').trim();
  const email = String(profileData?.email || '').trim().toLowerCase();
  const newPassword = String(profileData?.password || '');
  if (!nickname || !fullName || !email) {
    throw new Error('Ad soyad ve e-posta alanlarını doldurunuz.');
  }

  if (db) {
    const duplicateEmail = await getDocs(query(collection(db, 'student_accounts'), where('email', '==', email)));
    if (duplicateEmail.docs.some((accountDoc) => accountDoc.id !== nickname)) {
      throw new Error('Bu e-posta adresi başka bir hesapta kullanılıyor.');
    }
  }

  const authUser = auth?.currentUser;
  if (authUser && authUser.email?.toLowerCase() === String(userData.email || '').toLowerCase()) {
    if ((authUser.email?.toLowerCase() !== email || newPassword) && profileData.currentPassword) {
      const credential = EmailAuthProvider.credential(authUser.email, profileData.currentPassword);
      await reauthenticateWithCredential(authUser, credential);
    }
    if (authUser.displayName !== fullName) await updateProfile(authUser, { displayName: fullName });
    if (authUser.email?.toLowerCase() !== email) await updateEmail(authUser, email);
    if (newPassword) await updatePassword(authUser, newPassword);
  }

  const updates = { fullName, email };
  if (newPassword) updates.password = newPassword;
  if (db) await setDoc(doc(db, 'student_accounts', nickname), updates, { merge: true });

  const localAccountKey = `mahir_student_${nickname}`;
  let localAccount = {};
  try {
    localAccount = JSON.parse(localStorage.getItem(localAccountKey) || '{}');
  } catch {}
  localStorage.setItem(localAccountKey, JSON.stringify({ ...localAccount, ...updates }));

  const updatedUser = { ...userData, displayName: fullName, fullName, email };
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedUser));
  return updatedUser;
}

export async function sendStudentPasswordReset(email) {
  if (!auth) throw new Error('Firebase Authentication bağlantısı kurulamadı.');
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!cleanEmail) throw new Error('Sıfırlama bağlantısı için e-posta adresinizi giriniz.');
  await sendPasswordResetEmail(auth, cleanEmail);
}

// Klasik Giriş
export async function loginWithNickname(identifier, password, selectedRole = 'student') {
  const cleanId = identifier.trim().toLowerCase();

  if (selectedRole === 'teacher' || cleanId === 'mahirsengun') {
    if (cleanId === 'mahirsengun' && password === 'mahirsengun2440') {
      const userProfile = {
        uid: 'teacher-mahirsengun',
        displayName: teacherProfile.officialName,
        nickname: 'mahirsengun',
        role: 'teacher',
        gradeClass: 'Fizik Zümre Başkanı'
      };
      localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userProfile));
      return userProfile;
    }
    throw new Error('Admin kullanıcı adı veya şifresi hatalı!');
  }

  let account = null;
  if (db) {
    try {
      const docRef = doc(db, 'student_accounts', normalizeNickname(cleanId));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        account = docSnap.data();
      } else {
        const q = query(collection(db, 'student_accounts'), where('email', '==', cleanId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          account = querySnapshot.docs[0].data();
        }
      }
    } catch (e) {
      console.error("Giriş hatası:", e);
    }
  }

  if (!account) {
    const localAcc = localStorage.getItem(`mahir_student_${normalizeNickname(cleanId)}`);
    if (localAcc) account = JSON.parse(localAcc);
  }

  if (!account || account.password !== password) {
    throw new Error('Kullanıcı adı/e-posta veya şifre hatalı.');
  }

  try {
    await connectFirebaseAuthAccount(account.email, password, account.fullName);
  } catch (error) {
    console.warn('Firebase Auth oturumu kurulamadı; kayıtlı nickname oturumu kullanılacak:', error);
  }

  const userProfile = {
    uid: account.uid,
    displayName: account.fullName,
    nickname: account.nickname,
    email: account.email,
    role: 'student',
    gradeClass: account.gradeClass
  };

  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userProfile));
  await logStudentLogin(userProfile, 'Portala Giriş Yapıldı');
  return userProfile;
}

// Yeni Öğrenci Kaydı
export async function registerStudentWithNickname(nickname, password, email, fullName, gradeClass) {
  const normalized = normalizeNickname(nickname);
  const cleanEmail = email.trim().toLowerCase();
  const cleanGradeClass = normalizeGradeClass(gradeClass);

  if (normalized.length < 3) throw new Error('Kullanıcı adı en az 3 karakter olmalıdır.');
  if (password.length < 6) throw new Error('Şifre en az 6 karakter olmalıdır.');
  if (normalized === 'mahirsengun') throw new Error('Bu kullanıcı adı admin hesabına ayrılmıştır.');

  if (db) {
    const existingNick = await getDoc(doc(db, 'student_accounts', normalized));
    if (existingNick.exists()) {
      throw new Error('Bu kullanıcı adı daha önce alınmış.');
    }

    const q = query(collection(db, 'student_accounts'), where('email', '==', cleanEmail));
    const existingEmail = await getDocs(q);
    if (!existingEmail.empty) {
      throw new Error('Bu e-posta adresi ile zaten bir hesap oluşturulmuş.');
    }
  }

  try {
    await connectFirebaseAuthAccount(cleanEmail, password, fullName);
  } catch (error) {
    console.warn('Firebase Auth hesabı oluşturulamadı; kayıt yerel hesap olarak sürdürülecek:', error);
  }

  const account = {
    uid: `student-${normalized}-${Date.now()}`,
    nickname: normalized,
    email: cleanEmail,
    password,
    fullName,
    gradeClass: cleanGradeClass,
    role: 'student',
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(`mahir_student_${normalized}`, JSON.stringify(account));

  if (db) {
    try {
      await setDoc(doc(db, 'student_accounts', normalized), account);
    } catch (e) {
      console.warn("Firestore kayıt çevrimdışı.");
    }
  }

  const userProfile = {
    uid: account.uid,
    displayName: fullName,
    nickname: normalized,
    email: cleanEmail,
    role: 'student',
    gradeClass: cleanGradeClass
  };

  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(userProfile));
  await logStudentLogin(userProfile, 'Yeni Hesap Oluşturuldu ve Giriş Yapıldı');
  return userProfile;
}

export async function getTeacherAccount() {
  return { nickname: 'mahirsengun', password: 'mahirsengun2440' };
}

export async function updateTeacherAccount(nickname, password) {
  return { nickname, password, role: 'teacher' };
}

export async function logoutUser() {
  localStorage.removeItem(SESSION_USER_KEY);
  if (auth) {
    try { await signOut(auth); } catch (e) {}
  }
  window.location.reload();
}

export function getCurrentSessionUser() {
  try {
    const saved = localStorage.getItem(SESSION_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// Storage & Dosya / PDF Yükleme İşlemleri
export async function uploadPdfFile(file, onProgress) {
  if (!file) return null;
  if (file.size > 700 * 1024) {
    throw new Error('Firestore sınırı nedeniyle PDF en fazla 700 KB olabilir.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error('PDF dosyası okunamadı.'));
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

export async function uploadTestImage(file) {
  if (!file) return '';

  const allowedTypes = ['image/png', 'image/jpeg'];
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(file.type) || !['png', 'jpg', 'jpeg'].includes(extension)) {
    throw new Error('Test kitapçığı yalnızca PNG veya JPG/JPEG biçiminde olabilir.');
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Test kitapçığı görseli en fazla 10 MB olabilir.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

export function subscribeToExamPdfs(callback) {
  if (db) {
    try {
      const q = query(collection(db, 'pdfs'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(list);
      }, () => callback([]));
    } catch (e) {
      callback([]);
    }
  }
  return () => {};
}

export async function addExamPdf(pdfData) {
  const payload = { ...pdfData, author: teacherProfile.officialName, createdAt: new Date().toISOString(), isManuallyLocked: false, timestamp: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'pdfs'), payload);
  return { id: docRef.id, ...payload };
}

export async function toggleExamPdfLock(pdfId, state) {
  await updateDoc(doc(db, 'pdfs', String(pdfId)), { isManuallyLocked: state });
  return true;
}

export async function deleteExamPdf(pdfId) {
  await deleteDoc(doc(db, 'pdfs', String(pdfId)));
  return true;
}

// Duyurular
export function subscribeToAnnouncements(callback) {
  if (db) {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(list);
      }, () => callback([]));
    } catch (e) {
      callback([]);
    }
  }
  return () => {};
}

export async function addAnnouncementToFirestore(annData) {
  const payload = { ...annData, author: teacherProfile.officialName, createdAt: new Date().toISOString(), timestamp: serverTimestamp() };
  const docRef = await addDoc(collection(db, 'announcements'), payload);
  return { id: docRef.id, ...payload };
}

export async function deleteAnnouncementFromFirestore(annId) {
  await deleteDoc(doc(db, 'announcements', String(annId)));
  return true;
}

// ==========================================
// İNTERAKTİF TEST YÖNETİMİ (Firestore)
// ==========================================
export function subscribeToInteractiveTests(callback) {
  if (db) {
    try {
      const q = query(collection(db, 'interactive_tests'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(list);
      }, (error) => {
        console.error('İnteraktif testler alınamadı:', error);
        callback([]);
      });
    } catch (error) {
      console.error('İnteraktif testlere abone olunamadı:', error);
      callback([]);
    }
  }
  callback([]);
  return () => {};
}

export async function incrementInteractiveTestCounter(testId, counter = 'views') {
  if (!db) throw new Error('Firestore bağlantısı kurulamadı.');
  if (!testId || !['views', 'solveCount'].includes(counter)) {
    throw new Error('Geçersiz test sayacı isteği.');
  }

  await updateDoc(doc(db, 'interactive_tests', String(testId)), {
    [counter]: increment(1)
  });
}

export async function saveInteractiveTestResult(resultData) {
  if (!db) {
    throw new Error('Firestore bağlantısı kurulamadı.');
  }

  const payload = {
    ...resultData,
    gradeClass: normalizeGradeClass(resultData.gradeClass, 'Belirtilmedi'),
    submittedAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  };
  const docRef = await addDoc(collection(db, 'test_results'), payload);
  return { id: docRef.id, ...payload };
}

export function subscribeToInteractiveTestResults(callback) {
  if (!db) {
    callback([]);
    return () => {};
  }

  try {
    const resultsQuery = query(collection(db, 'test_results'), orderBy('timestamp', 'desc'), limit(500));
    return onSnapshot(resultsQuery, (snapshot) => {
      callback(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    }, (error) => {
      console.error('Test sonuçları alınamadı:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Test sonuçlarına abone olunamadı:', error);
    callback([]);
    return () => {};
  }
}

export async function addInteractiveTestToFirestore(testData) {
  if (!db) {
    throw new Error('Firestore bağlantısı kurulamadı.');
  }

  const testImageUrls = Array.isArray(testData.testImageUrls)
    ? testData.testImageUrls.filter((url) => typeof url === 'string' && url.trim())
    : [testData.testImageUrl].filter((url) => typeof url === 'string' && url.trim());
  const payload = { 
    ...testData, 
    testImageUrls,
    author: teacherProfile.officialName, 
    createdAt: new Date().toISOString(), 
    timestamp: serverTimestamp() 
  };
  
  const docRef = await addDoc(collection(db, 'interactive_tests'), payload);
  return { id: docRef.id, ...payload };
}

export async function deleteInteractiveTestFromFirestore(testId) {
  if (!db) {
    throw new Error('Firestore bağlantısı kurulamadı.');
  }

  await deleteDoc(doc(db, 'interactive_tests', String(testId)));
  return true;
}