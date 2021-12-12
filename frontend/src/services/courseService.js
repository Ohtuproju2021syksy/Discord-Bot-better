import axios from "axios";
const baseUrl = "/api/courses";

const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then(response => response.data);
};

const exportedObject =  { getAll };

export default exportedObject;