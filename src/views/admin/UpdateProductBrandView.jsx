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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function UpdateProductBrandView() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const authToken = useStore((state) => state.authToken);
  const [open, setOpen] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [file, setFile] = useState();
  const [productBrand, setProductBrand] = useState({
    id: "",
    name: "",
    imageUrl: "",
    image: {
      id: "",
      publicId: "",
      url: "",
    },
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
          onClick={async () => await addToProductBrandProducts(row.original)}
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

  async function addToProductBrandProducts(productSelected) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${productSelected.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productCategoryId: productBrand.id,
          }),
        }
      );
      if (!response.ok) {
        throw new Error();
      }
      setProductBrand({
        ...productBrand,
        products: [...productBrand.products, productSelected],
      });
      setProducts(
        products.filter((product) => product.id !== productSelected.id)
      );
      toast.success("Producto agregado correctamente");
    } catch (error) {
      toast.success("Error al remover el producto");
    }
  }

  async function removeFromProductBrandProducts(productSelected) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${
          productSelected.id
        }/null`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productCategoryId: null,
          }),
        }
      );
      if (!response.ok) {
        throw new Error();
      }
      setProducts([...products, productSelected]);
      setProductBrand({
        ...productBrand,
        products: productBrand.products.filter(
          (product) => product.id !== productSelected.id
        ),
      });
      toast.success("Producto removido correctamente");
    } catch (error) {
      toast.success("Error al remover el producto");
    }
  }

  async function updateProductBrand(e) {
    try {
      setSubmiting(true);
      e.preventDefault();
      const formData = new FormData();
      formData.append("name", productBrand.name);
      formData.append("products", JSON.stringify(productBrand.products));
      if (file) {
        formData.append("image", file);
        formData.append("imageId", productBrand.image.id);
        formData.append("publicId", productBrand.image.publicId);
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/productBrands/${productBrand.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        }
      );
      if (!response.ok) {
        throw Error;
      }
      navigate("/admin/productBrands");
      toast.success("Marca actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la marca");
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

  async function fetchProductBrandAndProducts() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/productBrand/${id}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!response.ok) {
        throw Error;
      }
      const data = await response.json();
      setProductBrand({
        ...data.productBrand,
        imageUrl: data.productBrand.image.url,
      });
      const productsDB = data.products;
      const idProducts = productBrand.products.map((product) => product.id);
      const products = productsDB.filter(
        (product) => !idProducts.includes(product.id)
      );
      setProducts(products);
    } catch (error) {
      toast.error("No se pudo obtener la marca");
    }
  }

  useEffect(() => {
    fetchProductBrandAndProducts();
  }, []);

  return (
    <main className="p-10">
      <form className="flex gap-x-8" onSubmit={updateProductBrand}>
        <SideBar />
        <div className="grow flex flex-col gap-y-6">
          <TopBar text="MODIFICAR MARCA" />
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
                  <span className="font-medium">Productos en la marca</span>
                  <Button
                    className="px-3 py-1.5 h-auto rounded-none"
                    type="button"
                    onClick={() => setOpen(true)}
                  >
                    <Plus className="w-4 h-4" strokeWidth={3} />
                  </Button>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="min-w-[50vw] h-[50vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Agregar productos</DialogTitle>
                        <DialogDescription>
                          Agregue productos a la marca.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-x-4">
                        <Input
                          type="search"
                          placeholder="Buscar por nombre, descripcion o id"
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
                              type="button"
                              onClick={async () =>
                                await removeFromProductBrandProducts(product)
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
                  ACTUALIZAR MARCA
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
