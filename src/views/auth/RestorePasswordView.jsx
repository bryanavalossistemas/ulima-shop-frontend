import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Heading from "@/components/auth/Heading";
import Input from "@/components/auth/Input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function RestorePasswordView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [submiting, setSubmiting] = useState(false);

  async function restorePassword(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      if (password !== repeatPassword) {
        setSubmiting(false);
        toast.error("Las contraseñas no son iguales");
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/update-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );
      if (!response.ok) {
        setPassword("");
        setRepeatPassword("");
        setSubmiting(false);
        throw new Error();
      }
      setPassword("");
      setRepeatPassword("");
      setSubmiting(false);
      navigate("/auth/login");
      toast.success("Contraseña modificada correctamente");
    } catch (error) {
      setPassword("");
      setRepeatPassword("");
      setSubmiting(false);
      toast.error("Error al modificar la contraseña");
    }
  }

  useEffect(() => {
    if (!token) {
      navigate("/auth/restorePassword");
    }
  }, []);

  return (
    <main className="p-8">
      <div className="flex flex-col justify-center items-center gap-y-8 max-w-xs mx-auto">
        <Heading text="Restablecer Password" />
        <form
          onSubmit={restorePassword}
          className="flex flex-col gap-y-4 w-full"
        >
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Repetir contraseña"
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
            required
          />    
          <Button
            className="py-8 text-base rounded-none disabled:opacity-50"
            type="submit"
            disabled={submiting}
          >
            Restablecer
          </Button>
        </form>
        <div className="flex flex-col justify-center items-center gap-y-4">
          <Link className="underline" to={"/auth/forgot"}>
            Solicitar un nuevo código
          </Link>
        </div>
      </div>
    </main>
  );
}
