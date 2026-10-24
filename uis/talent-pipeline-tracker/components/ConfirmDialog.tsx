"use client";

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	message: string;
	confirmLabel: string;
	onConfirm: () => void;
	onCancel: () => void;
	loading?: boolean;
};

export default function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel,
	onConfirm,
	onCancel,
	loading = false,
}: ConfirmDialogProps) {
	if (!open) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className="relative w-full max-w-sm rounded-md bg-white p-6 shadow-lg"
			>
				<button
					type="button"
					aria-label="Cerrar"
					onClick={onCancel}
					disabled={loading}
					className="absolute right-3 top-3 text-xl text-brand-warmgray hover:text-brand-darkbrown"
				>
					×
				</button>
				<h2 className="text-lg font-semibold text-brand-darkbrown">{title}</h2>
				<p className="mt-2 text-sm text-brand-warmgray">{message}</p>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="rounded border border-brand-beige bg-white px-4 py-2 text-brand-warmgray text-sm"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-60 text-sm"
					>
						{loading ? "Eliminando…" : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
}