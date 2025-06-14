import { useEffect, useState, FormEvent, ChangeEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { formUrlQuery, removeKeysFromQuery } from '../../utils/helper';

interface CustomInputProps {
  route: string;
  placeholder: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void; // Add onSubmit prop
  value: string; // Add value prop
  onChange: (e: ChangeEvent<HTMLInputElement>) => void; // Add onChange prop
}

const Searchbar = ({
  route,
  placeholder,
  onSubmit,
  value,
  onChange,
}: CustomInputProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q');
  const [search, setSearch] = useState(query || '');

  useEffect(() => {
    // Sync internal state with external value prop
    setSearch(value || query || '');
  }, [value, query]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search) {
        const newUrl = formUrlQuery({
          params: searchParams.toString(),
          key: 'q',
          value: search,
        });
        navigate(newUrl, { replace: true });
      } else if (location.pathname === route) {
        const newUrl = removeKeysFromQuery({
          params: searchParams.toString(),
          keysToRemove: ['q'],
        });
        navigate(newUrl, { replace: true });
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, route, location.pathname, navigate, searchParams]);

  return (
    <div className="w-full max-w-md">
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
        />
      </form>
    </div>
  );
};

export default Searchbar;