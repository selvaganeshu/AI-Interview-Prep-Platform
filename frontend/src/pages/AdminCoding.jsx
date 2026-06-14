import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import codingApi from '../services/codingApi';
import LoadingSpinner from '../components/LoadingSpinner';
import CodingChallengeForm from '../components/CodingChallengeForm';

export default function AdminCodingPage() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const loadChallenges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await codingApi.getChallenges();
      setChallenges(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load challenges.');
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  const handleEdit = (challenge) => {
    setSelectedChallenge(challenge);
    setMessage(null);
  };

  const handleDelete = async (challengeId) => {
    if (!window.confirm('Delete this challenge? This cannot be undone.')) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await codingApi.deleteChallenge(challengeId);
      setMessage('Challenge deleted successfully.');
      setSelectedChallenge((current) => (current?._id === challengeId ? null : current));
      await loadChallenges();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to delete challenge.');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (payload) => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      if (selectedChallenge) {
        await codingApi.updateChallenge(selectedChallenge._id, payload);
        setMessage('Challenge updated successfully.');
      } else {
        await codingApi.createChallenge(payload);
        setMessage('Challenge created successfully.');
      }
      setSelectedChallenge(null);
      await loadChallenges();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to save challenge.');
    } finally {
      setSaving(false);
    }
  };

  const challengeOptions = useMemo(() => {
    if (!selectedChallenge) return null;
    return selectedChallenge;
  }, [selectedChallenge]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Admin Coding Challenges</h2>
          <p className="mt-2 text-sm text-slate-600">Create, update, and remove coding challenges for your platform.</p>
        </div>
        <Link
          to="/admin"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to Admin Dashboard
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">{selectedChallenge ? 'Edit Challenge' : 'New Challenge'}</h3>
              <p className="text-sm text-slate-600">Use the form below to publish a challenge for candidates.</p>
            </div>
            {selectedChallenge && (
              <button
                type="button"
                onClick={() => setSelectedChallenge(null)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Clear form
              </button>
            )}
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>}
          {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div>}

          <CodingChallengeForm
            initialValues={challengeOptions}
            onSubmit={handleSubmit}
            submitLabel={saving ? 'Saving...' : selectedChallenge ? 'Update Challenge' : 'Create Challenge'}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Challenge Library</h3>
              <p className="text-sm text-slate-600">Manage existing challenge content and metadata.</p>
            </div>
            <button
              type="button"
              onClick={loadChallenges}
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : challenges.length === 0 ? (
            <p className="text-sm text-slate-500">No challenges found yet.</p>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{challenge.title}</p>
                      <p className="text-sm text-slate-500">{challenge.difficulty} • {challenge.languageOptions?.join(', ')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(challenge)}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(challenge._id)}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
