import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  Edit2,
  Download,
  Upload,
  RefreshCw,
  Github,
  Linkedin,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  Code,
  BookOpen,
} from 'lucide-react';
import { fetchProfilePerformance } from '../features/profile/profileSlice';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EditProfileModal from '../components/EditProfileModal';
import api from '../services/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const { data: performanceData, isLoading: performanceLoading, error: performanceError } = useSelector(
    (state) => state.profile
  );
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [animatedChallengesSolved, setAnimatedChallengesSolved] = useState(0);
  const [animatedInterviewsDone, setAnimatedInterviewsDone] = useState(0);
  const [animatedAvgInterviewScore, setAnimatedAvgInterviewScore] = useState(0);
  const [animatedResumeScore, setAnimatedResumeScore] = useState(0);
  const [animatedProfileCompletion, setAnimatedProfileCompletion] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/user/profile');
        setProfileData(data.data.profile);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      dispatch(fetchProfilePerformance());
      loadProfile();
    }
  }, [user, dispatch]);

  useEffect(() => {
    const animateValue = (target, setter, duration = 600) => {
      if (typeof target !== 'number') {
        setter(0);
        return;
      }

      let start = 0;
      const startTime = performance.now();
      const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        setter(Math.round(progress * target));
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    if (performanceData) {
      animateValue(performanceData.challengesSolved || 0, setAnimatedChallengesSolved);
      animateValue(performanceData.interviewsDone || 0, setAnimatedInterviewsDone);
      animateValue(performanceData.averageInterviewScore || 0, setAnimatedAvgInterviewScore);
      animateValue(performanceData.resumeScore || 0, setAnimatedResumeScore);
      animateValue(performanceData.profileCompletion || 0, setAnimatedProfileCompletion);
    }
  }, [performanceData]);

  const loadingState = isLoading || loading || performanceLoading;
  const profile = profileData || user;
  const combinedError = error || performanceError;

  const challengesSolved = performanceData?.challengesSolved ?? profile?.codingSolved ?? 0;
  const interviewsDone = performanceData?.interviewsDone ?? profile?.interviewsCompleted ?? 0;
  const avgInterviewScore = performanceData?.averageInterviewScore ?? profile?.avgInterviewScore ?? 0;
  const resumeScore = performanceData?.resumeScore ?? profile?.resumeScore ?? 0;
  const profileCompletion = performanceData?.profileCompletion ?? 0;
  const recentActivity = performanceData?.recentActivity ?? [];

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days >= 2) return `${days} days ago`;
    if (days === 1) return 'Yesterday';
    if (hours >= 1) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes >= 1) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loadingState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const achievements = [
    { label: '100+ Coding Problems', icon: '🧠', completed: true },
    { label: 'Resume Uploaded', icon: '📄', completed: !!profile?.resumeUrl },
    { label: 'Interview Completed', icon: '🎯', completed: profile?.interviewsCompleted > 0 },
    { label: 'First Coding Challenge Solved', icon: '✨', completed: profile?.codingSolved > 0 },
  ];

  const skills = [
    'JavaScript',
    'React',
    'Python',
    'Java',
    'MongoDB',
    'Express.js',
    'MySQL',
    'Tailwind CSS',
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {combinedError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {combinedError}
          </motion.div>
        )}

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage your account information and career profile.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Profile Overview Card */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-3xl font-bold text-white shadow-sm">
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900">{profile?.name || 'User'}</h2>
                  <p className="mt-1 text-sm text-slate-600 flex items-center gap-2">
                    <Mail size={14} />
                    {profile?.email}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {profile?.college && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        <BookOpen size={12} />
                        {profile?.college}
                      </span>
                    )}
                    {profile?.role && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
                        {profile?.role}
                      </span>
                    )}
                    {profile?.location && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        <MapPin size={12} />
                        {profile?.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 active:scale-95"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Personal Information Card */}
            <motion.div
              variants={itemVariants}
              className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Personal Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Full Name</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.name || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Phone</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Location</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.location || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">College</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.college || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Degree</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.degree || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Graduation Year</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{profile?.graduationYear || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Joined Date</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Performance Summary Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Performance
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: 'Challenges Solved',
                    value: animatedChallengesSolved,
                    fallback: challengesSolved,
                    suffix: '',
                  },
                  {
                    title: 'Interviews Done',
                    value: animatedInterviewsDone,
                    fallback: interviewsDone,
                    suffix: '',
                  },
                  {
                    title: 'Avg Interview Score',
                    value: animatedAvgInterviewScore,
                    fallback: avgInterviewScore,
                    suffix: '%',
                  },
                  {
                    title: 'Resume Score',
                    value: animatedResumeScore,
                    fallback: resumeScore,
                    suffix: '/100',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      {item.title}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {loadingState ? (
                        <span className="inline-block h-8 w-24 animate-pulse rounded-lg bg-slate-200" />
                      ) : (
                        `${item.value || item.fallback || 0}${item.suffix}`
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
              Profile Completion
            </h3>
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between text-sm font-medium text-slate-600">
                  <span>{profileCompletion}% complete</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Profile Picture', filled: Boolean(profile?.profileImage) },
                  { label: 'Name', filled: Boolean(profile?.name) },
                  { label: 'Phone', filled: Boolean(profile?.phone) },
                  { label: 'College', filled: Boolean(profile?.college) },
                  { label: 'Degree', filled: Boolean(profile?.degree) },
                  {
                    label: 'Skills',
                    filled:
                      Boolean(profile?.resumeScore) ||
                      Boolean(profile?.resumeUrl) ||
                      Boolean(performanceData?.profileCompletion),
                  },
                  { label: 'GitHub', filled: Boolean(profile?.github) },
                  { label: 'LinkedIn', filled: Boolean(profile?.linkedin) },
                  { label: 'Resume', filled: Boolean(profile?.resumeScore || profile?.resumeUrl) },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-2xl border px-3 py-2 text-sm ${
                      item.filled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={`${activity.type}-${activity.timestamp}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
                      {activity.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{activity.subtitle}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
                  No recent activity available yet.
                </div>
              )}
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-1">
            {/* Resume Card */}
            

            {/* Achievements Card */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Achievements
              </h3>
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.label}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition ${
                      achievement.completed
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-100 bg-slate-50'
                    }`}
                  >
                    <span className="text-lg">{achievement.icon}</span>
                    <span
                      className={`text-sm font-medium ${
                        achievement.completed ? 'text-emerald-700' : 'text-slate-600'
                      }`}
                    >
                      {achievement.label}
                    </span>
                    {achievement.completed && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Professional Links Card */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-indigo-600">
              Professional Links
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Github size={20} className="text-slate-700" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">GitHub</p>
                    <p className="text-sm font-semibold text-slate-900">Profile</p>
                  </div>
                </a>
              )}
              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Linkedin size={20} className="text-slate-700" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">LinkedIn</p>
                    <p className="text-sm font-semibold text-slate-900">Profile</p>
                  </div>
                </a>
              )}
              {profile?.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  <Globe size={20} className="text-slate-700" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">Portfolio</p>
                    <p className="text-sm font-semibold text-slate-900">Website</p>
                  </div>
                </a>
              )}
              {!profile?.github && !profile?.linkedin && !profile?.portfolio && (
                <p className="col-span-3 text-center text-sm text-slate-600 py-6">
                  No professional links added yet. Edit profile to add them.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedProfile) => {
            setProfileData(updatedProfile);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
