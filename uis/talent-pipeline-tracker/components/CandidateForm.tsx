"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { CandidateFormData } from "@/types/candidate";

type CandidateFormProps = {
	initialValues?: CandidateFormData;
	submitLabel: string;
	onSubmit: (data: CandidateFormData) => Promise<void>;
	onCancel?: () => void;
};

// Los inputs siempre trabajan con texto, por eso aquí todo es string
type FormValues = {
	full_name: string;
	email: string;
	phone: string;
	position: string;
	linkedin_url: string;
	cv_url: string;
	experience_years: string;
};

// Clases que se repiten en todos los campos
const labelClass = "text-sm text-brand-warmgray";
const inputClass = "rounded border border-brand-beige bg-white px-3 py-2";
const errorClass = "text-xs text-red-600";

export default function CandidateForm({
	initialValues,
	submitLabel,
	onSubmit,
	onCancel,
}: CandidateFormProps) {
	const [values, setValues] = useState<FormValues>({
		full_name: initialValues?.full_name ?? "",
		email: initialValues?.email ?? "",
		phone: initialValues?.phone ?? "",
		position: initialValues?.position ?? "",
		linkedin_url: initialValues?.linkedin_url ?? "",
		cv_url: initialValues?.cv_url ?? "",
		experience_years: initialValues ? String(initialValues.experience_years) : "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Un solo onChange para todos los campos: usa el "name" del input
	function handleChange(event: ChangeEvent<HTMLInputElement>) {
		setValues({ ...values, [event.target.name]: event.target.value });
	}

	function validate() {
		const newErrors: Record<string, string> = {};

		if (!values.full_name.trim()) {
			newErrors.full_name = "Este campo es obligatorio.";
		}

		if (!values.email.trim()) {
			newErrors.email = "Este campo es obligatorio.";
		} else if (!values.email.includes("@") || !values.email.includes(".")) {
			newErrors.email = "Introduce un email válido.";
		}

		if (!values.phone.trim()) {
			newErrors.phone = "Este campo es obligatorio.";
		}

		if (!values.position.trim()) {
			newErrors.position = "Este campo es obligatorio.";
		}

		if (!values.experience_years.trim()) {
			newErrors.experience_years = "Este campo es obligatorio.";
		} else if (isNaN(Number(values.experience_years)) || Number(values.experience_years) < 0) {
			newErrors.experience_years = "Introduce un número de años válido.";
		}

		if (values.linkedin_url.trim() && !values.linkedin_url.trim().startsWith("http")) {
			newErrors.linkedin_url = "Introduce un enlace válido que empiece con http.";
		}

		if (values.cv_url.trim() && !values.cv_url.trim().startsWith("http")) {
			newErrors.cv_url = "Introduce un enlace válido que empiece con http.";
		}

		return newErrors;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const newErrors = validate();
		setErrors(newErrors);

		// Si hay al menos un error, no se envía nada
		if (Object.keys(newErrors).length > 0) {
			return;
		}

		setSubmitting(true);
		setSubmitError(null);
		setSuccess(null);

		try {
			await onSubmit({
				full_name: values.full_name.trim(),
				email: values.email.trim(),
				phone: values.phone.trim(),
				position: values.position.trim(),
				linkedin_url: values.linkedin_url.trim() || null,
				cv_url: values.cv_url.trim() || null,
				experience_years: Number(values.experience_years),
			});
			setSuccess("Datos guardados correctamente.");
		} catch (caughtError) {
			setSubmitError(
				caughtError instanceof Error ? caughtError.message : String(caughtError),
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<form noValidate onSubmit={handleSubmit} className="space-y-4">
			<div className="grid gap-4 sm:grid-cols-2">
				<div className="flex flex-col gap-1">
					<label htmlFor="full_name" className={labelClass}>Nombre completo</label>
					<input id="full_name" name="full_name" type="text" value={values.full_name} onChange={handleChange} className={inputClass} />
					{errors.full_name && <p className={errorClass}>{errors.full_name}</p>}
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="email" className={labelClass}>Email</label>
					<input id="email" name="email" type="email" value={values.email} onChange={handleChange} className={inputClass} />
					{errors.email && <p className={errorClass}>{errors.email}</p>}
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="phone" className={labelClass}>Teléfono</label>
					<input id="phone" name="phone" type="tel" value={values.phone} onChange={handleChange} className={inputClass} />
					{errors.phone && <p className={errorClass}>{errors.phone}</p>}
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="position" className={labelClass}>Puesto</label>
					<input id="position" name="position" type="text" value={values.position} onChange={handleChange} className={inputClass} />
					{errors.position && <p className={errorClass}>{errors.position}</p>}
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="linkedin_url" className={labelClass}>LinkedIn (opcional)</label>
					<input id="linkedin_url" name="linkedin_url" type="url" value={values.linkedin_url} onChange={handleChange} className={inputClass} />
					{errors.linkedin_url && <p className={errorClass}>{errors.linkedin_url}</p>}
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="cv_url" className={labelClass}>CV — enlace (opcional)</label>
					<input id="cv_url" name="cv_url" type="url" value={values.cv_url} onChange={handleChange} className={inputClass} />
					{errors.cv_url && <p className={errorClass}>{errors.cv_url}</p>}
				</div>

				<div className="flex flex-col gap-1">
					<label htmlFor="experience_years" className={labelClass}>Años de experiencia</label>
					<input id="experience_years" name="experience_years" type="number" min={0} value={values.experience_years} onChange={handleChange} className={inputClass} />
					{errors.experience_years && <p className={errorClass}>{errors.experience_years}</p>}
				</div>
			</div>

			<div className="flex flex-wrap gap-3">
				<button
					type="submit"
					disabled={submitting}
					className="rounded bg-brand-ochre px-4 py-2 text-brand-darkbrown disabled:opacity-60"
				>
					{submitting ? "Guardando…" : submitLabel}
				</button>
				{onCancel && (
					<button
						type="button"
						onClick={onCancel}
						className="rounded border border-brand-beige bg-white px-4 py-2 text-brand-warmgray"
					>
						Cancelar
					</button>
				)}
			</div>

			{success && <p className="text-sm text-green-700">{success}</p>}
			{submitError && <p className="text-sm text-red-600">{submitError}</p>}
		</form>
	);
}