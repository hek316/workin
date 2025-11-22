'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getAllOffices,
  createOffice,
  updateOffice,
  deleteOffice,
  initializeDefaultOffices,
} from '@/lib/firestore/offices';
import { clearOfficesCache } from '@/lib/gps';
import type { OfficeLocation } from '@/types';

interface OfficeFormData {
  name: string;
  address: string;
  lat: string;
  lng: string;
  checkInRadius: string;
  checkOutRadius: string;
  isActive: boolean;
}

const defaultFormData: OfficeFormData = {
  name: '',
  address: '',
  lat: '',
  lng: '',
  checkInRadius: '1000',
  checkOutRadius: '3000',
  isActive: true,
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [loadingOffices, setLoadingOffices] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(null);
  const [formData, setFormData] = useState<OfficeFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchOffices();
    }
  }, [user]);

  const fetchOffices = async () => {
    try {
      const officeList = await getAllOffices();
      setOffices(officeList);

      // If no offices exist, initialize defaults
      if (officeList.length === 0) {
        await initializeDefaultOffices();
        const updatedList = await getAllOffices();
        setOffices(updatedList);
      }
    } catch (err) {
      console.error('Error fetching offices:', err);
      setError('사무실 목록을 불러오는데 실패했습니다');
    } finally {
      setLoadingOffices(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.name.trim()) {
      setError('사무실 이름을 입력해주세요');
      return;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setError('유효한 위도를 입력해주세요 (-90 ~ 90)');
      return;
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      setError('유효한 경도를 입력해주세요 (-180 ~ 180)');
      return;
    }

    const checkInRadius = parseInt(formData.checkInRadius);
    const checkOutRadius = parseInt(formData.checkOutRadius);

    if (isNaN(checkInRadius) || checkInRadius <= 0) {
      setError('유효한 출근 반경을 입력해주세요');
      return;
    }

    if (isNaN(checkOutRadius) || checkOutRadius <= 0) {
      setError('유효한 퇴근 반경을 입력해주세요');
      return;
    }

    setSubmitting(true);

    try {
      const officeData = {
        name: formData.name.trim(),
        address: formData.address.trim() || undefined,
        lat,
        lng,
        checkInRadius,
        checkOutRadius,
        isActive: formData.isActive,
      };

      if (editingOffice) {
        await updateOffice(editingOffice.id, officeData);
        setSuccessMessage('사무실이 수정되었습니다');
      } else {
        await createOffice(officeData);
        setSuccessMessage('사무실이 추가되었습니다');
      }

      // Clear GPS cache and refresh offices
      clearOfficesCache();
      await fetchOffices();

      // Reset form
      setFormData(defaultFormData);
      setShowAddForm(false);
      setEditingOffice(null);
    } catch (err) {
      setError((err as Error).message || '저장에 실패했습니다');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (office: OfficeLocation) => {
    setEditingOffice(office);
    setFormData({
      name: office.name,
      address: office.address || '',
      lat: office.lat.toString(),
      lng: office.lng.toString(),
      checkInRadius: office.checkInRadius.toString(),
      checkOutRadius: office.checkOutRadius.toString(),
      isActive: office.isActive,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (office: OfficeLocation) => {
    if (!confirm(`"${office.name}" 사무실을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteOffice(office.id);
      clearOfficesCache();
      await fetchOffices();
      setSuccessMessage('사무실이 삭제되었습니다');
    } catch (err) {
      setError('삭제에 실패했습니다');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingOffice(null);
    setFormData(defaultFormData);
    setError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/admin/dashboard')}
              >
                &larr; 대시보드
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                사무실 위치 설정
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              {editingOffice ? '사무실 수정' : '새 사무실 추가'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="사무실 이름"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="예: 본사"
                  required
                />
                <Input
                  label="주소 (선택)"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="예: 서울특별시 중구 ..."
                />
                <Input
                  label="위도"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={handleInputChange}
                  placeholder="예: 37.5665"
                  required
                />
                <Input
                  label="경도"
                  name="lng"
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={handleInputChange}
                  placeholder="예: 126.9780"
                  required
                />
                <Input
                  label="출근 허용 반경 (m)"
                  name="checkInRadius"
                  type="number"
                  value={formData.checkInRadius}
                  onChange={handleInputChange}
                  placeholder="1000"
                  required
                />
                <Input
                  label="퇴근 허용 반경 (m)"
                  name="checkOutRadius"
                  type="number"
                  value={formData.checkOutRadius}
                  onChange={handleInputChange}
                  placeholder="3000"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  활성화
                </label>
              </div>

              <div className="flex gap-3">
                <Button type="submit" loading={submitting}>
                  {editingOffice ? '수정' : '추가'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Offices List */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              등록된 사무실
            </h2>
            {!showAddForm && (
              <Button onClick={() => setShowAddForm(true)}>
                새 사무실 추가
              </Button>
            )}
          </div>

          {loadingOffices ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 text-sm">로딩 중...</p>
            </div>
          ) : offices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              등록된 사무실이 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {offices.map((office) => (
                <div
                  key={office.id}
                  className={`p-4 border rounded-lg ${
                    office.isActive ? 'border-gray-200' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {office.name}
                        {!office.isActive && (
                          <span className="ml-2 text-xs text-gray-500">(비활성)</span>
                        )}
                      </h3>
                      {office.address && (
                        <p className="text-sm text-gray-600 mt-1">
                          {office.address}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <p>위치: {office.lat}, {office.lng}</p>
                        <p>
                          출근 반경: {office.checkInRadius}m / 퇴근 반경: {office.checkOutRadius}m
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-sm"
                        onClick={() => handleEdit(office)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        className="text-sm text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(office)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
