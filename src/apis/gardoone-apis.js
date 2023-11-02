import Axios from "axios";
import AIODate from './../npm/aio-date/aio-date';
export default function gardooneApis({baseUrl,helper}) {
  return {
    async get_all_awards() {
      let res = await Axios.get(`${baseUrl}/Awards`);
      let result = res.data && res.data.isSuccess ? res.data.data : [];
      return {result}
    },
    async get_tested_chance() {
      let today = AIODate.getToday({calendarType:"jalali",pattern:'{year},{month},{day}'}), date = [1401, 1, 1];
      let result = (today === `${date[0]},${date[1]},${date[2]}`);
      return {result}
    },
    async save_catched_chance({award,result}) {
      let res = await Axios.post(`${baseUrl}/UserAwards`, { UserId: 1, AwardId: award.id, Win: result });
      return {result:res.data.isSuccess}
    },
    async get_user_awards() {
      let res = await Axios.get(`${baseUrl}/UserAwards`);
      let result = [];
      if (res.data && res.data.isSuccess) {
        result = res.data.data.map((o) => {
          let {date,time} = helper.getDateAndTime(o.createdDate);
          return { title: o.award.title, subtitle: o.award.shortDescription, date,_time:time, used: o.usedDate !== null, code: o.id };
        });
      }
      return {result};
    }
  }
}