import React from 'react';

type Props = {
  onNext: (data: any) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: any;
  isSaving?: boolean;
};

export default function BrandIdentityStep(_: Props) {
  return <div />;
}
