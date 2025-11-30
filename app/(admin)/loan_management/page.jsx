'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { 
  Check, X, Clock, BookOpen, User, Calendar, 
  AlertCircle, DollarSign, Search, Grid3X3, List,
  CheckCircle, XCircle, RotateCcw
} from 'lucide-react';

export default function AdminLoansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [fine, setFine] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/home');
      } else {
        fetchLoans();
      }
    }
  }, [status, session, filter]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams();
      params.append('isAdmin', 'true');
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/loans?${params}`);
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      showToast('Failed to fetch loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateFine = (dueDate, returnDate) => {
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const daysLate = Math.max(0, Math.floor((returned - due) / (1000 * 60 * 60 * 24)));
    return daysLate * 5000;
  };

  const handleApprove = async (loanId) => {
    try {
      console.log('Approving loan:', loanId);
      
      const response = await fetch(`/api/loans/${loanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      const data = await response.json();
      console.log('Approval response:', data);

      if (response.ok) {
        showToast('Loan approved successfully!', 'success');
        fetchLoans();
      } else {
        showToast(data.error || 'Failed to approve loan', 'error');
      }
    } catch (error) {
      console.error('Approval error:', error);
      showToast('An error occurred while approving loan', 'error');
    }
  };

  const openRejectModal = (loan) => {
    setSelectedLoan(loan);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }

    try {
      console.log('Rejecting loan:', selectedLoan.id, 'Reason:', rejectionReason);
      
      const response = await fetch(`/api/loans/${selectedLoan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'rejected',
          rejection_reason: rejectionReason 
        }),
      });

      const data = await response.json();
      console.log('Rejection response:', data);

      if (response.ok) {
        showToast('Loan rejected successfully', 'success');
        setShowRejectModal(false);
        setRejectionReason('');
        fetchLoans();
      } else {
        showToast(data.error || 'Failed to reject loan', 'error');
      }
    } catch (error) {
      console.error('Rejection error:', error);
      showToast('An error occurred while rejecting loan', 'error');
    }
  };

  const openReturnModal = (loan) => {
    setSelectedLoan(loan);
    const today = new Date().toISOString().split('T')[0];
    setReturnDate(today);
    const calculatedFine = calculateFine(loan.due_date, today);
    setFine(calculatedFine);
    setShowReturnModal(true);
  };

  const handleReturn = async () => {
    try {
      const response = await fetch(`/api/loans/${selectedLoan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'returned',
          return_date: returnDate,
          fine: fine,
        }),
      });

      if (response.ok) {
        showToast('Book returned successfully!', 'success');
        setShowReturnModal(false);
        fetchLoans();
      } else {
        showToast('Failed to return book', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'returned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'returned': return <RotateCcw className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <BookOpen className="w-8 h-8" />
              Loan Management
            </h1>
            <p className="text-gray-600">Manage loan history and approve or deny loan requests</p>
          </div>

          {/* Search & View Toggle */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by ID, ISBN, Title, Author, or Category"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'All Loans', icon: <BookOpen className="w-4 h-4" /> },
                { value: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
                { value: 'approved', label: 'Borrowed', icon: <CheckCircle className="w-4 h-4" /> },
                { value: 'returned', label: 'Returned', icon: <RotateCcw className="w-4 h-4" /> },
                { value: 'rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilter(tab.value)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                    filter === tab.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLoans.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-600">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No loans found</p>
                </div>
              ) : (
                filteredLoans.map((loan) => {
                  const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';

                  return (
                    <div key={loan.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
                      <div className="flex gap-4 p-4">
                        {/* Book Cover */}
                        <div className="w-20 h-28 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                          {loan.cover_image ? (
                            <img src={loan.cover_image} alt={loan.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Loan Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm line-clamp-2 mb-1">{loan.title}</h3>
                          <p className="text-xs text-gray-600 mb-2">by {loan.author}</p>
                          
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                            {getStatusIcon(loan.status)}
                            <span className="capitalize">{loan.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-gray-800 px-4 py-3 bg-gray-50">
                        {/* User Info */}
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-gray-900">{loan.user_name}</p>
                            <p className="text-xs text-gray-500">{loan.user_email}</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Loan: {new Date(loan.loan_date).toLocaleDateString('id-ID')}</span>
                          </div>
                          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : ''}`}>
                            <AlertCircle className="w-3 h-3" />
                            <span>Due: {new Date(loan.due_date).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>

                        {/* Fine */}
                        {loan.fine > 0 && (
                          <div className="flex items-center gap-1 text-xs text-red-600 font-bold mb-3">
                            <DollarSign className="w-3 h-3" />
                            <span>Fine: Rp {loan.fine.toLocaleString()}</span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          {loan.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(loan.id)}
                                className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-1 text-sm"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(loan)}
                                className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 text-sm"
                              >
                                <X className="w-4 h-4" />
                                Deny
                              </button>
                            </>
                          )}
                          {loan.status === 'approved' && (
                            <button
                              onClick={() => openReturnModal(loan)}
                              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Mark as Returned
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredLoans.length === 0 ? (
                <div className="p-8 text-center text-gray-600">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No loans found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrower</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredLoans.map((loan) => {
                        const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';

                        return (
                          <tr key={loan.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{loan.user_name}</div>
                                  <div className="text-xs text-gray-500">{loan.user_email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {loan.cover_image ? (
                                  <img src={loan.cover_image} alt={loan.title} className="w-8 h-12 object-cover rounded" />
                                ) : (
                                  <div className="w-8 h-12 bg-gray-200 rounded flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{loan.title}</div>
                                  <div className="text-xs text-gray-500">{loan.author}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(loan.loan_date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={isOverdue ? 'text-red-600 font-bold' : 'text-gray-500'}>
                                {new Date(loan.due_date).toLocaleDateString('id-ID')}
                                {isOverdue && <div className="text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Overdue!</div>}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(loan.status)}`}>
                                {getStatusIcon(loan.status)}
                                <span className="capitalize">{loan.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {loan.fine > 0 ? (
                                <span className="text-red-600 font-bold flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  Rp {loan.fine.toLocaleString()}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <div className="flex gap-2">
                                {loan.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(loan.id)}
                                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 flex items-center gap-1"
                                    >
                                      <Check className="w-4 h-4" />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openRejectModal(loan)}
                                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                                    >
                                      <X className="w-4 h-4" />
                                      Deny
                                    </button>
                                  </>
                                )}
                                {loan.status === 'approved' && (
                                  <button
                                    onClick={() => openReturnModal(loan)}
                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                    Return
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold">Deny Loan Request</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Book:</p>
                <p className="font-bold">{selectedLoan.title}</p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Borrower:</p>
                <p className="font-medium">{selectedLoan.user_name}</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="4"
                  placeholder="Please provide a reason for rejecting this loan request..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold flex items-center justify-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Confirm Denial
                </button>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedLoan && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <RotateCcw className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold">Return Book</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Book:</p>
                <p className="font-bold">{selectedLoan.title}</p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Borrower:</p>
                <p className="font-medium">{selectedLoan.user_name}</p>
                <p className="text-sm text-gray-600 mt-2 mb-1">Due Date:</p>
                <p className="font-medium">{new Date(selectedLoan.due_date).toLocaleDateString('id-ID')}</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Return Date</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => {
                    setReturnDate(e.target.value);
                    setFine(calculateFine(selectedLoan.due_date, e.target.value));
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Fine (Auto-calculated)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value ={fine}
                    onChange={(e) => setFine(parseInt(e.target.value) || 0)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    </div>
                  <p className="text-sm text-gray-600 mt-1">Rp 5,000 per day late</p>
                </div>
                <div className="flex gap-2 pt-4">
            <button
              onClick={handleReturn}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Confirm Return
            </button>
            <button
              onClick={() => setShowReturnModal(false)}
              className="px-6 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )}

  <style jsx>{`
    @keyframes slide-down {
      from {
        transform: translate(-50%, -100%);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }
    .animate-slide-down {
      animation: slide-down 0.3s ease-out;
    }
  `}</style>
</>
);
}