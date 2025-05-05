import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import { useSelector } from "react-redux";
import { RootState } from "../../@types";
import { ReactNode } from "react";

const DashboardLayout = ({ children, activeMenu }: { children: ReactNode, activeMenu: string }) => {
    const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="">
      <Navbar activeMenu={activeMenu} />

      {user && (
        <div className="flex">
          <div className="max-[1080px]:hidden">
            <SideMenu activeMenu={activeMenu} />
          </div>

          <div className="grow mx-5">{children}</div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
