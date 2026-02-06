import React from 'react';

type Props = {
	onNext: (data: any) => Promise<void> | void;
	onBack?: () => void;
	initialData?: any;
	isSaving?: boolean;
};

export default function StrategyStep(_: Props) {
	return <div />;
}
