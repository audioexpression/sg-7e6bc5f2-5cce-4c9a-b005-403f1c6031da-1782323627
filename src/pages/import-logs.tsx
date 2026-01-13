import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Download, Trash2, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ImportLogEntry {
  id: string;
  timestamp: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  duplicatesResolved: number;
  details: {
    successes: Array<{ row: number; name: string; team: string }>;
    errors: Array<{ row: number; field: string; message: string; data?: any }>;
    warnings: Array<{ row: number; message: string }>;
    duplicates: Array<{ row: number; name: string; action: string }>;
  };
}

export default function ImportLogsPage() {
  const [logs, setLogs] = useState<ImportLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<ImportLogEntry | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const savedLogs = localStorage.getItem("importLogs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleViewDetails = (log: ImportLogEntry) => {
    setSelectedLog(log);
    setIsDetailOpen(true);
  };

  const handleDeleteLog = (id: string) => {
    if (confirm("Are you sure you want to delete this import log?")) {
      const updated = logs.filter(l => l.id !== id);
      setLogs(updated);
      localStorage.setItem("importLogs", JSON.stringify(updated));
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all import logs? This cannot be undone.")) {
      setLogs([]);
      localStorage.removeItem("importLogs");
    }
  };

  const handleExportLog = (log: ImportLogEntry) => {
    const data = JSON.stringify(log, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-log-${log.timestamp.replace(/:/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (log: ImportLogEntry) => {
    if (log.errorCount > 0) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Errors</Badge>;
    }
    if (log.warningCount > 0) {
      return <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700"><AlertCircle className="w-3 h-3" />Warnings</Badge>;
    }
    return <Badge variant="outline" className="gap-1 border-green-500 text-green-700"><CheckCircle className="w-3 h-3" />Success</Badge>;
  };

  return (
    <>
      <SEO title="Import Logs - Bali Bulldogs" description="Review data import history" />
      
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto w-full px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import Logs</h1>
              <p className="text-sm text-gray-500">Review past data import history and audit trails</p>
            </div>
            <div className="flex gap-2">
              {logs.length > 0 && (
                <Button onClick={handleClearAll} variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />Clear All
                </Button>
              )}
            </div>
          </div>

          {logs.length === 0 ? (
            <div className="bg-white rounded-lg border shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Import Logs Yet</h3>
              <p className="text-sm text-gray-500 mb-4">
                Import logs will appear here after you import member data
              </p>
              <Button onClick={() => window.location.href = "/members"}>
                Go to Members
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead className="text-center">Total Rows</TableHead>
                    <TableHead className="text-center">Success</TableHead>
                    <TableHead className="text-center">Errors</TableHead>
                    <TableHead className="text-center">Warnings</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <>
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleRow(log.id)}
                            className="h-8 w-8 p-0"
                          >
                            {expandedRows[log.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          {new Date(log.timestamp).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{log.fileName}</TableCell>
                        <TableCell className="text-center">{log.totalRows}</TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-1 text-green-600 font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            {log.successCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {log.errorCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-semibold">
                              <XCircle className="w-4 h-4" />
                              {log.errorCount}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {log.warningCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-yellow-600 font-semibold">
                              <AlertCircle className="w-4 h-4" />
                              {log.warningCount}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(log)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewDetails(log)}
                              className="h-8 w-8 p-0"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportLog(log)}
                              className="h-8 w-8 p-0"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteLog(log.id)}
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedRows[log.id] && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-gray-50 p-6">
                            <div className="space-y-4">
                              {log.details.successes.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Successfully Imported ({log.details.successes.length})
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {log.details.successes.slice(0, 9).map((item, idx) => (
                                      <div key={idx} className="text-sm bg-white p-2 rounded border">
                                        <span className="font-mono text-xs text-gray-500">Row {item.row}:</span>{" "}
                                        <span className="font-medium">{item.name}</span>
                                        {item.team && <span className="text-gray-600"> → {item.team}</span>}
                                      </div>
                                    ))}
                                    {log.details.successes.length > 9 && (
                                      <div className="text-sm text-gray-500 p-2">
                                        + {log.details.successes.length - 9} more...
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {log.details.errors.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Errors ({log.details.errors.length})
                                  </h4>
                                  <div className="space-y-2">
                                    {log.details.errors.map((error, idx) => (
                                      <div key={idx} className="text-sm bg-red-50 p-3 rounded border border-red-200">
                                        <div className="font-medium text-red-900">
                                          Row {error.row}: {error.message}
                                        </div>
                                        {error.field && (
                                          <div className="text-red-700 text-xs mt-1">
                                            Field: <span className="font-mono">{error.field}</span>
                                          </div>
                                        )}
                                        {error.data && (
                                          <div className="text-red-600 text-xs mt-1 font-mono">
                                            {JSON.stringify(error.data)}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {log.details.warnings.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Warnings ({log.details.warnings.length})
                                  </h4>
                                  <div className="space-y-1">
                                    {log.details.warnings.map((warning, idx) => (
                                      <div key={idx} className="text-sm bg-yellow-50 p-2 rounded border border-yellow-200">
                                        <span className="font-mono text-xs text-yellow-700">Row {warning.row}:</span>{" "}
                                        <span className="text-yellow-900">{warning.message}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {log.details.duplicates.length > 0 && (
                                <div>
                                  <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Duplicates Resolved ({log.details.duplicates.length})
                                  </h4>
                                  <div className="space-y-1">
                                    {log.details.duplicates.map((dup, idx) => (
                                      <div key={idx} className="text-sm bg-blue-50 p-2 rounded border border-blue-200">
                                        <span className="font-mono text-xs text-blue-700">Row {dup.row}:</span>{" "}
                                        <span className="font-medium">{dup.name}</span>
                                        <span className="text-blue-700"> → {dup.action}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>

        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Import Details</DialogTitle>
              <DialogDescription>
                {selectedLog && `${selectedLog.fileName} - ${new Date(selectedLog.timestamp).toLocaleString("en-GB")}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedLog && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-900">{selectedLog.totalRows}</div>
                    <div className="text-xs text-gray-500">Total Rows</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-700">{selectedLog.successCount}</div>
                    <div className="text-xs text-green-600">Success</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-700">{selectedLog.errorCount}</div>
                    <div className="text-xs text-red-600">Errors</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-700">{selectedLog.warningCount}</div>
                    <div className="text-xs text-yellow-600">Warnings</div>
                  </div>
                </div>

                {selectedLog.details.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-red-700">Errors</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedLog.details.errors.map((error, idx) => (
                        <div key={idx} className="bg-red-50 p-3 rounded border border-red-200">
                          <div className="font-medium text-red-900">Row {error.row}: {error.message}</div>
                          {error.field && <div className="text-sm text-red-700 mt-1">Field: {error.field}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.details.warnings.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-yellow-700">Warnings</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedLog.details.warnings.map((warning, idx) => (
                        <div key={idx} className="bg-yellow-50 p-2 rounded border border-yellow-200 text-sm">
                          Row {warning.row}: {warning.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.details.successes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-green-700">
                      Successfully Imported ({selectedLog.details.successes.length})
                    </h3>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {selectedLog.details.successes.map((item, idx) => (
                        <div key={idx} className="bg-green-50 p-2 rounded border border-green-200 text-sm">
                          Row {item.row}: <strong>{item.name}</strong> {item.team && `→ ${item.team}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}