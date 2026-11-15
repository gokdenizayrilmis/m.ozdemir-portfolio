'use client';

import { useEffect, useState } from 'react';
import { leadService } from '@/services';
import { Lead } from '@/types';
import {
  MessageCircle,
  Phone,
  FileText,
  Loader2,
} from 'lucide-react';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    const data = await leadService.getAllLeads();
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleMarkRead = async (id: string) => {
    await leadService.markAsRead(id);
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isRead: true } : l))
    );
  };

  const filtered = leads.filter((l) => {
    if (filterType === 'all') return true;
    return l.conversionType === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-700">
            Dönüşüm & Hasta Takip
          </span>
          <h1 className="text-2xl font-serif font-bold text-slate-900 mt-1">
            Gelen Randevu & Tıklama Kayıtları ({leads.length})
          </h1>
          <p className="text-xs text-slate-500">
            WhatsApp ve telefon butonlarına tıklayan ya da iletişim formu
            dolduran hastaların tüm detayları
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tümü ({leads.length})
          </button>
          <button
            onClick={() => setFilterType('WhatsAppClick')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'WhatsAppClick'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setFilterType('PhoneClick')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'PhoneClick'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Arama
          </button>
          <button
            onClick={() => setFilterType('ContactForm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'ContactForm'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Form
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Kayıtlar yükleniyor...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Bu kategoride henüz kayıt bulunmamaktadır.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4">Kanal</th>
                  <th className="py-3 px-4">Hasta Adı / Kayıt</th>
                  <th className="py-3 px-4">Telefon</th>
                  <th className="py-3 px-4">Açılış Sayfası</th>
                  <th className="py-3 px-4">Google Ads Kampanya</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((l) => (
                  <tr
                    key={l.id}
                    className={`hover:bg-slate-50/70 transition ${
                      !l.isRead ? 'bg-amber-50/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          l.conversionType === 'WhatsAppClick'
                            ? 'bg-emerald-50 text-emerald-700'
                            : l.conversionType === 'PhoneClick'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {l.conversionType === 'WhatsAppClick' && (
                          <MessageCircle className="w-3 h-3" />
                        )}
                        {l.conversionType === 'PhoneClick' && (
                          <Phone className="w-3 h-3" />
                        )}
                        {l.conversionType === 'ContactForm' && (
                          <FileText className="w-3 h-3" />
                        )}
                        <span>{l.conversionType}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900">{l.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-mono">
                      {l.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {l.sourcePageSlug}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {l.utmCampaign || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      {l.isRead ? (
                        <span className="text-slate-400 text-[10px]">
                          İncelendi
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Yeni
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {l.conversionType === 'ContactForm' && (
                        <button
                          onClick={() => setSelectedLead(l)}
                          className="px-2 py-1 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md text-[11px]"
                        >
                          Detay
                        </button>
                      )}
                      {!l.isRead && (
                        <button
                          onClick={() => handleMarkRead(l.id)}
                          className="px-2 py-1 bg-slate-900 text-white rounded-md text-[11px] hover:bg-slate-800"
                        >
                          Okundu
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
              Hasta Randevu & Mesaj Detayı
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <p>
                <strong className="text-slate-900">Ad Soyad:</strong>{' '}
                {selectedLead.fullName}
              </p>
              <p>
                <strong className="text-slate-900">Telefon:</strong>{' '}
                {selectedLead.phone}
              </p>
              <p>
                <strong className="text-slate-900">E-Posta:</strong>{' '}
                {selectedLead.email || '-'}
              </p>
              <p>
                <strong className="text-slate-900">Konu:</strong>{' '}
                {selectedLead.subject}
              </p>
              <p>
                <strong className="text-slate-900">Sayfa:</strong>{' '}
                {selectedLead.sourcePageSlug}
              </p>
              <p>
                <strong className="text-slate-900">Kampanya (UTM):</strong>{' '}
                {selectedLead.utmCampaign || 'Organik'}
              </p>
              <div className="pt-2">
                <strong className="text-slate-900 block mb-1">Mesaj:</strong>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed text-slate-700">
                  {selectedLead.message}
                </p>
              </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

