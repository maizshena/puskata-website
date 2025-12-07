'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BookOpen, Clock, CheckCircle, XCircle, AlertCircle, Calendar, DollarSign, Loader2, RotateCcw } from 'lucide-react';

export default function UserLoansPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchLoans();
    }
  }, [status, session, filter, router]);

  const fetchLoans = async () => {
    try {
      const params = new URLSearchParams();
      params.append('userEmail', session.user.email);
      params.append('isAdmin', 'false');
      
      if (filter !== 'all') params.append('status', filter);

      const response = await fetch(`/api/loans?${params}`);
      const data = await response.json();
      setLoans(data.loans || []);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateFine = (dueDate, returnDate) => {
    if (!returnDate) returnDate = new Date();
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
    const daysLate = Math.max(0, Math.floor((returned - due) / (1000 * 60 * 60 * 24)));
    return daysLate * 5000;
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'approved':
        return { 
          label: 'Borrowed', 
          color: 'bg-emerald-100 text-emerald-700', 
          icon: CheckCircle 
        };
      case 'pending':
        return { 
          label: 'Pending Approval', 
          color: 'bg-amber-100 text-amber-700', 
          icon: Clock 
        };
      case 'returned':
        return { 
          label: 'Returned', 
          color: 'bg-sky-100 text-sky-700', 
          icon: RotateCcw 
        };
      case 'rejected':
        return { 
          label: 'Rejected', 
          color: 'bg-rose-100 text-rose-700', 
          icon: XCircle 
        };
      default:
        return { 
          label: status, 
          color: 'bg-gray-100 text-gray-700', 
          icon: AlertCircle 
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <div className="text-lg text-gray-600">Loading loans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 pr-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">My Loans</h2>
          <p className="text-sm text-gray-500 mt-1">Track your borrowed books and due dates</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'All Loans', icon: BookOpen },
            { value: 'pending', label: 'Pending', icon: Clock },
            { value: 'approved', label: 'Borrowed', icon: CheckCircle },
            { value: 'returned', label: 'Returned', icon: RotateCcw },
            { value: 'rejected', label: 'Rejected', icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition font-medium text-sm ${
                  filter === tab.value
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Loans Table */}
      <section className="rounded-2xl bg-white/70 border border-gray-100 shadow-sm overflow-hidden">
        {loans.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 font-medium mb-2">No loans found</p>
            <p className="text-sm text-gray-400">
              {filter === 'all' 
                ? "You haven't borrowed any books yet" 
                : `No ${filter} loans found`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3">Book</th>
                  <th className="px-6 py-3">Loan Date</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loans.map((loan) => {
                  const isOverdue = new Date(loan.due_date) < new Date() && loan.status === 'approved';
                  const fine = isOverdue ? calculateFine(loan.due_date, null) : loan.fine;
                  const statusInfo = getStatusInfo(loan.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr key={loan.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {loan.cover_image ? (
                            <img
                              src={loan.cover_image}
                              alt={loan.title}
                              className="w-12 h-16 object-cover rounded border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-gray-100 rounded flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{loan.title}</div>
                            <div className="text-sm text-gray-500">{loan.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(loan.loan_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-rose-600 font-semibold' : 'text-gray-600'}`}>
                          <Clock className={`w-4 h-4 ${isOverdue ? 'text-rose-600' : 'text-gray-400'}`} />
                          <div>
                            {new Date(loan.due_date).toLocaleDateString('id-ID', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                            {isOverdue && (
                              <div className="text-xs flex items-center gap-1 mt-0.5">
                                <AlertCircle className="w-3 h-3" /> Overdue!
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {fine > 0 ? (
                          <div className="flex items-center gap-1 text-sm font-semibold text-rose-600">
                            <DollarSign className="w-4 h-4" />
                            Rp {fine.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Info Box */}
      {loans.some(loan => loan.status === 'approved') && (
        <section className="rounded-2xl bg-sky-50 border border-sky-200 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-sky-900 mb-1">Important Reminder</p>
              <p className="text-xs text-sky-700">
                Please return books before the due date to avoid fines. Late fees are Rp 5,000 per day.
              </p>
            </div>
          </div>
        </section>
      )}

      <footer className="pt-60 text-sm text-gray-400 py-6">
        © {new Date().getFullYear()} Puskata — My Loans
      </footer>
    </div>
  );
}