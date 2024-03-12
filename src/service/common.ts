import { axiosGet, axiosPost } from "./axios";
import axios from 'axios';

/**
 * 获取中国所有省市区
 * @param data 
 * @returns 
 */
export const getAreaConfig = (): Promise<any> => {
  return axios.get(`/chinese-cities.json`)
    .then((response) => {
      return response;
    })
    .catch((error) => console.error(error));;
}