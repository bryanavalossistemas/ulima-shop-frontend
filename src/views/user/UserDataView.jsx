import SideBar from "@/components/shop/SideBar";
import TopBar from "@/components/admin/TopBar";
import { useEffect, useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import Input from "@/components/auth/Input";
import { toast } from "sonner";

export default function UserDataView() {
  const authToken = useStore((state) => state.authToken);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [submiting, setSubmiting] = useState(false);

  async function updateUser(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/user`,

        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
          }),
        }
      );

      if (!response.ok) {
        setSubmiting(false);
        throw new Error();
      }
      setSubmiting(false);
      toast.success("Usuario actualizado correctamente");
    } catch (error) {
      setSubmiting(false);
      toast.error("Error al actualizar usuario");
    }
  }

  async function fetchUserData() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/user/data`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!response.ok) {
        throw Error;
      }
      const currentUser = await response.json();
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setEmail(currentUser.email);
    } catch (error) {
      toast.error("No se pudo obtener los datos del usuario");
    }
  }

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <main className="p-10">
      <div className="flex gap-x-8">
        <SideBar />
        <div className="flex-grow flex flex-col">
          <div className="flex flex-col">
            <TopBar text="DATOS DE REGISTRO" />
            <div className="flex pt-4 justify-center">
              <form
                onSubmit={updateUser}
                className="flex flex-col gap-y-4 w-96"
              >
                <Input
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  className="py-8 text-lg rounded-none"
                  type="submit"
                  disabled={submiting}
                >
                  Actualizar
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
