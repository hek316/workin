# Components

이 디렉토리는 재사용 가능한 React 컴포넌트를 포함합니다.

## 구조

- `ui/` - 기본 UI 컴포넌트 (버튼, 입력, 카드 등)
- `layout/` - 레이아웃 컴포넌트 (헤더, 푸터, 사이드바 등)
- `features/` - 기능별 컴포넌트 (출퇴근, 대시보드 등)

## 예시

```tsx
// components/ui/Button.tsx
export function Button({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-blue-500 text-white rounded">
      {children}
    </button>
  );
}
```
