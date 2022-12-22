import Axios from "axios";
import AIODate from './../npm/aio-date/aio-date';
export default function apis({getState,token,getDateAndTime,showAlert,baseUrl}) {
  return {
    async get_all_awards() {
      let res = await Axios.get(`${baseUrl}/Awards`);
      return res.data && res.data.isSuccess ? res.data.data : [];
    },
    async get_tested_chance() {
      let today = AIODate.getToday("jalali"), date = [1401, 1, 1];
      return (`${today[0]},${today[1]},${today[2]}` === `${date[0]},${date[1]},${date[2]}`);
    },
    async save_catched_chance({award,result}) {
      let res = await Axios.post(`${baseUrl}/UserAwards`, { UserId: 1, AwardId: award.id, Win: result });
      return res.data.isSuccess;
    },
    async get_user_awards() {
      let res = await Axios.get(`${baseUrl}/UserAwards`);
      if (res.data && res.data.isSuccess) {
        return res.data.data.map((o) => {
          let {date,time} = getDateAndTime(o.createdDate);
          return { title: o.award.title, subtitle: o.award.shortDescription, date,_time:time, used: o.usedDate !== null, code: o.id };
        });
      }
      else { return []; }
    }
  }
}