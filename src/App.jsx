import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PdfViewerModal from './components/PdfViewerModal';
import TeacherPdfModal from './components/TeacherPdfModal';
import TeacherAnnouncementModal from './components/TeacherAnnouncementModal';
import StudentLogsModal from './components/StudentLogsModal';
import Announcements from './components/Announcements';
import FormulaCheatSheetModal from './components/FormulaCheatSheetModal';
import AccountSettingsModal from './components/AccountSettingsModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import ExamTestModal from './components/ExamTestModal';
import TeacherTestModal from './components/TeacherTestModal';
import StudyAssistant from './components/StudyAssistant';
import { 
  getCurrentSessionUser, 
  logoutUser, 
  subscribeToExamPdfs, 
  toggleExamPdfLock, 
  deleteExamPdf,
  subscribeToAnnouncements,
  deleteAnnouncementFromFirestore,
  subscribeToLoginLogs,
  subscribeToStudentAccounts,
  subscribeToInteractiveTestResults,
  subscribeToInteractiveTests,
  addInteractiveTestToFirestore,
  deleteInteractiveTestFromFirestore
} from './firebase';
import { teacherProfile } from './data/teacherProfile';
import { FileText, BellRing, Sparkles } from 'lucide-react';

export default function App() {
  // Current authenticated user (student or teacher)
  const [user, setUser] = useState(() => getCurrentSessionUser());

  // Real-time Written Exam PDFs stream (`pdfs` collection)
  const [pdfs, setPdfs] = useState([]);
  const [newPdfAlert, setNewPdfAlert] = useState(null);

  // Real-time Announcements stream (`announcements` collection)
  const [announcements, setAnnouncements] = useState([]);

  // Real-time interactive tests stream (`interactive_tests` collection)
  const [interactiveTests, setInteractiveTests] = useState([]);

  // Real-time Student Login Logs (`login_logs` collection)
  const [loginLogs, setLoginLogs] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [studentAccounts, setStudentAccounts] = useState([]);

  // Modals state
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [isTeacherPdfModalOpen, setIsTeacherPdfModalOpen] = useState(false);
  const [isTeacherAnnModalOpen, setIsTeacherAnnModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(false);
  const [isFormulasOpen, setIsFormulasOpen] = useState(false);
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [pendingAuthAction, setPendingAuthAction] = useState(null);
  const [loginPrompt, setLoginPrompt] = useState('');
  const [isExamTestOpen, setIsExamTestOpen] = useState(false);
  const [isTeacherTestModalOpen, setIsTeacherTestModalOpen] = useState(false);
  const [selectedInteractiveTest, setSelectedInteractiveTest] = useState(null);
  const [testActionError, setTestActionError] = useState('');

  // 1. Subscribe to Exam PDFs via Firestore onSnapshot
  useEffect(() => {
    let initialLoad = true;
    const unsubscribe = subscribeToExamPdfs((updatedPdfs) => {
      if (!initialLoad && updatedPdfs.length > pdfs.length) {
        const newlyAdded = updatedPdfs[0];
        setNewPdfAlert(newlyAdded?.title || 'Mahir Şengün yeni bir yazılı PDF çalışması yayınladı!');
        setTimeout(() => setNewPdfAlert(null), 6000);
      }
      initialLoad = false;
      setPdfs(updatedPdfs);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 2. Subscribe to Announcements via Firestore onSnapshot
  useEffect(() => {
    const unsubscribe = subscribeToAnnouncements((updatedAnn) => {
      setAnnouncements(updatedAnn);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Subscribe to interactive tests published from the teacher dashboard
  useEffect(() => {
    const unsubscribe = subscribeToInteractiveTests((updatedTests) => {
      setInteractiveTests(Array.isArray(updatedTests) ? updatedTests : []);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Test sonuçlarını sonuç ekranındaki sıralamalar için tüm giriş yapmış kullanıcılar alır.
  useEffect(() => {
    const unsubscribeResults = subscribeToInteractiveTestResults((results) => {
      setTestResults(Array.isArray(results) ? results : []);
    });

    return () => {
      if (typeof unsubscribeResults === 'function') unsubscribeResults();
    };
  }, []);

  // 3. Subscribe to Student Login Logs if user is Teacher
  useEffect(() => {
    if (user?.role === 'teacher') {
      const unsubscribe = subscribeToLoginLogs((logs) => {
        setLoginLogs(logs);
      });
      const unsubscribeAccounts = subscribeToStudentAccounts((accounts) => {
        setStudentAccounts(Array.isArray(accounts) ? accounts : []);
      });

      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
        if (typeof unsubscribeAccounts === 'function') unsubscribeAccounts();
      };
    }
  }, [user?.role]);

  // Authentication handlers
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoginOpen(false);
    setLoginPrompt('');
    if (pendingAuthAction?.type === 'test') {
      setSelectedInteractiveTest(pendingAuthAction.test);
      setIsExamTestOpen(true);
    } else if (pendingAuthAction?.type === 'defaultTest') {
      setSelectedInteractiveTest(null);
      setIsExamTestOpen(true);
    }
    setPendingAuthAction(null);
  };

  const handleProfileAction = () => {
    if (user) {
      setIsAccountSettingsOpen(true);
    } else {
      setLoginPrompt('Profilinizi açmak için lütfen giriş yapın veya kayıt olun.');
      setIsLoginOpen(true);
    }
  };

  const requireLogin = (message) => {
    if (user) return true;
    setLoginPrompt(message || 'Bu işlem için lütfen giriş yapın veya kayıt olun.');
    setIsLoginOpen(true);
    return false;
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    setPendingAuthAction(null);
    setLoginPrompt('');
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  // Toggle PDF Lock (Mahir Şengün action)
  const handleToggleLock = async (pdfId, currentLockedState) => {
    try {
      await toggleExamPdfLock(pdfId, currentLockedState);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete PDF (Mahir Şengün action)
  const handleDeletePdf = async (pdfId) => {
    try {
      await deleteExamPdf(pdfId);
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Announcement (Mahir Şengün action)
  const handleDeleteAnnouncement = async (annId) => {
    try {
      await deleteAnnouncementFromFirestore(annId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInteractiveTest = async (testData) => {
    await addInteractiveTestToFirestore(testData);
  };

  const handleDeleteInteractiveTest = async (testId) => {
    try {
      await deleteInteractiveTestFromFirestore(testId);
    } catch (error) {
      console.error(error);
      setTestActionError('Test silinemedi. Lütfen tekrar deneyiniz.');
    }
  };

  const handleStartInteractiveTest = (test) => {
    if (!user) {
      setPendingAuthAction({ type: 'test', test });
      setLoginPrompt('İnteraktif testi çözmek için lütfen giriş yapın veya kayıt olun.');
      setIsLoginOpen(true);
      return;
    }
    setSelectedInteractiveTest(test);
    setIsExamTestOpen(true);
  };

  const handleOpenDefaultExam = () => {
    if (!user) {
      setPendingAuthAction({ type: 'defaultTest' });
      requireLogin('Test çözebilmek için lütfen giriş yapın veya kayıt olun.');
      return;
    }
    setSelectedInteractiveTest(null);
    setIsExamTestOpen(true);
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <div className="w-full min-w-0 max-w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-clip">
      
      {/* Realtime Toast Notification when Mahir Hoca uploads a new PDF */}
      {newPdfAlert && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white shadow-2xl shadow-purple-950/50 flex items-center gap-3 animate-fadeIn border border-purple-400/40 max-w-md">
          <div className="p-2.5 bg-white/20 rounded-xl shrink-0">
            <FileText className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div className="overflow-hidden">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-200">
              Yeni Yazılı PDF'i Yayınlandı
            </span>
            <span className="text-xs sm:text-sm font-semibold truncate block">
              {newPdfAlert}
            </span>
          </div>
          <button
            onClick={() => setNewPdfAlert(null)}
            className="ml-auto text-white/70 hover:text-white text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {testActionError && (
        <div className="fixed top-24 right-4 z-50 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-3">
          <span>{testActionError}</span>
          <button
            type="button"
            onClick={() => setTestActionError('')}
            className="font-bold hover:text-white"
            aria-label="Uyarıyı kapat"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Navigation */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
        onOpenFormulas={() => setIsFormulasOpen(true)}
        onOpenUploadPdf={() => setIsTeacherPdfModalOpen(true)}
        onOpenCreateAnnouncement={() => setIsTeacherAnnModalOpen(true)}
        onOpenLogs={() => setIsLogsModalOpen(true)}
        onOpenAccountSettings={handleProfileAction}
        onOpenExamTest={handleOpenDefaultExam}
        logsCount={loginLogs.length}
      />

      {/* Main Simplified PDF Listing Dashboard */}
      <Dashboard
        user={user}
        pdfs={pdfs}
        announcements={announcements}
        interactiveTests={interactiveTests}
        isAuthenticated={Boolean(user)}
        onRequireAuth={requireLogin}
        onViewPdf={(pdf) => {
          if (!requireLogin('PDF görüntülemek veya indirmek için lütfen giriş yapın veya kayıt olun.')) return;
          setSelectedPdf(pdf);
        }}
        onOpenUploadPdf={() => setIsTeacherPdfModalOpen(true)}
        onOpenCreateTest={() => setIsTeacherTestModalOpen(true)}
        onStartTest={handleStartInteractiveTest}
        onDeleteTest={handleDeleteInteractiveTest}
        onTogglePdfLock={handleToggleLock}
        onDeletePdf={handleDeletePdf}
        onOpenAnnouncements={() => setIsAnnouncementsOpen(true)}
        onOpenCreateAnnouncement={() => setIsTeacherAnnModalOpen(true)}
        onOpenLogs={() => setIsLogsModalOpen(true)}
        onOpenExamTest={() => setIsExamTestOpen(true)}
        onOpenFormulas={() => setIsFormulasOpen(true)}
        logsCount={loginLogs.length}
        testResults={testResults}
      />

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PdfViewerModal
          pdf={selectedPdf}
          onClose={() => setSelectedPdf(null)}
          isAuthenticated={Boolean(user)}
          onRequireAuth={requireLogin}
        />
      )}

      {/* Mahir Şengün PDF Upload Modal (Teacher only) */}
      {isTeacher && (
        <TeacherPdfModal
          isOpen={isTeacherPdfModalOpen}
          onClose={() => setIsTeacherPdfModalOpen(false)}
          onPdfUploaded={() => {}}
        />
      )}

      {/* Mahir Şengün Announcement Modal (Teacher only) */}
      {isTeacher && (
        <TeacherAnnouncementModal
          isOpen={isTeacherAnnModalOpen}
          onClose={() => setIsTeacherAnnModalOpen(false)}
          onAnnouncementCreated={() => {}}
        />
      )}

      {isTeacher && (
        <TeacherTestModal
          isOpen={isTeacherTestModalOpen}
          onClose={() => setIsTeacherTestModalOpen(false)}
          onTestCreated={handleCreateInteractiveTest}
        />
      )}

      {/* Mahir Şengün Student Login Tracking Logs Modal (Teacher only) */}
      {isTeacher && (
        <StudentLogsModal
          isOpen={isLogsModalOpen}
          onClose={() => setIsLogsModalOpen(false)}
          logs={loginLogs}
          testResults={testResults}
          studentAccounts={studentAccounts}
        />
      )}

      {/* İnteraktif Sınav / Test Modalı */}
      <ExamTestModal
        key={selectedInteractiveTest?.id || 'default-exam'}
        isOpen={isExamTestOpen}
        onClose={() => {
          setIsExamTestOpen(false);
          setSelectedInteractiveTest(null);
        }}
        examTitle={selectedInteractiveTest?.title || 'Fizik 1. Dönem 1. Yazılı Deneme Sınavı'}
        testData={selectedInteractiveTest || {}}
        user={user}
        testResults={testResults}
      />

      {/* Sınav Takvimi & Duyurular Modal */}
      <Announcements
        isOpen={isAnnouncementsOpen}
        onClose={() => setIsAnnouncementsOpen(false)}
        announcements={announcements}
        isTeacher={isTeacher}
        onOpenCreateAnnouncement={() => setIsTeacherAnnModalOpen(true)}
        onDeleteAnnouncement={handleDeleteAnnouncement}
      />

      {/* Formül & Bağıntı Kartı Modalı */}
      <FormulaCheatSheetModal
        isOpen={isFormulasOpen}
        onClose={() => setIsFormulasOpen(false)}
      />

      <StudyAssistant />

      {isTeacher ? (
        <AccountSettingsModal
          isOpen={isAccountSettingsOpen}
          onClose={() => setIsAccountSettingsOpen(false)}
        />
      ) : user ? (
        <ProfileSettingsModal
          isOpen={isAccountSettingsOpen}
          onClose={() => setIsAccountSettingsOpen(false)}
          user={user}
          onProfileUpdated={setUser}
        />
      ) : null}

      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-950/90 backdrop-blur-sm">
          <Login onLoginSuccess={handleLoginSuccess} onClose={handleCloseLogin} notice={loginPrompt} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026-2027 {teacherProfile.portalBrand} • {teacherProfile.officialName} • Firebase Auth & Realtime Firestore</p>
        <p className="mt-1 text-slate-600">{teacherProfile.school} • Fizik Zümre Koordinatörlüğü</p>
      </footer>

    </div>
  );
}