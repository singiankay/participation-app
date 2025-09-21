"use client";

import { useForm } from "react-hook-form";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  participation: number;
}

interface ParticipationFormProps {
  mode: "add" | "edit";
  participant?: Participant;
  onSave: (participant: Omit<Participant, "id">) => void;
  onCancel: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  participation: number;
}

export default function ParticipationForm({
  mode,
  participant,
  onSave,
  onCancel,
}: ParticipationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      firstName: participant?.firstName || "",
      lastName: participant?.lastName || "",
      participation: participant?.participation || 0,
    },
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    onSave({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      participation: data.participation,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      {mode === "edit" && participant && (
        <h1 className="form-title">
          Edit Participation - {participant.firstName} {participant.lastName}
        </h1>
      )}
      <div className="form-fields-container">
        <div className="form-field-wrapper">
          <input
            type="text"
            placeholder="First Name"
            {...register("firstName", {
              required: "First name is required",
              minLength: {
                value: 2,
                message: "First name must be at least 2 characters",
              },
              maxLength: {
                value: 50,
                message: "First name must be less than 50 characters",
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: "First name can only contain letters and spaces",
              },
            })}
            className={`form-field ${
              errors.firstName ? "form-field-error" : ""
            }`}
          />
          {errors.firstName && (
            <span className="form-error">{errors.firstName.message}</span>
          )}
        </div>

        <div className="form-field-wrapper">
          <input
            type="text"
            placeholder="Last Name"
            {...register("lastName", {
              required: "Last name is required",
              minLength: {
                value: 2,
                message: "Last name must be at least 2 characters",
              },
              maxLength: {
                value: 50,
                message: "Last name must be less than 50 characters",
              },
              pattern: {
                value: /^[a-zA-Z\s]+$/,
                message: "Last name can only contain letters and spaces",
              },
            })}
            className={`form-field ${
              errors.lastName ? "form-field-error" : ""
            }`}
          />
          {errors.lastName && (
            <span className="form-error">{errors.lastName.message}</span>
          )}
        </div>

        <div className="form-field-wrapper">
          <input
            type="number"
            placeholder="Participation (%)"
            step="1"
            {...register("participation", {
              required: "Participation is required",
              min: {
                value: 0,
                message: "Participation must be at least 0%",
              },
              max: {
                value: 100,
                message: "Participation cannot exceed 100%",
              },
              valueAsNumber: true,
            })}
            className={`form-field ${
              errors.participation ? "form-field-error" : ""
            }`}
          />
          {errors.participation && (
            <span className="form-error">{errors.participation.message}</span>
          )}
        </div>

        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? "SAVING..." : mode === "add" ? "SEND" : "UPDATE"}
        </button>

        {mode === "edit" && (
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={isSubmitting}
          >
            CANCEL
          </button>
        )}
      </div>
    </form>
  );
}
