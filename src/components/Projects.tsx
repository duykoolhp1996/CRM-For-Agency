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
import { Project, ProjectStatus, Client } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  X,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Briefcase,
  ExternalLink,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface ProjectsProps {
  userId: string;
}

const STATUS_CONFIG: { id: ProjectStatus; label: string; color: string; bgColor: string }[] = [
  { id: 'Planning', label: 'Lập kế hoạch', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  { id: 'In Progress', label: 'Đang thực hiện', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  { id: 'Review', label: 'Đang duyệt', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  { id: 'Completed', label: 'Hoàn thành', color: 'text-accent-yellow', bgColor: 'bg-accent-yellow/10' },
  { id: 'Cancelled', label: 'Đã hủy', color: 'text-red-400', bgColor: 'bg-red-500/10' }
];

const Projects: React.FC<ProjectsProps> = ({ userId }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    clientName: '',
    status: 'Planning' as ProjectStatus,
    budget: 0,
    productLink: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    const q = query(collection(db, 'clients'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));
      setClients(clientsData);
    });
    return unsubscribe;
  }, [userId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const selectedClient = clients.find(c => c.id === formData.clientId);
    const data = {
      ...formData,
      clientName: selectedClient?.company || selectedClient?.name || '',
      ownerId: userId,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingProject) {
        const oldStatus = editingProject.status;
        await updateDoc(doc(db, 'projects', editingProject.id), data);
        
        // If status changed to Completed, create revenue
        if (data.status === 'Completed' && oldStatus !== 'Completed') {
          await createRevenueFromProject({ ...editingProject, ...data });
        }
        toast.success('Đã cập nhật dự án');
      } else {
        const docRef = await addDoc(collection(db, 'projects'), {
          ...data,
          createdAt: serverTimestamp()
        });
        
        // If created as Completed, create revenue
        if (data.status === 'Completed') {
          await createRevenueFromProject({ id: docRef.id, ...data } as Project);
        }
        toast.success('Đã thêm dự án mới');
      }
      closeModal();
    } catch (error) {
      console.error("Error saving project: ", error);
      toast.error('Có lỗi xảy ra khi lưu dự án');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRevenueFromProject = async (project: Project) => {
    try {
      await addDoc(collection(db, 'revenues'), {
        title: `Dự án: ${project.name}`,
        amount: project.budget,
        date: new Date().toISOString().split('T')[0],
        status: 'Success',
        projectId: project.id,
        ownerId: userId,
        createdAt: serverTimestamp()
      });
      toast.success('Đã ghi nhận doanh thu từ dự án hoàn thành!');
    } catch (error) {
      console.error("Error creating revenue: ", error);
      toast.error('Không thể tự động tạo doanh thu');
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        name: project.name,
        clientId: project.clientId,
        clientName: project.clientName || '',
        status: project.status,
        budget: project.budget,
        productLink: project.productLink || '',
        startDate: project.startDate,
        endDate: project.endDate,
        description: project.description || ''
      });
    } else {
      setEditingProject(null);
      setFormData({
        name: '',
        clientId: '',
        clientName: '',
        status: 'Planning',
        budget: 0,
        productLink: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.status === status) return;

    try {
      const oldStatus = project.status;
      await updateDoc(doc(db, 'projects', projectId), { 
        status, 
        updatedAt: serverTimestamp() 
      });
      
      if (status === 'Completed' && oldStatus !== 'Completed') {
        await createRevenueFromProject(project);
      }
      toast.success(`Đã cập nhật trạng thái dự án sang ${STATUS_CONFIG.find(s => s.id === status)?.label}`);
    } catch (error) {
      console.error("Error updating project status: ", error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white font-display tracking-tight">Dự án</h2>
          <p className="text-lg text-text-muted font-medium">Quản lý tiến độ và trạng thái dự án</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center justify-center gap-3 bg-accent-yellow text-black px-8 py-4 rounded-[2rem] font-black hover:bg-opacity-90 transition-all shadow-[0_0_20px_rgba(239,255,51,0.2)] active:scale-95 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={3} />
          Thêm dự án
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center bg-white/5 p-4 rounded-3xl border border-white/5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Tìm kiếm dự án, khách hàng..." 
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

      <div className="table-container bento-card !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Tên dự án</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Khách hàng</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Ngân sách</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Thời gian</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 text-accent-yellow rounded-xl flex items-center justify-center font-black">
                        <Briefcase size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{project.name}</p>
                        {project.productLink && (
                          <a 
                            href={project.productLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-accent-yellow font-black uppercase tracking-widest flex items-center gap-1 hover:underline mt-1"
                          >
                            <ExternalLink size={10} />
                            Xem sản phẩm
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-white">{project.clientName}</p>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-2 appearance-none cursor-pointer focus:outline-none transition-all",
                        STATUS_CONFIG.find(s => s.id === project.status)?.bgColor,
                        STATUS_CONFIG.find(s => s.id === project.status)?.color,
                        "border-transparent hover:border-white/10"
                      )}
                    >
                      {STATUS_CONFIG.map(status => (
                        <option key={status.id} value={status.id} className="bg-bg-dark text-white">{status.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-white">{project.budget.toLocaleString()} VNĐ</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs text-text-muted font-bold">
                      <Calendar size={14} />
                      <span>{project.startDate}</span>
                      {project.endDate && (
                        <>
                          <span>→</span>
                          <span>{project.endDate}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal(project)}
                        className="p-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(project.id)}
                        className="p-2.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-text-muted font-black uppercase tracking-widest text-xs">
                    {searchTerm ? 'Không tìm thấy dự án nào.' : 'Chưa có dự án nào. Hãy bắt đầu bằng cách thêm dự án đầu tiên!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-bg-dark w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">
                  {editingProject ? 'Sửa dự án' : 'Thêm dự án'}
                </h2>
                <p className="text-text-muted text-sm font-medium mt-1">Quản lý lộ trình triển khai</p>
              </div>
              <button onClick={closeModal} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-text-muted hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Tên dự án *</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="Ví dụ: Chiến dịch SEO Q2"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Khách hàng *</label>
                  <select 
                    required
                    value={formData.clientId}
                    onChange={e => setFormData({...formData, clientId: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                  >
                    <option value="" className="bg-bg-dark">Chọn khách hàng</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id} className="bg-bg-dark">
                        {client.company} ({client.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Trạng thái</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}
                      className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    >
                      {STATUS_CONFIG.map(status => (
                        <option key={status.id} value={status.id} className="bg-bg-dark">{status.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Ngân sách (VNĐ)</label>
                    <input 
                      type="number" 
                      value={formData.budget}
                      onChange={e => setFormData({...formData, budget: parseInt(e.target.value) || 0})}
                      className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                      className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                      className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Link sản phẩm (nếu có)</label>
                  <input 
                    type="url" 
                    value={formData.productLink}
                    onChange={e => setFormData({...formData, productLink: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white"
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Mô tả dự án</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white min-h-[100px]"
                    placeholder="Chi tiết về dự án..."
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
                  disabled={isSubmitting}
                  className="flex-[2] px-8 py-4 bg-accent-yellow hover:bg-opacity-90 text-black rounded-2xl font-black shadow-[0_0_20px_rgba(239,255,51,0.1)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : (editingProject ? 'Cập nhật' : 'Lưu dự án')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-bg-dark rounded-[2.5rem] w-full max-w-md p-10 border border-white/10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-red-500/20">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3">Xác nhận xóa</h3>
            <p className="text-text-muted font-medium mb-10">
              Bạn có chắc chắn muốn xóa dự án này? Dữ liệu doanh thu đã ghi nhận sẽ không bị ảnh hưởng.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black transition-all active:scale-95"
              >
                Hủy
              </button>
              <button 
                onClick={async () => {
                  try {
                    await deleteDoc(doc(db, 'projects', confirmDelete));
                    toast.success('Đã xóa dự án');
                    setConfirmDelete(null);
                  } catch (error) {
                    toast.error('Lỗi khi xóa dự án');
                  }
                }}
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

export default Projects;
