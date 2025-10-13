'use client';

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import AddButton from '@/components/buttons/AddButton';
import CheckBox from '@/components/buttons/CheckBox';
import SearchBox from '@/components/input/SearchBox';
import DropdownMenu from '@/components/input/DropdownMenu';
import DownArrow from '@/components/icons/DownArrowIcon';
import EditIcon from '@/components/icons/EditIcon';
import RedCancelIcon from '@/components/icons/RedCancelIcon';

export default function AlleRollenTab({ admin_counts, user_counts, admin_docs, user_docs }) {
  const allOptions = ['Bulkacties', 'Option 1', 'Option 2', 'Option 3'];
  const [selected, setSelected] = useState(allOptions[0]);

  // Derived data (memoized for clarity & performance)
  const RolData = useMemo(
    () => [
      { rol: 'Beheerder', gebruikers: admin_counts, documenten: admin_docs },
      { rol: 'PM’er', gebruikers: user_counts, documenten: user_docs },
    ],
    [admin_counts, user_counts, admin_docs, user_docs]
  );

  return (
    <div className="flex flex-col w-full">
      {/* Header controls */}
      <div className="flex w-full h-[60px] bg-[#F9FBFA] items-center justify-between px-4">
        <div className="flex w-2/3 gap-4">
          <div className="w-1/3">
            <DropdownMenu value={selected} onChange={setSelected} allOptions={allOptions} />
          </div>

          <div className="w-1/3">
            <SearchBox placeholderText="Zoek gebruiker..." />
          </div>
        </div>

        <AddButton onClick={() => {}} text="Toevoegen" />
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="bg-[#F9FBFA]">
            <tr className="h-[51px] border-b border-[#C5BEBE]">
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  <CheckBox toggle={false} color="#23BD92" />
                  <span>Rol</span>
                  <DownArrow />
                </div>
              </th>
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  Gebruikers
                  <DownArrow />
                </div>
              </th>
              <th className="px-4 py-2 font-montserrat font-bold text-[16px] text-black">
                <div className="flex items-center gap-3">
                  Documenten toegewezen
                  <DownArrow />
                </div>
              </th>
              <th className="px-4 py-2 w-[52px]"></th>
            </tr>
          </thead>

          <tbody>
            {RolData.map(({ rol, gebruikers, documenten }) => (
              <tr
                key={rol}
                className="h-[51px] border-b border-[#C5BEBE] hover:bg-[#F9FBFA] transition-colors"
              >
                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  <div className="flex items-center gap-3">
                    <CheckBox toggle={false} color="#23BD92" />
                    {rol}
                  </div>
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  {gebruikers}
                </td>

                <td className="px-4 py-2 font-montserrat text-[16px] text-black font-normal">
                  {documenten}
                </td>

                <td className="px-4 py-2 flex justify-end gap-3">
                  <button
                    aria-label={`Edit ${rol}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <EditIcon />
                  </button>
                  <button
                    aria-label={`Delete ${rol}`}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <RedCancelIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ Prop validation (if not using TypeScript)
AlleRollenTab.propTypes = {
  admin_counts: PropTypes.number,
  user_counts: PropTypes.number,
  admin_docs: PropTypes.number,
  user_docs: PropTypes.number,
};
