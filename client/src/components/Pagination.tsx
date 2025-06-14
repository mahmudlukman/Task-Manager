import { formUrlQuery } from "../utils/helper";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Props {
  pageNumber: number;
  isNext: boolean;
}

const Pagination = ({ pageNumber, isNext }: Props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleNavigation = (direction: string) => {
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    // Navigate to the new URL
    navigate(newUrl);
  };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <button
        disabled={pageNumber === 1}
        onClick={() => handleNavigation("prev")}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <p className="text-xs md:text-[14px] text-gray-500">Prev</p>
      </button>
      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <p className="body-semibold text-light-900">{pageNumber}</p>
      </div>
      <button
        disabled={!isNext}
        onClick={() => handleNavigation("next")}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <p className="text-xs md:text-[14px] text-gray-500">Next</p>
      </button>
    </div>
  );
};

export default Pagination;
