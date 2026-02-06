/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

type Props = {
  onNext: (data: any) => Promise<void> | void;
  onSaveAndExit?: () => void;
  initialData?: any;
  isSaving?: boolean;
};

// TODO: replace `any` usages with proper types
export default function BusinessDetailsStep(_: Props) {
  return <div />;
}
