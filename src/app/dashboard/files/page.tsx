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
  ShieldAlert,
  Save,
  X,
  FileText,
  Archive,
} from 'lucide-react';
import { useServerStore } from '@/lib/serverStore';
import { ServerFile } from '@/types';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function FileManagerPage() {
  const { files, fileContents, saveFileContent, deleteFile, createFolder } = useServerStore();

  const [currentPath, setCurrentPath] = useState('/');
  const [editingFile, setEditingFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServerFile | null>(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentFiles = files[currentPath] || [];

  const handleOpenItem = (item: ServerFile) => {
    if (item.isDirectory) {
      setCurrentPath(item.path);
    } else {
      // Check if text/editable file
      const content = fileContents[item.path] || `# Content of ${item.name}\n# (Simulated file view)\n`;
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
    setEditingFile(null);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(currentPath, newFolderName.trim());
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const breadcrumbs = currentPath === '/' ? [''] : currentPath.split('/');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
  };

  const getFileIcon = (item: ServerFile) => {
    if (item.isDirectory) return <Folder className="w-5 h-5 text-blue-400 fill-blue-500/20" />;
    if (item.extension === 'jar') return <Archive className="w-5 h-5 text-purple-400" />;
    if (item.extension === 'properties' || item.extension === 'yml' || item.extension === 'json') {
      return <FileCode className="w-5 h-5 text-emerald-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-blue-400" />
            Minecraft File Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Path traversal restricted to: <code className="text-blue-300 font-mono text-[11px]">~/minecraft/server</code>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsNewFolderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Folder
          </button>
          <button
            onClick={() => alert('Safe SFTP / chunked upload handler ready for Phase 4 Termux agent.')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>
      </div>

      {/* Path Traversal & Security Alert */}
      <div className="px-4 py-2.5 rounded-xl bg-blue-950/20 border border-blue-900/40 flex items-center gap-2.5 text-xs text-blue-300">
        <ShieldAlert className="w-4 h-4 shrink-0 text-blue-400" />
        <span>
          Root isolation active. Symlink dereferencing and traversal outside <code className="font-mono text-white">/home/minecraft/server</code> are blocked.
        </span>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="p-3 rounded-xl bg-[#111722] border border-slate-800/80 flex items-center gap-1.5 text-xs overflow-x-auto">
        <button
          onClick={() => setCurrentPath('/')}
          className={`hover:text-white font-mono px-2 py-1 rounded transition-colors ${
            currentPath === '/' ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-400'
          }`}
        >
          ~/minecraft/server
        </button>

        {breadcrumbs.map((part, index) => {
          if (!part) return null;
          const targetPath = '/' + breadcrumbs.slice(1, index + 1).join('/');
          const isLast = index === breadcrumbs.length - 1;

          return (
            <React.Fragment key={targetPath}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => setCurrentPath(targetPath)}
                className={`hover:text-white font-mono px-2 py-1 rounded transition-colors shrink-0 ${
                  isLast ? 'text-blue-400 font-bold bg-blue-950/40' : 'text-slate-400'
                }`}
              >
                {part}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Files List / Table */}
      <div className="bg-[#111722] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 p-3 bg-slate-900/60 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <div className="col-span-7 sm:col-span-6">Name</div>
          <div className="col-span-3 sm:col-span-3">Size</div>
          <div className="hidden sm:block sm:col-span-2">Modified</div>
          <div className="col-span-2 sm:col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-800/50">
          {currentPath !== '/' && (
            <div
              onClick={() => {
                const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
                setCurrentPath(parent);
              }}
              className="p-3 hover:bg-slate-800/30 cursor-pointer flex items-center gap-3 text-xs text-blue-400 font-mono transition-colors"
            >
              <Folder className="w-4 h-4" />
              <span>.. (Up one level)</span>
            </div>
          )}

          {currentFiles.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              This directory is empty.
            </div>
          ) : (
            currentFiles.map((file) => (
              <div
                key={file.path}
                className="grid grid-cols-12 p-3 hover:bg-slate-800/40 items-center text-xs transition-colors group"
              >
                <div
                  onClick={() => handleOpenItem(file)}
                  className="col-span-7 sm:col-span-6 flex items-center gap-3 cursor-pointer min-w-0"
                >
                  {getFileIcon(file)}
                  <span
                    className={`font-mono truncate ${
                      file.isDirectory
                        ? 'text-white font-semibold hover:text-blue-400'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {file.name}
                  </span>
                </div>

                <div className="col-span-3 sm:col-span-3 font-mono text-slate-400 text-[11px]">
                  {file.isDirectory ? 'Directory' : formatFileSize(file.sizeBytes)}
                </div>

                <div className="hidden sm:block sm:col-span-2 font-mono text-slate-500 text-[11px]">
                  {file.modifiedAt}
                </div>

                <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-1.5">
                  {!file.isDirectory && (
                    <button
                      onClick={() => handleOpenItem(file)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit file"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteTarget(file)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* In-Browser Text File Editor Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-3xl bg-[#111722] border border-slate-800 rounded-2xl flex flex-col h-[80vh] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-[#0d131d]">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-white text-sm font-mono">{editingFile.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{editingFile.path}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingFile(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-3 bg-[#0a0d14] overflow-hidden">
              <textarea
                value={editingFile.content}
                onChange={(e) =>
                  setEditingFile((prev) => (prev ? { ...prev, content: e.target.value } : null))
                }
                className="w-full h-full bg-transparent font-mono text-xs text-slate-200 resize-none focus:outline-none leading-relaxed p-2"
                spellCheck={false}
              />
            </div>

            <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-[#0d131d]">
              <span className="text-xs text-slate-400">
                {editingFile.content.split('\n').length} lines • {editingFile.content.length} characters
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingFile(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditor}
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#111722] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-blue-400" />
              Create New Folder
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="Folder name (e.g. datapacks)"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full bg-[#0a0d14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={`Delete ${deleteTarget?.name}?`}
        message={`Are you sure you want to permanently delete "${deleteTarget?.path}" from the server storage? This cannot be undone.`}
        confirmText="Delete Permanently"
        isDestructive={true}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteFile(deleteTarget.path);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
