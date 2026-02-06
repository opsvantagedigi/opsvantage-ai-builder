import React from 'react';

type Props = {
  onNext: (data: any) => Promise<void> | void;
  onBack?: () => void;
  onSaveAndExit?: () => void;
  initialData?: any;
  isSaving?: boolean;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: replace `any` usages with proper types
export default function BrandIdentityStep(_: Props) {
  return <div />;
}
