import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Heading from "@/components/auth/Heading";
import Input from "@/components/auth/Input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";

export default function LoginView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const setAuthToken = useStore((state) => state.setAuthToken);
  const [submiting, setSubmiting] = useState(false);

  const navigate = useNavigate();

  async function login(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );
      if (!response.ok) {
        setEmail("");
        setPassword("");
        setSubmiting(false);
        throw new Error();
      }
      const authToken = await response.json();
      setAuthToken(authToken);
      if (redirectTo) {
        navigate(`${redirectTo}`);
      } else {
        navigate("/");
      }
      toast.success("Usuario logueado correctamente");
    } catch (error) {
      setEmail("");
      setPassword("");
      setSubmiting(false);
      toast.error("Error al loguear usuario");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-col justify-center items-center gap-y-8 max-w-xs mx-auto">
        <Heading text="Ingreso para Clientes Registrados" />
        <form onSubmit={login} className="flex flex-col gap-y-4 w-full">
          <Input
            required
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button
            className="py-8 text-base rounded-none disabled:opacity-50"
            type="submit"
            disabled={submiting}
          >
            Ingresar
          </Button>
        </form>
        <div className="flex flex-col justify-center items-center gap-y-4">
          <Link className="underline" to={"/auth/register"}>
            ¿No tienes una cuenta? Crear Una
          </Link>
          <Link className="underline" to={"/auth/forgot"}>
            ¿Olvidaste tu contraseña? Reestablecer
          </Link>
        </div>
      </div>
    </main>
  );
}
