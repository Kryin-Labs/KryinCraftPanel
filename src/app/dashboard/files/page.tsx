'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree,
  Folder,
  File,
  FileCode,
  FolderPlus,
  Trash2,
  Edit3,
  ChevronRight,
  Save,
  X,
  Archive,
  Check,
  CornerLeftUp,
  RefreshCw,
  Loader2,
  FileText,
  Settings2,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { ServerFile } from '@/types';
import { ConfigBackups } from '@/components/ConfigBackups';

export default function FileManagerPage() {
  const { activeServerId, permissions, isLoading } = useServerStore();

  if (isLoading) return <p role="status" className="text-sm">Loading server access…</p>;
  if (!permissions.includes('files')) {
    return <p className="text-sm">File access is required to manage server files.</p>;
  }

  return <FileManager key={activeServerId} />;
}

function FileManager() {
  const {
    files,
    fetchDirectory,
    fetchFileContent,
    saveFileContent,
    deleteFile,
    createFolder,
    createFile,
    serverInfo,
    activeServerId,
    serverRole,
  } = useServerStore();

  const [currentPath, setCurrentPath] = useState('/');
  const [editingFile, setEditingFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingDir, setIsLoadingDir] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Editor DOM refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const currentFiles = files[currentPath] || [];

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // Sync directory from Indian Node whenever path changes
  useEffect(() => {
    let isMounted = true;
    async function loadDir() {
      setIsLoadingDir(true);
      try {
        await fetchDirectory(currentPath);
      } finally {
        if (isMounted) setIsLoadingDir(false);
      }
    }
    loadDir();
    return () => {
      isMounted = false;
    };
  }, [currentPath]);

  // Handle Ctrl+S keyboard shortcut inside editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        if (editingFile && !isSaving) {
          e.preventDefault();
          handleSaveEditor();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingFile, isSaving]);

  // Sync line numbers scroll with textarea
  const handleEditorScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleOpenItem = async (item: ServerFile) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else {
      setIsLoadingFile(item.path);
      try {
        const content = await fetchFileContent(item.path);
        setEditingFile({
          path: item.path,
          name: item.name,
          content: content || `# Content of ${item.name}\n`,
        });
      } finally {
        setIsLoadingFile(null);
      }
    }
  };

  const handleSaveEditor = async () => {
    if (!editingFile || isSaving) return;
    setIsSaving(true);
    try {
      await saveFileContent(editingFile.path, editingFile.content);
      showNotice(`Successfully saved ${editingFile.name} to Indian Node.`);
    } catch (err: any) {
      showNotice(`Failed to save ${editingFile.name}: ${err?.message || 'Error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(currentPath, newFolderName.trim());
    showNotice(`Created folder "${newFolderName.trim()}".`);
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    const fname = newFileName.trim();
    if (!fname) return;
    await createFile(currentPath, fname, '');
    showNotice(`Created file "${fname}".`);
    setNewFileName('');
    setIsNewFileOpen(false);
    const cleanParent = currentPath === '/' ? '' : currentPath;
    const fullPath = `${cleanParent}/${fname}`;
    setEditingFile({
      path: fullPath,
      name: fname,
      content: '',
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingPath) return;
    const p = deletingPath;
    setDeletingPath(null);
    await deleteFile(p);
    showNotice(`Deleted ${p.split('/').pop()}.`);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const handleRefreshDirectory = async () => {
    setIsLoadingDir(true);
    try {
      await fetchDirectory(currentPath);
      showNotice(`Synchronized directory with Indian Node.`);
    } finally {
      setIsLoadingDir(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
  };

  const getFileIcon = (item: ServerFile) => {
    if (item.isDirectory) return <Folder className="w-4 h-4 text-blue-600" />;
    if (item.extension === 'jar') return <Archive className="w-4 h-4 text-indigo-600" />;
    if (['properties', 'yml', 'yaml', 'json', 'toml'].includes(item.extension || '')) {
      return <FileCode className="w-4 h-4 text-emerald-600" />;
    }
    if (['log', 'txt'].includes(item.extension || '')) {
      return <FileText className="w-4 h-4 text-amber-600" />;
    }
    return <File className="w-4 h-4 text-[#1a1522]/50" />;
  };

  // Breadcrumbs calculation (Pterodactyl /home/container/ style)
  const breadcrumbSegments = currentPath
    .split('/')
    .filter(Boolean)
    .map((seg, idx, arr) => ({
      name: seg,
      path: '/' + arr.slice(0, idx + 1).join('/'),
    }));

  const linesCount = editingFile ? editingFile.content.split('\n').length : 0;
  const fileExt = editingFile ? editingFile.name.split('.').pop()?.toUpperCase() || 'TXT' : '';

  return (
    <div className="space-y-6 font-mono text-[#1a1522]">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-blue-600 hover:text-blue-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {serverRole === 'owner' && activeServerId && <ConfigBackups key={activeServerId} serverId={activeServerId} />}

      {/* Header Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1522] flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-blue-600" />
            Server File Manager
          </h1>
          <p className="text-xs text-[#1a1522]/60 mt-1">
            Real-time filesystem sync on Indian Node (<code className="text-blue-700">~/minecraft/server</code>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefreshDirectory}
            disabled={isLoadingDir}
            className="p-2.5 rounded-xl bg-[#f8f9fd] hover:bg-slate-100 text-[#1a1522]/70 hover:text-[#1a1522] border border-[#1a1522]/15 text-xs transition-colors"
            title="Reload directory from node"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingDir ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* New Folder */}
          <button
            onClick={() => {
              setIsNewFolderOpen(!isNewFolderOpen);
              setIsNewFileOpen(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>New Folder</span>
          </button>

          {/* New File */}
          <button
            onClick={() => {
              setIsNewFileOpen(!isNewFileOpen);
              setIsNewFolderOpen(false);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>New File</span>
          </button>
        </div>
      </div>

      {/* New File Input Dropdown */}
      {isNewFileOpen && (
        <form onSubmit={handleCreateFile} className="p-4 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center gap-3 animate-fade-in">
          <FileCode className="w-4 h-4 text-emerald-600" />
          <input
            type="text"
            placeholder="File name (e.g. motd.txt, server.properties, rules.yml)..."
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            className="flex-1 bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] focus:outline-none focus:border-blue-600 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs font-mono transition-all shadow-xs"
          >
            Create File
          </button>
          <button
            type="button"
            onClick={() => setIsNewFileOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#f8f9fd] text-[#1a1522]/60 hover:text-[#1a1522] text-xs font-mono border border-[#1a1522]/10"
          >
            Cancel
          </button>
        </form>
      )}

      {/* New Folder Input Dropdown */}
      {isNewFolderOpen && (
        <form onSubmit={handleCreateFolder} className="p-4 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center gap-3 animate-fade-in">
          <Folder className="w-4 h-4 text-blue-600" />
          <input
            type="text"
            placeholder="Folder name (e.g. plugins_backup)..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 bg-[#f8f9fd] border border-[#1a1522]/15 rounded-xl px-3.5 py-2 text-xs text-[#1a1522] focus:outline-none focus:border-blue-600 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs font-mono transition-all shadow-xs"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsNewFolderOpen(false)}
            className="px-4 py-2 rounded-xl bg-[#f8f9fd] text-[#1a1522]/60 hover:text-[#1a1522] text-xs font-mono border border-[#1a1522]/10"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Pterodactyl-Style Clickable Breadcrumb Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[#1a1522]/70 font-semibold select-none">
          <span className="text-zinc-400 font-mono">/home/container</span>
          <span className="text-zinc-300">/</span>
          <button
            onClick={() => setCurrentPath('/')}
            className={`transition-colors font-bold px-1.5 py-0.5 rounded ${currentPath === '/' ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600'
              }`}
          >
            root
          </button>

          {breadcrumbSegments.map((crumb, idx) => {
            const isLast = idx === breadcrumbSegments.length - 1;
            return (
              <React.Fragment key={crumb.path}>
                <span className="text-zinc-300">/</span>
                <button
                  onClick={() => setCurrentPath(crumb.path)}
                  className={`transition-colors px-1.5 py-0.5 rounded truncate max-w-[140px] ${isLast ? 'text-blue-600 bg-blue-50 font-bold' : 'hover:text-blue-600'
                    }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {isLoadingDir && (
            <span className="flex items-center gap-1 text-[11px] text-blue-600">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Syncing...</span>
            </span>
          )}

          {currentPath !== '/' && (
            <button
              onClick={handleNavigateUp}
              className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold transition-colors pl-2"
            >
              <CornerLeftUp className="w-3.5 h-3.5" />
              <span>Up Level</span>
            </button>
          )}
        </div>
      </div>

      {/* Files List Table */}
      <div className="rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs overflow-hidden">
        {currentFiles.length === 0 ? (
          <div className="p-12 text-center text-[#1a1522]/50 text-xs">
            {isLoadingDir ? (
              <div className="flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <span>Reading directory from Indian Node...</span>
              </div>
            ) : (
              'This directory is empty or syncing from server.'
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1a1522]/8">
            {currentFiles.map((file) => {
              const isReading = isLoadingFile === file.path;
              return (
                <div
                  key={file.path}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#f8f9fd] transition-colors group cursor-pointer"
                  onClick={() => handleOpenItem(file)}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10 flex-shrink-0">
                      {isReading ? (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      ) : (
                        getFileIcon(file)
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-[#1a1522] group-hover:text-blue-600 transition-colors truncate block font-mono">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[#1a1522]/50 block mt-0.5">
                        {file.modifiedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-[#1a1522]/60 flex-shrink-0">
                    <span className="font-mono text-[11px]">
                      {file.isDirectory ? 'Folder' : formatFileSize(file.sizeBytes)}
                    </span>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!file.isDirectory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenItem(file);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-[#1a1522]/60 hover:text-blue-600 border border-transparent hover:border-blue-200 transition-colors"
                          title="Edit file"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingPath(file.path);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-[#1a1522]/60 hover:text-red-600 border border-transparent hover:border-red-200 transition-colors"
                        title="Delete file or folder"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pterodactyl-Grade Syntax Code Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 font-mono">
          <div className="w-full max-w-5xl bg-[#0d1117] border border-white/15 rounded-2xl flex flex-col h-[90vh] shadow-2xl overflow-hidden text-zinc-100">
            {/* Editor Header */}
            <div className="px-4 py-3 bg-[#161b22] border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCode className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-bold text-xs text-zinc-200 truncate">{editingFile.path}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-300 border border-blue-500/30 uppercase font-semibold">
                  {fileExt}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="hidden sm:inline text-[11px] text-zinc-400">
                  Ctrl+S to save
                </span>

                <button
                  type="button"
                  onClick={async () => {
                    if (!editingFile) return;
                    setIsSaving(true);
                    try {
                      const c = await fetchFileContent(editingFile.path);
                      setEditingFile({ ...editingFile, content: c });
                      showNotice(`Reloaded ${editingFile.name} from disk.`);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all font-mono"
                  title="Reload content from server"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reload</span>
                </button>

                <button
                  onClick={handleSaveEditor}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all font-mono shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                </button>

                <button
                  onClick={() => setEditingFile(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  title="Close editor (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Interior with Line Numbers Gutter */}
            <div className="flex-1 flex overflow-hidden bg-[#0d1117]">
              {/* Line Numbers Gutter */}
              <div
                ref={lineNumbersRef}
                className="w-12 py-4 select-none bg-[#161b22]/40 text-right pr-3 font-mono text-xs text-zinc-600 overflow-hidden leading-relaxed border-r border-white/5"
              >
                {Array.from({ length: linesCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea Code Body */}
              <textarea
                ref={textareaRef}
                value={editingFile.content}
                onChange={(e) =>
                  setEditingFile({ ...editingFile, content: e.target.value })
                }
                onScroll={handleEditorScroll}
                className="flex-1 p-4 bg-transparent text-xs text-zinc-100 font-mono resize-none focus:outline-none leading-relaxed select-text overflow-auto"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
              />
            </div>

            {/* Editor Status Footer */}
            <div className="px-4 py-2 bg-[#161b22] border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-4">
                <span>Lines: <strong className="text-zinc-200">{linesCount}</strong></span>
                <span>Size: <strong className="text-zinc-200">{formatFileSize(editingFile.content.length)}</strong></span>
              </div>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Atomic write ready
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deletingPath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-mono">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4 text-[#1a1522]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-red-600 font-bold text-base">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span>Delete {deletingPath.split('/').pop()}?</span>
              </div>
              <button
                onClick={() => setDeletingPath(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Are you sure you want to permanently delete <code className="bg-red-50 text-red-700 px-1 py-0.5 rounded font-bold">{deletingPath}</code> from Indian Node? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setDeletingPath(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
