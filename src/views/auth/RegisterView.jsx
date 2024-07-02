import Input from "@/components/auth/Input";
import Heading from "@/components/auth/Heading";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function RegisterView() {
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [repeatPassword, setRepeatPassword] = useState("");
  const [submiting, setSubmiting] = useState(false);

  async function createUser(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      if (user.password !== repeatPassword) {
        toast.error("Las contraseñas no son iguales");
        setSubmiting(false);
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(user),
        }
      );
      if (!response.ok) {
        setUser({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
        setRepeatPassword("");
        setSubmiting(false);
        throw Error;
      }
      toast.success(`Código enviado al correo: ${user.email}`);
      setUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setRepeatPassword("");
      setSubmiting(false);
    } catch (error) {
      setUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      setRepeatPassword("");
      setSubmiting(false);
      toast.error("Error al crear usuario");
    }
  }

  return (
    <main className="p-8">
      <div className="flex flex-col justify-center items-center gap-y-8 max-w-md mx-auto">
        <Heading text="Registra una Nueva Cuenta" />
        <form onSubmit={createUser} className="flex flex-col gap-y-4 w-full">
          <Input
            placeholder="Nombre"
            value={user.firstName}
            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
            required
          />
          <Input
            placeholder="Apellido"
            value={user.lastName}
            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
            required
          />
          <Input
            type="email"
            placeholder="Correo"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
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
            className="py-8 text-base rounded-none"
            type="submit"
            disabled={submiting}
          >
            Crear Nueva Cuenta
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
