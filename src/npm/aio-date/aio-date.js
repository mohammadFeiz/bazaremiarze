export default function AIODate() {
  let $$ = {
    isMatch(obj) {
      if (!obj || !Array.isArray(obj.matchers) || obj.date === undefined) {
        console.error(`AIODate().isMatch should get an object as parameter. {*date:number | string | array,*matchers:array}`, obj)
        return false
      }
      let { date, matchers } = obj;
      if (!date) { return false }
      if (matchers === true) { return true }
      if (matchers === false) { return false }
      date = $$.convertToArray({ date })
      let { isLess, isGreater, isEqual } = $$;
      for (let i = 0; i < matchers.length; i++) {
        let matcher = matchers[i], type, targets;
        try {
          let a = matcher.split(',');
          type = a[0];
          targets = a.slice(1, a.length);
        }
        catch { return false }
        if (type === '<') { for (let i = 0; i < targets.length; i++) { if (isLess(date, targets[i])) { return true } } }
        else if (type === '>') { for (let i = 0; i < targets.length; i++) { if (isGreater(date, targets[i])) { return true } } }
        else if (type === '<=') { for (let i = 0; i < targets.length; i++) { if (isEqual(date, targets[i])) { return true } if (isLess(date, targets[i])) { return true } } }
        else if (type === '>=') { for (let i = 0; i < targets.length; i++) { if (isEqual(date, targets[i])) { return true } if (isGreater(date, targets[i])) { return true } } }
        else if (type === '=') { for (let i = 0; i < targets.length; i++) { if (isEqual(date, targets[i])) { return true } } }
        else if (type === '!=') { for (let i = 0; i < targets.length; i++) { if (!isEqual(date, targets[i])) { return true } } }
        else if (type === '<>') {
          if (targets[0] && targets[1]) {
            let start, end;
            if (isLess(targets[0], targets[1])) { start = targets[0]; end = targets[1]; }
            else { start = targets[1]; end = targets[0]; }
            if (isGreater(date, start) && isLess(date, end)) { return true }
          }
        }
        else if (type === '<=>') {
          if (targets[0] && targets[1]) {
            let start, end;
            if (isLess(targets[0], targets[1])) { start = targets[0]; end = targets[1]; }
            else { start = targets[1]; end = targets[0]; }
            if (isGreater(date, start) && isLess(date, end)) { return true }
            if (isEqual(date, start) || isEqual(date, end)) { return true }
          }
        }
        else if (type === '!<>') {
          if (targets[0] && targets[1]) {
            let start, end;
            if (isLess(targets[0], targets[1])) { start = targets[0]; end = targets[1]; }
            else { start = targets[1]; end = targets[0]; }
            if (!isGreater(date, start) || !isLess(date, end)) { return true }
          }
        }
        else if (type === '!<=>') {
          if (targets[0] && targets[1]) {
            let start, end;
            if (isLess(targets[0], targets[1])) { start = targets[0]; end = targets[1]; }
            else { start = targets[1]; end = targets[0]; }
            if (!isEqual(date, start) && !isEqual(date, end) && (isLess(date, start) || isGreater(date, end))) { return true }
          }
        }
        else if (type === 'w') {
          let w = $$.getWeekDay({ date }).index;
          for (let i = 0; i < targets.length; i++) { if (w === +targets[i]) { return true } }
        }
        else if (type === '!w') {
          let w = $$.getWeekDay({ date }).index;
          for (let i = 0; i < targets.length; i++) { if (w !== +targets[i]) { return true } }
        }
      }
      return false
    },
    getSplitter(value) {
      let splitter = '/';
      for (let i = 0; i < value.length; i++) {
        if (isNaN(parseInt(value[i]))) { return value[i] }
      }
      return splitter;
    },
    convertToArray(obj) {
      if (!obj || obj.date === undefined) {
        console.error(`
          AIODate().convertToArray should get an object as parameter. 
          { 
            *date:number | string | array
          }`, obj)
        return false
      }
      let { date } = obj;
      if (!date) { return [] }
      if (Array.isArray(date)) { return [...date] }
      else if (typeof date === 'string') {
        let list;
        if (date.indexOf("T") !== -1) {
          //"2015-03-25T12:00:00Z"
          let [d, t] = date.split("T");
          t = t.split(".")[0];
          t = t.split(':');
          d = d.split('-');
          list = d.concat(t, 0)
        }
        else {
          list = date.split($$.getSplitter(date));
        }
        return list.map((date) => parseInt(date))
      }
      else if (typeof date === 'number') {
        let d = new Date(date);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        let hour = d.getHours();
        let minute = d.getMinutes();
        let second = d.getSeconds();
        let miliseconds = d.getMilliseconds();
        let tenthsecond = Math.round(miliseconds / 100);
        return [year, month, day, hour, minute, second, tenthsecond]
      }
      else if (typeof date === 'object') {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        let miliseconds = date.getMilliseconds();
        let tenthsecond = Math.round(miliseconds / 100);
        return [year, month, day, hour, minute, second, tenthsecond]
      }
      else { return false }
    },
    toJalali(obj) {
      if (!obj || obj.date === undefined) {
        console.error(`
          AIODate().toJalali should get an object as parameter. 
          { 
            *date:number | string | array , 
            pattern:string (example: {year}/{month}/{day}) 
          }`, obj)
        return false
      }
      if (!obj.date) { return }
      let arr = $$.convertToArray({ date: obj.date });
      let calendarType = $$.getCalendarType(arr);
      if (calendarType === 'jalali') { return arr }
      let [gy, gm, gd] = arr;
      var g_d_m, jy, jm, jd, gy2, days;
      g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      gy2 = (gm > 2) ? (gy + 1) : gy;
      days = 355666 + (365 * gy) + ~~((gy2 + 3) / 4) - ~~((gy2 + 99) / 100) + ~~((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
      jy = -1595 + (33 * ~~(days / 12053)); days %= 12053; jy += 4 * ~~(days / 1461); days %= 1461;
      if (days > 365) { jy += ~~((days - 1) / 365); days = (days - 1) % 365; }
      if (days < 186) { jm = 1 + ~~(days / 31); jd = 1 + (days % 31); } else { jm = 7 + ~~((days - 186) / 30); jd = 1 + ((days - 186) % 30); }
      arr[0] = jy; arr[1] = jm; arr[2] = jd;
      if (obj.pattern) { return $$.pattern(arr, obj.pattern) }
      return arr;
    },
    toGregorian(obj) {
      if (!obj || obj.date === undefined) {
        console.error(`
          AIODate().toGregorian should get an object as parameter. 
          { 
            *date:number | string | array , 
            pattern:string (example: {year}/{month}/{day}) 
          }`, obj)
        return false
      }
      if (!obj.date) { return }
      let arr = $$.convertToArray({ date: obj.date });
      let calendarType = $$.getCalendarType(arr);
      if (calendarType === 'gregorian') { return arr }
      let [jy, jm, jd] = arr;
      var sal_a, gy, gm, gd, days;
      jy += 1595; days = -355668 + (365 * jy) + (~~(jy / 33) * 8) + ~~(((jy % 33) + 3) / 4) + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
      gy = 400 * ~~(days / 146097); days %= 146097;
      if (days > 36524) { gy += 100 * ~~(--days / 36524); days %= 36524; if (days >= 365) days++; }
      gy += 4 * ~~(days / 1461); days %= 1461;
      if (days > 365) { gy += ~~((days - 1) / 365); days = (days - 1) % 365; }
      gd = days + 1;
      sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      for (gm = 0; gm < 13 && gd > sal_a[gm]; gm++) gd -= sal_a[gm];
      arr[0] = gy; arr[1] = gm; arr[2] = gd;
      if (obj.pattern) { return $$.pattern(arr, obj.pattern) }
      return arr;
    },
    compaire(obj) {
      if (!obj || obj.date === undefined || obj.otherDate === undefined) {
        console.error(`
          AIODate().compaire should get an object as parameter. 
          { 
            *date:number | string | array , 
            *otherDate:number | string | array , 
          }
          and returns 'greater' | 'less' | 'equal'
          `, obj)
        return false
      }
      let { date, otherDate } = obj;
      if (!date || !otherDate) { return }
      let arr1 = $$.convertToArray({ date });
      let arr2 = $$.convertToArray({ date: otherDate });
      for (let i = 0; i < arr1.length; i++) {
        let a = arr1[i];
        let b = arr2[i] || 0;
        if (a < b) { return 'less' }
        if (a > b) { return 'greater' }
      }
      return 'equal';
    },
    getToCompaire(o1, o2) {
      o1 = $$.convertToArray({ date: o1 });
      o2 = $$.convertToArray({ date: o2 });
      for (let i = 0; i < o1.length; i++) { if (isNaN(o2[i])) { o2[i] = o1[i] } }
      return { date: o1, otherDate: o2 }
    },
    isLess(o1, o2) {
      if (!o1 || !o2) { return false }
      return $$.compaire($$.getToCompaire(o1, o2)) === 'less'
    },
    isEqual(o1, o2) {
      if (!o1 || !o2) { return false }
      return $$.compaire($$.getToCompaire(o1, o2)) === 'equal'
    },
    isGreater(o1, o2) {
      if (!o1 || !o2) { return false }
      return $$.compaire($$.getToCompaire(o1, o2)) === 'greater'
    },
    isBetween(o1, [o2, o3]) {
      if (!o1 || !o2 || !o3) { return false }
      return $$.isGreater(o1, o2) && $$.isLess(o1, o3)
    },
    getTime(obj) {
      if (!obj || obj.date === undefined) {
        console.error(`
          AIODate().getTime should get an object as parameter. 
          { 
            *date:number | string | array , 
          }`, obj)
        return false
      }
      let { date, calendarType } = obj;
      if (!date) { return }
      calendarType = calendarType || $$.getCalendarType(date);
      if (typeof date === 'number') { return date }
      date = $$.convertToArray({ date });
      let [year, month = 1, day = 1, hour = 0, minute = 0, second = 0, tenthsecond = 0] = date;
      if (calendarType === 'jalali') { date = $$.toGregorian({ date: [year, month, day, hour, minute, second, tenthsecond] }) }
      let time = new Date(date[0], date[1] - 1, date[2]).getTime()
      time += hour * 60 * 60 * 1000;
      time += minute * 60 * 1000;
      time += second * 1000;
      time += tenthsecond * 100;
      return time;
    },
    getNextTime(obj) {
      if (!obj || obj.date === undefined || isNaN(obj.offset)) {
        console.error(`
          AIODate().getNextTime should get an object as parameter. 
          { 
            *date:number | string | array , 
            *offset : number(miliseconds) ,
            jalali : boolean(return result by jalali date),
            pattern:string (example: {year}/{month}/{day}) 
          }`, obj)
        return false
      }
      let { date, offset, pattern } = obj;
      if (!offset || !date) { return date }
      let calendarType = $$.getCalendarType(date);
      let time = $$.getTime({ date, calendarType });
      time += offset;
      time = $$.convertToArray({ date: time });
      if (calendarType === 'jalali' || obj.jalali) {
        let [jy, jm, jd] = $$.toJalali({ date: time });
        time[0] = jy; time[1] = jm; time[2] = jd;
      }
      if (pattern) { return $$.pattern(time, pattern) }
      return time;
    },
    GetMonthDaysLength: {
      jalali: (year, month) => {
        if (month <= 6) { return 31; }
        if (month <= 11) { return 30; }
        if ([1, 5, 9, 13, 17, 22, 26, 30].indexOf(year % 33) === -1) { return 29; }
        return 30;
      },
      gregorian: (year, month) => { return new Date(year, month - 1, 0).getDate(); }
    },
    getMonthDaysLength(obj) {
      if (!obj || obj.date === undefined) {
        console.error(`
          AIODate().getMonthDaysLength should get an object as parameter. 
          { 
            *date:number | string | array
          }
          `, obj)
        return false
      }
      let { date } = obj;
      if (!date) { return }
      let [year, month] = $$.convertToArray({ date });
      return $$.GetMonthDaysLength[$$.getCalendarType([year, month])](year, month)
    },
    getCalendarType(date) {
      return $$.convertToArray({ date })[0] < 1700 ? 'jalali' : 'gregorian'
    },
    getWeekDay(obj) {
      if (!obj || !obj.date) {
        console.error(`AIODate().getWeekDay should get an object as parameter. {*date:string | array}`, obj)
        return false
      }
      let date = $$.convertToArray({ date: obj.date });
      let calendarType = $$.getCalendarType(date);
      date = $$.toGregorian({ date })
      let index = new Date(date[0], date[1] - 1, date[2]).getDay();
      if (calendarType === 'jalali') {
        index += 1;
        index = index % 7;
      }
      return { weekDay: $$.getWeekDays({ calendarType })[index], index };
    },
    getDaysOfWeek(obj) {
      if (!obj || !obj.date) {
        console.error(`AIODate().getDaysOfWeek should get an object as parameter. {*date:string | array}`, obj)
        return false
      }
      let { index } = $$.getWeekDay({ date: obj.date });
      let startDate = $$.getNextTime({ date: [obj.date[0], obj.date[1], obj.date[2]], offset: -(index + 1) * 24 * 60 * 60 * 1000 });
      let endDate = $$.getNextTime({ date: [obj.date[0], obj.date[1], obj.date[2]], offset: (7 - index) * 24 * 60 * 60 * 1000 });
      return $$.getDatesBetween({ date: startDate, otherDate: endDate, pattern: obj.pattern, step: 24 * 60 * 60 * 1000 })
    },
    getDaysOfMonth(obj) {
      if (!obj || !obj.date) {
        console.error(`AIODate().getLastDayOfMonth should get an object as parameter. {*date:string | array}`, obj)
        return false
      }
      let date = $$.convertToArray({ date: obj.date });
      let firstDay = [date[0], date[1], 1];
      let lastDay = $$.getLastDayOfMonth({ date })
      let betweenDayes = $$.getDatesBetween({ date: firstDay, otherDate: lastDay, step: 24 * 60 * 60 * 1000 });
      let result = [firstDay];
      result = result.concat(betweenDayes);
      result.push(lastDay);
      if (obj.pattern) {
        return result.map((o) => $$.getDateByPattern({ date: o, pattern: obj.pattern }))
      }
      return result;
    },
    getLastDayOfMonth(obj) {
      if (!obj || !obj.date) {
        console.error(`AIODate().getLastDayOfMonth should get an object as parameter. {*date:string | array}`, obj)
        return false
      }
      let date = $$.convertToArray({ date: obj.date });
      let length = $$.getMonthDaysLength({ date });
      let lastDay = [date[0], date[1], length];
      if (obj.pattern) {
        return $$.getDateByPattern({ date: lastDay, pattern: obj.pattern })
      }
      return lastDay
    },
    getWeekDays({ calendarType }) {
      return {
        jalali: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
        gregorian: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      }[calendarType]
    },
    getMonths({ calendarType }) {
      return {
        jalali: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',],
        gregorian: ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER']
      }[calendarType]
    },
    getDatesBetween(obj) {
      if (!obj || obj.date === undefined || obj.otherDate === undefined) {
        console.error(`
          AIODate().getDatesBetween should get an object as parameter. 
          {
            *date:number | array | string,
            *otherDate:number | array | string,
            *step:number(miliseconds. default is 24 * 60 * 60 * 1000),
            pattern:string (example '{year/{month}/{day}}')
          }`)
        return false;
      }
      let { date, otherDate, step = 24 * 60 * 60 * 1000, pattern } = obj;
      date = $$.convertToArray({ date: date });
      otherDate = $$.convertToArray({ date: otherDate });
      if (!$$.isGreater(otherDate, date)) { return [] }
      let length = $$.getDelta({ date, otherDate }).miliseconds / step;
      if (isNaN(length) || length > 1000) {
        console.error('AIODate().getDatesBetween() => too many dates');
        return;
      }
      let nextDate = $$.getNextTime({ date, offset: step });
      let res = [];
      while ($$.isLess(nextDate, otherDate)) {
        if (pattern) {
          res.push($$.pattern(nextDate, pattern));
        }
        else {
          res.push(nextDate);
        }
        nextDate = $$.getNextTime({ date: nextDate, offset: step });
      }
      return res
    },
    getToday(obj) {
      if (!obj || ['jalali', 'gregorian'].indexOf(obj.calendarType) === -1) {
        console.error(`AIODate().getToday should get an object as parameter. {*calendarType:'gregorian' | 'jalali',pattern:string}`)
        return false;
      }
      let date = new Date();
      date = [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), Math.round(date.getMilliseconds() / 100)]
      if (obj.calendarType === 'jalali') { date = $$.toJalali({ date }) }
      if (obj.pattern) { return $$.pattern(date, obj.pattern) }
      return date;
    },
    getDateByPattern(obj) {
      if (!obj || !obj.date || typeof obj.pattern !== 'string') {
        console.error(`AIODate().getDateByPattern should get an object as parameter. {*date:number | string | array,*pattern:string}`)
        return false;
      }
      let { date, pattern } = obj
      return $$.pattern(date, pattern)
    },
    pattern(date, pattern) {
      date = $$.convertToArray({ date });
      let [year, month, day, hour, minute, second, tenthsecond] = date;
      let calendarType = $$.getCalendarType(date);
      pattern = pattern.replace('{year}', year);
      pattern = pattern.replace('{month}', month);
      pattern = pattern.replace('{day}', day);
      pattern = pattern.replace('{hour}', hour);
      pattern = pattern.replace('{minute}', minute);
      pattern = pattern.replace('{second}', second);
      pattern = pattern.replace('{tenthsecond}', tenthsecond);
      if (pattern.indexOf('{monthString}') !== -1) {
        pattern = pattern.replace('{monthString}', $$.getMonths({ calendarType })[month - 1]);
      }
      if (pattern.indexOf('{weekDay}') !== -1) {
        let weekDays = $$.getWeekDays({ calendarType });
        let { index } = $$.getWeekDay({ date });
        pattern = pattern.replace('{weekDay}', weekDays[index]);
      }
      return pattern
    },
    getDif(dif) {
      let miliseconds = dif;
      let day = Math.floor(dif / (24 * 60 * 60 * 1000));
      dif -= day * (24 * 60 * 60 * 1000);
      let hour = Math.floor(dif / (60 * 60 * 1000));
      dif -= hour * (60 * 60 * 1000);
      let minute = Math.floor(dif / (60 * 1000));
      dif -= minute * (60 * 1000);
      let second = Math.floor(dif / (1000));
      dif -= second * (1000);
      let tenthsecond = Math.floor(dif / (100));
      return { day, hour, minute, second, tenthsecond, miliseconds }
    },
    getDelta(obj) {
      if (!obj || !obj.date) {
        console.error(`
          AIODate().getDelta should get an object as parameter. 
          {
            *date:number | string | array,
            otherDate:number | string | array, (default is now),
            pattern:string (example: '{year}/{month}/{day}')
          }`)
        return false;
      }
      let { date, otherDate = new Date().getTime(), pattern } = obj;
      let dif = $$.getTime({ date }) - $$.getTime({ date: otherDate });
      let res;
      if (dif === 0) { res = { day: 0, hour: 0, minute: 0, second: 0, tenthsecond: 0, type: 'now' } }
      if (dif < 0) { res = { ...$$.getDif(-dif), type: 'passed' } }
      if (dif > 0) { res = { ...$$.getDif(dif), type: 'remaining' } }
      if (pattern) {
        let { day, hour, minute, second, tenthsecond } = res;
        return $$.pattern([0, 0, day, hour, minute, second, tenthsecond], pattern)
      }
      return res
    },
    getByOffset({ date, offset, unit = 'day', calendarType = 'gregorian' }) {
      if (!offset) { return date }
      let fn = $$['get' + (offset > 0 ? 'Next' : 'Prev') + { 'hour': 'Hour', 'day': 'Day', 'month': 'Month', 'year': 'Year' }[unit]];
      let abs = Math.abs(offset);
      for (let i = 0; i < abs; i++) { date = fn(date, calendarType); }
      return date;
    },
    getNextYear([year, month]) {
      return [year + 1, month, 1, 0]
    },
    getPrevYear([year, month]) {
      return [year - 1, month, 1, 0]
    },
    getNextHour([year, month, day, hour], calendarType) {
      if (hour < 23) { return [year, month, day, hour + 1] }
      let a = $$.getNextDay([year, month, day], calendarType);
      return [a[0], a[1], a[2], 0]
    },
    getPrevHour([year, month, day, hour], calendarType) {
      if (hour > 0) { return [year, month, day, hour - 1] }
      let a = $$.getPrevDay([year, month, day], calendarType);
      return [a[0], a[1], a[2], 23]
    },
    getNextDay([year, month, day, hour]) {
      if (day < $$.getMonthDaysLength({ date: [year, month] })) { return [year, month, day + 1, hour] }
      if (month < 12) { return [year, month + 1, 1, hour] }
      return [year + 1, 1, 1, hour];
    },
    getPrevDay([year, month, day, hour], calendarType) {
      if (day > 1) { return [year, month, day - 1] }
      if (month > 1) {
        month -= 1;
        day = $$.getMonthDaysLength({ date: [year, month] });
        return [year, month, day, hour];
      }
      year -= 1;
      month = 12;
      day = $$.getMonthDaysLength({ date: [year, month] });
      return [year, month, day, hour];
    },
    getNextMonth([year, month, day, hour]) { return month < 12 ? [year, month + 1, day, hour] : [year + 1, 1, 1]; },
    getPrevMonth([year, month, day, hour]) { return month > 1 ? [year, month - 1, day, hour] : [year - 1, 12, 1]; },
  }
  return {
    getDaysOfWeek: $$.getDaysOfWeek,
    getDaysOfMonth: $$.getDaysOfMonth,
    getLastDayOfMonth: $$.getLastDayOfMonth,
    getByOffset: $$.getByOffset,
    toJalali: $$.toJalali,
    toGregorian: $$.toGregorian,
    getTime: $$.getTime,
    getSplitter: $$.getSplitter,
    convertToArray: $$.convertToArray,
    compaire: $$.compaire,
    isEqual: $$.isEqual,
    isGreater: $$.isGreater,
    getDelta: $$.getDelta,
    isLess: $$.isLess,
    isBetween: $$.isBetween,
    getMonthDaysLength: $$.getMonthDaysLength,
    getWeekDay: $$.getWeekDay,
    getWeekDays: $$.getWeekDays,
    getMonths: $$.getMonths,
    getToday: $$.getToday,
    isMatch: $$.isMatch,
    getNextTime: $$.getNextTime,
    getDatesBetween: $$.getDatesBetween,
    getDateByPattern: $$.getDateByPattern
  }
}
//  getToday {calendarType,pattern}
// isMatch {matchers,date}
// getWeekDay {calnedarType,date}
// getDateOffset  getDelta({*date,otherDate,pattern}) return {day,hour,minute,second,tenthsecond}
// getByOffset getNextTime {date,offset,pattern,jalali}
// remove getPassedTime getRemainingTime
// calendarType only in getWeekDays getMonths getToday
// all functions get one object as parameter
//gregorianToJalali => toJalali ({*date,pattern})
//jalaliToGregorian => toGregorian ({*date,pattern})
//getDaysBetween removed instead use getDelta
//getMonthDaysLength ({*date})