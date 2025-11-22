import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ApprovalRequest, ApprovalType, Location } from '@/types';
import { formatDateToString } from './attendance';

/**
 * Create a new approval request
 */
export async function createApprovalRequest(
  uid: string,
  name: string,
  type: ApprovalType,
  reason: string,
  location: Location
): Promise<ApprovalRequest> {
  const today = formatDateToString(new Date());
  const docId = `${uid}_${today}_${type}`;
  const approvalRef = doc(db, 'approvals', docId);

  // Check if there's already a pending request for today
  const existingSnap = await getDoc(approvalRef);
  if (existingSnap.exists()) {
    const existing = existingSnap.data();
    if (existing.status === 'pending') {
      throw new Error('이미 승인 대기 중인 요청이 있습니다');
    }
  }

  const approvalData = {
    uid,
    name,
    date: today,
    type,
    reason,
    location,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(approvalRef, approvalData);

  return {
    id: docId,
    ...approvalData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get today's approval request for a user
 */
export async function getTodayApprovalRequest(
  uid: string,
  type: ApprovalType
): Promise<ApprovalRequest | null> {
  const today = formatDateToString(new Date());
  const docId = `${uid}_${today}_${type}`;
  const approvalRef = doc(db, 'approvals', docId);
  const approvalSnap = await getDoc(approvalRef);

  if (!approvalSnap.exists()) {
    return null;
  }

  const data = approvalSnap.data();
  return {
    id: approvalSnap.id,
    ...data,
    reviewedAt: data.reviewedAt?.toDate(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as ApprovalRequest;
}

/**
 * Get all approval requests for a user
 */
export async function getUserApprovalRequests(uid: string): Promise<ApprovalRequest[]> {
  const approvalsRef = collection(db, 'approvals');
  const q = query(
    approvalsRef,
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const approvals: ApprovalRequest[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    approvals.push({
      id: doc.id,
      ...data,
      reviewedAt: data.reviewedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ApprovalRequest);
  });

  return approvals;
}

/**
 * Get all pending approval requests (for admin)
 */
export async function getPendingApprovals(): Promise<ApprovalRequest[]> {
  const approvalsRef = collection(db, 'approvals');
  const q = query(
    approvalsRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const approvals: ApprovalRequest[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    approvals.push({
      id: doc.id,
      ...data,
      reviewedAt: data.reviewedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ApprovalRequest);
  });

  return approvals;
}

/**
 * Approve a request
 */
export async function approveRequest(
  requestId: string,
  reviewerUid: string
): Promise<void> {
  const approvalRef = doc(db, 'approvals', requestId);
  await updateDoc(approvalRef, {
    status: 'approved',
    reviewedBy: reviewerUid,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reject a request
 */
export async function rejectRequest(
  requestId: string,
  reviewerUid: string,
  rejectionReason: string
): Promise<void> {
  const approvalRef = doc(db, 'approvals', requestId);
  await updateDoc(approvalRef, {
    status: 'rejected',
    reviewedBy: reviewerUid,
    reviewedAt: serverTimestamp(),
    rejectionReason,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to approval status changes for a specific request
 */
export function subscribeToApprovalStatus(
  requestId: string,
  callback: (approval: ApprovalRequest | null) => void
): Unsubscribe {
  const approvalRef = doc(db, 'approvals', requestId);

  return onSnapshot(approvalRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }

    const data = docSnap.data();
    callback({
      id: docSnap.id,
      ...data,
      reviewedAt: data.reviewedAt?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as ApprovalRequest);
  });
}

/**
 * Subscribe to pending approvals (for admin real-time updates)
 */
export function subscribeToPendingApprovals(
  callback: (approvals: ApprovalRequest[]) => void
): Unsubscribe {
  const approvalsRef = collection(db, 'approvals');
  const q = query(
    approvalsRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const approvals: ApprovalRequest[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      approvals.push({
        id: doc.id,
        ...data,
        reviewedAt: data.reviewedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as ApprovalRequest);
    });

    callback(approvals);
  });
}
