'use client';

import React, { useState } from 'react';
import {
  FolderTree,
  Folder,
  File,
  FileCode,
  FolderPlus,
  Upload,
  Download,
  Trash2,
  Edit3,
  ChevronRight,
  Save,
  X,
  Archive,
  Check,
  Zap,
  CornerLeftUp
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { ServerFile } from '@/types';

export default function FileManagerPage() {
  const { files, fileContents, saveFileContent, deleteFile, createFolder } = useServerStore();

  const [currentPath, setCurrentPath] = useState('/');
  const [editingFile, setEditingFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const currentFiles = files[currentPath] || [];

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleOpenItem = (item: ServerFile) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else {
      const content = fileContents[item.path] || `# Content of ${item.name}\n# Auto-generated for KryinCraft\n`;
      setEditingFile({
        path: item.path,
        name: item.name,
        content,
      });
    }
  };

  const handleSaveEditor = async () => {
    if (!editingFile) return;
    setIsSaving(true);
    await saveFileContent(editingFile.path, editingFile.content);
    setIsSaving(false);
    showNotice(`Successfully saved ${editingFile.name}.`);
    setEditingFile(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(currentPath, newFolderName.trim());
    showNotice(`Created directory "${newFolderName.trim()}".`);
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    const newPath = '/' + parts.join('/');
    setCurrentPath(newPath === '' ? '/' : newPath);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
  };

  const getFileIcon = (item: ServerFile) => {
    if (item.isDirectory) return <Folder className="w-4 h-4 text-blue-400" />;
    if (item.extension === 'jar') return <Archive className="w-4 h-4 text-purple-400" />;
    if (['properties', 'yml', 'json', 'toml'].includes(item.extension || '')) {
      return <FileCode className="w-4 h-4 text-emerald-400" />;
    }
    return <File className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Toast Notice */}
      {notice && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-[#121019] border border-[#242131] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-emerald-400" />
            Server File Manager
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse and configure server.properties, plugins, world saves, and Paper configs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewFolderOpen(!isNewFolderOpen)}
            className="px-3.5 py-1.5 rounded-lg bg-[#1a1724] hover:bg-[#231f31] text-zinc-200 border border-[#2b273b] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* New Folder Modal / Input */}
      {isNewFolderOpen && (
        <form onSubmit={handleCreateFolder} className="p-4 rounded-xl bg-[#121019] border border-[#242131] flex items-center gap-3">
          <Folder className="w-4 h-4 text-blue-400" />
          <input
            type="text"
            placeholder="Folder name (e.g. plugins_backup)..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="flex-1 bg-[#181622] border border-[#2b273b] rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold text-xs font-mono"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setIsNewFolderOpen(false)}
            className="px-3 py-1.5 rounded-lg bg-[#181622] text-zinc-400 hover:text-white text-xs font-mono"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Breadcrumb Path Bar */}
      <div className="p-3 rounded-xl bg-[#121019] border border-[#242131] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-zinc-300">
          <button
            onClick={() => setCurrentPath('/')}
            className="hover:text-emerald-400 transition-colors font-bold px-1 py-0.5 rounded"
          >
            root
          </button>
          {currentPath !== '/' &&
            currentPath
              .split('/')
              .filter(Boolean)
              .map((segment, idx, arr) => {
                const fullPath = '/' + arr.slice(0, idx + 1).join('/');
                return (
                  <React.Fragment key={fullPath}>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <button
                      onClick={() => setCurrentPath(fullPath)}
                      className="hover:text-emerald-400 transition-colors px-1 py-0.5 rounded truncate max-w-[120px]"
                    >
                      {segment}
                    </button>
                  </React.Fragment>
                );
              })}
        </div>

        {currentPath !== '/' && (
          <button
            onClick={handleNavigateUp}
            className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors pl-2"
          >
            <CornerLeftUp className="w-3.5 h-3.5" />
            <span>Up</span>
          </button>
        )}
      </div>

      {/* Files Grid / List */}
      <div className="rounded-xl bg-[#121019] border border-[#242131] overflow-hidden">
        {currentFiles.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-xs">
            This directory is empty.
          </div>
        ) : (
          <div className="divide-y divide-[#1e1b29]">
            {currentFiles.map((file) => (
              <div
                key={file.path}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-[#161421] transition-colors group cursor-pointer"
                onClick={() => handleOpenItem(file)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-[#181622] border border-[#262333] flex-shrink-0">
                    {getFileIcon(file)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-xs text-zinc-200 group-hover:text-emerald-300 transition-colors truncate block font-mono">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      {file.modifiedAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-zinc-400 flex-shrink-0">
                  <span className="font-mono text-[11px]">
                    {file.isDirectory ? 'Directory' : formatFileSize(file.sizeBytes)}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!file.isDirectory && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenItem(file);
                        }}
                        className="p-1.5 rounded hover:bg-[#231f31] text-zinc-300 hover:text-white"
                        title="Edit file"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFile(file.path);
                        showNotice(`Deleted ${file.name}.`);
                      }}
                      className="p-1.5 rounded hover:bg-red-950/50 text-zinc-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Code Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full max-w-4xl bg-[#0e0d13] border border-[#2b273b] rounded-2xl flex flex-col h-[85vh] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#14121c] border-b border-[#242131] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-zinc-100">{editingFile.path}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEditor}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors font-mono"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                </button>
                <button
                  onClick={() => setEditingFile(null)}
                  className="p-1.5 rounded-lg hover:bg-[#221f2f] text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 p-4 bg-[#08070b] overflow-hidden">
              <textarea
                value={editingFile.content}
                onChange={(e) =>
                  setEditingFile({ ...editingFile, content: e.target.value })
                }
                className="w-full h-full bg-transparent text-xs text-zinc-200 font-mono resize-none focus:outline-none leading-relaxed select-text"
                spellCheck={false}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 bg-[#14121c] border-t border-[#242131] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Lines: {editingFile.content.split('\n').length}</span>
              <span className="text-emerald-400">Ready to save to disk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
