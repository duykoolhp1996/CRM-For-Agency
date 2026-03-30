import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag, 
  DollarSign, 
  Briefcase, 
  CheckCircle2, 
  X, 
  GripVertical,
  Layers,
  Sparkles,
  Copy,
  LayoutGrid,
  Kanban
} from 'lucide-react';
import { cn } from '../lib/utils';

const Services: React.FC<{ userId: string }> = ({ userId }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [viewMode, setViewMode] = useState<'gallery' | 'kanban'>('gallery');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    basePrice: 0, 
    category: '',
    features: [] as string[]
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'services'), where('ownerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setServices(servicesData);
    });
    return unsubscribe;
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      ownerId: userId
    };
    if (editingService) {
      await updateDoc(doc(db, 'services', editingService.id), data);
    } else {
      await addDoc(collection(db, 'services'), data);
    }
    closeModal();
  };

  const handleDelete = async (id: string) => {
    setConfirmDelete(id);
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDoc(doc(db, 'services', confirmDelete));
      setConfirmDelete(null);
    } catch (error) {
      console.error("Error deleting service: ", error);
    }
  };

  const handleDuplicate = async (service: Service) => {
    const { id, ...serviceData } = service;
    await addDoc(collection(db, 'services'), {
      ...serviceData,
      name: `${service.name} (Bản sao)`,
      ownerId: userId
    });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  const openModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: service.name, 
        description: service.description, 
        basePrice: service.basePrice, 
        category: service.category,
        features: service.features || []
      });
    } else {
      setEditingService(null);
      setFormData({ 
        name: '', 
        description: '', 
        basePrice: 0, 
        category: '',
        features: [
          'Phỏng vấn/ Khảo sát',
          'Trình bày 3 concepts',
          'Chỉnh sửa 03 lần',
          'Câu chuyện logo',
          'Logo sheet',
          'Logo guidelines PDF',
          'Tư vấn bảo hộ logo'
        ]
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', basePrice: 0, category: '', features: [] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">Danh mục Dịch vụ</h2>
          <p className="text-sm sm:text-base text-text-muted font-medium">Quản lý gói giải pháp và các hạng mục bàn giao cho khách hàng.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner w-full sm:w-auto">
            <button 
              onClick={() => setViewMode('gallery')}
              className={cn(
                "flex-1 sm:flex-none p-2 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest",
                viewMode === 'gallery' ? "bg-accent-yellow text-bg-dark shadow-sm" : "text-text-muted hover:text-white"
              )}
            >
              <LayoutGrid size={14} className="sm:w-4 sm:h-4" />
              Lưới
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "flex-1 sm:flex-none p-2 rounded-xl transition-all flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest",
                viewMode === 'kanban' ? "bg-accent-yellow text-bg-dark shadow-sm" : "text-text-muted hover:text-white"
              )}
            >
              <Kanban size={14} className="sm:w-4 sm:h-4" />
              Bảng
            </button>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-yellow text-bg-dark rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-opacity-90 transition-all active:scale-95"
          >
            <Plus size={18} />
            Tạo dịch vụ mới
          </button>
        </div>
      </div>

      {viewMode === 'gallery' ? (
        <div className="flex overflow-x-auto pb-8 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6 scrollbar-hide">
          {services.map((service) => (
            <div 
              key={service.id} 
              onClick={() => setViewingService(service)}
              className="bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-accent-yellow/30 transition-all group flex flex-col overflow-hidden cursor-pointer shrink-0 w-[75vw] lg:w-auto"
            >
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-accent-yellow/10 text-accent-yellow rounded-2xl">
                    <Layers size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDuplicate(service)}
                      title="Nhân bản"
                      className="p-2.5 text-text-muted hover:text-accent-yellow hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => openModal(service)}
                      title="Chỉnh sửa"
                      className="p-2.5 text-text-muted hover:text-accent-yellow hover:bg-white/5 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      title="Xóa"
                      className="p-2.5 text-text-muted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black text-accent-yellow bg-accent-yellow/10 px-3 py-1 rounded-full uppercase tracking-widest">
                      {service.category || 'Marketing'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white leading-tight">{service.name}</h3>
                </div>

                <p className="text-sm text-text-muted mb-8 line-clamp-2 font-medium">{service.description}</p>
                
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Hạng mục bàn giao</p>
                  <div className="space-y-3">
                    {(service.features || []).slice(0, 4).map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-white/80 font-medium">
                        <CheckCircle2 size={14} className="text-accent-yellow shrink-0" />
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                    {service.features?.length > 4 && (
                      <p className="text-xs text-accent-yellow font-black uppercase tracking-widest pl-7">+{service.features.length - 4} hạng mục khác</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-white/5 border-t border-white/5 flex items-center justify-between mt-auto">
                <div>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Giá cơ bản</p>
                  <div className="flex items-center text-2xl font-black text-white">
                    <span>{service.basePrice.toLocaleString()}</span>
                    <span className="text-sm ml-1 font-bold text-accent-yellow">đ</span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingService(service);
                  }}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                >
                  Chi tiết
                </button>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full py-24 text-center bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-text-muted">
                <Briefcase size={36} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Chưa có dịch vụ nào</h3>
              <p className="text-text-muted max-w-xs mx-auto font-medium">Hãy bắt đầu xây dựng danh mục dịch vụ chuyên nghiệp cho agency của bạn.</p>
            </div>
          )}
          <div className="w-20 shrink-0 lg:hidden" /> {/* Spacer for mobile scroll end */}
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[600px]">
          {Array.from(new Set(services.map(s => s.category || 'Chưa phân loại'))).map((category) => (
            <div key={category} className="w-80 shrink-0 flex flex-col gap-4">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">{category}</h3>
                  <span className="bg-white/10 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {services.filter(s => (s.category || 'Chưa phân loại') === category).length}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                {services.filter(s => (s.category || 'Chưa phân loại') === category).map((service) => (
                  <div 
                    key={service.id}
                    onClick={() => setViewingService(service)}
                    className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-accent-yellow/30 transition-all group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-black text-white text-base leading-tight">{service.name}</h4>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => openModal(service)}
                          className="p-2 text-text-muted hover:text-accent-yellow hover:bg-white/5 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-xs text-text-muted mb-6 line-clamp-2 font-medium">{service.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-sm font-black text-accent-yellow">
                        {service.basePrice.toLocaleString()}đ
                      </div>
                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        {service.features?.length || 0} hạng mục
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="w-20 shrink-0" /> {/* Spacer for scroll end */}
          {services.length === 0 && (
            <div className="flex-1 py-24 text-center bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/10">
              <p className="text-text-muted font-medium">Chưa có dịch vụ nào.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-xl flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-bg-dark sm:rounded-[2.5rem] w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in duration-200 overflow-hidden min-h-screen sm:min-h-0 flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-yellow text-bg-dark rounded-2xl shadow-lg shadow-accent-yellow/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {editingService ? 'Cấu hình Dịch vụ' : 'Thiết lập Dịch vụ mới'}
                  </h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">Marketing Solutions</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-y-auto">
              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Thông tin cơ bản</label>
                  <div className="space-y-4">
                    <div className="relative">
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Tên dịch vụ (VD: Branding Package)"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        placeholder="Danh mục (VD: Thiết kế, Social...)"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-bold text-white placeholder:text-text-muted/50"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-accent-yellow">
                        <DollarSign size={20} />
                      </div>
                      <input 
                        required
                        type="number" 
                        value={formData.basePrice}
                        onChange={e => setFormData({...formData, basePrice: Number(e.target.value)})}
                        placeholder="Giá cơ bản"
                        className="w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all font-black text-white placeholder:text-text-muted/50"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Mô tả giải pháp</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Mô tả ngắn gọn về giá trị của dịch vụ..."
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:bg-white/10 focus:border-accent-yellow outline-none transition-all resize-none font-medium text-white placeholder:text-text-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Hạng mục bàn giao (Deliverables)</label>
                  <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                    <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group focus-within:border-accent-yellow/50 transition-all">
                          <GripVertical size={14} className="text-text-muted/30 cursor-grab" />
                          <input 
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="text-sm font-bold text-white flex-1 bg-transparent border-none focus:ring-0 p-0 outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-1 text-text-muted hover:text-red-400 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={newFeature}
                        onChange={e => setNewFeature(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        placeholder="Thêm hạng mục mới..."
                        className="w-full pl-5 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white focus:border-accent-yellow outline-none transition-all placeholder:text-text-muted/50"
                      />
                      <button 
                        type="button"
                        onClick={addFeature}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-yellow text-bg-dark rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-4 sticky bottom-0 bg-bg-dark sm:bg-transparent pb-4 sm:pb-0">
                  <button 
                    type="submit"
                    className="w-full py-5 bg-accent-yellow text-bg-dark rounded-2xl font-black uppercase tracking-widest hover:bg-opacity-90 transition-all active:scale-95 shadow-lg shadow-accent-yellow/10"
                  >
                    {editingService ? 'Lưu thay đổi' : 'Kích hoạt Dịch vụ'}
                  </button>
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="w-full py-5 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingService && (
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-xl flex items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
          <div className="bg-bg-dark sm:rounded-[2.5rem] w-full max-w-2xl border border-white/10 shadow-2xl animate-in zoom-in duration-200 overflow-hidden min-h-screen sm:min-h-0 flex flex-col">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-yellow text-bg-dark rounded-2xl shadow-lg shadow-accent-yellow/20">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{viewingService.name}</h3>
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">{viewingService.category || 'Marketing Service'}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingService(null)} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 flex-1 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Mô tả dịch vụ</label>
                <p className="text-base text-white leading-relaxed font-medium">
                  {viewingService.description || 'Không có mô tả cho dịch vụ này.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Thông tin giá</label>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Giá cơ bản</p>
                    <p className="text-3xl font-black text-accent-yellow">
                      {viewingService.basePrice.toLocaleString()}đ
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Phân loại</label>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Danh mục</p>
                    <p className="text-xl font-black text-white uppercase tracking-tight">
                      {viewingService.category || 'Chưa phân loại'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">Hạng mục bàn giao chi tiết</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewingService.features?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                      <CheckCircle2 size={16} className="text-accent-yellow shrink-0" />
                      <span className="text-sm font-bold text-white">{feature}</span>
                    </div>
                  ))}
                  {(!viewingService.features || viewingService.features.length === 0) && (
                    <p className="text-sm text-text-muted italic">Không có hạng mục bàn giao nào được liệt kê.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-bg-dark sm:bg-transparent pb-4 sm:pb-0">
                <button 
                  onClick={() => {
                    setViewingService(null);
                    openModal(viewingService);
                  }}
                  className="flex-1 py-5 bg-accent-yellow text-bg-dark rounded-2xl font-black uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg shadow-accent-yellow/10 flex items-center justify-center gap-3 active:scale-95"
                >
                  <Edit2 size={20} />
                  Chỉnh sửa ngay
                </button>
                <button 
                  onClick={() => setViewingService(null)}
                  className="flex-1 py-5 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all"
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
        <div className="fixed inset-0 bg-bg-dark/80 backdrop-blur-xl flex items-center justify-center z-[60] p-4">
          <div className="bg-bg-dark rounded-[2.5rem] w-full max-w-md border border-white/10 shadow-2xl animate-in zoom-in duration-200 p-10 text-center">
            <div className="w-20 h-20 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Xác nhận xóa</h3>
            <p className="text-text-muted mb-10 font-medium">Bạn có chắc chắn muốn xóa dịch vụ này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-4 bg-white/5 text-text-muted rounded-2xl font-black uppercase tracking-widest hover:bg-white/10 transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 active:scale-95"
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

export default Services;
