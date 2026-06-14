import Editor from '@monaco-editor/react';

const languageMappings = {
  javascript: 'javascript',
  python: 'python',
  java: 'java',
  cpp: 'cpp',
  c: 'c',
  typescript: 'typescript',
};

export default function CodeEditor({ language, value, onChange, height = '520px' }) {
  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 shadow-sm">
      <Editor
        height={height}
        defaultLanguage={languageMappings[language] || 'javascript'}
        language={languageMappings[language] || 'javascript'}
        theme="vs-dark"
        value={value}
        onChange={(value) => onChange(value || '')}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
        }}
      />
    </div>
  );
}
