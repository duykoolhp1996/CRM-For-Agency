import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  where,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  DollarSign,
  FileText,
  CreditCard,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

interface Revenue {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'Success' | 'Pending' | 'Cancelled';
  ownerId: string;
  createdAt: any;
}

interface Acceptance {
  id: string;
  revenueId: string;
  documentUrl: string;
  notes: string;
  isConfirmed: boolean;
  confirmedAt: string;
}

interface Payment {
  id: string;
  revenueId: string;
  amount: number;
  dueDate: string;
  status: 'Unpaid' | 'Paid';
}

const Revenue: React.FC<{ userId: string }> = ({ userId }) => {
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [acceptances, setAcceptances] = useState<Acceptance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    status: 'Pending' as 'Success' | 'Pending' | 'Cancelled'
  });

  useEffect(() => {
    const q = query(collection(db, 'revenues'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Revenue));
      setRevenues(data.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds));
      setLoading(false);
    });

    const qAcc = query(collection(db, 'acceptances'), where('ownerId', '==', userId));
    const unsubscribeAcc = onSnapshot(qAcc, (snapshot) => {
      setAcceptances(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acceptance)));
    });

    const qPay = query(collection(db, 'payments'), where('ownerId', '==', userId));
    const unsubscribePay = onSnapshot(qPay, (snapshot) => {
      setPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment)));
    });

    return () => {
      unsubscribe();
      unsubscribeAcc();
      unsubscribePay();
    };
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRevenue) {
        const oldStatus = editingRevenue.status;
        await updateDoc(doc(db, 'revenues', editingRevenue.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        
        // Workflow: If status changed to Success, create Acceptance and Payment
        if (oldStatus !== 'Success' && formData.status === 'Success') {
          await createFollowUpStages(editingRevenue.id, formData.amount);
        }
        
        toast.success('Cập nhật doanh thu thành công');
      } else {
        const docRef = await addDoc(collection(db, 'revenues'), {
          ...formData,
          ownerId: userId,
          createdAt: serverTimestamp()
        });
        
        // Workflow: If initially Success
        if (formData.status === 'Success') {
          await createFollowUpStages(docRef.id, formData.amount);
        }
        
        toast.success('Thêm doanh thu mới thành công');
      }
      setIsModalOpen(false);
      setEditingRevenue(null);
      setFormData({
        title: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending'
      });
    } catch (error) {
      console.error(error);
      toast.error('Có lỗi xảy ra');
    }
  };

  const createFollowUpStages = async (revenueId: string, amount: number) => {
    try {
      // Create Acceptance stage
      await addDoc(collection(db, 'acceptances'), {
        revenueId,
        documentUrl: '',
        notes: 'Tự động tạo từ doanh thu thành công',
        isConfirmed: false,
        ownerId: userId,
        createdAt: serverTimestamp()
      });

      // Create Payment stage
      await addDoc(collection(db, 'payments'), {
        revenueId,
        amount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days later
        status: 'Unpaid',
        ownerId: userId,
        createdAt: serverTimestamp()
      });
      
      toast.info('Đã tự động tạo giai đoạn Nghiệm thu và Thanh toán');
    } catch (error) {
      console.error('Workflow error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) {
      try {
        await deleteDoc(doc(db, 'revenues', id));
        toast.success('Đã xóa bản ghi');
      } catch (error) {
        toast.error('Lỗi khi xóa');
      }
    }
  };

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white font-display uppercase tracking-tight mb-2">Quản lý Tài chính</h2>
          <p className="text-text-muted font-medium">Theo dõi doanh thu và tiến độ dòng tiền</p>
        </div>
        <button 
          onClick={() => {
            setEditingRevenue(null);
            setFormData({
              title: '',
              amount: 0,
              date: new Date().toISOString().split('T')[0],
              status: 'Pending'
            });
            setIsModalOpen(true);
          }}
          className="bg-accent-yellow text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:scale-105 transition-all shadow-[0_0_20px_rgba(239,255,51,0.2)]"
        >
          <Plus size={20} />
          Thêm doanh thu
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="accent-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">Tổng doanh thu</p>
            <h3 className="text-4xl font-black mb-2">{totalRevenue.toLocaleString()} VNĐ</h3>
            <p className="text-xs font-bold opacity-60">Tổng cộng từ {revenues.length} bản ghi</p>
          </div>
          <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        <div className="bento-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-4">Thành công</p>
            <h3 className="text-4xl font-black text-white mb-2">
              {revenues.filter(r => r.status === 'Success').reduce((sum, r) => sum + r.amount, 0).toLocaleString()} VNĐ
            </h3>
            <p className="text-xs text-text-muted font-bold">
              {revenues.filter(r => r.status === 'Success').length} đơn hàng hoàn tất
            </p>
          </div>
          <CheckCircle2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bento-card p-8 rounded-[2.5rem] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-4">Đang chờ</p>
            <h3 className="text-4xl font-black text-white mb-2">
              {revenues.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0).toLocaleString()} VNĐ
            </h3>
            <p className="text-xs text-text-muted font-bold">
              {revenues.filter(r => r.status === 'Pending').length} đơn hàng đang xử lý
            </p>
          </div>
          <Clock className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-5 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      {/* Revenue Table */}
      <div className="table-container bento-card rounded-[2.5rem] overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-white uppercase tracking-wider">Danh sách doanh thu</h3>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                placeholder="Tìm kiếm..."
                className="bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-yellow transition-all w-full md:w-64"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Dịch vụ / Dự án</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Số tiền</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Ngày ghi nhận</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Quy trình</th>
                <th className="px-8 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {revenues.map((revenue) => {
                const acceptance = acceptances.find(a => a.revenueId === revenue.id);
                const payment = payments.find(p => p.revenueId === revenue.id);
                
                return (
                  <tr key={revenue.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          revenue.status === 'Success' ? "bg-green-500/10 text-green-400" : 
                          revenue.status === 'Pending' ? "bg-accent-yellow/10 text-accent-yellow" : 
                          "bg-red-500/10 text-red-400"
                        )}>
                          <DollarSign size={20} />
                        </div>
                        <span className="font-bold text-white text-base">{revenue.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-black text-white">{revenue.amount.toLocaleString()} VNĐ</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm text-text-muted font-medium">{revenue.date}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        revenue.status === 'Success' ? "bg-green-500/10 text-green-400" : 
                        revenue.status === 'Pending' ? "bg-accent-yellow/10 text-accent-yellow" : 
                        "bg-red-500/10 text-red-400"
                      )}>
                        {revenue.status === 'Success' ? <CheckCircle2 size={12} /> : 
                         revenue.status === 'Pending' ? <Clock size={12} /> : 
                         <XCircle size={12} />}
                        {revenue.status === 'Success' ? 'Thành công' : 
                         revenue.status === 'Pending' ? 'Đang chờ' : 
                         'Đã hủy'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {acceptance && (
                          <div className={cn(
                            "p-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            acceptance.isConfirmed ? "bg-green-500/10 text-green-400" : "bg-white/5 text-text-muted"
                          )} title="Nghiệm thu">
                            <ClipboardCheck size={14} />
                            <span className="hidden lg:inline">Nghiệm thu</span>
                          </div>
                        )}
                        {payment && (
                          <div className={cn(
                            "p-2 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                            payment.status === 'Paid' ? "bg-green-500/10 text-green-400" : "bg-white/5 text-text-muted"
                          )} title="Thanh toán">
                            <CreditCard size={14} />
                            <span className="hidden lg:inline">Thanh toán</span>
                          </div>
                        )}
                        {!acceptance && !payment && <span className="text-[10px] text-text-muted/30 font-black uppercase italic">N/A</span>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingRevenue(revenue);
                            setFormData({
                              title: revenue.title,
                              amount: revenue.amount,
                              date: revenue.date,
                              status: revenue.status
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-text-muted hover:text-accent-yellow hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(revenue.id)}
                          className="p-2 text-text-muted hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {revenues.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-text-muted">
                        <DollarSign size={32} />
                      </div>
                      <p className="text-text-muted font-medium">Chưa có dữ liệu doanh thu</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4">
          <div className="bg-bg-dark w-full max-w-xl rounded-[2.5rem] border border-white/10 overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                {editingRevenue ? 'Cập nhật doanh thu' : 'Thêm doanh thu mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors text-text-muted"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tên dịch vụ / Dự án</label>
                <input 
                  required
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-yellow transition-all font-bold"
                  placeholder="VD: Thiết kế Branding - Client A"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Số tiền (VNĐ)</label>
                  <input 
                    required
                    type="number"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-yellow transition-all font-black"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Ngày ghi nhận</label>
                  <input 
                    required
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent-yellow transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Trạng thái</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['Pending', 'Success', 'Cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({...formData, status})}
                      className={cn(
                        "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        formData.status === status 
                          ? "bg-accent-yellow border-accent-yellow text-black" 
                          : "bg-white/5 border-white/10 text-text-muted hover:bg-white/10"
                      )}
                    >
                      {status === 'Pending' ? 'Đang chờ' : status === 'Success' ? 'Thành công' : 'Đã hủy'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-accent-yellow text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-accent-yellow/10"
                >
                  {editingRevenue ? 'Cập nhật' : 'Lưu bản ghi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revenue;
