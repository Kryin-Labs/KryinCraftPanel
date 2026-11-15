'use client';

import React, { useState } from 'react';
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
    if (!editingFile || isSaving) return;
    setIsSaving(true);
    try {
      await saveFileContent(editingFile.path, editingFile.content);
      showNotice(`Successfully saved ${editingFile.name} to server disk.`);
      setEditingFile(null);
    } catch (err: any) {
      showNotice(`Failed to save ${editingFile.name}: ${err?.message || 'Error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    createFolder(currentPath, newFolderName.trim());
    showNotice(`Created folder "${newFolderName.trim()}".`);
    setNewFolderName('');
    setIsNewFolderOpen(false);
  };

  const handleNavigateUp = () => {
    if (currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length === 0 ? '/' : '/' + parts.join('/'));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
  };

  const getFileIcon = (item: ServerFile) => {
    if (item.isDirectory) return <Folder className="w-4 h-4 text-blue-600" />;
    if (item.extension === 'jar') return <Archive className="w-4 h-4 text-indigo-600" />;
    if (['properties', 'yml', 'json', 'toml'].includes(item.extension || '')) {
      return <FileCode className="w-4 h-4 text-blue-600" />;
    }
    return <File className="w-4 h-4 text-[#1a1522]/50" />;
  };

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

      {/* Header Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1a1522] flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-blue-600" />
            Server File Manager
          </h1>
          <p className="text-xs text-[#1a1522]/60 mt-1">
            Browse and configure server.properties, plugins, world saves, and Paper configs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewFolderOpen(!isNewFolderOpen)}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* New Folder Modal / Input */}
      {isNewFolderOpen && (
        <form onSubmit={handleCreateFolder} className="p-4 rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center gap-3">
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

      {/* Breadcrumb Path Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-[#1a1522]/10 shadow-xs flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto text-[#1a1522]/70 font-semibold">
          <button
            onClick={() => setCurrentPath('/')}
            className="hover:text-blue-600 transition-colors font-bold px-1.5 py-0.5 rounded"
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
                    <ChevronRight className="w-3.5 h-3.5 text-[#1a1522]/30 flex-shrink-0" />
                    <button
                      onClick={() => setCurrentPath(fullPath)}
                      className="hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded truncate max-w-[140px]"
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
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold transition-colors pl-2"
          >
            <CornerLeftUp className="w-3.5 h-3.5" />
            <span>Up One Level</span>
          </button>
        )}
      </div>

      {/* Files Grid / List */}
      <div className="rounded-2xl bg-white border border-[#1a1522]/10 shadow-xs overflow-hidden">
        {currentFiles.length === 0 ? (
          <div className="p-12 text-center text-[#1a1522]/50 text-xs">
            This directory is empty.
          </div>
        ) : (
          <div className="divide-y divide-[#1a1522]/8">
            {currentFiles.map((file) => (
              <div
                key={file.path}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-[#f8f9fd] transition-colors group cursor-pointer"
                onClick={() => handleOpenItem(file)}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-[#f8f9fd] border border-[#1a1522]/10 flex-shrink-0">
                    {getFileIcon(file)}
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
                    {file.isDirectory ? 'Directory' : formatFileSize(file.sizeBytes)}
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
                        deleteFile(file.path);
                        showNotice(`Deleted ${file.name}.`);
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-[#1a1522]/60 hover:text-red-600 border border-transparent hover:border-red-200 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in font-mono">
          <div className="w-full max-w-4xl bg-white border border-[#1a1522]/15 rounded-2xl flex flex-col h-[85vh] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-[#fbfbfe] border-b border-[#1a1522]/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCode className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-xs text-[#1a1522]">{editingFile.path}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEditor}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all font-mono shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save File'}</span>
                </button>
                <button
                  onClick={() => setEditingFile(null)}
                  className="p-1.5 rounded-lg hover:bg-[#1a1522]/10 text-[#1a1522]/60 hover:text-[#1a1522]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <div className="flex-1 p-4 bg-[#0e1117] overflow-hidden">
              <textarea
                value={editingFile.content}
                onChange={(e) =>
                  setEditingFile({ ...editingFile, content: e.target.value })
                }
                className="w-full h-full bg-transparent text-xs text-zinc-100 font-mono resize-none focus:outline-none leading-relaxed select-text"
                spellCheck={false}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#fbfbfe] border-t border-[#1a1522]/10 flex items-center justify-between text-[11px] text-[#1a1522]/60">
              <span>Lines: {editingFile.content.split('\n').length}</span>
              <span className="text-blue-700 font-bold">Ready to save to disk</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
