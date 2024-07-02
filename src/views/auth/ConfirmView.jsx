import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Heading from "@/components/auth/Heading";
import Input from "@/components/auth/Input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function LoginView() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [submiting, setSubmiting] = useState(false);

  async function confirmAccount(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        }
      );
      if (!response.ok) {
        setToken("");
        setSubmiting(false);
        throw Error;
      }
      navigate("/auth/login");
      toast.success("Cuenta confirmada correctamente");
    } catch (error) {
      setToken("");
      setSubmiting(false);
      toast.error("Error al confirmar cuenta");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-col justify-center items-center gap-y-8 max-w-xs mx-auto">
        <Heading text="Confirma tu Cuenta" />
        <form
          onSubmit={confirmAccount}
          className="flex flex-col gap-y-4 w-full"
        >
          <Input
            type="number"
            placeholder="Código de 6 dígitos"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
          <Button
            className="py-8 text-base rounded-none disabled:opacity-50"
            type="submit"
            disabled={submiting}
          >
            Confirmar
          </Button>
        </form>
        <div className="flex flex-col justify-center items-center gap-y-4">
          <Link className="underline" to={"/auth/new-code"}>
            Solicitar un nuevo código
          </Link>
        </div>
      </div>
    </main>
  );
}
