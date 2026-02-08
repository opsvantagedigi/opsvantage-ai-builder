import React from 'react';

type Props = {
	onNext: (data: unknown) => Promise<void> | void;
	onBack?: () => void;
	initialData?: unknown;
	isSaving?: boolean;
};

export default function StrategyStep(props: Props) {
	void props;
	return <div />;
}
