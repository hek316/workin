import type { Location } from '@/types';

/**
 * Company office location (from environment variables or defaults)
 */
export const OFFICE_LOCATION = {
  lat: parseFloat(process.env.NEXT_PUBLIC_OFFICE_LAT || '37.5665'),
  lng: parseFloat(process.env.NEXT_PUBLIC_OFFICE_LNG || '126.9780'),
};

/**
 * GPS configuration constants
 */
export const GPS_CONFIG = {
  CHECK_IN_RADIUS: 1000, // 1km for check-in
  CHECK_OUT_RADIUS: 3000, // 3km for check-out
  MAX_ACCURACY: 50, // Maximum acceptable accuracy in meters
  TIMEOUT: 10000, // GPS timeout in milliseconds
  MAXIMUM_AGE: 60000, // Maximum age of cached position in milliseconds
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * GPS error types
 */
export type GPSErrorType =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'LOW_ACCURACY'
  | 'OUT_OF_RANGE'
  | 'UNKNOWN';

/**
 * GPS error with type and message
 */
export interface GPSError {
  type: GPSErrorType;
  message: string;
}

/**
 * Get current GPS position
 */
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        type: 'POSITION_UNAVAILABLE',
        message: '이 브라우저에서는 GPS를 지원하지 않습니다',
      } as GPSError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        let gpsError: GPSError;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            gpsError = {
              type: 'PERMISSION_DENIED',
              message: 'GPS 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.',
            };
            break;
          case error.POSITION_UNAVAILABLE:
            gpsError = {
              type: 'POSITION_UNAVAILABLE',
              message: '위치 정보를 사용할 수 없습니다',
            };
            break;
          case error.TIMEOUT:
            gpsError = {
              type: 'TIMEOUT',
              message: '위치 정보 요청 시간이 초과되었습니다',
            };
            break;
          default:
            gpsError = {
              type: 'UNKNOWN',
              message: '알 수 없는 오류가 발생했습니다',
            };
        }
        reject(gpsError);
      },
      {
        enableHighAccuracy: true,
        timeout: GPS_CONFIG.TIMEOUT,
        maximumAge: GPS_CONFIG.MAXIMUM_AGE,
      }
    );
  });
}

/**
 * Validate GPS position for check-in/check-out
 */
export interface GPSValidationResult {
  isValid: boolean;
  location: Location | null;
  distance: number | null;
  error: GPSError | null;
}

export async function validateGPSForCheckIn(): Promise<GPSValidationResult> {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;

    // Check accuracy
    if (accuracy > GPS_CONFIG.MAX_ACCURACY) {
      return {
        isValid: false,
        location: { lat: latitude, lng: longitude, accuracy },
        distance: null,
        error: {
          type: 'LOW_ACCURACY',
          message: `GPS 정확도가 낮습니다 (${Math.round(accuracy)}m). 정확도가 ${GPS_CONFIG.MAX_ACCURACY}m 이내여야 합니다.`,
        },
      };
    }

    // Calculate distance from office
    const distance = calculateDistance(
      latitude,
      longitude,
      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng
    );

    // Check if within check-in radius
    if (distance > GPS_CONFIG.CHECK_IN_RADIUS) {
      return {
        isValid: false,
        location: { lat: latitude, lng: longitude, accuracy },
        distance,
        error: {
          type: 'OUT_OF_RANGE',
          message: `회사로부터 ${Math.round(distance)}m 거리에 있습니다. 출근은 ${GPS_CONFIG.CHECK_IN_RADIUS}m 이내에서만 가능합니다.`,
        },
      };
    }

    return {
      isValid: true,
      location: { lat: latitude, lng: longitude, accuracy },
      distance,
      error: null,
    };
  } catch (error) {
    return {
      isValid: false,
      location: null,
      distance: null,
      error: error as GPSError,
    };
  }
}

export async function validateGPSForCheckOut(): Promise<GPSValidationResult> {
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude, accuracy } = position.coords;

    // Check accuracy
    if (accuracy > GPS_CONFIG.MAX_ACCURACY) {
      return {
        isValid: false,
        location: { lat: latitude, lng: longitude, accuracy },
        distance: null,
        error: {
          type: 'LOW_ACCURACY',
          message: `GPS 정확도가 낮습니다 (${Math.round(accuracy)}m). 정확도가 ${GPS_CONFIG.MAX_ACCURACY}m 이내여야 합니다.`,
        },
      };
    }

    // Calculate distance from office
    const distance = calculateDistance(
      latitude,
      longitude,
      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng
    );

    // Check if within check-out radius (more lenient than check-in)
    if (distance > GPS_CONFIG.CHECK_OUT_RADIUS) {
      return {
        isValid: false,
        location: { lat: latitude, lng: longitude, accuracy },
        distance,
        error: {
          type: 'OUT_OF_RANGE',
          message: `회사로부터 ${Math.round(distance)}m 거리에 있습니다. 퇴근은 ${GPS_CONFIG.CHECK_OUT_RADIUS}m 이내에서만 가능합니다.`,
        },
      };
    }

    return {
      isValid: true,
      location: { lat: latitude, lng: longitude, accuracy },
      distance,
      error: null,
    };
  } catch (error) {
    return {
      isValid: false,
      location: null,
      distance: null,
      error: error as GPSError,
    };
  }
}

/**
 * Format work hours to HH:MM string
 */
export function formatWorkHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}시간 ${m}분`;
}

/**
 * Format time to HH:MM string
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
