import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  createInterview,
  generateQuestions,
  getInterview,
  submitAnswer,
  completeInterview,
  getUserInterviews,
} from '../features/interview/interviewSlice';
import InterviewTimer from '../components/InterviewTimer';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';

export default function InterviewPage() {
  const dispatch = useDispatch();
  const { current, questions, interviews, loading } = useSelector((state) => state.interview);
  const [form, setForm] = useState({ title: '', interviewType: 'technical', difficulty: 'Medium', categories: '', duration: 30 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    dispatch(getUserInterviews());
  }, [dispatch]);

  useEffect(() => {
    if (current?.questions && current.questions.length > 0) {
      setCurrentIndex(0);
    }
  }, [current]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Interview title is required.');
      return;
    }

    if (!form.interviewType) {
      setFormError('Interview type is required.');
      return;
    }

    if (!form.difficulty) {
      setFormError('Difficulty level is required.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: '',
      interviewType: form.interviewType,
      categories: form.categories.split(',').map((c) => c.trim()).filter(Boolean),
      difficulty: form.difficulty,
      duration: form.duration,
    };

    const result = await dispatch(createInterview(payload));
    if (result.error) {
      setFormError(result.payload?.message || result.error.message || 'Failed to create interview.');
    }
  };

  const handleGenerate = async () => {
    if (!current) return;
    await dispatch(generateQuestions({ interviewId: current._id, questionCount: 5 }));
  };

  const handleStart = async () => {
    if (!current) return;
    // call backend start
    await dispatch(getInterview(current._id));
  };

  const onSubmitAnswer = async ({ questionId, answer, timeTaken }) => {
    if (!current) return;
    await dispatch(submitAnswer({ interviewId: current._id, questionId, userAnswer: answer, timeTaken }));
    setAnswers((s) => ({ ...s, [questionId]: answer }));
  };

  const handleComplete = async () => {
    if (!current) return;
    await dispatch(completeInterview(current._id));
  };

  const currentQuestion = questions && questions.length > 0 ? questions[currentIndex] : null;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">AI Interview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          {!current && (
            <form onSubmit={handleCreate} className="space-y-3 p-4 border rounded">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Interview title"
                className="w-full p-2 border rounded"
                required
              />

              <div className="flex gap-2">
                <select
                  value={form.interviewType}
                  onChange={(e) => setForm({ ...form, interviewType: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="technical">Technical</option>
                  <option value="hr">HR</option>
                  <option value="behavioral">Behavioral</option>
                </select>

                <select
                  value={form.difficulty}
                  onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                  className="p-2 border rounded"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <input value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="Categories (comma separated)" className="flex-1 p-2 border rounded" />
              </div>

              <div className="flex gap-2 items-center">
                <label>Duration (minutes)</label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} className="w-24 p-2 border rounded" />
              </div>

              {formError && <div className="text-sm text-red-600">{formError}</div>}
              <button type="submit" className="btn btn-primary">Create Interview</button>
            </form>
          )}

          {current && (
            <div className="p-4 border rounded">
              <h3 className="text-xl font-medium">{current.title}</h3>
              <div className="flex gap-2 mt-3">
                <button onClick={handleGenerate} className="btn">Generate Questions</button>
                <button onClick={handleStart} className="btn">Refresh Interview</button>
                <button onClick={handleComplete} className="btn btn-accent">Complete Interview</button>
              </div>

              <div className="mt-4">
                {currentQuestion ? (
                  <>
                    <InterviewTimer duration={current.duration || 30} onTimeUp={() => {}} />
                    <QuestionCard question={currentQuestion} onSubmit={onSubmitAnswer} />

                    <div className="flex gap-2 mt-2">
                      <button className="btn" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}>Prev</button>
                      <button className="btn" onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={currentIndex === questions.length - 1}>Next</button>
                    </div>
                  </>
                ) : (
                  <p>No questions yet. Click "Generate Questions".</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="p-4 border rounded mb-4">
            <h4 className="font-medium">Your Interviews</h4>
            <ul>
              {interviews.map((it) => (
                <li key={it._id} className="py-2 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{it.title}</div>
                      <div className="text-sm text-gray-500">{it.interviewType} • {it.difficulty}</div>
                    </div>
                    <div>
                      <button onClick={() => dispatch(getInterview(it._id))} className="btn btn-link">Open</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 border rounded">
            <h4 className="font-medium">Progress</h4>
            <ProgressBar value={current?.score || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
