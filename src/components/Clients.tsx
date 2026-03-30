import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Project } from '../types';
import { 
  Filter, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Building2,
  Globe,
  Trash2,
  Edit2,
  X,
  User,
  Users,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface ClientsProps {
  userId: string;
}

const Clients: React.FC<ClientsProps> = ({ userId }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    industry: '',
    website: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'clients'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
    });
    return unsubscribe;
  }, [userId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      ownerId: userId,
    };

    try {
      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), data);
        toast.success('Đã cập nhật thông tin khách hàng');
      } else {
        await addDoc(collection(db, 'clients'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success('Đã thêm khách hàng mới');
      }
      closeModal();
    } catch (error) {
      console.error("Error saving client: ", error);
      toast.error('Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const handleDeleteClient = (id: string) => {
    setConfirmDelete(id);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'clients', confirmDelete));
      toast.success('Đã xóa khách hàng');
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting client: ", error);
      toast.error('Có lỗi xảy ra khi xóa khách hàng');
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone || '',
        industry: client.industry || '',
        website: client.website || ''
      });
    } else {
      setEditingClient(null);
      setFormData({ name: '', company: '', email: '', phone: '', industry: '', website: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white font-display tracking-tight">Khách hàng</h2>
          <p className="text-lg text-text-muted font-medium">Quản lý danh sách khách hàng chính thức</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-3 bg-accent-yellow text-black px-8 py-4 rounded-[2rem] font-black hover:bg-opacity-90 transition-all shadow-[0_0_20px_rgba(239,255,51,0.2)] active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={3} />
          Thêm khách hàng
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white/5 p-4 rounded-3xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border-none rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-accent-yellow outline-none transition-all"
          />
        </div>
        <button className="flex items-center justify-center gap-3 px-6 py-3 text-text-muted hover:bg-white/5 hover:text-white rounded-2xl text-sm font-black border border-white/5 transition-all">
          <Filter size={20} />
          Bộ lọc
        </button>
      </div>

      {filteredClients.length > 0 ? (
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
          {filteredClients.map(client => (
            <div key={client.id} className="bento-card group relative overflow-hidden shrink-0 w-[75vw] md:w-auto">
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all flex gap-2 z-10">
                <button 
                  onClick={() => openModal(client)}
                  className="p-2.5 bg-white/10 text-white hover:bg-accent-yellow hover:text-black rounded-xl border border-white/10 transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
                  className="p-2.5 bg-white/10 text-white hover:bg-red-500 rounded-xl border border-white/10 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 bg-accent-yellow/10 text-accent-yellow rounded-[1.5rem] flex items-center justify-center text-2xl font-black border border-accent-yellow/20">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-white text-xl leading-tight">{client.name}</h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{client.company}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5 group/item hover:bg-white/10 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover/item:text-accent-yellow transition-colors">
                    <Mail size={18} />
                  </div>
                  <span className="text-sm font-bold text-white truncate">{client.email}</span>
                </div>
                
                {client.phone && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5 group/item hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover/item:text-accent-yellow transition-colors">
                      <Phone size={18} />
                    </div>
                    <span className="text-sm font-bold text-white">{client.phone}</span>
                  </div>
                )}

                {client.industry && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5 group/item hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted group-hover/item:text-accent-yellow transition-colors">
                      <Building2 size={18} />
                    </div>
                    <span className="text-sm font-bold text-white">{client.industry}</span>
                  </div>
                )}

                {client.website && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/5 group/item hover:bg-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                      <Globe size={18} />
                    </div>
                    <a 
                      href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm font-bold text-accent-yellow hover:underline truncate"
                    >
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}

                {/* Project Status Badge */}
                {projects.find(p => p.clientId === client.id) && (
                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-accent-yellow/5 border border-accent-yellow/10 group/item hover:bg-accent-yellow/10 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-accent-yellow/10 flex items-center justify-center text-accent-yellow">
                      <Briefcase size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-accent-yellow uppercase tracking-widest">Trạng thái dự án</span>
                      <span className="text-sm font-bold text-white">
                        {projects.find(p => p.clientId === client.id)?.status === 'Planning' && 'Lập kế hoạch'}
                        {projects.find(p => p.clientId === client.id)?.status === 'In Progress' && 'Đang thực hiện'}
                        {projects.find(p => p.clientId === client.id)?.status === 'Review' && 'Đang duyệt'}
                        {projects.find(p => p.clientId === client.id)?.status === 'Completed' && 'Hoàn thành'}
                        {projects.find(p => p.clientId === client.id)?.status === 'Cancelled' && 'Đã hủy'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-9 h-9 rounded-full border-2 border-bg-dark bg-white/5 flex items-center justify-center text-[10px] font-black text-text-muted">
                      <User size={14} />
                    </div>
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-bg-dark bg-accent-yellow flex items-center justify-center text-[10px] font-black text-black">
                    +2
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-accent-yellow uppercase tracking-widest cursor-pointer hover:opacity-80 transition-all">
                  Chi tiết khách hàng
                </div>
              </div>
            </div>
          ))}
          <div className="w-20 shrink-0 md:hidden" /> {/* Spacer for mobile scroll end */}
        </div>
      ) : (
        <div className="bento-card border-dashed border-white/10 py-20 text-center">
          <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-white/20">
            <Users size={48} />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Chưa có khách hàng nào</h3>
          <p className="text-text-muted font-medium max-w-sm mx-auto mb-10">
            {searchTerm 
              ? "Không tìm thấy khách hàng nào khớp với tìm kiếm của bạn." 
              : "Các khách hàng từ Leads khi chuyển sang trạng thái 'Thành công' sẽ tự động xuất hiện ở đây."}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => openModal()}
              className="px-10 py-4 bg-white text-black rounded-[2rem] font-black hover:bg-opacity-90 transition-all active:scale-95"
            >
              Thêm khách hàng thủ công
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-bg-dark w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {editingClient ? 'Sửa khách hàng' : 'Thêm khách hàng'}
                </h2>
                <p className="text-text-muted text-sm font-medium mt-1">Thông tin chi tiết đối tác</p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-text-muted hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Họ và tên</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Công ty</label>
                  <input 
                    required
                    type="text" 
                    value={formData.company}
                    onChange={e => setFormData({...formData, company: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="Công ty ABC"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Số điện thoại</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Lĩnh vực</label>
                  <input 
                    type="text" 
                    value={formData.industry}
                    onChange={e => setFormData({...formData, industry: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="Công nghệ, Bán lẻ..."
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Website</label>
                  <input 
                    type="text" 
                    value={formData.website}
                    onChange={e => setFormData({...formData, website: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="www.example.com"
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all active:scale-95"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-8 py-4 bg-accent-yellow hover:bg-opacity-90 text-black rounded-2xl font-black shadow-[0_0_20px_rgba(239,255,51,0.1)] transition-all active:scale-95"
                >
                  {editingClient ? 'Cập nhật' : 'Lưu khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-bg-dark rounded-[2.5rem] w-full max-w-md p-10 border border-white/10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Xác nhận xóa</h3>
            <p className="text-text-muted font-medium mb-10">
              Bạn có chắc chắn muốn xóa khách hàng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all active:scale-95"
              >
                Hủy
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black shadow-[0_0_20px_rgba(239,68,68,0.1)] transition-all active:scale-95"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
