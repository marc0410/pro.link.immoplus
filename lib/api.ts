const BASE = process.env.NEXT_PUBLIC_API_URL;

export interface AcquisitionPayload {
  nom: string;
  prenom: string;
  activite: string;
  email: string;
  telephone: { indicatif: string; numero: string };
  profil: "particulier" | "entreprise";
  appInstalle: boolean;
  entreprise?: string;
}

export interface AcquisitionSuccess {
  success: true;
  reference: string;
  message: string;
}

export interface AcquisitionError {
  success: false;
  errors?: Record<string, string>;
  message?: string;
}

export type AcquisitionResult = AcquisitionSuccess | AcquisitionError;

export async function submitAcquisition(
  payload: AcquisitionPayload
): Promise<AcquisitionResult> {
  const res = await fetch(`${BASE}/marketing-pro/acquisitions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    return { success: false, ...data } as AcquisitionError;
  }

  return data as AcquisitionSuccess;
}
