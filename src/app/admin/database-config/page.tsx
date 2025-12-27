'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/layout';
import { databaseConfigApi } from '@/lib/api';

interface Collection {
  name: string;
}

interface DocumentList {
  total: number;
  docs: any[];
}

const PAGE_SIZE = 20;

// Helper to guess field type
function guessFieldType(value: any) {
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    // Try to detect date
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) return 'date';
    return 'string';
  }
  return 'string';
}

function toCSV(rows: any[]): string {
  if (!rows.length) return '';
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(',')].concat(
    rows.map(row => keys.map(k => JSON.stringify(row[k] ?? '')).join(','))
  );
  return csv.join('\n');
}

const DatabaseConfigPage = () => {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // All hooks must be declared before any return
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filteredDocs, setFilteredDocs] = useState<any[]>([]);
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDoc, setEditDoc] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewDoc, setViewDoc] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  // Add/Edit form state
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [customField, setCustomField] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !isAdmin) {
      router.replace('/login');
    }
  }, [isMounted, isAdmin, isLoading, router]);

  // Fetch all collections
  useEffect(() => {
    if (!isMounted || !isAdmin) return; // Guard against running on server or for non-admins
    setLoading(true);
    databaseConfigApi.getCollections()
      .then(data => {
        setCollections(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load collections');
        setLoading(false);
      });
  }, [isMounted, isAdmin]);

  // Fetch documents for selected collection
  useEffect(() => {
    if (!isMounted || !isAdmin || !selectedCollection) return;
    setLoading(true);
    databaseConfigApi.getDocuments(selectedCollection, page, PAGE_SIZE)
      .then(data => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load documents');
        setLoading(false);
      });
  }, [isMounted, isAdmin, selectedCollection, page]);

  // Filter documents by search
  useEffect(() => {
    if (!documents) return;
    if (!search) {
      setFilteredDocs(documents.docs);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredDocs(
      documents.docs.filter(doc =>
        Object.values(doc).some(val =>
          (val + '').toLowerCase().includes(lower)
        )
      )
    );
  }, [documents, search]);

  // Defer all rendering until component is mounted on the client
  if (!isMounted || isLoading) {
    return <Layout><div className="flex items-center justify-center h-96 text-xl">Loading...</div></Layout>;
  }

  // If not admin, redirect is happening via useEffect. Show a loading/redirecting state.
  if (!isAdmin) {
    return <Layout><div className="flex items-center justify-center h-96 text-xl">Access Denied. Redirecting...</div></Layout>;
  }

  const handleSelectCollection = (name: string) => {
    setSelectedCollection(name);
    setPage(1);
    setDocuments(null);
    setError(null);
    setSearch('');
  };

  // Add Document
  const handleAdd = () => {
    setFormData({});
    setFormErrors({});
    setShowAddModal(true);
    setActionError(null);
    setCustomField('');
  };
  const handleAddSubmit = async () => {
    if (!selectedCollection) return;
    // Validate
    const errors: { [key: string]: string } = {};
    Object.keys(formData).forEach((key) => {
      if (key === '_id') return;
      const type = guessFieldType(formData[key]);
      if (type === 'number' && formData[key] && isNaN(Number(formData[key]))) {
        errors[key] = 'Must be a number';
      }
      if (type === 'boolean' && typeof formData[key] !== 'boolean') {
        errors[key] = 'Must be true or false';
      }
      if (type === 'date' && formData[key] && isNaN(Date.parse(formData[key]))) {
        errors[key] = 'Invalid date';
      }
      if (formData[key] === undefined || formData[key] === '') {
        errors[key] = 'Required';
      }
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await databaseConfigApi.addDocument(selectedCollection, formData);
      setShowAddModal(false);
      setFormData({});
      // Refresh docs
      const data = await databaseConfigApi.getDocuments(selectedCollection, page, PAGE_SIZE);
      setDocuments(data);
    } catch (err) {
      setActionError('Failed to add document');
    } finally {
      setActionLoading(false);
    }
  };

  // Edit Document
  const handleEdit = (doc: any) => {
    setEditDoc(doc);
    setFormData(doc);
    setFormErrors({});
    setShowEditModal(true);
    setActionError(null);
  };
  const handleEditSubmit = async () => {
    if (!selectedCollection || !editDoc || !editDoc._id) return;
    // Validate
    const errors: { [key: string]: string } = {};
    Object.keys(formData).forEach((key) => {
      if (key === '_id') return;
      const type = guessFieldType(formData[key]);
      if (type === 'number' && formData[key] && isNaN(Number(formData[key]))) {
        errors[key] = 'Must be a number';
      }
      if (type === 'boolean' && typeof formData[key] !== 'boolean') {
        errors[key] = 'Must be true or false';
      }
      if (type === 'date' && formData[key] && isNaN(Date.parse(formData[key]))) {
        errors[key] = 'Invalid date';
      }
      if (formData[key] === undefined || formData[key] === '') {
        errors[key] = 'Required';
      }
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await databaseConfigApi.updateDocument(selectedCollection, editDoc._id, formData);
      setShowEditModal(false);
      setEditDoc(null);
      setFormData({});
      // Refresh docs
      const data = await databaseConfigApi.getDocuments(selectedCollection, page, PAGE_SIZE);
      setDocuments(data);
    } catch (err) {
      setActionError('Failed to update document');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Document
  const handleDelete = (id: string) => {
    setDeleteDocId(id);
    setShowDeleteConfirm(true);
    setActionError(null);
  };
  const handleDeleteConfirm = async () => {
    if (!selectedCollection || !deleteDocId) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await databaseConfigApi.deleteDocument(selectedCollection, deleteDocId);
      setShowDeleteConfirm(false);
      setDeleteDocId(null);
      // Refresh docs
      const data = await databaseConfigApi.getDocuments(selectedCollection, page, PAGE_SIZE);
      setDocuments(data);
    } catch (err) {
      setActionError('Failed to delete document');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle form field change
  const handleFormChange = (key: string, value: any, type?: string) => {
    let val: any = value;
    if (type === 'number') val = value === '' ? '' : Number(value);
    if (type === 'boolean') val = value;
    if (type === 'date') val = value;
    setFormData((prev: any) => ({ ...prev, [key]: val }));
  };

  // Add custom field
  const handleAddCustomField = () => {
    if (!customField.trim()) return;
    setFormData((prev: any) => ({ ...prev, [customField.trim()]: '' }));
    setCustomField('');
  };

  // Export
  const handleExport = (type: 'json' | 'csv') => {
    if (!filteredDocs.length) return;
    let dataStr = '';
    let filename = `${selectedCollection || 'collection'}.${type}`;
    if (type === 'json') {
      dataStr = JSON.stringify(filteredDocs, null, 2);
    } else {
      dataStr = toCSV(filteredDocs);
    }
    const blob = new Blob([dataStr], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import
  const handleImport = async () => {
    if (!selectedCollection || !importText.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const docs = JSON.parse(importText);
      await databaseConfigApi.importDocuments(selectedCollection, docs);
      setShowImportModal(false);
      setImportText('');
      // Refresh docs
      const data = await databaseConfigApi.getDocuments(selectedCollection, page, PAGE_SIZE);
      setDocuments(data);
    } catch (err) {
      setActionError('Failed to import documents');
    } finally {
      setActionLoading(false);
    }
  };

  // View document
  const handleView = (doc: any) => {
    setViewDoc(doc);
    setShowViewModal(true);
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Config</h1>
          <p className="text-gray-600 mb-6">View and manage all MongoDB collections. Add, update, delete, or create documents in any collection. (Admin only)</p>
          <div className="flex gap-8">
            <div className="w-64">
              <h2 className="font-semibold mb-2">Collections</h2>
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <ul className="divide-y divide-gray-200 bg-white rounded shadow">
                  {collections.map((name) => (
                    <li key={name}>
                      <button
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors ${selectedCollection === name ? 'bg-primary/10 font-semibold text-primary' : ''}`}
                        onClick={() => handleSelectCollection(name)}
                      >
                        {name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {selectedCollection ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{selectedCollection} Documents</h2>
                    <div className="flex gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" onClick={handleAdd}>Add Document</button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => handleExport('json')}>Export JSON</button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => handleExport('csv')}>Export CSV</button>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onClick={() => setShowImportModal(true)}>Import JSON</button>
                    </div>
                  </div>
                  <div className="mb-4 flex gap-2 items-center">
                    <input
                      className="border px-2 py-1 rounded w-64"
                      placeholder="Search documents..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <span className="text-gray-400 text-sm">({filteredDocs.length} results)</span>
                  </div>
                  {loading ? (
                    <div>Loading...</div>
                  ) : error ? (
                    <div className="text-red-500">{error}</div>
                  ) : filteredDocs && filteredDocs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border text-sm">
                        <thead>
                          <tr>
                            {Object.keys(filteredDocs[0]).map((key) => (
                              <th key={key} className="border px-2 py-1 bg-gray-50">{key}</th>
                            ))}
                            <th className="border px-2 py-1 bg-gray-50">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDocs.map((doc, idx) => (
                            <tr key={doc._id || idx}>
                              {Object.keys(doc).map((key) => (
                                <td key={key} className="border px-2 py-1">{JSON.stringify(doc[key])}</td>
                              ))}
                              <td className="border px-2 py-1">
                                <button className="text-blue-600 hover:underline mr-2" onClick={() => handleView(doc)}>View</button>
                                {/* <button className="text-blue-600 hover:underline mr-2" onClick={() => handleEdit(doc)}>Edit</button> */}
                                {/* <button className="text-red-600 hover:underline" onClick={() => handleDelete(doc._id)}>Delete</button> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Pagination */}
                      <div className="flex justify-between items-center mt-4">
                        <button
                          className="px-3 py-1 rounded border"
                          disabled={page === 1}
                          onClick={() => setPage(page - 1)}
                        >
                          Previous
                        </button>
                        <span>Page {page}</span>
                        <button
                          className="px-3 py-1 rounded border"
                          disabled={filteredDocs.length < PAGE_SIZE}
                          onClick={() => setPage(page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No documents found.</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-400 text-lg text-center mt-24">Select a collection to view documents.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[350px] max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Add Document</h3>
            {actionError && <div className="text-red-500 mb-2">{actionError}</div>}
            {/* Render dynamic fields */}
            {Object.keys(formData).map((key) => {
              if (key === '_id') return null;
              const type = guessFieldType(formData[key]);
              return (
                <div key={key} className="mb-2">
                  <label className="block text-sm font-medium mb-1">{key}</label>
                  {type === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={!!formData[key]}
                      onChange={e => handleFormChange(key, e.target.checked, type)}
                      className="mr-2"
                    />
                  ) : type === 'number' ? (
                    <input
                      type="number"
                      className="border px-2 py-1 rounded w-full"
                      value={formData[key] || ''}
                      onChange={e => handleFormChange(key, e.target.value, type)}
                    />
                  ) : type === 'date' ? (
                    <input
                      type="date"
                      className="border px-2 py-1 rounded w-full"
                      value={formData[key] || ''}
                      onChange={e => handleFormChange(key, e.target.value, type)}
                    />
                  ) : (
                    <input
                      className="border px-2 py-1 rounded w-full"
                      value={formData[key] || ''}
                      onChange={e => handleFormChange(key, e.target.value, type)}
                    />
                  )}
                  {formErrors[key] && <div className="text-xs text-red-500 mt-1">{formErrors[key]}</div>}
                </div>
              );
            })}
            {/* Add custom field */}
            <div className="flex gap-2 mt-2">
              <input
                className="border px-2 py-1 rounded w-full"
                placeholder="Add custom field..."
                value={customField}
                onChange={e => setCustomField(e.target.value)}
              />
              <button className="px-2 py-1 rounded bg-gray-200" onClick={handleAddCustomField}>Add Field</button>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded border" onClick={() => setShowAddModal(false)} disabled={actionLoading}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleAddSubmit} disabled={actionLoading}>{actionLoading ? 'Adding...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {/* (Removed Edit Modal) */}

      {/* Delete Confirmation */}
      {/* (Removed Delete Confirmation Modal) */}

      {/* View Modal */}
      {showViewModal && viewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[350px] max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Document Details</h3>
            <div className="mb-4 max-h-96 overflow-auto">
              {Object.entries(viewDoc).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <span className="font-semibold">{key}:</span> <span className="break-all">{JSON.stringify(value)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded border" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[350px] max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Import Documents (JSON Array)</h3>
            {actionError && <div className="text-red-500 mb-2">{actionError}</div>}
            <textarea
              className="border px-2 py-1 rounded w-full h-40 mb-4"
              placeholder='Paste JSON array here, e.g. [{"field": "value"}, ...]'
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded border" onClick={() => setShowImportModal(false)} disabled={actionLoading}>Cancel</button>
              <button className="px-4 py-2 rounded bg-purple-600 text-white" onClick={handleImport} disabled={actionLoading}>{actionLoading ? 'Importing...' : 'Import'}</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default DatabaseConfigPage; 