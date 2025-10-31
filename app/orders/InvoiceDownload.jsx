import { Eye, MoreVertical, Download } from "lucide-react";
import { useState } from "react";

const InvoiceDownload = ({ order }) => {
  const BASE_URL = "https://marketplace.yuukke.com/shop/invoice";
  const [open, setOpen] = useState(false);

  const warehouseList = order?.warehouse_details || [];

  if (warehouseList.length <= 1) {
    // ✅ Single package → direct download
    const packageId = warehouseList[0]?.product_warehouse_id;
    return (
      <button
        onClick={() =>
          window.open(`${BASE_URL}/${order.id}/${packageId}`, "_blank")
        }
        className="flex items-center gap-1 text-xs md:text-sm font-medium text-blue-600 hover:underline "
      >
        <Download className="h-4 w-4" /> Download
        {/* <span className="hidden md:inline">Download</span>
        <span className="inline md:hidden">Download invoice</span> */}
      </button>
    );
  }

  // ✅ Multiple packages → dropdown
  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline "
      >
        <Download className="h-4 w-4" /> Packages
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white  ring-1 ring-black ring-opacity-5 z-20">
          <ul className="py-1">
            {warehouseList.map((pkg, idx) => (
              <li key={idx}>
                <button
                  onClick={() =>
                    window.open(
                      `${BASE_URL}/${order.id}/${pkg.product_warehouse_id}`,
                      "_blank"
                    )
                  }
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 "
                >
                  Package {idx + 1}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InvoiceDownload;
