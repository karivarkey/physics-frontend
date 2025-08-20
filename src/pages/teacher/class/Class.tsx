import { useParams } from "react-router-dom"



const ClassDetails = () => {
    const params = useParams<{ classId: string }>();
  return (
    <div>{params.classId}</div>
  )
}

export default ClassDetails