import SideBar from "@/components/shop/SideBar";
import TopBar from "@/components/admin/TopBar";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useStore } from "@/store";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { formatCurrencyPeru } from "@/helpers";

export default function UserOrdersView() {
  const authToken = useStore((state) => state.authToken);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 3 });

  const columns = [
    {
      accessorKey: "id",
    },
    {
      accessorKey: "quantity",
    },
    {
      accessorKey: "name",
    },
    {
      accessorKey: "createdAt",
    },
    {
      accessorKey: "total",
    },
    {
      accessorKey: "firstDirection",
    },
    {
      accessorKey: "district",
    },
    {
      accessorKey: "city",
    },
    {
      accessorKey: "country",
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  async function fetchOrdersByUserId() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/user`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (!response.ok) {
        throw Error;
      }
      const orders = await response.json();
      const data = orders.map((order) => {
        const orderDetails = [...order.orderDetails];
        const orderDetailNames = orderDetails
          .splice(0, 3)
          .map((orderDetail) => orderDetail.product.name);

        return {
          ...order,
          quantity: order.orderDetails.reduce(
            (total, detailOrder) => total + detailOrder.quantity,
            0
          ),
          name: JSON.stringify(orderDetailNames),
          createdAt: new Date(order.createdAt).toLocaleDateString(),
        };
      });
      setData(data);
    } catch (error) {
      toast.error("Error al obtener las órdenes");
    }
  }

  useEffect(() => {
    fetchOrdersByUserId();
  }, []);

  return (
    <main className="p-10">
      <div className="flex gap-x-8">
        <SideBar />
        <div className="flex-grow flex flex-col">
          <div className="flex flex-col gap-y-3">
            <div>
              <TopBar text="ÓRDENES RECIENTES" />
              {table.getRowModel().rows.map((row) => (
                <div
                  key={row.id}
                  className="flex gap-x-[10px] bg-white h-[114px] justify-between px-[33px]"
                >
                  <div className="mt-5">
                    <p>
                      Orden x {row.getValue("quantity")} items (
                      {row.getValue("name")})
                    </p>
                    <p>
                      Fecha: {row.getValue("createdAt")} - Total:{" "}
                      {formatCurrencyPeru(row.getValue("total"))}
                    </p>
                    <p>
                      Enviado a: {row.getValue("firstDirection")},{" "}
                      {row.getValue("district")}, {row.getValue("city")},{" "}
                      {row.getValue("country")}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="w-[153px] h-[23px]">
                      Orden Nro. {row.getValue("id")}
                    </p>
                    <Link
                      className="underline"
                      to={`/orders/${row.getValue("id")}/view`}
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end">
              <div className="space-x-2">
                <Button
                  className="border-none rounded-none"
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Anterior
                </Button>
                <Button
                  className="border-none rounded-none"
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
