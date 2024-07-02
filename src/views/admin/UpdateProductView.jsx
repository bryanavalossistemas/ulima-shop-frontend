import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import SideBar from "@/components/admin/SideBar";
import TopBar from "@/components/admin/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Pen, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/store";

export default function UpdateProductView() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const authToken = useStore((state) => state.authToken);
  const [submiting, setSubmiting] = useState(false);
  const [file, setFile] = useState();
  const [productCategories, setProductCategories] = useState([]);
  const [productBrands, setProductBrands] = useState([]);
  const [productCharacteristicName, setProductCharacteristicName] =
    useState("");
  const [product, setProduct] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    productCategoryId: "",
    productBrandId: "",
    productCharacteristics: [],
  });

  function addCharacteristic() {
    if (!productCharacteristicName) {
      toast.error("Caracteristica no puede ir vacía");
      return;
    }
    setProduct({
      ...product,
      productCharacteristics: [
        ...product.productCharacteristics,
        { id: uuidv4(), name: productCharacteristicName },
      ],
    });
    setProductCharacteristicName("");
  }

  async function removeCharacteristic(id) {
    setProduct({
      ...product,
      productCharacteristics: product.productCharacteristics.filter(
        (productCharacteristic) => productCharacteristic.id !== id
      ),
    });
  }

  async function editCharacteristic(productCharacteristic) {
    setProduct({
      ...product,
      productCharacteristics: product.productCharacteristics.filter(
        (productCharacteristicA) =>
          productCharacteristicA.id !== productCharacteristic.id
      ),
    });
    setProductCharacteristicName(productCharacteristic.name);
  }

  async function updateProduct(e) {
    try {
      e.preventDefault();
      setSubmiting(true);
      if (!product.productBrandId) {
        toast.error("Debe seleccionar una marca");
        return;
      }
      if (!product.productCategoryId) {
        toast.error("Debe seleccionar una categoría");
        return;
      }
      const formData = new FormData();
      formData.append("name", product.name);
      formData.append("price", product.price);
      formData.append("description", product.description);
      formData.append("productCategoryId", product.productCategoryId);
      formData.append("productBrandId", product.productBrandId);
      formData.append(
        "productCharacteristics",
        JSON.stringify(product.productCharacteristics)
      );
      if (file) {
        formData.append("image", file);
        formData.append("imageId", product.image.id);
        formData.append("publicId", product.image.publicId);
      }
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${product.id}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${authToken}` },
          body: formData,
        }
      );
      if (!response.ok) {
        throw Error;
      }
      setSubmiting(false);
      navigate("/admin/products");
      toast.success("Producto actualizado correctamente");
    } catch (error) {
      toast.error("Error al actualizar el producto");
      setSubmiting(false);
    }
  }

  async function fetchProductAndProductCategoriesAndProductBrands() {
    try {
      const responseProduct = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!responseProduct.ok) {
        throw Error;
      }
      const product = await responseProduct.json();
      setProduct({
        ...product,
        price: product.price.toString(),
        productBrandId: product.productBrandId.toString(),
        productCategoryId: product.productCategoryId.toString(),
        imageUrl: product.image.url,
      });

      const responseProductCategories = await fetch(
        `${import.meta.env.VITE_API_URL}/api/productCategories`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!responseProductCategories.ok) {
        throw Error;
      }
      const productCategories = await responseProductCategories.json();
      setProductCategories(productCategories);

      const responseProductBrands = await fetch(
        `${import.meta.env.VITE_API_URL}/api/productBrands`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!responseProductBrands.ok) {
        throw Error;
      }
      const productBrands = await responseProductBrands.json();
      setProductBrands(productBrands);
    } catch (error) {
      toast.error("No se pudo obtener el producto");
    }
  }

  useEffect(() => {
    fetchProductAndProductCategoriesAndProductBrands();
  }, []);

  function onSelectFile(e) {
    if (!e.target.files || e.target.files.length === 0) {
      setFile();
      return;
    }
    setFile(e.target.files[0]);
  }

  useEffect(() => {
    if (!file) {
      setProduct({ ...product, imageUrl: "" });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setProduct({ ...product, imageUrl: objectUrl });
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <main className="p-10">
      <form className="flex gap-x-8" onSubmit={updateProduct}>
        <SideBar />
        <div className="grow flex flex-col gap-y-6">
          <TopBar text="MODIFICAR PRODUCTO" />
          <div className="flex-1 flex gap-x-6">
            <ImageUpload
              className="basis-5/12"
              src={product.imageUrl}
              onSelectFile={onSelectFile}
            />
            <div className="basis-7/12 flex flex-col gap-y-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Nombre:</Label>
                <Input
                  className="h-9 rounded-none border-none"
                  type="text"
                  id="name"
                  value={product.name}
                  onChange={(e) =>
                    setProduct({ ...product, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="description">Descripción:</Label>
                <Textarea
                  className="rounded-none border-none"
                  id="description"
                  value={product.description}
                  onChange={(e) =>
                    setProduct({ ...product, description: e.target.value })
                  }
                  required
                ></Textarea>
              </div>
              <div className="flex flex-col gap-y-2">
                <div className="flex items-center justify-between">
                  <Label>Características:</Label>
                  <Button
                    className="h-7 w-7 p-0 rounded-none"
                    type="button"
                    onClick={addCharacteristic}
                  >
                    <Plus />
                  </Button>
                </div>
                <Textarea
                  className="border-none rounded-none"
                  value={productCharacteristicName}
                  onChange={(e) => setProductCharacteristicName(e.target.value)}
                ></Textarea>
                {product.productCharacteristics.map(
                  (productCharacteristic, index) => (
                    <div
                      className="flex items-center justify-between gap-x-4"
                      key={productCharacteristic.id}
                    >
                      <span>
                        Característica {index + 1}: {productCharacteristic.name}
                      </span>
                      <div className="flex items-center gap-x-2">
                        <Button
                          className="shrink-0 p-0 h-7 w-7 rounded-none"
                          type="button"
                          onClick={() =>
                            editCharacteristic(productCharacteristic)
                          }
                        >
                          <Pen className="h-5 w-5" />
                        </Button>
                        <Button
                          className="shrink-0 p-0 h-7 w-7 rounded-none"
                          variant={"destructive"}
                          type="button"
                          onClick={() =>
                            removeCharacteristic(productCharacteristic.id)
                          }
                        >
                          <Trash className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-between items-center gap-x-4">
                <div className="flex-1 flex flex-col gap-y-2">
                  <Label htmlFor="serie">Marca:</Label>
                  <Select
                    value={product.productBrandId}
                    onValueChange={(id) => {
                      if (id) {
                        setProduct({ ...product, productBrandId: id });
                      }
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccione marca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Marcas</SelectLabel>
                        {productBrands.map((productBrand) => (
                          <SelectItem
                            key={productBrand.id}
                            value={productBrand.id.toString()}
                          >
                            {productBrand.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 flex flex-col gap-y-2">
                  <Label htmlFor="serie">Categoría:</Label>
                  <Select
                    value={product.productCategoryId}
                    onValueChange={(id) => {
                      if (id) {
                        setProduct({ ...product, productCategoryId: id });
                      }
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Categorías</SelectLabel>
                        {productCategories.map((productCategory) => (
                          <SelectItem
                            key={productCategory.id}
                            value={productCategory.id.toString()}
                          >
                            {productCategory.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 flex-col gap-y-2">
                  <Label htmlFor="price">Precio:</Label>
                  <div className="flex items-center gap-x-3">
                    <span className="font-bold">S/</span>
                    <Input
                      className="h-9 border-none rounded-none"
                      type="number"
                      id="price"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({ ...product, price: e.target.value })
                      }
                      required
                      min={1}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  className="px-8 py-6 rounded-none disabled:opacity-50"
                  type="submit"
                  disabled={submiting}
                >
                  ACTUALIZAR PRODUCTO
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
