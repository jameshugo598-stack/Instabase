import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Play,
  Check,
  Code,
  Terminal,
  Globe,
  Search,
  Zap,
  LayoutTemplate,
  Settings2,
  Copy,
  Server,
  Key,
} from 'lucide-react';
import { parseD2, generateSql, Table } from './lib/parser';
import { Switch } from './components/ui/switch';

const DEFAULT_D2 = `Users: {
  shape: sql_table
  id: int
  email: text
  created_at: timestamp
}

Posts: {
  shape: sql_table
  id: int
  title: text
  content: text
  user_id: int
}`;

export default function App() {
  const [d2Input, setD2Input] = useState(DEFAULT_D2);
  const [tables, setTables] = useState<Table[]>([]);
  const [vectorSearch, setVectorSearch] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'sql' | 'cursor' | 'api'>('sql');
  const [deployState, setDeployState] = useState<'idle' | 'deploying' | 'success'>('idle');

  useEffect(() => {
    const parsed = parseD2(d2Input);
    setTables(parsed);
  }, [d2Input]);

  const sqlOutput = generateSql(tables, vectorSearch);

  const handleDeploy = () => {
    setDeployState('deploying');
    setTimeout(() => {
      setDeployState('success');
      setTimeout(() => setDeployState('idle'), 3000);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const cursorPrompt = `I am building a new application using SQLite. 
Here is my database schema:

\`\`\`sql
${sqlOutput}
\`\`\`

Please generate the TypeScript types and a basic CRUD repository for this schema.`;

  return (
    <div className="flex h-screen w-full flex-col bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Database size={18} />
          </div>
          <span className="font-semibold text-white tracking-tight">InstaBase</span>
          <span className="ml-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-400 border border-white/10">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeploy}
            disabled={deployState !== 'idle'}
            className="group relative flex h-8 items-center gap-2 overflow-hidden rounded-md bg-blue-600 px-3 text-sm font-medium text-white transition-all hover:bg-blue-500 disabled:opacity-80"
          >
            <AnimatePresence mode="wait">
              {deployState === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <Play size={14} className="fill-current" />
                  Deploy to Turso
                </motion.div>
              )}
              {deployState === 'deploying' && (
                <motion.div
                  key="deploying"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deploying...
                </motion.div>
              )}
              {deployState === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2"
                >
                  <Check size={14} />
                  Deployed
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Pane: Editor */}
        <section className="flex w-1/3 flex-col border-r border-white/10 bg-[#0c0c0c]">
          <div className="flex h-10 items-center border-b border-white/5 px-4">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              <Code size={14} />
              Schema Editor (D2)
            </div>
          </div>
          <div className="relative flex-1">
            <textarea
              value={d2Input}
              onChange={(e) => setD2Input(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-300 outline-none placeholder:text-gray-700"
              spellCheck={false}
              placeholder="Define your schema here..."
            />
          </div>
        </section>

        {/* Middle Pane: Visual ERD */}
        <section className="flex w-1/3 flex-col border-r border-white/10 bg-[#0a0a0a] relative overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          
          <div className="relative flex h-10 items-center justify-between border-b border-white/5 px-4 bg-[#0a0a0a]/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              <LayoutTemplate size={14} />
              Visual Preview
            </div>
          </div>
          
          <div className="relative flex-1 overflow-auto p-8">
            <div className="flex flex-col gap-8 items-center">
              {tables.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-600">
                  No valid tables defined.
                </div>
              ) : (
                tables.map((table, i) => (
                  <motion.div
                    key={table.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-64 overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-2xl shadow-black/50"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Database size={14} className="text-blue-400" />
                        <span className="font-mono text-sm font-semibold text-white">{table.name}</span>
                      </div>
                    </div>
                    <div className="flex flex-col px-4 py-3">
                      {table.columns.map((col, j) => (
                        <div key={j} className="flex items-center justify-between py-1.5">
                          <span className="font-mono text-xs text-gray-300">{col.name}</span>
                          <span className="font-mono text-[10px] text-blue-400/80 uppercase tracking-wider">{col.type}</span>
                        </div>
                      ))}
                      {vectorSearch[table.name] && (
                        <div className="flex items-center justify-between py-1.5 border-t border-white/5 mt-1 pt-2">
                          <span className="font-mono text-xs text-purple-400 flex items-center gap-1">
                            <Zap size={10} /> embedding
                          </span>
                          <span className="font-mono text-[10px] text-purple-400/80 uppercase tracking-wider">F32_BLOB(768)</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Pane: Magic Panel */}
        <section className="flex w-1/3 flex-col bg-[#0c0c0c]">
          <div className="flex h-10 items-center border-b border-white/5 px-2">
            <div className="flex gap-1">
              {[
                { id: 'sql', label: 'SQL', icon: Database },
                { id: 'cursor', label: 'Cursor', icon: Terminal },
                { id: 'api', label: 'Live API', icon: Globe },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'sql' && (
                <motion.div
                  key="sql"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex items-center justify-between rounded-lg border border-white/10 bg-[#141414] p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Settings2 size={16} />
                      Vector Search Features
                    </div>
                  </div>
                  
                  {tables.length > 0 && (
                    <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-[#141414] p-3">
                      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Enable Embeddings
                      </div>
                      {tables.map((table) => (
                        <div key={table.name} className="flex items-center justify-between py-1">
                          <span className="font-mono text-sm text-gray-300">{table.name}</span>
                          <Switch
                            checked={vectorSearch[table.name] || false}
                            onChange={(checked) =>
                              setVectorSearch((prev) => ({ ...prev, [table.name]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="group relative mt-2 rounded-lg border border-white/10 bg-[#141414] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-xs font-medium text-gray-400">Generated SQLite</span>
                      <button
                        onClick={() => copyToClipboard(sqlOutput)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed text-gray-300">
                      <code>{sqlOutput}</code>
                    </pre>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cursor' && (
                <motion.div
                  key="cursor"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4"
                >
                  <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-400">
                      <Zap size={16} />
                      Connect to Cursor
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Copy this prompt into Cursor or your favorite AI coding assistant to instantly generate your application boilerplate.
                    </p>
                  </div>

                  <div className="group relative rounded-lg border border-white/10 bg-[#141414] overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-2">
                      <span className="text-xs font-medium text-gray-400">AI Prompt</span>
                      <button
                        onClick={() => copyToClipboard(cursorPrompt)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed text-gray-300 whitespace-pre-wrap">
                      <code>{cursorPrompt}</code>
                    </pre>
                  </div>
                </motion.div>
              )}

              {activeTab === 'api' && (
                <motion.div
                  key="api"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col gap-4"
                >
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-green-400">
                      <Server size={16} />
                      Live REST API
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your database is instantly available via REST. Use these endpoints to interact with your data.
                    </p>
                  </div>

                  {tables.length === 0 ? (
                    <div className="text-sm text-gray-500">Define tables to see API endpoints.</div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {tables.map((table) => (
                        <div key={table.name} className="rounded-lg border border-white/10 bg-[#141414] p-3">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded bg-green-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-green-400">GET</span>
                            <span className="font-mono text-xs text-gray-300">
                              https://instabase.vercel.app/api/v1/user_id/{table.name.toLowerCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-blue-500/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-blue-400">POST</span>
                            <span className="font-mono text-xs text-gray-300">
                              https://instabase.vercel.app/api/v1/user_id/{table.name.toLowerCase()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 rounded-lg border border-white/10 bg-[#141414] p-4">
                    <h4 className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-400">
                      <Key size={14} />
                      Authentication
                    </h4>
                    <p className="mb-2 text-xs text-gray-500">Include your API key in the headers:</p>
                    <pre className="rounded bg-black/50 p-2 font-mono text-xs text-gray-300">
                      Authorization: Bearer ib_live_xxxxxxxx
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </div>
  );
}
