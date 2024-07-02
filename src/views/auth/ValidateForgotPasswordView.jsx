import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Heading from "@/components/auth/Heading";
import Input from "@/components/auth/Input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ValidateForgotPasswordView() {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [submiting, setSubmiting] = useState(false);

  async function confirmAccount(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/validate-token`,
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
      navigate(`/auth/restore-password?token=${token}`);
      toast.success("Token válido, restablece tu password");
    } catch (error) {
      setToken("");
      setSubmiting(false);
      toast.error("Token no válido");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-col justify-center items-center gap-y-8 max-w-xs mx-auto">
        <Heading text="Restablecer Password" />
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
            Validar
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
