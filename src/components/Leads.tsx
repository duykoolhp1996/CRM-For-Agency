import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  getDoc,
  setDoc,
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Lead, LeadStatus, Service, Project } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Building2, 
  MessageSquare, 
  X,
  LayoutGrid,
  Kanban,
  Edit2,
  Eye,
  CheckCircle2,
  TrendingUp,
  Clock,
  User,
  MapPin,
  Briefcase,
  GripVertical,
  ChevronDown,
  Check,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

const COLUMNS: { id: LeadStatus; label: string; color: string }[] = [
  { id: 'New', label: 'Mới', color: 'bg-blue-500' },
  { id: 'Contacted', label: 'Đang chăm sóc', color: 'bg-yellow-500' },
  { id: 'Qualified', label: 'Tiềm năng', color: 'bg-indigo-500' },
  { id: 'Proposal', label: 'Đề xuất', color: 'bg-purple-500' },
  { id: 'Won', label: 'Thành công', color: 'bg-accent-yellow' },
  { id: 'Lost', label: 'Thất bại', color: 'bg-red-500' }
];

interface SortableLeadCardProps {
  lead: Lead;
  onClick: () => void;
  onEdit: (e: React.MouseEvent, lead: Lead) => void;
  onContact: (e: React.MouseEvent, type: 'email' | 'phone' | 'social', value?: string) => void;
}

const SortableLeadCard: React.FC<SortableLeadCardProps> = ({ lead, onClick, onEdit, onContact }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "bento-card !p-6 md:!p-8 mb-4 md:mb-6 cursor-grab active:cursor-grabbing group relative",
        isDragging && "z-50 ring-2 ring-accent-yellow"
      )}
    >
      <div className="flex items-start gap-4 md:gap-6">
        <div 
          {...attributes} 
          {...listeners}
          className="mt-2 p-1 text-text-muted hover:text-white cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-4 md:gap-5 mb-4 md:mb-6">
            {lead.avatar ? (
              <img 
                src={lead.avatar} 
                alt={lead.name} 
                className="w-12 h-12 md:w-16 md:h-16 rounded-2xl object-cover border border-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 text-accent-yellow rounded-2xl flex items-center justify-center text-lg md:text-xl font-black border border-white/10">
                {lead.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h4 className="font-black text-white text-lg md:text-xl truncate leading-tight">{lead.name}</h4>
              <p className="text-[10px] md:text-sm text-text-muted font-bold uppercase tracking-tight truncate">
                {lead.position || 'Khách hàng'} @ {lead.company}
              </p>
            </div>
          </div>

          <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-text-muted">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0 text-text-muted/60" />
              <span className="truncate">{lead.address || 'Chưa cập nhật địa chỉ'}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1 md:mb-2">Giá trị tiềm năng</span>
                <span className="text-base md:text-lg font-black text-accent-yellow">
                  {lead.value.toLocaleString()} VNĐ
                </span>
              </div>
              <span className="text-[10px] font-black text-text-muted uppercase bg-white/5 px-2 py-1 md:px-3 md:py-1.5 rounded">
                {lead.source || 'Direct'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 md:gap-3" onClick={e => e.stopPropagation()}>
            <button 
              onClick={(e) => onEdit(e, lead)}
              className="flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 bg-white/5 text-text-muted rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
            >
              <Edit2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
              Sửa
            </button>
            <button 
              onClick={(e) => onContact(e, 'phone', lead.phone)}
              className="flex-1 flex items-center justify-center gap-2 py-2 md:py-2.5 bg-accent-yellow text-black rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest hover:bg-accent-yellow/90 transition-all shadow-lg shadow-accent-yellow/10"
            >
              <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" />
              Liên hệ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Leads: React.FC<{ userId: string }> = ({ userId }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updatingLeads = React.useRef<Set<string>>(new Set());

  const [formData, setFormData] = useState({ 
    name: '', 
    company: '', 
    position: '',
    address: '',
    avatar: '',
    email: '', 
    phone: '', 
    socialContact: '', 
    value: 0, 
    status: 'New' as LeadStatus,
    source: 'Direct',
    serviceIds: [] as string[]
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const q = query(collection(db, 'leads'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
      setLeads(leadsData);
    });
    return unsubscribe;
  }, [userId]);

  useEffect(() => {
    const q = query(collection(db, 'services'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
    });
    return unsubscribe;
  }, [userId]);

  const calculatePotentialValue = (selectedServiceIds: string[]) => {
    return selectedServiceIds.reduce((total, id) => {
      const service = services.find(s => s.id === id);
      return total + (service?.basePrice || 0);
    }, 0);
  };

  const handleServiceToggle = (serviceId: string) => {
    const serviceToToggle = services.find(s => s.id === serviceId);
    if (!serviceToToggle) return;

    let newServiceIds: string[];

    if (formData.serviceIds.includes(serviceId)) {
      // Bỏ chọn nếu đã chọn
      newServiceIds = formData.serviceIds.filter(id => id !== serviceId);
    } else {
      // Chọn mới, nhưng loại bỏ các sản phẩm cùng danh mục đã chọn trước đó
      const otherIdsInDifferentCategories = formData.serviceIds.filter(id => {
        const s = services.find(item => item.id === id);
        return s?.category !== serviceToToggle.category;
      });
      newServiceIds = [...otherIdsInDifferentCategories, serviceId];
    }
    
    setFormData({
      ...formData,
      serviceIds: newServiceIds,
      value: calculatePotentialValue(newServiceIds)
    });
  };

  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'Khác';
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const data = {
        ...formData,
        ownerId: userId,
        updatedAt: serverTimestamp()
      };

      if (editingLead) {
        await updateDoc(doc(db, 'leads', editingLead.id), data);
        // Nếu cập nhật sang "Thành công" từ trạng thái khác
        if (data.status === 'Won' && editingLead.status !== 'Won') {
          await createClientFromLead({ ...editingLead, ...data });
        }
        // Nếu cập nhật từ "Thành công" sang trạng thái khác
        else if (data.status !== 'Won' && editingLead.status === 'Won') {
          await deleteClientByLeadId(editingLead.id);
        }
      } else {
        const newLeadRef = await addDoc(collection(db, 'leads'), {
          ...data,
          createdAt: serverTimestamp()
        });
        // Nếu tạo mới với trạng thái "Thành công"
        if (data.status === 'Won') {
          await createClientFromLead({ id: newLeadRef.id, ...data } as Lead);
        }
      }
      closeModal();
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast.error('Có lỗi xảy ra khi lưu thông tin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = (lead?: Lead) => {
    if (lead) {
      setEditingLead(lead);
      setFormData({
        name: lead.name,
        company: lead.company,
        position: lead.position || '',
        address: lead.address || '',
        avatar: lead.avatar || '',
        email: lead.email || '',
        phone: lead.phone || '',
        socialContact: lead.socialContact || '',
        value: lead.value,
        status: lead.status,
        source: lead.source || 'Direct',
        serviceIds: lead.serviceIds || []
      });
    } else {
      setEditingLead(null);
      setFormData({ 
        name: '', 
        company: '', 
        position: '',
        address: '',
        avatar: '',
        email: '', 
        phone: '', 
        socialContact: '', 
        value: 0, 
        status: 'New', 
        source: 'Direct',
        serviceIds: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLead(null);
  };

  const createProjectFromLead = async (lead: Lead) => {
    try {
      const projectDocRef = doc(db, 'projects', lead.id);
      const projectDoc = await getDoc(projectDocRef);
      
      if (projectDoc.exists()) {
        return;
      }

      await setDoc(projectDocRef, {
        name: `Dự án: ${lead.company || lead.name}`,
        clientId: lead.id, // Client ID is same as Lead ID
        clientName: lead.company || lead.name,
        status: 'Planning',
        budget: lead.value || 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: lead.notes || '',
        ownerId: userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success(`Đã tạo dự án mới cho ${lead.company || lead.name}!`, {
        description: 'Bạn có thể quản lý tiến độ trong tab Dự án.',
        duration: 5000,
      });
    } catch (error) {
      console.error("Error creating project from lead: ", error);
    }
  };

  const deleteProjectByLeadId = async (leadId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', leadId));
    } catch (error) {
      console.error("Error deleting project by leadId: ", error);
    }
  };

  const createClientFromLead = async (lead: Lead) => {
    try {
      // Sử dụng lead.id làm document ID cho client để đảm bảo tính duy nhất
      const clientDocRef = doc(db, 'clients', lead.id);
      const clientDoc = await getDoc(clientDocRef);
      
      if (clientDoc.exists()) {
        return; // Đã tồn tại khách hàng cho lead này
      }

      // Kiểm tra thêm bằng query để chắc chắn (đề phòng dữ liệu cũ không dùng lead.id làm doc ID)
      const q = query(collection(db, 'clients'), where('leadId', '==', lead.id));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return;
      }

      await setDoc(clientDocRef, {
        name: lead.name,
        company: lead.company,
        email: lead.email || '',
        phone: lead.phone || '',
        leadId: lead.id,
        ownerId: userId,
        createdAt: serverTimestamp()
      });
      toast.success(`Đã chuyển ${lead.name} sang danh sách khách hàng!`, {
        description: 'Bạn có thể xem thông tin chi tiết trong tab Khách hàng.',
        duration: 5000,
      });
    } catch (error) {
      console.error("Error creating client from lead: ", error);
      toast.error('Có lỗi xảy ra khi tạo khách hàng từ lead');
    }
  };

  const deleteClientByLeadId = async (leadId: string) => {
    try {
      // Thử xóa bằng ID (nếu được tạo bằng leadId)
      await deleteDoc(doc(db, 'clients', leadId));
      
      // Đồng thời tìm và xóa các bản ghi khác có cùng leadId (để dọn dẹp dữ liệu cũ nếu có)
      const q = query(collection(db, 'clients'), where('leadId', '==', leadId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const deletePromises = querySnapshot.docs.map(docSnapshot => 
          deleteDoc(doc(db, 'clients', docSnapshot.id))
        );
        await Promise.all(deletePromises);
        toast.info('Đã gỡ khách hàng khỏi danh sách do trạng thái Lead thay đổi.');
      }
    } catch (error) {
      console.error("Error deleting client by leadId: ", error);
    }
  };

  const updateStatus = async (leadId: string, status: LeadStatus) => {
    if (updatingLeads.current.has(leadId)) return;
    
    const lead = leads.find(l => l.id === leadId);
    if (!lead || lead.status === status) return;

    updatingLeads.current.add(leadId);
    
    try {
      const oldStatus = lead.status;
      await updateDoc(doc(db, 'leads', leadId), { status, updatedAt: serverTimestamp() });
      
      // Nếu chuyển sang trạng thái "Thành công" và trước đó không phải "Thành công"
      if (status === 'Won' && oldStatus !== 'Won') {
        await createClientFromLead(lead);
        await createProjectFromLead(lead);
      }
      // Nếu chuyển từ "Thành công" sang trạng thái khác
      else if (status !== 'Won' && oldStatus === 'Won') {
        await deleteClientByLeadId(leadId);
        await deleteProjectByLeadId(leadId);
      }
    } catch (error) {
      console.error("Error updating status: ", error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái.');
    } finally {
      updatingLeads.current.delete(leadId);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column
    const column = COLUMNS.find(col => col.id === overId);
    if (column) {
      await updateStatus(activeLeadId, column.id);
      return;
    }

    // Check if dropped over another lead
    const overLead = leads.find(l => l.id === overId);
    if (overLead && activeLeadId !== overId) {
      const activeLead = leads.find(l => l.id === activeLeadId);
      if (activeLead && activeLead.status !== overLead.status) {
        await updateStatus(activeLeadId, overLead.status);
      }
    }
  };

  const deleteLead = async (leadId: string) => {
    try {
      await deleteDoc(doc(db, 'leads', leadId));
      setViewingLead(null);
      setConfirmDelete(null);
      toast.success('Đã xóa lead thành công');
    } catch (error) {
      console.error("Error deleting lead: ", error);
      toast.error('Có lỗi xảy ra khi xóa lead');
    }
  };

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Contacted': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Qualified': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Proposal': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'Won': return 'bg-accent-yellow/10 text-accent-yellow border-accent-yellow/20';
      case 'Lost': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-white/5 text-text-muted border-white/10';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(searchLower) ||
      lead.company.toLowerCase().includes(searchLower) ||
      (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
      (lead.phone && lead.phone.includes(searchTerm)) ||
      lead.status.toLowerCase().includes(searchLower)
    );
  });

  const handleContact = (e: React.MouseEvent | null, type: 'email' | 'phone' | 'social', value?: string) => {
    if (e) e.stopPropagation();
    
    if (!value) {
      toast.error(`Lead này chưa có thông tin ${type === 'email' ? 'Email' : type === 'phone' ? 'Số điện thoại' : 'Liên hệ mạng xã hội'}.`);
      return;
    }

    if (type === 'email') {
      window.location.href = `mailto:${value}`;
    } else if (type === 'phone') {
      window.location.href = `tel:${value}`;
    } else if (type === 'social') {
      window.open(value, '_blank');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="sticky top-0 z-30 bg-bg-dark/95 backdrop-blur-xl -mx-4 px-4 md:-mx-8 md:px-8 py-6 mb-8 border-b border-white/5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-yellow rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(239,255,51,0.2)]">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white font-display tracking-tight leading-none">Leads</h2>
            <p className="text-sm text-text-muted font-bold uppercase tracking-widest mt-1">Pipeline Management</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-[320px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent-yellow transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm lead, công ty, SĐT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white/5 border border-white/5 rounded-2xl text-sm font-bold text-white focus:bg-white/10 focus:border-accent-yellow outline-none transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  viewMode === 'table' ? "bg-accent-yellow text-black shadow-lg" : "text-text-muted hover:text-white"
                )}
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">Bảng</span>
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "p-2.5 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest",
                  viewMode === 'kanban' ? "bg-accent-yellow text-black shadow-lg" : "text-text-muted hover:text-white"
                )}
              >
                <Kanban size={16} />
                <span className="hidden sm:inline">Kanban</span>
              </button>
            </div>

            <button 
              onClick={() => openModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-3.5 bg-accent-yellow text-black rounded-2xl text-sm font-black hover:bg-accent-yellow/90 transition-all shadow-[0_0_20px_rgba(239,255,51,0.2)] active:scale-95"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="hidden sm:inline">Thêm Lead</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-container bento-card !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Thông tin Lead</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Giá trị</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Liên hệ</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setViewingLead(lead)}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      {lead.avatar ? (
                        <img src={lead.avatar} alt={lead.name} className="w-12 h-12 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 text-accent-yellow rounded-full flex items-center justify-center font-black text-lg">
                          {lead.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-black text-white">{lead.name}</p>
                        <p className="text-xs text-text-muted font-bold flex items-center gap-1.5 uppercase tracking-wider">
                          <Building2 size={14} />
                          {lead.company}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                    <select 
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-2 appearance-none cursor-pointer focus:outline-none transition-all",
                        lead.status === 'Won' ? "bg-accent-yellow text-black border-accent-yellow" : "bg-white/5 text-white border-white/10 hover:border-white/20"
                      )}
                    >
                      <option value="New">Mới</option>
                      <option value="Contacted">Đang chăm sóc</option>
                      <option value="Qualified">Tiềm năng</option>
                      <option value="Proposal">Đề xuất</option>
                      <option value="Won">Thành công</option>
                      <option value="Lost">Thất bại</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-white">{lead.value.toLocaleString()} VNĐ</p>
                  </td>
                  <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleContact(null, 'email', lead.email)}
                        className="p-2.5 text-text-muted hover:text-accent-yellow hover:bg-accent-yellow/10 rounded-xl transition-all"
                        title={lead.email || 'Chưa có Email'}
                      >
                        <Mail size={18} />
                      </button>
                      <button 
                        onClick={() => handleContact(null, 'phone', lead.phone)}
                        className="p-2.5 text-text-muted hover:text-accent-yellow hover:bg-accent-yellow/10 rounded-xl transition-all"
                        title={lead.phone || 'Chưa có SĐT'}
                      >
                        <Phone size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal(lead)}
                        className="p-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
                        title="Sửa nhanh"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2.5 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-text-muted/20">
                        <Search size={40} />
                      </div>
                      <div>
                        <p className="text-lg font-black text-white uppercase tracking-widest">
                          {searchTerm ? 'Không tìm thấy lead' : 'Chưa có lead nào'}
                        </p>
                        <p className="text-sm text-text-muted font-bold mt-1">
                          {searchTerm 
                            ? `Không tìm thấy kết quả cho "${searchTerm}"` 
                            : 'Hãy bắt đầu bằng cách thêm lead đầu tiên vào hệ thống'}
                        </p>
                      </div>
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="mt-2 px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          Xóa tìm kiếm
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="relative">
          {filteredLeads.length === 0 && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-bg-dark/50 backdrop-blur-sm rounded-3xl min-h-[600px]">
              <div className="flex flex-col items-center gap-4 bg-white/5 p-12 rounded-3xl border border-white/5 shadow-2xl">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-text-muted/20">
                  <Search size={40} />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-white uppercase tracking-widest">
                    {searchTerm ? 'Không tìm thấy lead' : 'Chưa có lead nào'}
                  </p>
                  <p className="text-sm text-text-muted font-bold mt-2">
                    {searchTerm 
                      ? `Không tìm thấy kết quả cho "${searchTerm}"` 
                      : 'Hãy bắt đầu bằng cách thêm lead đầu tiên vào hệ thống'}
                  </p>
                </div>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-8 py-3 bg-accent-yellow text-black text-xs font-black uppercase tracking-widest rounded-xl transition-all hover:bg-accent-yellow/90 shadow-lg"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </div>
            </div>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
          <div className="flex flex-nowrap gap-4 md:gap-8 overflow-x-auto pb-12 px-4 md:px-8 custom-scrollbar min-h-[800px] -mx-4 md:-mx-8 scrollbar-hide">
            {COLUMNS.map((column) => (
              <div key={column.id} className="w-[85vw] sm:w-[400px] shrink-0 flex flex-col gap-6">
                <div className="flex flex-col gap-2 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full", column.color)} />
                      <h3 className="font-black text-white uppercase tracking-widest text-base">{column.label}</h3>
                      <span className="bg-white/5 text-text-muted text-sm font-black px-3 py-1 rounded-full">
                        {filteredLeads.filter(l => l.status === column.id).length}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-black text-text-muted uppercase tracking-tight">
                    Tổng: {filteredLeads.filter(l => l.status === column.id).reduce((sum, l) => sum + l.value, 0).toLocaleString()} VNĐ
                  </div>
                </div>
                
                <SortableContext
                  id={column.id}
                  items={filteredLeads.filter(l => l.status === column.id).map(l => l.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 space-y-4 md:space-y-6 bg-white/5 p-4 md:p-8 rounded-[2.5rem] border border-dashed border-white/10 min-h-[200px]">
                    {filteredLeads.filter(l => l.status === column.id).map((lead) => (
                      <SortableLeadCard 
                        key={lead.id}
                        lead={lead}
                        onClick={() => setViewingLead(lead)}
                        onEdit={(e) => { e.stopPropagation(); openModal(lead); }}
                        onContact={(e, type, val) => handleContact(e, type, val)}
                      />
                    ))}
                    {filteredLeads.filter(l => l.status === column.id).length === 0 && (
                      <div className="py-16 text-center text-text-muted text-sm font-black uppercase tracking-widest">
                        Trống
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
            <div className="w-40 shrink-0" /> {/* Larger spacer for scroll end */}
          </div>

          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeId ? (
              <div className="bento-card !p-4 w-80 shadow-2xl rotate-3 scale-105 ring-2 ring-accent-yellow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-yellow text-black rounded-xl flex items-center justify-center text-sm font-black">
                    {leads.find(l => l.id === activeId)?.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-sm truncate">{leads.find(l => l.id === activeId)?.name}</h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-tight truncate">
                      {leads.find(l => l.id === activeId)?.company}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-zinc-900 sm:rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in duration-200 max-h-[100vh] sm:max-h-[90vh] overflow-y-auto my-auto border border-white/5">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-accent-yellow text-black rounded-2xl shadow-lg shadow-accent-yellow/10">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{editingLead ? 'Cập nhật Lead' : 'Thêm Lead mới'}</h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Agency CRM</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Thông tin định danh</label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input 
                          required
                          type="text" 
                          placeholder="Tên liên hệ *"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                        />
                      </div>
                      <div className="w-24">
                        <input 
                          type="text" 
                          placeholder="Avatar URL"
                          value={formData.avatar}
                          onChange={e => setFormData({...formData, avatar: e.target.value})}
                          className="w-full px-4 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all text-[10px] font-bold text-white placeholder:text-text-muted/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        required
                        type="text" 
                        placeholder="Công ty *"
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                      />
                      <input 
                        type="text" 
                        placeholder="Chức vụ"
                        value={formData.position}
                        onChange={e => setFormData({...formData, position: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Địa chỉ"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Kênh liên lạc</label>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="Địa chỉ Email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                    />
                    <input 
                      type="text" 
                      placeholder="Số điện thoại"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                    />
                    <input 
                      type="text" 
                      placeholder="Liên hệ Social (FB, Zalo...)"
                      value={formData.socialContact}
                      onChange={e => setFormData({...formData, socialContact: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Sản phẩm quan tâm</label>
                  <div className="space-y-4 max-h-60 overflow-y-auto p-4 bg-white/5 rounded-2xl border border-white/5 focus-within:bg-white/10 focus-within:border-accent-yellow transition-all custom-scrollbar">
                    {services.length === 0 ? (
                      <p className="text-xs text-text-muted italic">Chưa có dịch vụ nào.</p>
                    ) : (
                      Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                        <div key={category} className="space-y-2">
                          <h5 className="text-[9px] font-black text-accent-yellow/60 uppercase tracking-widest px-1">{category}</h5>
                          <div className="space-y-1">
                            {categoryServices.map(service => (
                              <div 
                                key={service.id} 
                                className={cn(
                                  "flex items-center gap-3 cursor-pointer group p-2.5 rounded-xl transition-all",
                                  formData.serviceIds.includes(service.id) ? "bg-accent-yellow/10" : "hover:bg-white/5"
                                )} 
                                onClick={() => handleServiceToggle(service.id)}
                              >
                                <div 
                                  className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                    formData.serviceIds.includes(service.id) 
                                      ? "bg-accent-yellow border-accent-yellow text-black" 
                                      : "border-white/20 group-hover:border-accent-yellow/50"
                                  )}
                                >
                                  {formData.serviceIds.includes(service.id) && <Check size={12} strokeWidth={4} />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-bold text-white">{service.name}</p>
                                  <p className="text-[10px] text-text-muted font-bold">{service.basePrice.toLocaleString()} VNĐ</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Giá trị (VNĐ)</label>
                    <input 
                      type="number" 
                      value={formData.value}
                      onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-black text-accent-yellow"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Trạng thái</label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as LeadStatus})}
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/5 rounded-2xl focus:bg-white/10 focus:border-accent-yellow focus:ring-4 focus:ring-accent-yellow/10 outline-none transition-all font-black text-white appearance-none"
                    >
                      <option value="New">Mới</option>
                      <option value="Contacted">Đang chăm sóc</option>
                      <option value="Qualified">Tiềm năng</option>
                      <option value="Proposal">Đề xuất</option>
                      <option value="Won">Thành công</option>
                      <option value="Lost">Thất bại</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-4 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "flex-1 px-6 py-4 bg-accent-yellow text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-yellow/90 transition-all shadow-lg shadow-accent-yellow/10 active:scale-95",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Đang lưu...
                    </div>
                  ) : (
                    editingLead ? 'Lưu thay đổi' : 'Tạo Lead'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 overflow-hidden my-auto border border-white/5">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/5 text-accent-yellow rounded-3xl shadow-xl flex items-center justify-center text-2xl font-black border border-white/10">
                  {viewingLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">{viewingLead.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border", getStatusColor(viewingLead.status))}>
                      {viewingLead.status === 'New' ? 'Mới' :
                       viewingLead.status === 'Contacted' ? 'Đang chăm sóc' :
                       viewingLead.status === 'Qualified' ? 'Tiềm năng' :
                       viewingLead.status === 'Proposal' ? 'Đề xuất' :
                       viewingLead.status === 'Won' ? 'Thành công' : 'Thất bại'}
                    </span>
                    <span className="text-xs text-text-muted font-bold uppercase tracking-tighter flex items-center gap-1">
                      <Building2 size={12} />
                      {viewingLead.company}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setViewingLead(null)} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                    <TrendingUp size={12} />
                    Giá trị dự kiến
                  </p>
                  <p className="text-xl font-black text-accent-yellow">{viewingLead.value.toLocaleString()} VNĐ</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Briefcase size={12} />
                    Chức vụ
                  </p>
                  <p className="text-sm font-bold text-white">{viewingLead.position || 'Khách hàng'}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
                    <MapPin size={12} />
                    Địa chỉ
                  </p>
                  <p className="text-sm font-bold text-white truncate">{viewingLead.address || 'Chưa cập nhật'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Thông tin liên hệ</label>
                  <div className="space-y-3">
                    <div 
                      onClick={() => handleContact(null, 'email', viewingLead.email)}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-accent-yellow/30 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="p-3 bg-white/5 text-text-muted rounded-xl group-hover:bg-accent-yellow group-hover:text-black transition-colors">
                        <Mail size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Email</p>
                        <p className="text-sm font-bold text-white truncate">{viewingLead.email || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => handleContact(null, 'phone', viewingLead.phone)}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-accent-yellow/30 hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="p-3 bg-white/5 text-text-muted rounded-xl group-hover:bg-accent-yellow group-hover:text-black transition-colors">
                        <Phone size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Số điện thoại</p>
                        <p className="text-sm font-bold text-white">{viewingLead.phone || 'Chưa cập nhật'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Sản phẩm quan tâm</label>
                  <div className="flex flex-wrap gap-2">
                    {viewingLead.serviceIds && viewingLead.serviceIds.length > 0 ? (
                      viewingLead.serviceIds.map(id => {
                        const service = services.find(s => s.id === id);
                        return service ? (
                          <span key={id} className="px-4 py-2 bg-accent-yellow/10 text-accent-yellow rounded-xl text-[10px] font-black uppercase tracking-widest border border-accent-yellow/20 flex items-center gap-2">
                            <CheckCircle2 size={12} />
                            {service.name}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <p className="text-xs text-text-muted italic">Chưa chọn sản phẩm nào.</p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Thông tin bổ sung</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Ngày tạo</p>
                      <p className="text-sm font-bold text-white">
                        {viewingLead.createdAt?.toDate ? viewingLead.createdAt.toDate().toLocaleDateString('vi-VN') : 'Vừa xong'}
                      </p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nguồn Lead</p>
                      <p className="text-sm font-bold text-white">{viewingLead.source || 'Trực tiếp'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    setViewingLead(null);
                    openModal(viewingLead);
                  }}
                  className="flex-1 min-w-[140px] py-4 bg-accent-yellow text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-accent-yellow/90 transition-all shadow-lg shadow-accent-yellow/10 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => setConfirmDelete(viewingLead.id)}
                  className="flex-1 min-w-[140px] py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 border border-red-500/20"
                >
                  <X size={18} />
                  Xóa Lead
                </button>
                <button 
                  onClick={() => setViewingLead(null)}
                  className="flex-1 min-w-[140px] py-4 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-zinc-900 rounded-[3rem] w-full max-w-lg p-12 shadow-2xl animate-in zoom-in duration-200 border border-white/10">
            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2rem] flex items-center justify-center mb-8 border border-red-500/20">
              <AlertTriangle size={56} />
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Xác nhận xóa</h3>
            <p className="text-lg text-text-muted mb-12 font-medium leading-relaxed">Bạn có chắc chắn muốn xóa lead này không? Hành động này không thể hoàn tác và mọi dữ liệu liên quan sẽ bị gỡ bỏ.</p>
            <div className="flex gap-6">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-5 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/10 hover:text-white transition-all border border-white/5"
              >
                Hủy
              </button>
              <button 
                onClick={() => deleteLead(confirmDelete)}
                className="flex-1 py-5 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 active:scale-95"
              >
                Xóa ngay
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Notification Toast */}
    </div>
  );
};

export default Leads;
