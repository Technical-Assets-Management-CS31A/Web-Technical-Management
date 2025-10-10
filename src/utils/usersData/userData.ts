import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useUserQuery } from "../../query/get/useUserQuery";
import type { TUsers } from "../../types/types";

export const UserData = () => {
  const [userData, setUserData] = useState<TUsers>({
    id: "",
    username: "",
    lastName: "",
    middleName: "",
    firstName: "",
    email: "",
    phoneNumber: "",
    userRole: "",
    status: "",
  })

  const { data } = useSuspenseQuery(useUserQuery())

  useEffect(() => {
    if (!data) console.log("User not found")
    setUserData(data)
  }, [data])

  return userData
}


