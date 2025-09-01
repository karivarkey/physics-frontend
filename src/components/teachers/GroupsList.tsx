import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useMemo } from "react";
import type { ApiResponse } from "./types";
import CreateGroupModal from "./CreateGroupModal";
import GroupCard from "./GroupCard";

type Props = {
  class_short: string;
};

const GroupsList = ({ class_short }: Props) => {
  // Fetching groups
  const {
    data: groupsData,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["groups", class_short],
    queryFn: () =>
      axiosInstance
        .get(`/teacher/groups/${class_short}`)
        .then((res) => res.data),
  });

  const groups = groupsData?.[0]?.groups || [];
  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => a.group_name - b.group_name);
  }, [groups]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error fetching groups</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manage Groups</h1>
        <CreateGroupModal class_short={class_short} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedGroups.map((group) => (
          <GroupCard key={group.group_id} group={group} class_short={class_short} />
        ))}
      </div>
    </div>
  );
};

export default GroupsList;
