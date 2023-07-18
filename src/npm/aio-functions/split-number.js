export default function SplitNumber(price, count = 3, splitter = ',') {
    if (!price) { return price }
    let str = price.toString()
    let dotIndex = str.indexOf('.');
    if (dotIndex !== -1) {
      str = str.slice(0, dotIndex)
    }
    let res = ''
    let index = 0;
    for (let i = str.length - 1; i >= 0; i--) {
      res = str[i] + res;
      if (index === count - 1) {
        index = 0;
        if (i > 0) { res = splitter + res; }
      }
      else { index++ }
    }
    return res
  }