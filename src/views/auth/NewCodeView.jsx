import { useState } from "react";
import { Link } from "react-router-dom";
import Heading from "@/components/auth/Heading";
import Input from "@/components/auth/Input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function NewCodeView() {
  const [email, setEmail] = useState("");
  const [submiting, setSubmiting] = useState(false);

  async function requestToken(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/request-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );
      if (!response.ok) {
        setEmail("");
        setSubmiting(false);
        throw Error;
      }
      setEmail("");
      setSubmiting(false);
      toast.success(`Token enviado al correo: ${email}`);
    } catch (error) {
      setEmail("");
      setSubmiting(false);
      toast.error("Error al enviar token");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-col justify-center items-center gap-y-8 max-w-xs mx-auto">
        <Heading text="Solicitar Código de Confirmación" />
        <form onSubmit={requestToken} className="flex flex-col gap-y-4 w-full">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            className="py-8 text-base rounded-none disabled:opacity-50"
            type="submit"
            disabled={submiting}
          >
            Enviar
          </Button>
        </form>
        <div className="flex flex-col justify-center items-center gap-y-4">
          <Link className="underline" to={"/auth/login"}>
            Ya tienes una cuenta. Iniciar Sesión
          </Link>
          <Link className="underline" to={"/auth/forgot"}>
            ¿Olvidaste tu contraseña? Reestablecer
          </Link>
        </div>
      </div>
    </main>
  );
}
