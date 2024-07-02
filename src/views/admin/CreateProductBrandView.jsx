import ImageUpload from "@/components/admin/ImageUpload";
import SideBar from "@/components/admin/SideBar";
import TopBar from "@/components/admin/TopBar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStore } from "@/store";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CreateProductBrandView() {
  const navigate = useNavigate();
  const authToken = useStore((state) => state.authToken);
  const [open, setOpen] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [file, setFile] = useState();
  const [productBrand, setProductBrand] = useState({
    name: "",
    imageUrl: "",
    products: [],
  });
  const [products, setProducts] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => row.getValue("id"),
    },
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => row.getValue("name"),
    },
    {
      accessorKey: "description",
      header: "Descripción",
      cell: ({ row }) => row.getValue("description"),
    },
    {
      id: "actions",
      header: () => <span className="flex justify-end">Acciones</span>,
      cell: ({ row }) => (
        <button
          className="underline w-full text-right"
          onClick={() => addToProductBrandProducts(row.original)}
        >
          Agregar
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: products,
    columns,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
  });

  function addToProductBrandProducts(productSelected) {
    setProductBrand({
      ...productBrand,
      products: [...productBrand.products, productSelected],
    });
    setProducts(
      products.filter((product) => product.id !== productSelected.id)
    );
    toast.success("Producto agregado correctamente");
  }

  function removeFromProductBrandProducts(productSelected) {
    setProducts([...products, productSelected]);
    setProductBrand({
      ...productBrand,
      products: productBrand.products.filter(
        (product) => product.id !== productSelected.id
      ),
    });
    toast.success("Producto removido correctamente");
  }

  async function createProductBrand(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      if (!file) {
        toast.error("Debe seleccionar una imagen para la marca");
        setSubmiting(false);
        return;
      }
      const formData = new FormData();
      formData.append("image", file);
      formData.append("products", JSON.stringify(productBrand.products));
      formData.append("name", productBrand.name);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/productBrands`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        }
      );
      if (!response.ok) {
        setSubmiting(false);
        throw Error;
      }
      setSubmiting(false);
      navigate("/admin/productBrands");
      toast.success("Marca creada correctamente");
    } catch (error) {
      toast.error("Error al crear la marca");
      setSubmiting(false);
    }
  }

  function onSelectFile(e) {
    if (!e.target.files || e.target.files.length === 0) {
      setFile();
      return;
    }
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    if (!file) {
      setProductBrand({ ...productBrand, imageUrl: "" });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setProductBrand({ ...productBrand, imageUrl: objectUrl });
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  async function fetchProducts() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!response.ok) {
        throw new Error();
      }
      const products = await response.json();
      setProducts(products);
    } catch (error) {
      toast.error("No se pudo obtener los productos");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="p-10">
      <form className="flex gap-x-8" onSubmit={createProductBrand}>
        <SideBar />
        <div className="grow flex flex-col gap-y-6">
          <TopBar text="AGREGAR MARCA" />
          <div className="flex-1 flex gap-x-6">
            <ImageUpload
              className="basis-5/12"
              src={productBrand.imageUrl}
              onSelectFile={onSelectFile}
            />
            <div className="basis-7/12 flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  className="h-9 rounded-none border-none"
                  type="text"
                  id="name"
                  value={productBrand.name}
                  onChange={(e) =>
                    setProductBrand({
                      ...productBrand,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="bg-lime-500 py-2 px-4 flex items-center justify-between">
                  <span className="font-medium">
                    Productos que pertenecen a la marca
                  </span>
                  <Button
                    className="px-3 py-1.5 h-auto rounded-none"
                    type="button"
                    onClick={() => setOpen(true)}
                  >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                  </Button>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="min-w-[80vw] h-[70vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Agregar productos</DialogTitle>
                        <DialogDescription>
                          Agregue productos a la marca.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-x-4">
                        <Input
                          type="search"
                          placeholder="Buscar producto"
                          value={table.getState().globalFilter ?? ""}
                          onChange={(event) =>
                            table.setGlobalFilter(event.target.value)
                          }
                        />
                      </div>
                      <div className="overflow-auto">
                        <Table>
                          <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                  return (
                                    <TableHead key={header.id}>
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    </TableHead>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table.getRowModel().rows?.length ? (
                              table.getRowModel().rows.map((row) => (
                                <TableRow
                                  key={row.id}
                                  data-state={row.getIsSelected() && "selected"}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={columns.length}
                                  className="h-24 text-center"
                                >
                                  No hay resultados.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="h-full max-h-[275.5px] overflow-auto bg-white py-2 px-4">
                  <Table className="">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Acción</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productBrand.products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.id}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.description}</TableCell>
                          <TableCell className="text-right">
                            <button
                              className="underline"
                              onClick={() =>
                                removeFromProductBrandProducts(product)
                              }
                            >
                              Remover
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="rounded-none px-8 py-6 disabled:opacity-50"
                  type="submit"
                  disabled={submiting}
                >
                  CREAR MARCA
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
