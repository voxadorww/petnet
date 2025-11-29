import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../utils/api.tsx';

interface AdminPanelProps {
  accessToken: string;
}

export function AdminPanel({ accessToken }: AdminPanelProps) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const result = await api.getReports(accessToken);
      if (result.reports) {
        setReports(result.reports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, action: string) => {
    try {
      await api.updateReport(accessToken, reportId, {
        status: 'resolved',
        action
      });
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const handleDismissReport = async (reportId: string) => {
    try {
      await api.updateReport(accessToken, reportId, {
        status: 'dismissed',
        action: 'no_action'
      });
      setSelectedReport(null);
      loadReports();
    } catch (error) {
      console.error('Failed to dismiss report:', error);
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'dismissed');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#9d4edd]/30 border-t-[#9d4edd] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl text-[#e8e4ff] mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-[#c77dff]" />
            Admin Panel
          </h1>
          <p className="text-[#c8b8e6]">Manage reports and moderate content</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-3xl text-[#e8e4ff]">{pendingReports.length}</p>
                <p className="text-[#c8b8e6]">Pending Reports</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-3xl text-[#e8e4ff]">{resolvedReports.length}</p>
                <p className="text-[#c8b8e6]">Resolved</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#9d4edd]/20 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#9d4edd]/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#9d4edd]" />
              </div>
              <div>
                <p className="text-3xl text-[#e8e4ff]">{reports.length}</p>
                <p className="text-[#c8b8e6]">Total Reports</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className="mb-8">
          <h2 className="text-2xl text-[#e8e4ff] mb-4">Pending Reports</h2>
          {pendingReports.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <p className="text-[#c8b8e6]">No pending reports!</p>
              <p className="text-[#c8b8e6] text-sm mt-2">Everything is looking good.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/30 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                        <h3 className="text-xl text-[#e8e4ff]">{report.reason}</h3>
                      </div>
                      <p className="text-[#c8b8e6] mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-sm text-[#c8b8e6]">
                        <span>Type: {report.reportedItemType}</span>
                        <span>•</span>
                        <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="px-4 py-2 bg-[#9d4edd] text-white rounded-xl hover:bg-[#7209b7] transition-colors"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleDismissReport(report.id)}
                      className="px-4 py-2 bg-[#240046] text-[#c8b8e6] rounded-xl hover:bg-[#3c096c] transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resolved Reports */}
        <div>
          <h2 className="text-2xl text-[#e8e4ff] mb-4">Recent Actions</h2>
          {resolvedReports.length === 0 ? (
            <div className="text-center py-8 bg-gradient-to-br from-[#140a2e]/80 to-[#240046]/80 rounded-2xl border border-[#9d4edd]/20">
              <p className="text-[#c8b8e6]">No resolved reports yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {resolvedReports.slice(0, 5).map((report) => (
                <div
                  key={report.id}
                  className="bg-gradient-to-br from-[#140a2e]/60 to-[#240046]/60 backdrop-blur-sm rounded-xl p-4 border border-[#9d4edd]/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {report.status === 'resolved' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                        <span className="text-[#e8e4ff]">{report.reason}</span>
                      </div>
                      <p className="text-sm text-[#c8b8e6]">
                        {report.status === 'resolved' ? 'Resolved' : 'Dismissed'} on{' '}
                        {new Date(report.reviewedAt || report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {report.action && (
                      <span className="px-3 py-1 bg-[#240046] text-[#c8b8e6] rounded-full text-sm">
                        {report.action.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Review Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-[#140a2e] to-[#240046] rounded-3xl p-8 max-w-2xl w-full border border-[#9d4edd]/30 relative">
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 text-[#c8b8e6] hover:text-[#e8e4ff]"
              >
                ✕
              </button>

              <h2 className="text-2xl text-[#e8e4ff] mb-6 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                Review Report
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[#c8b8e6] mb-1">Reason</label>
                  <p className="text-[#e8e4ff]">{selectedReport.reason}</p>
                </div>

                <div>
                  <label className="block text-[#c8b8e6] mb-1">Description</label>
                  <p className="text-[#e8e4ff]">{selectedReport.description || 'No description provided'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#c8b8e6] mb-1">Type</label>
                    <p className="text-[#e8e4ff]">{selectedReport.reportedItemType}</p>
                  </div>

                  <div>
                    <label className="block text-[#c8b8e6] mb-1">Reported</label>
                    <p className="text-[#e8e4ff]">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[#c8b8e6] mb-1">Item ID</label>
                  <p className="text-[#e8e4ff] text-sm font-mono">{selectedReport.reportedItemId}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[#e8e4ff]">Take Action:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleResolveReport(selectedReport.id, 'content_removed')}
                    className="px-4 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition-all"
                  >
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleResolveReport(selectedReport.id, 'warning_issued')}
                    className="px-4 py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl hover:bg-orange-500/30 transition-all"
                  >
                    Issue Warning
                  </button>
                  <button
                    onClick={() => handleResolveReport(selectedReport.id, 'user_suspended')}
                    className="px-4 py-3 bg-[#ff006e]/20 text-[#ff006e] border border-[#ff006e]/30 rounded-xl hover:bg-[#ff006e]/30 transition-all"
                  >
                    Suspend User
                  </button>
                  <button
                    onClick={() => handleDismissReport(selectedReport.id)}
                    className="px-4 py-3 bg-[#240046] text-[#c8b8e6] border border-[#9d4edd]/30 rounded-xl hover:bg-[#3c096c] transition-all"
                  >
                    Dismiss Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
