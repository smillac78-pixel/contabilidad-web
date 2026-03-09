"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { APP_NAME } from "@/config/app";

export default function VerifyEmailPage() {
  const supabase = getSupabaseClient();
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setError("No se encontró el email. Vuelve a registrarte.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.resend({ type: "signup", email: user.email });
    if (error) {
      setError("Error al reenviar. Inténtalo en unos minutos.");
    } else {
      setResent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-5xl">📬</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{APP_NAME}</h1>
          <p className="text-gray-500 mt-1 text-sm">Verifica tu email</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-4">
          <p className="text-sm text-gray-700">
            Te hemos enviado un enlace de verificación. Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <p className="text-xs text-gray-400">
            Si no lo ves, revisa la carpeta de spam.
          </p>

          {resent && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5">
              Email reenviado correctamente.
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <button
            onClick={handleResend}
            disabled={loading || resent}
            className="w-full py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? "Enviando..." : resent ? "Email enviado ✓" : "Reenviar email de verificación"}
          </button>
        </div>
      </div>
    </div>
  );
}
