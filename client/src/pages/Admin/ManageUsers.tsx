import DashboardLayout from '../../components/layouts/DashboardLayout';
import { LuFileSpreadsheet } from 'react-icons/lu';
import UserCard from '../../components/Cards/UserCard';
import { useGetAllUsersQuery } from '../../redux/features/user/userApi';
import { useExportUsersReportMutation } from '../../redux/features/report/reportApi';
import { toast } from 'react-hot-toast';
import { User } from '../../@types';
import { downloadBlob } from '../../utils/helper';
import UsersTable from '../../components/UsersTable';
import Pagination from '../../components/Pagination';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Searchbar from '../../components/Inputs/Search';
import { useState, FormEvent, ChangeEvent } from 'react';

const ManageUsers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState<string>(
    searchParams.get('q') || ''
  );

  // Extract search parameters
  const searchQuery = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || '';
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;

  // Fetch users
  const {
    data: allUsers,
    isLoading,
    isError,
  } = useGetAllUsersQuery({
    searchQuery,
    filter,
    page,
  });

  const allUsersList = allUsers?.users || [];
  const usersWithTasks = allUsers?.usersWithTaskCounts || [];
  const isNext = allUsers?.isNext || false;

  // Download report mutation
  const [exportUsersReport, { isLoading: isExporting }] =
    useExportUsersReportMutation();

  // Handle search submission
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }

    // Reset to page 1 when searching
    params.set('page', '1');

    navigate(`?${params.toString()}`, { replace: true });
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (!e.target.value.trim()) {
      // Clear search query when input is empty
      const params = new URLSearchParams(searchParams);
      params.delete('q');
      params.set('page', '1');
      navigate(`?${params.toString()}`, { replace: true });
    }
  };

  // Download user report
  const handleDownloadReport = async () => {
    try {
      const blob = await exportUsersReport().unwrap();
      downloadBlob(
        blob,
        `users_report_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report. Please try again.');
    }
  };

  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium">Members With Tasks</h2>
          <button
            className="flex download-btn mt-3 md:mt-0"
            onClick={handleDownloadReport}
            disabled={isExporting}
          >
            <LuFileSpreadsheet className="text-lg" />
            {isExporting ? 'Downloading...' : 'Download Report'}
          </button>
        </div>

        {isLoading && <p className="text-gray-500 mt-4">Loading users...</p>}

        {isError && <p className="text-red-500 mt-4">Error fetching users</p>}

        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {usersWithTasks.length > 0 ? (
              usersWithTasks.map((user: User) => (
                <UserCard key={user._id} userInfo={user} />
              ))
            ) : (
              <p className="text-gray-500">No users with tasks available.</p>
            )}
          </div>
        )}
      </div>

      <div className="md:col-span-2">
        <h2 className="text-xl md:text-xl font-medium mb-4">Team Members</h2>

        {/* Search Component */}
        <div className="mb-6">
          <Searchbar
            route="/manage-users"
            onSubmit={handleSearch}
            placeholder="Search users by name..."
            value={searchInput}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Showing results for: "<span className="font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between"></div>
          <UsersTable usersData={allUsersList} />
        </div>
      </div>

      <div className="mt-10">
        <Pagination pageNumber={page} isNext={isNext} />
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;