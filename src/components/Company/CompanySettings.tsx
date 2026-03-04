import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { uploadCompanyAsset } from '../../lib/storage';
import { Loader2, Save, Building2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function CompanySettings() {
    const { company, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        nif: '',
        address: '',
        logo_url: '',
        watermark_url: ''
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [watermarkFile, setWatermarkFile] = useState<File | null>(null);

    useEffect(() => {
        if (company?.id) {
            loadCompanyData();
        }
    }, [company?.id]);

    const loadCompanyData = async () => {
        try {
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('id', company?.id)
                .single();

            if (error) throw error;
            if (data) {
                setFormData({
                    name: data.name || '',
                    nif: data.nif || '',
                    address: data.address || '',
                    logo_url: data.logo_url || '',
                    watermark_url: data.watermark_url || ''
                });
            }
        } catch (error) {
            console.error('Error loading company data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'watermark') => {
        const file = e.target.files?.[0];
        if (file) {
            if (type === 'logo') setLogoFile(file);
            else setWatermarkFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!company?.id) return;

        setSaving(true);
        try {
            let currentLogoUrl = formData.logo_url;
            let currentWatermarkUrl = formData.watermark_url;

            if (logoFile) {
                currentLogoUrl = await uploadCompanyAsset(logoFile, company.id, 'logo');
            }

            if (watermarkFile) {
                currentWatermarkUrl = await uploadCompanyAsset(watermarkFile, company.id, 'watermark');
            }

            const { error } = await supabase
                .from('companies')
                .update({
                    name: formData.name,
                    nif: formData.nif,
                    address: formData.address,
                    logo_url: currentLogoUrl,
                    watermark_url: currentWatermarkUrl
                })
                .eq('id', company.id);

            if (error) throw error;

            setFormData(prev => ({
                ...prev,
                logo_url: currentLogoUrl,
                watermark_url: currentWatermarkUrl
            }));

            alert('Configurações salvas com sucesso!');

        } catch (error) {
            console.error('Error saving company:', error);
            alert('Erro ao salvar as configurações da empresa.');
        } finally {
            setSaving(false);
        }
    };

    if (role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-brand-primary/10">
                <Building2 size={48} className="text-brand-primary/20 mb-4" />
                <h2 className="text-xl font-bold text-brand-primary">Acesso Negado</h2>
                <p className="text-brand-primary/60 mt-2">Apenas administradores podem gerenciar as configurações da empresa.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold text-brand-primary">Configurações da Empresa</h2>
                <p className="text-brand-primary/60 mt-1">Gerencie os dados e a identidade visual da sua organização</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-brand-primary/10 overflow-hidden">
                <div className="p-6 border-b border-brand-primary/10">
                    <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2">
                        <Building2 size={20} className="text-brand-accent" />
                        Dados Gerais
                    </h3>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-brand-primary/80 mb-2">Nome Comercial / Razão Social</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-primary"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-brand-primary/80 mb-2">NIF</label>
                            <input
                                type="text"
                                value={formData.nif}
                                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                                className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-brand-primary/80 mb-2">Morada / Endereço Completo</label>
                        <textarea
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-primary resize-none"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-brand-primary/10">
                    <h3 className="text-lg font-semibold text-brand-primary flex items-center gap-2 mb-6">
                        <ImageIcon size={20} className="text-brand-accent" />
                        Identidade Visual
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-brand-primary/80">Logotipo Institucional</label>
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 bg-brand-bg border border-brand-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                                    {logoFile ? (
                                        <img src={URL.createObjectURL(logoFile)} alt="Novo Logo" className="w-full h-full object-contain" />
                                    ) : formData.logo_url ? (
                                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <ImageIcon size={32} className="text-brand-primary/20" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-brand-primary/60 mb-2">Recomendado: PNG ou JPG com fundo transparente. Máx 5MB.</p>
                                    <label className="cursor-pointer bg-brand-bg border border-brand-primary/20 hover:bg-brand-primary/5 text-brand-primary px-4 py-2 rounded-lg text-sm transition-colors inline-block">
                                        Escolher Imagem
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Watermark Upload */}
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-brand-primary/80">Marca d'Água (Relatórios PDF)</label>
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 bg-brand-bg border border-brand-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                                    {watermarkFile ? (
                                        <img src={URL.createObjectURL(watermarkFile)} alt="Nova Marca" className="w-full h-full object-contain opacity-50" />
                                    ) : formData.watermark_url ? (
                                        <img src={formData.watermark_url} alt="Marca" className="w-full h-full object-contain opacity-50" />
                                    ) : (
                                        <ImageIcon size={32} className="text-brand-primary/20" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-brand-primary/60 mb-2">Utilize imagens SVG ou PNG com baixa opacidade para melhor resultado nos PDFs documentais.</p>
                                    <label className="cursor-pointer bg-brand-bg border border-brand-primary/20 hover:bg-brand-primary/5 text-brand-primary px-4 py-2 rounded-lg text-sm transition-colors inline-block">
                                        Escolher Fundo
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'watermark')} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-brand-bg/50 border-t border-brand-primary/10 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-brand-primary hover:bg-brand-primary/90 text-brand-accent px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 font-medium"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save size={20} />
                                Salvar Configurações
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
