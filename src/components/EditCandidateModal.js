'use client';

import { useState, useEffect } from 'react';
import { X, Save, Trash2, Loader2, Upload, Hash, User, Image as ImageIcon } from "lucide-react";
import ConfirmModal from "./ConfirmModal";

export default function EditCandidateModal({ isOpen, onClose, candidate, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        number: '',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const [members, setMembers] = useState([]);
    const [newMember, setNewMember] = useState({
        name: '',
        studentId: '',
        position: '',
        imageFile: null,
        previewUrl: ''
    });

    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name || '',
                number: candidate.number || '',
            });
            setPreviewUrl(candidate.logoUrl || '');
            setSelectedFile(null);
            setMembers(candidate.members || []);
        } else {
            setFormData({
                name: '',
                number: '',
            });
            setPreviewUrl('');
            setSelectedFile(null);
            setMembers([]);
        }
        setNewMember({ name: '', studentId: '', position: '', imageFile: null, previewUrl: '' });
    }, [candidate, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น');
                return;
            }

            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleMemberChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({ ...prev, [name]: value }));
    };

    const handleMemberImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewMember(prev => ({
                ...prev,
                imageFile: file,
                previewUrl: URL.createObjectURL(file)
            }));
        }
    };

    const addMember = () => {
        if (!newMember.name || !newMember.studentId) {
            alert("Please fill in at least Name and Student ID");
            return;
        }
        
        setMembers(prev => [...prev, { ...newMember, tempId: Date.now() }]);
        
        setNewMember({ name: '', studentId: '', position: '', imageFile: null, previewUrl: '' });
    };

    const removeMember = (indexToRemove) => {
        setMembers(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const isFormValid = formData.name.trim() !== '' && formData.number !== '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setIsLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('number', formData.number);
            if (selectedFile) data.append('file', selectedFile);

            const membersPayload = members.map(m => ({
                name: m.name,
                studentId: m.studentId,
                position: m.position,
            }));
            data.append('members', JSON.stringify(membersPayload));

            let res;

            if (candidate) {
                res = await fetch(`/api/admin/candidates?id=${candidate.id}`, {
                    method: 'PUT',
                    body: data,
                });
            } else {
                res = await fetch(`/api/admin/candidates`, {
                    method: 'POST',
                    body: data,
                });
            }

            if (!res.ok) throw new Error('Update failed');

            if (onUpdate) onUpdate(candidate ? 'UPDATE' : 'CREATE');
            onClose();

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/candidates?id=${candidate.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Delete failed');

            if (onUpdate) onUpdate('DELETE');
            setShowDeleteConfirm(false);
            onClose();

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up border border-gray-100">

                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" />
                        แก้ไขข้อมูลผู้สมัคร
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form id="candidate-form" onSubmit={handleSubmit} className="space-y-6">

                        {/* --- Section 1: Candidate Info --- */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">ข้อมูลพรรค</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลข <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="number"
                                            name="number"
                                            value={formData.number}
                                            onChange={handleChange}
                                            required
                                            className="pl-10 w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="1"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อพรรค <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="พรรคก้าวหน้า"
                                    />
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">โลโก้พรรค</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                                    </div>
                                    <label className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                                        Upload Logo
                                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        {/* --- Section 2: Members --- */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-4 h-4" /> สมาชิกพรรค ({members.length})
                                </h4>
                            </div>

                            {/* Add Member Form */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        name="name"
                                        value={newMember.name}
                                        onChange={handleMemberChange}
                                        placeholder="ชื่อ-นามสกุล"
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="studentId"
                                        value={newMember.studentId}
                                        onChange={handleMemberChange}
                                        placeholder="รหัสนักศึกษา"
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <input
                                        type="text"
                                        name="position"
                                        value={newMember.position}
                                        onChange={handleMemberChange}
                                        placeholder="ตำแหน่ง (Optional)"
                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                     {/* Simple Image Input for member (Visual only for now unless backend supports it) */}
                                    <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                                        <Upload className="w-3 h-3" /> 
                                        {newMember.imageFile ? "Image Selected" : "Add Image"}
                                        <input type="file" className="hidden" accept="image/*" onChange={handleMemberImageChange}/>
                                    </label>
                                    
                                    <button 
                                        type="button" 
                                        onClick={addMember}
                                        className="px-4 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> เพิ่มสมาชิก
                                    </button>
                                </div>
                            </div>

                            {/* Members List */}
                            <div className="space-y-2">
                                {members.length === 0 && <p className="text-center text-gray-400 text-sm py-4">ยังไม่มีสมาชิก</p>}
                                {members.map((member, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                                {member.previewUrl || member.imageUrl ? (
                                                    <img src={member.previewUrl || member.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{member.name}</p>
                                                <p className="text-xs text-gray-500">{member.studentId} • {member.position || 'Member'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => removeMember(idx)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        ยกเลิก
                    </button>
                    {candidate == null ? "" :
                        <button
                            onClick={handleDeleteClick}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-2 bg-[#C40808] hover:bg-[#990C0C] text-white rounded-xl font-medium shadow-md transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Trash2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            ลบ
                        </button>
                    }
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !isFormValid}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl font-medium shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${!isFormValid
                            ? 'bg-gray-300 text-gray-500'
                            : 'bg-[#8A2680] hover:bg-[#701e68] text-white'
                            }`}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {candidate ? "บันทึก" : "สร้าง"}
                    </button>
                </div>

            </div>
            
            <ConfirmModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleConfirmDelete}
                title="ยืนยันการลบ?"
                message={`คุณต้องการลบผู้สมัคร "${formData.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`}
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}