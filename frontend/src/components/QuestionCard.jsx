import { useState } from 'react';

export default function QuestionCard({ question, onSubmit }) {
  const [answer, setAnswer] = useState('');
  const [timeTaken, setTimeTaken] = useState(0);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    await onSubmit({ questionId: question._id, answer, timeTaken });
    setAnswer('');
  };

  return (
    <div className="p-4 border rounded mt-4">
      <div className="text-lg font-semibold">{question.orderNumber}. {question.questionText}</div>
      <div className="text-sm text-gray-600 mt-2">Category: {question.category} • Difficulty: {question.difficulty}</div>

      {question.hints && question.hints.length > 0 && (
        <div className="mt-2">
          <strong>Hints:</strong>
          <ul className="list-disc ml-6 text-sm text-gray-700">
            {question.hints.map((h, idx) => <li key={idx}>{h}</li>)}
          </ul>
        </div>
      )}

      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} className="w-full p-2 border rounded mt-3" placeholder="Type your answer here..."></textarea>

      <div className="flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={handleSubmit}>Submit Answer</button>
      </div>
    </div>
  );
}
