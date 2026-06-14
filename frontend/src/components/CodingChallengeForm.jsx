import { useMemo, useState } from 'react';

const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'c', 'typescript'];

export default function CodingChallengeForm({ initialValues, onSubmit, submitLabel }) {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [difficulty, setDifficulty] = useState(initialValues?.difficulty || 'Easy');
  const [categories, setCategories] = useState((initialValues?.categories || []).join(', '));
  const [languageOptions, setLanguageOptions] = useState((initialValues?.languageOptions || ['javascript', 'python', 'java']).join(', '));
  const [defaultLanguage, setDefaultLanguage] = useState(initialValues?.defaultLanguage || 'javascript');
  const [starterCode, setStarterCode] = useState(initialValues?.starterCode || {});
  const [timeLimit, setTimeLimit] = useState(initialValues?.timeLimit || 20);
  const [maxScore, setMaxScore] = useState(initialValues?.maxScore || 100);
  const [testCases, setTestCases] = useState(initialValues?.testCases || [{ input: '', expectedOutput: '', hidden: false }]);
  const [tags, setTags] = useState((initialValues?.tags || []).join(', '));

  const languageList = useMemo(() => languageOptions.split(',').map((item) => item.trim()).filter(Boolean), [languageOptions]);

  const handleTestCaseChange = (index, field, value) => {
    setTestCases((current) => current.map((testCase, i) => (i === index ? { ...testCase, [field]: field === 'hidden' ? value : value } : testCase)));
  };

  const addTestCase = () => {
    setTestCases((current) => [...current, { input: '', expectedOutput: '', hidden: false }]);
  };

  const removeTestCase = (index) => {
    setTestCases((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      categories: categories.split(',').map((item) => item.trim()).filter(Boolean),
      languageOptions: languageList,
      defaultLanguage,
      starterCode,
      timeLimit: Number(timeLimit),
      maxScore: Number(maxScore),
      testCases: testCases.map((testCase) => ({
        input: String(testCase.input || '').trim(),
        expectedOutput: String(testCase.expectedOutput || '').trim(),
        hidden: Boolean(testCase.hidden),
      })),
      tags: tags.split(',').map((item) => item.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
      </div>

      <label className="space-y-2 text-sm text-slate-700">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          Categories
          <input
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            placeholder="algorithms, strings"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </label>
        <label className="space-y-2 text-sm text-slate-700">
          Language Options
          <input
            value={languageOptions}
            onChange={(e) => setLanguageOptions(e.target.value)}
            placeholder="javascript, python, java"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="space-y-2 text-sm text-slate-700">
          Default Language
          <select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
          >
            {languageList.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Time Limit (s)
            <input
              type="number"
              min="1"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Max Score
            <input
              type="number"
              min="0"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Starter Code</h3>
          <span className="text-xs text-slate-500">Editable per language</span>
        </div>
        {supportedLanguages.map((lang) => (
          <label key={lang} className="space-y-2 text-sm text-slate-700">
            {lang}
            <textarea
              rows={4}
              value={starterCode[lang] || ''}
              onChange={(e) => setStarterCode((current) => ({ ...current, [lang]: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
            />
          </label>
        ))}
      </div>

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Test Cases</h3>
          <button
            type="button"
            onClick={addTestCase}
            className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Add case
          </button>
        </div>
        {testCases.map((testCase, index) => (
          <div key={index} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-700">Case {index + 1}</span>
              <button
                type="button"
                onClick={() => removeTestCase(index)}
                className="text-sm font-semibold text-rose-600 hover:text-rose-800"
              >
                Remove
              </button>
            </div>
            <label className="space-y-2 text-sm text-slate-700">
              Input
              <textarea
                rows={2}
                value={testCase.input}
                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Expected Output
              <textarea
                rows={2}
                value={testCase.expectedOutput}
                onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={testCase.hidden}
                onChange={(e) => handleTestCaseChange(index, 'hidden', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Hidden test case
            </label>
          </div>
        ))}
      </div>

      <label className="space-y-2 text-sm text-slate-700">
        Tags
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="math, arrays"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
      </label>

      <button
        type="submit"
        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
      >
        {submitLabel}
      </button>
    </form>
  );
}
