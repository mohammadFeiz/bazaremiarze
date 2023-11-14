///***Version 1.1.16****///
//Edited: 2023-11-13

"use strict";

export default class Pricing {
    "use strict";
    //dbrequest = {};
    updateInterval = 100 * 60 * 1000; // 100min
    ndbrequest = {};
    //updateTimer = setTimeout(this.refresh, this.updateInterval);
    pricingData = {
        ItemPrices: [], DisRules: [], CampRules: [], SlpCode: {}, Customer: {}
    };
    db = {};

    constructor(fetchURL, applicator, interval = 100 * 60 * 1000) {

        this.fetchUrl = fetchURL;

        this.updateInterval = interval;
        this.applicator = applicator;
    }
    openDataBase() {
        return new Promise(function (resolve, reject) {

        });
    }
    async CreateDatabase() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.ndbrequest = window.indexedDB.open("BRXINTLayerCalcData");
            self.ndbrequest.onerror = function (event) {
                console.log("error: " + event.target.error);
                reject(event.target.error);
            };

            self.ndbrequest.onsuccess = function (event) {
                self.db = event.target.result;
                console.log("success: " + this.db);
                resolve(self.db);
            };

            self.ndbrequest.onupgradeneeded = function (event) {
                const newdb = event.target.result;
                if (newdb === undefined) {
                    console.log("error");
                    return false;
                }

                if (newdb.objectStoreNames.contains("itemPrices")) {
                    newdb.deleteObjectStore("itemPrices");
                }
                let tbitemprice = newdb.createObjectStore("itemPrices", { keyPath: 'itemid', autoIncrement: true });
                let index = tbitemprice.createIndex("itemCode_idx", "itemCode");
                index = tbitemprice.createIndex("listNums_idx", "listNums");
                index = tbitemprice.createIndex("groupCode_idx", "groupCode");
                index = tbitemprice.createIndex("canSell_idx", "canSell");

                if (newdb.objectStoreNames.contains("discountRules")) {
                    newdb.deleteObjectStore("discountRules");
                }
                let tbdisrules = newdb.createObjectStore("discountRules", { keyPath: 'disid', autoIncrement: true });
                index = tbdisrules.createIndex("cardCode_idx", "cardCode");
                index = tbdisrules.createIndex("cardgroupCode_idx", "cardgroupCode");
                index = tbdisrules.createIndex("itemCode_idx", "itemCode");
                index = tbdisrules.createIndex("itemGroupCode_idx", "itemGroupCode");
                index = tbdisrules.createIndex("validFrom_idx", "validFrom");
                index = tbdisrules.createIndex("validTo_idx", "validTo");
                index = tbdisrules.createIndex("priceList_idx", "priceList");
                index = tbdisrules.createIndex("type_idx", "type");
                if (newdb.objectStoreNames.contains("campaignRules")) {
                    newdb.deleteObjectStore("campaignRules");
                }
                let tbcamprules = newdb.createObjectStore("campaignRules", { keyPath: 'camid', autoIncrement: true });
                index = tbcamprules.createIndex("camcardCode_idx", "camcardCode");
                index = tbcamprules.createIndex("camcardgroupCode_idx", "camcardgroupCode");
                index = tbcamprules.createIndex("itemCode_idx", "itemCode");
                index = tbcamprules.createIndex("itemGroupCode_idx", "itemGroupCode");
                index = tbcamprules.createIndex("camvalidFrom_idx", "camvalidFrom");
                index = tbcamprules.createIndex("camvalidTo_idx", "camvalidTo");
                index = tbcamprules.createIndex("camSettleType_idx", "camSettleType");
                index = tbcamprules.createIndex("camSalesChannel_idx", "camSalesChannel");
                index = tbcamprules.createIndex("campaignId_idx", "campaignId");

                if (newdb.objectStoreNames.contains("slpCode")) {
                    newdb.deleteObjectStore("slpCode");
                }
                let tbapplicator = newdb.createObjectStore("slpCode", { keyPath: 'slpCodeid', autoIncrement: true });
                index = tbapplicator.createIndex("slpcode_idx", "slpCode");
                if (newdb.objectStoreNames.contains("customer")) {
                    newdb.deleteObjectStore("customer");
                }
                let tbcustomer = newdb.createObjectStore("customer", { keyPath: 'customerid', autoIncrement: true });
                index = tbapplicator.createIndex("cardcde_idx", "cardCode");

                self.db = newdb;
                resolve(newdb);
            };
        });

        ////prefixes of implementation that we want to test
        //window.indexedDB = window.indexedDB || window.mozIndexedDB ||
        //    window.webkitIndexedDB || window.msIndexedDB;

        ////prefixes of window.IDB objects
        //window.IDBTransaction = window.IDBTransaction ||
        //    window.webkitIDBTransaction || window.msIDBTransaction;
        //window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange ||
        //    window.msIDBKeyRange

        //if (!window.indexedDB) {
        //    window.alert("Your browser doesn't support a stable version of IndexedDB.")
        //}
    }

    forceFetchData() {
        return this.#fetchdata();
    }

    forceLoadData() {
        return this.#getAllFromDataBase();
    }

    async #addDataToTable(tablename, rawdata, dbid) {
        let isDone = true;
        let nrequest;
        let length = rawdata.length;
        for (let i = 0; i < length; i++) {
            nrequest = await dbid.transaction(tablename, 'readwrite')
                .objectStore(tablename)
                .put(rawdata[i]);
            if (!isDone) {
                break;
            }

            nrequest.onsuccess = function (event) {
            };

            nrequest.onerror = function (event) {
                isDone = false;
            }

        }
        return isDone;
    }

    async #fetchDataFromUrl(url) {
        const data = await fetch(url, {
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            return data;
        }).catch(function (error) {
            console.log(error);
            return null;
        });
        return data;
    }

    async #fetchdata() {
        //const url = 'https://b1api.burux.com/api/BRXIntLayer/GetCalcData';
        const data = await this.#fetchDataFromUrl(this.fetchUrl + '/' + this.applicator);
        if (data) {
            const countitem = data?.itemPrices?.length;
            const countdisrules = data?.discountRules?.length;
            const countcamprules = data?.campaignRules?.length;
            const countslp = [data?.salePeople]?.length;
            const countcustomer = [data?.customer]?.length;
            console.log(countitem + ':' + countdisrules + ':' + countcamprules + ':' + countslp + ':' + countcustomer);
            if (countitem) {
                this.pricingData.ItemPrices = data.itemPrices;
                if (await this.#clearAllDatafromTable("itemPrices", this.db).then((value) => { return value; }) === 1) {
                    this.#addDataToTable("itemPrices", data.itemPrices, this.db);
                }
                else {
                    return false;
                }
            }
            if (countdisrules) {
                this.pricingData.DisRules = data.discountRules;
                if (await this.#clearAllDatafromTable("discountRules", this.db).then((value) => { return value; }) === 1) {
                    this.#addDataToTable("discountRules", data.discountRules, this.db);
                }
                else {
                    return false;
                }
            }
            if (countcamprules) {
                this.pricingData.CampRules = data.campaignRules;
                if (await this.#clearAllDatafromTable("campaignRules", this.db).then((value) => { return value; }) === 1) {
                    this.#addDataToTable("campaignRules", data.campaignRules, this.db);
                }
                else {
                    return false;
                }
            }
            if (data?.customer) {
                this.pricingData.Customer = data.customer;
                if (await this.#clearAllDatafromTable("customer", this.db).then((value) => { return value; }) === 1) {
                    this.#addDataToTable("customer", [data.customer], this.db);
                }
                else {
                    return false;
                }
            }
            if (data?.salePeople) {
                this.pricingData.SlpCode = data.salePeople;
                if (await this.#clearAllDatafromTable("slpCode", this.db).then((value) => { return value; }) === 1) {
                    this.#addDataToTable("slpCode", [data.salePeople], this.db);
                }
                else {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    #clearAllDatafromTable(tablename, dbid) {
        return new Promise(function (resolve, reject) {
            if (dbid && dbid.objectStoreNames?.contains(tablename)) {

                let tx = dbid.transaction(tablename, 'readwrite');
                let txStore = tx.objectStore(tablename);
                let txdata = txStore.clear();
                txdata.onsuccess = function (event) {
                    resolve(1);
                }
                txdata.onerror = function (event) {
                    reject('error getting data: ' + (event.target).errorCode);
                }
            }
            else {
                resolve(1);
            }
        });
    }

    #getAllDatafromTable(tablename, dbid) {
        return new Promise(function (resolve, reject) {
            if (dbid.objectStoreNames.contains(tablename)) {

                let tx = dbid.transaction(tablename, 'readonly');
                let txStore = tx.objectStore(tablename);
                let txdata = txStore.getAll();
                txdata.onsuccess = function (event) {
                    txdata = (event.target).result;
                    resolve(txdata);
                }
                txdata.onerror = function (event) {
                    reject('error getting data: ' + (event.target).errorCode);
                }
            } else {
                reject('Cann\'t Find Store');
            }
        });
    }

    async #getAllFromDataBase() {
        let isDone = true;
        this.pricingData = { ItemPrices: [], DisRules: [], CampRules: [] };
        this.pricingData.ItemPrices = await this.#getAllDatafromTable("itemPrices", this.db)
            .then((value) => {
                return value;
            }).catch(function (error) {
                console.log(error);
                isDone = false;
                return error;
            });
        this.pricingData.DisRules = await this.#getAllDatafromTable("discountRules", this.db)
            .then((value) => {
                return value;
            }).catch(function (error) {
                console.log(error);
                isDone = false;
                return error;
            });
        this.pricingData.CampRules = await this.#getAllDatafromTable("campaignRules", this.db)
            .then((value) => {
                return value;
            }).catch(function (error) {
                console.log(error);
                isDone = false;
                return error;
            });
        this.pricingData.SlpCode = await this.#getAllDatafromTable("slpCode", this.db)
            .then((value) => {
                return value;
            }).catch(function (error) {
                console.log(error);
                isDone = false;
                return error;
            });
        this.pricingData.Customer = await this.#getAllDatafromTable("customer", this.db)
            .then((value) => {
                return value;
            }).catch(function (error) {
                console.log(error);
                isDone = false;
                return error;
            });
        return isDone;
    }

    get discountRules() {
        return this.pricingData.DisRules;
    }

    get campaignRules() {
        return this.pricingData.CampRules;

    }

    get itemPrices() {
        return this.pricingData.ItemPrices;
    }

    startservice() {
        let self = this;
        let result = new Promise(async function (resolve, reject) {
            let newdb = await self.CreateDatabase()
                .then((value) => {
                    console.log(value);
                    return value;
                })
                .catch((value) => {
                    console.log(value);
                    return value;
                });
            let resfetch = await self.#fetchdata();
            if (!resfetch) {
                resfetch = await self.#getAllFromDataBase();
            }
            self.updateTimer = setTimeout(self.refresh, self.updateInterval, self);

            resolve(resfetch);
        });
        return result;
    }

    async refresh(self) {
        console.log((new Date()) + ": update started");
        let isgotfromurl = await self.#fetchdata();
        if (!isgotfromurl) {
            let res = await self.#getAllFromDataBase();
        }
        console.log((new Date()) + ": update finished");
        self.updateTimer = setTimeout(self.refresh, this.updateInterval, self);
    }

    stopUpdate() {
        clearInterval(this.updateTimer);
    }

    startUpdate() {
        this.updateTimer = setInterval(this.refresh, this.updateInterval);
    }

    isListNumExist(ListNums, ListNumtoCheck) {
        if ((this.GetPriceFromListNum(ListNums, ListNumtoCheck)) >= 0)
            return true;
        return false;
    }

    GetPriceFromListNum(listnums, listnumtocheck) {
        let index = -1;
        let price = -1;
        if ((index = listnums.indexOf(":" + listnumtocheck + ":")) >= 0) {
            let secondindex = listnums.indexOf('{', index + 4);
            if (secondindex < 0) return null;
            let thirdindex = listnums.indexOf('}', secondindex + 1);
            if (thirdindex > secondindex) {
                price = Number(listnums.substring(secondindex + 1, thirdindex));
                if (price > 0) {
                    return price;
                }
            }
        }
        return -1;
    }

    CalcColumns(expression, BasePrice, BaseDis, FixDis, QtyDis, VolDis
        , RowDis, FixAmnt, MaxDis) {
        let res = 0;
        switch (expression) {
            case 17: //"min(MaxDis,FixDis+QtyDis+VolDis+RowDis)":
                res = Math.min(MaxDis, FixDis + QtyDis + VolDis + RowDis);
                break;
            case 20: //"(BasePrice)*((100-BaseDis)*(100-RowDis)/10000)":
                res = (BasePrice) * ((100 - BaseDis) * (100 - RowDis) / 10000);
                break;
            case 16: //"(BasePrice-FixAmnt)*(1-(BaseDis+min(MaxDis,FixDis+QtyDis+VolDis+RowDis ))/100)":
                res = (BasePrice - FixAmnt) * (1 - (Math.min(MaxDis, BaseDis + FixDis + QtyDis + VolDis + RowDis)) / 100);
                break;
            default:
                break;
        }

        return res;
    }

    GetJalali(Gdate) {
        let gdate = new Date(Gdate);
        let YYYY = gdate.getFullYear();
        let MM = gdate.getMonth() + 1;
        let DD = gdate.getDate();
        let daysMonthGregorian = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let daysMonthJalali = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
        let gy = YYYY - 1600;
        let gm = MM - 1;
        let g_day_no = 365 * gy + parseInt((gy + 3) / 4) - parseInt((gy + 99) / 100) + parseInt((gy + 399) / 400);
        let i = 0;
        for (i = 0; i < gm; ++i) {
            g_day_no += daysMonthGregorian[i];
        }
        if (gm > 1 && ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0))) {
            // leap and after Feb
            g_day_no++;
        }
        g_day_no += DD - 1;
        let j_day_no = g_day_no - 79;
        let j_np = parseInt(j_day_no / 12053); // 12053 = (365 * 33 + 32 / 4)
        j_day_no %= 12053;
        let jy = (979 + 33 * j_np + 4 * parseInt(j_day_no / 1461)); // 1461 = (365 * 4 + 4 / 4)
        j_day_no %= 1461;
        if (j_day_no >= 366) {
            jy += parseInt((j_day_no - 1) / 365);
            j_day_no = (j_day_no - 1) % 365;
        }
        for (i = 0; (i < 11 && j_day_no >= daysMonthJalali[i]); ++i) {
            j_day_no -= daysMonthJalali[i];
        }
        i++;
        j_day_no++;
        let jd = j_day_no;
        let jm = i;
        let result = {
            Name: jy + "/" + i + "/" + j_day_no,
            Year: jy,
            Month: jm,
            Day: jd
        }
        return result;
    }

    FilllineMarketing(line) {
        if (line.Price != null && line.DiscountPercent != null && line.ItemQty != null) {
            line.Gross = parseInt(line.ItemQty * line.Price / 1.09);
            line.PriceAfterDiscount = parseInt(line.Price * (1 - line.DiscountPercent / 100) / 1.09);
            line.PriceAfterVat = parseInt(line.Price * (1 - line.DiscountPercent / 100));
            line.Discount = parseInt(line.ItemQty * line.Price * line.DiscountPercent / 100 / 1.09);
            line.Vat = parseInt(line.ItemQty * line.Price * (1 - line.DiscountPercent / 100) / 1.09 * 0.09);
            line.LineTotal = parseInt(line.ItemQty * line.Price * (1 - line.DiscountPercent / 100));
        }
        return line;
    }

    ZerolineMarketing(line) {
        line.Discount = line.DiscountPercent = line.ItemQty = line.LineTotal = line.Price = 0;
        line.PriceAfterDiscount = line.Vat = line.SecondQty = 0;
        line.PriceAfterDiscount = line.Gross = line.PriceAfterVat = 0;
        line.DiscountSrc = 78;
        line.PriceSrc = 78;
        return line;
    }

    CalculateCommission(qty, commission, docdate, paydate, settleType
        , linetotal, slpcode, cardgroupcode, countsku) {
        if (qty == 0 || commission == 0 || slpcode < 1) {
            return null;
        }
        let result = {};
        // محاسبه پورسانت پایه
        result.Value = qty * commission;
        result.BaseCommission = commission;
        result.ApplyDate = new Date();
        // محاسبه تاریخ
        switch (paydate) {
            case 1:
                result.ApplyDate.setDate(docdate + 5);
                break;
            case 2:
                result.ApplyDate.setDate(docdate + 20);
                break;
            case 3:
                result.ApplyDate.setDate(docdate + 30);
                break;
            case 4:
                result.ApplyDate.setDate(docdate + 45);
                break;
            case 6:
                result.ApplyDate.setDate(docdate + 60);
                break;
            case 5:
            default:
                result.ApplyDate.setDate(docdate + 90);
                break;
        }
        if (settleType == 1) {
            result.ApplyDate = docdate;
        }

        // محاسبه عامل مشتری
        switch (cardgroupcode) {
            case 166:
                result.CGCoEff = 100;
                break;
            case 167:
                result.Value *= 0.9;
                result.CGCoEff = 90;
                break;
            case 168:
                result.Value *= 0.8;
                result.CGCoEff = 80;
                break;
            case 169:
                result.Value *= 0.7;
                result.CGCoEff = 70;
                break;
            case 170:
                result.Value *= 0.3;
                result.CGCoEff = 30;
                break;
            default:
                result.Value *= 0.9;
                result.CGCoEff = 30;
                break;
        }

        // محاسبه تعداد اقلام
        let dateresult = this.GetJalali(docdate);
        let jy = dateresult.Year;
        let jm = dateresult.Month;
        let jd = dateresult.Day;
        let skusold = 0;
        if (countsku) {
            try {
                if (countsku.StartsWith("{")) countsku = countsku.Remove(0, 1);
                if (countsku.EndsWith("}")) countsku = countsku.Remove(countsku.Length - 1);
                let skus = countsku.Split("},{");
                //if (skus.length > 0 && skus.indexOf((x) => x.indexOf(jm.ToString("0#") + ":")>-1)>-1 &&
                //    !int.TryParse(skus.Find(x => x.Contains(jm.ToString("0#") + ":")).Remove(0, 3), out skusold))
                //    skusold = 0;
                skusold = 5;
            }
            catch (error) {
                skusold = 0;
            }
        }
        result.SkuSold = skusold;
        result.Percent = parseInt(result.Value * 100 / linetotal);
        result.ExtraCommission = skusold * 1.5 / 100 * result.Value;
        result.MoreInfo = "{\"CardGroupCode\":" + cardgroupcode + ",\"CGCoEff\":" + result.CGCoEff
            + ",\"SkuSold\":" + skusold + ",\"ExtraCommission\":" + result.ExtraCommission + "}";
        return result;
    }

    CalculatePaymentDiscount(MD) {
        if (MD.marketingdetails.SettleType == null) {
            MD.marketingdetails.SettleType = 1;
        }
        if (MD.marketingdetails.PaymentTime == null) {
            MD.marketingdetails.PaymentTime = 1;
        }
        MD.marketingdetails.DocumentDiscountPercent = 0;

        if (MD.marketingdetails.PayDueDate == null) {
            MD.marketingdetails.PayDueDate = 1;
        }
        switch (parseInt(MD.marketingdetails.PayDueDate)) {
            case 1:
                MD.marketingdetails.DocumentDiscountPercent = 12;
                break;
            case 2:
                MD.marketingdetails.DocumentDiscountPercent = 10.5;
                break;
            case 3:
                MD.marketingdetails.DocumentDiscountPercent = 9;
                break;
            case 4:
                MD.marketingdetails.DocumentDiscountPercent = 7.5;
                break;
            case 6:
                MD.marketingdetails.DocumentDiscountPercent = 6;
                break;
            case 7:
                MD.marketingdetails.DocumentDiscountPercent = 4.5;
                break;
            case 8:
                MD.marketingdetails.DocumentDiscountPercent = 3;
                break;
            case 9:
                MD.marketingdetails.DocumentDiscountPercent = 1.5;
                break;
            case 10:
                MD.marketingdetails.DocumentDiscountPercent = 0;
                break;
            case 11:
                MD.marketingdetails.DocumentDiscountPercent = 0;
                break;
            case 12:
                MD.marketingdetails.DocumentDiscountPercent = 0;
                break;
            case 13:
                MD.marketingdetails.DocumentDiscountPercent = 0;
                break;
            case 15:
                MD.marketingdetails.DocumentDiscountPercent = 7.5;
                break;
            case 16:
                MD.marketingdetails.DocumentDiscountPercent = 7.5;
                break;
            case 17:
                MD.marketingdetails.DocumentDiscountPercent = 4.8;
                break;
            case 18:
                MD.marketingdetails.DocumentDiscountPercent = 3.6;
                break;
            case 19:
                MD.marketingdetails.DocumentDiscountPercent = 4.5;
                break;
            case 20:
                MD.marketingdetails.DocumentDiscountPercent = 9.3;
                break;
            case 21:
                MD.marketingdetails.DocumentDiscountPercent = 6.6;
                break;
            case 22:
                MD.marketingdetails.DocumentDiscountPercent = 3.9;
                break;
            case 23:
                MD.marketingdetails.DocumentDiscountPercent = 1.2;
                break;
            case 24:
                MD.marketingdetails.DocumentDiscountPercent = 10.5;
                break;
            case 25:
                MD.marketingdetails.DocumentDiscountPercent = 7.8;
                break;
            case 26:
                MD.marketingdetails.DocumentDiscountPercent = 6.6;
                break;
            case 27:
                MD.marketingdetails.DocumentDiscountPercent = 6.0;
                break;
            case 28:
                MD.marketingdetails.DocumentDiscountPercent = 7.2;
                break;

            case 14:
            case 5:
            default:
                MD.marketingdetails.DocumentDiscountPercent = 0;
                break;
        }

        /// اضافه شده برای تغییر تخفیف ماهانه از 3 به 4.5
        MD.marketingdetails.DocumentDiscountPercent = MD.marketingdetails.DocumentDiscountPercent * 1.5;

        if (MD.marketingdetails.DiscountList == null) {
            MD.marketingdetails.DiscountList = {};
        }
        MD.marketingdetails.DiscountList.PaymentDiscountPercent = MD.marketingdetails.DocumentDiscountPercent;
        let docSum = 0;
        if (MD.MarketingLines == null) {
            return MD;
        }
        for (let line of MD.MarketingLines) {
            docSum += line.LineTotal ?? 0;
        }
        MD.marketingdetails.DiscountList.PaymentDiscountPercent = MD.marketingdetails.DocumentDiscountPercent;
        MD.marketingdetails.DiscountList.PaymentDiscountValue = docSum * MD.marketingdetails.DocumentDiscountPercent / 100;

        MD.marketingdetails.DocumentDiscount = docSum * (MD.marketingdetails.DocumentDiscountPercent) / 100;

        if (MD.marketingdetails.DiscountList != null & docSum > 0) {
            let prom = 0;
            let extra = 0;
            if (MD.marketingdetails.DiscountList.PromotionId != null) {
                prom = MD.marketingdetails.DiscountList.PromotionValue;
                MD.marketingdetails.DiscountList.PromotionValueUsed = prom;
            }
            if (MD.marketingdetails.DiscountList.DiscountId != null) {
                extra = Math.max(0,
                    Math.min((docSum - (MD.marketingdetails?.DocumentDiscount ?? 0)) * (MD.marketingdetails?.DiscountList?.DiscountPercentage ?? 0)/100, (MD.marketingdetails?.DiscountList?.DiscountMaxValue ?? 0)
                    ));
                MD.marketingdetails.DiscountList.DiscountValueUsed = extra;
            }
            if (docSum > 0) {
                let newDisc = ((MD.marketingdetails?.DocumentDiscount ?? 0) + (prom + extra) / 1.09) / docSum * 100;
                if (newDisc >= 99) {
                    newDisc = 99;
                }
                MD.marketingdetails.DocumentDiscountPercent = newDisc;
            }
        }
        return MD;
    }

    CalculatePriceDiscount(docdate, cardcode, cardgroupcode, lines,
        listnum, Items, DisRules, marketingdetails = null, SlpCodes = null) {
        if (lines == null) {
            return null;
        }
        if (listnum == null) listnum = 2;
        if (cardcode == null) {
            cardgroupcode = 100;
        }
        if (docdate == null) {
            docdate = new Date();
        }
        const itemcodes = [];
        let itemgrpcode = -1;
        for (let item of lines) {
            if (item.ItemCode && (item.ItemQty > 0)) {
                itemcodes.push(item.ItemCode);
            }
        }
        const results = [];
        let res;
        let shortitem = [];
        let shortrules = [];
        let disctemp = [];

        shortitem = Items.filter((x) => (x.canSell)
            //      && ((GetMaxPriceFromListNum(x.ListNums) ?? -1.0) > 0)
            && itemcodes.indexOf(x.itemCode) > -1);

        for (let item of DisRules) {
            if ((item.cardCode == cardcode || item.cardGroupCode == cardgroupcode || item.priceList == listnum)
                && ((!item.validFrom || docdate >= item.validFrom) && (!item.validTo || docdate <= item.validTo))) {
                for (let item1 of shortitem) {
                    if (item1.itemCode == item.itemCode || item1.groupCode == item.itemGroupCode) {
                        shortrules.push(item);
                    }
                }

            }
        }
        //shortrules = DisRules.filter((x) => (x.cardcode == cardcode || x.cardGroupCode == cardgroupcode || x.priceList == listnum)
        //    && (shortitem.indexOf((y) => y.itemCode == x.itemCode || y.groupCode == x.itemGroupCode) > -1)
        //    && (!x.validFrom || docdate >= x.validFrom) && (!x.validTo || docdate <= x.validTo));

        for (let item of lines) {
            res = null;
            res = item;
            res.Price = 0;
            if (!res.ItemCode) {
                results.push(this.ZerolineMarketing(res));
                continue;
            }
            if (!res.ItemQty) {
                results.push(this.ZerolineMarketing(res));
                continue;
            }
            let price = null;
            if (shortitem.indexOf((x) => x.itemCode == res.ItemCode && x.noDiscount == 'Y') > -1) {
                let foundprice = -1;
                let maxprice = -1;
                for (let itemrules of shortitem) {
                    if (itemrules.itemCode == res.ItemCode
                        && (foundprice = this.GetPriceFromListNum(itemrules.listNums, listnum) > maxprice)) {
                        maxprice = foundprice;
                    }
                }
                if (maxprice <= 0) {
                    results.push(res);
                    continue;
                }
                res.Price = maxprice;
                res.DiscountPercent = 0;
                res.DiscountSrc = 'P';
                res.PriceSrc = 'P';
                results.push(this.FilllineMarketing(res));
                continue;
            }
            price = shortitem.filter((x) => x.itemCode == res.ItemCode);
            if (price != null) {
                res.SecondQty = res.ItemQty / Math.min(price[0]?.qtyinBox ?? 1, 1);
                res.UnitOfMeasure = price[0]?.saleMeasureUnit;
                res.ItemGroupCode = price[0]?.groupCode;
            }

            //Blanket Agreement
            disctemp = [];
            disctemp = shortrules.filter(x => x.type == 66 &&
                (!(cardcode) ? false : x.cardCode == cardcode) && (x.itemCode == res.ItemCode));
            if (disctemp.length > 0) {
                let temp = 0;
                let temprule;
                for (let rule of disctemp) {
                    if ((rule.price * (1 - rule.discountPercent / 100)) > temp) {
                        temp = rule.price * (1 - rule.discountPercent / 100);
                        temprule = rule;
                    }
                }
                if (temprule && temprule.price != null) {
                    res.Price = temprule.price;
                    res.DiscountPercent = temprule.discountPercent;
                    res.DiscountSrc = 66;
                    res.PriceSrc = 66;
                    results.push(this.FilllineMarketing(res));
                    continue;
                }
            }

            //Speical Price for BP
            disctemp = [];
            disctemp = shortrules.filter((x) => x.type == 83 && ((!cardcode) ? false : x.cardCode == cardcode)
                && (x.itemCode === res.ItemCode) && (x.minQty == null ? true : res.ItemQty >= x.minQty)
                && (x.maxQty == null ? true : res.ItemQty < x.maxQty));
            if (disctemp.length > 0) {
                let temprule;
                let temp = 0;
                for (let rule of disctemp) {
                    if ((rule.price * (1 - rule.discountPercent / 100)) > temp) {
                        temp = rule.price * (1 - rule.discountPercent / 100);
                        temprule = rule;
                    }
                }
                if (temprule && temprule.price != null) {
                    res.Price = temprule.price;
                    res.DiscountPercent = temprule.discountPercent;
                    res.FiscountSrc = 83;
                    res.PriceSrc = 83;
                    results.push(this.FilllineMarketing(res));
                    continue;
                }
            }

            //Finding Price

            //Period And Volume
            let havepv = false;
            let pvdisount = 0;
            disctemp = [];
            disctemp = shortrules.filter((x) => x.type == 80 && x.priceList == listnum && (x.itemCode === res.ItemCode) &&
                ((!x.minQty) ? true : res.ItemQty >= x.minQty) && ((!x.maxQty) ? true : res.ItemQty < x.maxQty));
            res.Price = null;
            if (disctemp.length > 0) {
                let temprule;
                let temp = 0;
                for (let rule of disctemp) {
                    if ((rule.price) > temp) {
                        temp = rule.price;
                        temprule = rule;
                    }
                }
                if (temprule && temprule.price != null) {
                    //Price from Period and Volume Founded
                    res.Price = temprule.price;
                    pvdisount = temprule.discountPercent;
                    havepv = true;
                }
            }

            //Finidding Price
            //Price List
            if (!havepv) {
                let shortitem1 = shortitem.filter((x) => (x.itemCode == res.ItemCode) && this.isListNumExist(x.listNums, listnum));
                if (shortitem1.length > 0) {
                    // Price List Founded
                    let foundedMax = -1;
                    let founded = -1;
                    for (let itemrule of shortitem1) {
                        if ((founded = this.GetPriceFromListNum(itemrule.listNums, listnum)) > foundedMax) {
                            foundedMax = founded;
                        }
                    }
                    res.Price = foundedMax;
                }
                if (!res.Price) {
                    //No Price is Founded
                    res.DiscountPercent = null;
                    res.DiscountSrc = 78;
                    res.PriceSrc = 78;
                    results.push(this.FilllineMarketing(res));
                    continue;
                }
            }

            //Finding Discount
            //Disount Group Code
            res.DiscountPercent = 0;
            disctemp = [];
            disctemp = shortrules.filter((x) => x.type == 68 &&
                (((!res.ItemCode) ? false : x.itemCode === res.ItemCode) || ((!res.ItemGroupCode) ? false : x.itemGroupCode == res.ItemGroupCode)) &&
                ((!x.minQty) || res.ItemQty >= x.minQty) && ((!x.maxQty) || res.ItemQty < x.maxQty));
            if (disctemp.length > 0) {
                let temprule;
                let temp = 101;
                // فقط مدل حداقل تخفیف پیاده سازی شده است. مدل ضرایب تخفیف و حداکثر هم باید پیاده سازی شود
                for (let rule of disctemp) {
                    if ((rule.discountPercent) < temp) {
                        temp = rule.discountPercent;
                        temprule = rule;
                    }
                }
                if (temprule.discountPercent != null) {
                    res.DiscountPercent = temprule.discountPercent;
                    res.DiscountSrc = 68;
                    res.PriceSrc = 65;
                    results.push(this.FilllineMarketing(res));
                    continue;
                }
            }

            if (havepv) {
                // Discount and Price founded in PV
                res.DiscountPercent = pvdisount;
                //res.DiscountSource = enDiscountRuleType.PeriodandVolume;
                res.DiscountSrc = 80;
                res.PriceSrc = 80;
                results.push(this.FilllineMarketing(res));
                continue;
            }

            // No Discount Founded
            res.DiscountPercent = 0;
            res.DiscountSrc = 90;
            res.PriceSrc = 65;
            results.push(this.FilllineMarketing(res));

        }

        // تنظیمات برای محاسبه پورسانت
        let commission = 0;
        let needcommission = true;
        let havesku = false;
        let countsku = "";
        if (!marketingdetails || marketingdetails.SlpCode == -1) {
            needcommission = false;
        }
        else {
            if (SlpCodes && SlpCodes.length > 1
                && SlpCodes.indexOf(x => x.slpCode == marketingdetails.SlpCode && (countsku = x.countSku) != null) > -1) {
                havesku = true;
            }
        }
        if (needcommission) {
            for (let item of results) {
                if (!item || !item.ItemCode || !item.ItemQty) {
                    continue;
                }

                // اضافه کردن پورسانت
                commission = 0;
                for (let itemcom of shortitem) {
                    if (itemcom.itemCode == item.ItemCode) {
                        commission = itemcom.commission;
                        let com = this.CalculateCommission(item.ItemQty, commission, docdate, marketingdetails.PayDueDate, marketingdetails.SettleType
                            , item.LineTotal, marketingdetails.SlpCode, cardgroupcode, havesku ? countsku : "");
                        if (com != null) {
                            item.LineCommission = [com];
                        }
                    }
                }
            }
        }
        return results;
    }

    CalculateDocumentByB1(MD, Items, DisRules, SlpCodes = null) {
        if (!MD.MarketingLines) {
            return MD;
        }
        if (!MD.marketingdetails) {
            MD.marketingdetails = {};
        }
        if (!MD.marketingdetails.PriceList) MD.marketingdetails.PriceList = 2;
        if (!MD.CardCode) {
            MD.CardGroupCode = 100;
        }
        if (!MD.DocTime) {
            MD.CocTime = new Date();
        }
        let results = {};
        results.MarketingLines = [];
        let res = [];
        let shortitem = [];
        let shortrules = [];
        let disctemp = [];
        //shortrules = DisRules.filter((x) => {
        //    return (x.CardCode == MD.CardCode || x.CardGroupCode == MD.CardGroupCode || x.PriceList == MD.marketingdetails.PriceList)
        //        && (x.ValidFrom == null ? true : MD.DocTime >= x.ValidFrom) && (x.ValidTo == null ? true : MD.DocTime <= x.ValidTo)
        //});
        shortrules = DisRules.filter(checkshortrules);
        function checkshortrules(disrules) {
            return (disrules.cardCode == MD.CardCode || disrules.cardGroupCode == MD.CardGroupCode || disrules.priceList == MD.marketingdetails.PriceList)
                && (!disrules.validFrom || MD.DocTime >= disrules.validFrom) && (!disrules.validTo || MD.DocTime <= disrules.validTo);
        }
        results.MarketingLines = this.CalculatePriceDiscount(MD.DocTime, MD.CardCode, MD.CardGroupCode, MD.MarketingLines
            , MD.marketingdetails.PriceList, Items, shortrules, MD.marketingdetails, SlpCodes);

        // محاسبه جمع فاکتور
        let sum = 0;
        let commission = 0;
        let extracommission = 0;
        let applydate = null;
        for (let item of results.MarketingLines) {
            if (!item || !item.ItemCode || !item.ItemQty || !item.Gross) {
                continue;
            }
            sum += item.LineTotal ?? 0;
            if (item.LineCommission) {
                for (let x of item.LineCommission) {
                    if (x.Value) {
                        commission += x.Value;
                        extracommission += x.ExtraCommission ?? 0;
                        applydate = (!applydate || (x.ApplyDate && x.ApplyDate > applydate)) ? x.ApplyDate : applydate;
                    }
                };
            }
        }
        MD.MarketingLines = results.MarketingLines;
        results = MD;
        if (commission > 0) {
            results.marketingdetails.TotalCommission = {
                Applydate: applydate,
                Value: commission,
                ExtraCommission: extracommission,
                Percent: (sum) ? parseInt(100 * commission / sum) : 0
            };
        }

        MD = this.CalculatePaymentDiscount(MD);
        this.CalculateClubPoint(MD);

        results.marketingdetails.DocumentDiscount = results.marketingdetails.DocumentDiscountPercent * sum / 100;
        results.DocumentTotal = sum - results.marketingdetails.DocumentDiscount;
        return results;
    }

    CalculateDocumentByAll(MD, Items, DisRules, campaignRules, SlpCodes = null) {
        let DocAfterB1 = MD;
        let camrule = null;

        if (MD.marketingdetails.Campaign != null && (MD.marketingdetails?.Campaign ?? null) != null
            && MD.marketingdetails.Campaign != -1) {
            for (let item of campaignRules) {
                if (item.campaignId == MD.marketingdetails.Campaign) {
                    camrule = item;
                    break;
                }
            }
            if (camrule) {
                if (camrule?.camCanHaveB1Dis ?? false) {
                    if (camrule.priceList) {
                        if (!DocAfterB1.marketingdetails) {
                            DocAfterB1.marketingdetails = {};
                        }
                        DocAfterB1.marketingdetails.PriceList = camrule.priceList;
                    }
                    DocAfterB1 = this.CalculateDocumentByB1(MD, Items, DisRules, SlpCodes)
                }
                let DocAfterCa = this.CalculatePriceDiscountByCampaign(DocAfterB1, campaignRules, false);
                return DocAfterCa;
            }
        }
        DocAfterB1 = this.CalculateDocumentByB1(MD, Items, DisRules, SlpCodes)
        return DocAfterB1;
        //    let DocAfterB1 = this.CalculateDocumentByB1(MD, Items, DisRules, SlpCodes);
        //    let DocAfterCa = this.CalculatePriceDiscountByCampaign(DocAfterB1, campaignRules, false);
        //    return DocAfterCa;
    }

    CalculatePriceDiscountByCampaign(MD, campaignRules, KeepOthers = false) {
        if (!MD || !MD.MarketingLines || !MD.marketingdetails || !MD.marketingdetails.Campaign) {
            return MD;
        }

        if (MD.marketingdetails.PriceList == null) MD.marketingdetails.PriceList = 2;
        if (MD.CardCode == null) {
            MD.CardGroupCode = 100;
        }
        if (MD.DocTime == null) {
            MD.DocTime = new Date();
        }
        let results = {};
        results = MD;
        let itemofraws = results.MarketingLines.filter((x) => x?.CampaignDetails ?? false);
        for (let item of itemofraws) {
            if (item?.CampaignDetails ?? false) { item.CampaignDetails.Status = -2; }
        };
        let shortrules = [];

        // ساخت لیست قواعد مربوط به مشتری یا گروه مشتری
        for (let itemrules of campaignRules) {
            if ((itemrules.campaignId == (MD.marketingdetails.Campaign))
                && (itemrules.camType == "B")
                && (!itemrules.camCardCode || (itemrules.camCardCode.indexOf("," + MD.CardCode + ",")) > -1)
                && (!itemrules.camCardGroupCode || (itemrules.camCardGroupCode.indexOf("," + MD.CardGroupCode + ",")) > -1)
                && (!itemrules.camValidFrom || MD.DocTime >= itemrules.camValidFrom)
                && (!itemrules.camValidTo || MD.DocTime <= itemrules.camValidTo)
                //&& (!itemrules.camSettleType || (itemrules.camSettleType == MD.marketingdetails.SettleType || itemrules.camSettleType == 2))
                && (!itemrules.camSalesChannel || (itemrules.camSalesChannel == MD.marketingdetails.SaleChannel || itemrules.camSalesChannel == 1))
            ) {
                shortrules.push(itemrules);
            }
        }
        //shortrules = campaignRules.filter((x) =>
        //    (x.campaignId == (MD.marketingdetails.campaign))
        //    && (x.camType == "B")
        //    && (!x.camCardCode || (x.camCardCode.indexOf("," + MD.cardCode + ",")) > -1)
        //    && (!x.camCardGroupCode || (x.camCardGroupCode.indexOf("," + MD.cardGroupCode + ",")) > -1)
        //    && (!x.camValidFrom || MD.docTime >= x.camValidFrom)
        //    && (!x.camValidTo || MD.docTime <= x.camValidTo)
        //    && (!x.camSettleType || (x.camSettleType == MD.marketingdetails.settleType || x.camSettleType == 2))
        //    && (!x.camSalesChannel || (x.camSalesChannel == MD.marketingdetails.saleChannel || x.camSalesChannel == 1))
        //);
        let bri = [];
        let PrssdLine = [];
        let br = {};
        // فعلا فقط پیاده سازی تعدادی انجام شده است. پیاده سازی مبلغی باید بعدا اضافه شود.
        //debugger;
        if (shortrules.length > 0) {
            let isReq = false;
            let linenum = 0;
            let maxline = 0;
            for (let item of shortrules) {
                if (item.lineisRequired) isReq = true;
                br.isReq = item.lineisRequired;
                br.eqCoEff = item.lineReqCoEff ?? 0;
                br = {};
                br.lines = [];
                br.rowNo = item.lineRowNum;
                br.qty = 0;
                br.value = 0;
                br.disQty = 0;
                br.fixedValue = item.lineFixedValue ?? 0;
                br.formula = item.lineDisRelationFormula;
                br.commissionEffect = item.commissionEffect;

                linenum = 0;
                for (let line of results.MarketingLines) {
                    if (!line) {
                        continue;
                    }
                    if (!(line?.CampaignDetails ?? false)) line.CampaignDetails = {
                        Status: -2,
                        Information: ""
                    };
                    let temp = "," + item.lineItemCode + ",";
                    if (temp.indexOf("," + line.ItemCode + ",") > -1 && !PrssdLine.indexOf(linenum) > -1) {
                        br.isExist = true;
                        PrssdLine.push(linenum);
                        br.lines.push(linenum);
                        // پردازش قواعد کمپین
                        // قاعده حداکثر تعداد
                        if (item.lineMaxReqQty != null) {
                            if (br.qty == item.lineMaxReqQty || br.isFull) {
                                line.SecondQty = 0;
                                line.CampaignDetails.Status = 0;
                                line.CampaignDetails.Information += "مقدار تقاضا شده این خط بیشتر از مقدار مجاز (" + item.lineMaxReqQty + ") است. این خط حذف میشود.";
                                line.CampaignDetails.RequestedQty = line.ItemQty;
                                //line.ItemQty = 0;
                                br.isFull = true;
                                br.status = 0;
                                //debugger;
                                if (!KeepOthers ?? false) this.ZerolineMarketing(line);
                            }
                            else if ((br.qty + line.ItemQty > item.lineMaxReqQty) && !br.isFull) {
                                line.CampaignDetails.Status = 2;
                                line.CampaignDetails.Information += "مقدار تقاضا شده این خط بیشتر از مقدار مجاز(" + item.lineMaxReqQty + ") است. حداکثر مقدار مجاز در نظر گرفته می شود.";
                                line.CampaignDetails.RequestedQty = line.ItemQty;
                                line.SecondQty = line.SecondQty * (item.lineMaxReqQty - br.qty) / line.ItemQty;
                                line.ItemQty = item.lineMaxReqQty - br.qty;
                                br.isFull = true;
                                br.qty = item.lineMaxReqQty;
                            }
                            else {
                                line.CampaignDetails.Status = 1;
                                br.qty += line.ItemQty;
                            }

                        }
                        else {
                            line.CampaignDetails.Status = 1;
                            br.qty += line.ItemQty;
                        }
                        // قواعد حداکثر مبلغ
                    }
                    linenum++;
                }

                // قاعده حداقل تعداد
                if (item.lineMinReqQty && item.lineMinReqQty != 0) {
                    if (br.qty < item.lineMinReqQty) {
                        for (let itemb1 of br.lines) {
                            if (!results.MarketingLines[itemb1].CampaignDetails) {
                                results.MarketingLines[itemb1].CampaignDetails = {};
                            }
                            results.MarketingLines[itemb1].CampaignDetails.Status = 0;
                            results.MarketingLines[itemb1].CampaignDetails.Information += "مقدار تقاضا شده این خط کمتر از مقدار مجاز (" + item.lineMinReqQty ?? 0 + ") است. این خط حذف می شود.";
                            results.MarketingLines[itemb1].CampaignDetails.RequestedQty = results.MarketingLines[itemb1].ItemQty;
                            // results.MarketingLines[itemb1].ItemQty = 0;
                            //debugger;
                            if (!KeepOthers ?? false) this.ZerolineMarketing(results.MarketingLines[itemb1]);
                        }
                        br.disQty = 0;
                        br.isExist = false;
                    }
                }
                else {
                    for (let itemb1 of br.lines) {
                        if (!results.MarketingLines[itemb1].CampaignDetails) {
                            results.MarketingLines[itemb1].CampaignDetails = {};
                        }
                        results.MarketingLines[itemb1].CampaignDetails.Status = 1;
                    }
                }
                // قاعده حداقل مبلغ
                // محاسبه تخفیف تعدادی
                if (item.lineDisPerQtyStp && item.lineDisPerQtyStp != 0) {
                    br.disQty = Math.max(item.lineMaxDisPerQty, item.lineMaxDisPrcnt,
                        (Math.ceil(br.qty / item.lineStepReqQtyl)) * item.lineDisPerQtyStp);
                }
                else {
                    br.disQty = item.lineMaxDisPrcnt;
                }


                // محاسبه تخفیف مبلغی
                br.disVol = 0;

                // محاصبه تخفیف اقلام
                linenum = 0;
                let maxline = MD.MarketingLines.length;
                for (linenum = 0; linenum < maxline; linenum++) {
                    let lineMD = MD.MarketingLines[linenum];
                    if (br.lines.indexOf(linenum) > -1)
                        if (lineMD.CampaignDetails.Status == 1 || lineMD.CampaignDetails.Status == 2
                            || (KeepOthers ?? false)) {
                            if ((item.lineBasePrice ?? 0) > 0 && (lineMD.Price ?? 0) == 0) {
                                lineMD.Price = item.lineBasePrice ?? 0;
                            } else if (!lineMD.Price) {
                                lineMD.CampaignDetails.Information += "اطلاعات قیمت کالا موجود نمی باشد.";
                                lineMD.CampaignDetails.Status = -1;
                                continue;
                            }

                            // اصلاح شود
                            let newPrice = this.CalcColumns(item.lineDisRelationId, lineMD.Price, item.camCanHaveB1Dis ? lineMD.DiscountPercent : (item.lineBaseDis ?? 0)
                                , item.lineBaseDis ?? 0, br.disQty, br.disVol ?? 0, 0, item.lineFixedValue ?? 0, Math.min(item.lineMaxDisPrcnt ?? 80, item.camMaxDisPrcnt ?? 80));
                            lineMD.DiscountPercent = Math.round(Math.max(0.0, 100.0 - newPrice / lineMD.Price * 100), 2);
                            if (item.lineFixedValue != null) lineMD.CampaignDetails.Information += "مبلغ " + item.lineFixedValue + " ریال از مبلغ قلم کالا کسر شد.";
                            results.MarketingLines[linenum] = this.FilllineMarketing(lineMD);
                        }
                        else {
                            //debugger;
                            if (!KeepOthers) this.ZerolineMarketing(lineMD);
                        }
                }
                bri.push(br);
            }
            //debugger;
            // پردازش قواعد تخفیف کل فاکتور
            // قاعده وجود کالاهای لازم
            if (isReq) {
                let sumreq = 0;
                let sumnoreq = 0;
                for (let briitem of bri) {
                    if (briitem.isReq) {
                        sumreq += briitem.reqCoEff * briitem.qty;
                    } else {
                        sumnoreq += briitem.reqCoEff * briitem.qty;
                    }
                }
                if (sumreq < sumnoreq) {
                    results.MarketingLines = MD.marketingLines;
                    for (let line of results.MarketingLines) {
                        if (line.CampaignDetails == null) { line.CampaignDetails = {}; }
                        line.CampaignDetails.Status = -1;
                        line.CampaignDetails.Information = "شرط اقلام کمپین برآورده نشده است.";
                    };
                    results.marketingdetails.DocumentDiscountPercent = 0;
                    results.marketingdetails.DocumentDiscount = 0;
                    return results;
                }
            }
            //debugger;
            // قاعده تعداد خطوط فاکتور
            let rownum = bri.filter(x => x.isExist).length;
            if (rownum > shortrules[0].camMaxRow || rownum < shortrules[0].camMinRow) {
                results.MarketingLines = MD.MarketingLines;
                for (let line of results.MarketingLines) {
                    if (!line) {
                        continue;
                    }
                    if (!line.CampaignDetails) {
                        line.CampaignDetails = {};
                    }
                    line.CampaignDetails.Status = -1;
                    line.CampaignDetails.Information = "شرط تعداد خطوط فاکتور کمپین برآورده نشده است.";
                };
                results.marketingdetails.DocumentDiscountPercent = 0;
                results.marketingdetails.DocumentDiscount = 0;
                return results;
            }
            let RowDis = rownum * shortrules[0].camRowDisPrcnt;
            if (shortrules[0].camMaxRowDisPrcnt) {
                RowDis = Math.min(shortrules[0].camMaxRowDisPrcnt ?? 0, rownum * (shortrules[0].camRowDisPrcnt ?? 0));
            }

            // قاعده مبلغ فاکتور
            let VolDis = 0;

            // محاسبه تخفیف اقلام
            // تخفیفات برای همه اقلام براساس یک فرمول محاسبه می گردد.
            let Rule = shortrules[0].camDisRelationId;
            let Fixdis = shortrules[0].camBaseDiscount ? shortrules[0].camBaseDiscount : 0;
            let MaxDis = shortrules[0].camMaxDisPrcnt ? shortrules[0].camMaxDisPrcnt : 100;
            let DocDis = this.CalcColumns(Rule, 0, 0, Fixdis, 0, VolDis, RowDis, 0, MaxDis);

            // محاسبه تغییرات پورسانت
            let CommissionEffect = 101;

            for (let x of bri) {
                if (x.commissionEffect > 0 && x.commissionEffect <= CommissionEffect) {
                    CommissionEffect = x.commissionEffect;
                }
            }
            if (CommissionEffect == 101) {
                CommissionEffect = 0;
            }
            //محاسبه جمع فاکتور و اعمال تخفیف اقلامی
            //debugger;
            let sum = 0;
            linenum = 0;
            maxline = results.MarketingLines.length;
            for (linenum = 0; linenum < maxline; linenum++) {
                let lineMD = results.MarketingLines[linenum];
                if (!lineMD) {
                    continue;
                }
                if (lineMD.CampaignDetails == null) {
                    lineMD.CampaignDetails = { Status: -2 };
                }
                if (lineMD.CampaignDetails.Status == 1
                    || lineMD.CampaignDetails.Status == 2) {
                    // اعمال تخفیف تعداد اقلام بر روی هر خط فاکتور
                    lineMD.CampaignDetails.CamDiscount = DocDis;
                    lineMD.CampaignDetails.ExDiscount = lineMD.DiscountPercent;
                    lineMD.DiscountPercent = 100 - (100 - lineMD.DiscountPercent) * (100 - DocDis) / 100;
                    lineMD = this.FilllineMarketing(lineMD);
                    sum += lineMD.LineTotal ?? 0;
                }
                else if (lineMD.CampaignDetails.Status == -2) {
                    lineMD.CampaignDetails.RequestedQty = lineMD.ItemQty;
                    if (!KeepOthers) this.ZerolineMarketing(lineMD);
                    lineMD.CampaignDetails.Information += "این قلم کالا مشمول کمپین نمی باشد.";
                }

                // محاسبه تغییرات پورسانت
                if (lineMD.LineCommission && lineMD.LineCommission.length > 0 && CommissionEffect > 0) {
                    lineMD.LineCommission[0].Value *= CommissionEffect / 100;
                    lineMD.LineCommission[0].ExtraCommission *= CommissionEffect / 100;
                    lineMD.LineCommission[0].Percent *= CommissionEffect / 100;
                }
            }

            results = this.CalculatePaymentDiscount(results);

            if (!results.marketingdetails.TotalCommission
                && results.marketingdetails.TotalCommission > 0 && CommissionEffect > 0) {
                results.marketingdetails.TotalCommission.Value *= CommissionEffect / 100;
                results.marketingdetails.TotalCommission.ExtraCommission *= CommissionEffect / 100;
                results.marketingdetails.TotalCommission.Percent *= CommissionEffect / 100;
            }

            results.marketingdetails.DocumentDiscount = results.marketingdetails.DocumentDiscountPercent * sum / 100;
            results.DocumentTotal = sum - results.marketingdetails.DocumentDiscount;
            return results;
        }
        //for (let line of results.MarketingLines) {
        //    if (!line) {
        //        continue;
        //    }
        //    line.CmpaignDetails = {
        //        Status: -2,
        //        Information: "مشمول کمپین نمی شود."
        //    };
        //};
        return results;
    }

    CalculateClubPoint(MD) {
        let result = 0;
        if (MD == null) {
            return 0;
        }
        if (MD.marketingdetails == null) {
            MD.marketingdetails = {};
        }
        if (MD.marketingdetails.PayDueDate == null) {
            MD.marketingdetails.PayDueDate = 0;
        }

        if (MD.marketingdetails.ClubPoints == null) {
            MD.marketingdetails.ClubPoints = {};
        }
        MD.marketingdetails.ClubPoints.PurchasePoint = 0;
        MD.marketingdetails.ClubPoints.CashPoint = 0;
        MD.marketingdetails.ClubPoints.CampaignPoint = 0;

        let docSum = 0;
        for (let line of MD.MarketingLines) {
            docSum += line.LineTotal ?? 0;
        }

        MD.DocumentTotal = docSum * (100 - MD.marketingdetails.DocumentDiscountPercent) / 100;

        /// امتیاز پرداخت عادی
        result += Math.floor(((MD?.DocumentTotal ?? 0) / 10000000));
        MD.marketingdetails.ClubPoints.PurchasePoint = result;

        /// امتیاز پرداخت نقدی
        let CashRate = 0;
        switch (MD.marketingdetails.PayDueDate) {
            case 1:
            case 2:
                CashRate = 100;
                break;
            case 4:
            case 6:
            case 7:
            case 8:
            case 9:
            case 5:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
            case 3:
                CashRate = 0;
                break;
            case 20:
            case 21:
            case 22:
            case 23:
                CashRate = 10;
                break;
            case 17:
            case 28:
                CashRate = 20;
                break;
            case 15:
                CashRate = 25;
                break;
            case 25:
            case 18:
                CashRate = 30;
                break;
            case 26:
                CashRate = 40;
                break;
            case 27:
            case 24:
            case 16:
            case 19:
                CashRate = 50;
                break;
            default:
                CashRate = 0;
                break;
        }
        if ((MD.marketingdetails?.PaymentTime ?? 1) == 5
            && (MD.marketingdetails?.SettleType ?? 3) == 1) {
            CashRate = 100;
        }
        let CashPoint = 2 * Math.floor(((MD?.DocumentTotal ?? 0) * CashRate / 100 / 10000000));
        MD.marketingdetails.ClubPoints.PurchasePoint = CashPoint;
        result += CashPoint;

        /// امتیاز بسته های عادی همایش
        let clubPoints =
            [

                {
                    PackCode: "2370",
                    PackName: " طرح 7 وات ",
                    ItemCode1: ["2372", "2370"],
                    Point1: 1,
                    Levels: [300, 500, 1000, 3000]
                },

                {
                    PackCode: "5320",
                    PackName: "طرح 10 وات ",
                    ItemCode1: [
                        "5322", "5320"
                    ],
                    Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ]
                },

                {
                    PackCode: "5340",
                    PackName: "طرح 12 وات ",
                    ItemCode1: [
                        "5342", "5340"
                    ],
                    Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000],

                },

                {
                    PackCode: "5330",
                    PackName: "طرح 15 وات ",
                    ItemCode1: [
                        "5332", "5330"
                    ],
                    Point1: 1,
                    Levels: [
                        150, 250, 500, 1500
                    ],
                },

                {
                    PackCode: "BIG5350",
                    PackName: "طرح 20 وات ",
                    ItemCode1: [
                        "BIG5352", "BIG5350"
                    ],
                    Point1: 1,
                    Levels: [
                        150, 250, 500, 1500
                    ],
                },

                {
                    PackCode: "BIG5390",
                    PackName: "طرح 25 وات ",
                    ItemCode1: [
                        "BIG5392", "BIG5390"
                    ], Point1: 1,
                    Levels: [
                        150, 250, 500, 1500
                    ],
                },

                {
                    PackCode: "1220",
                    PackName: "طرح اشکی 6 وات ",
                    ItemCode1: [
                        "1222", "1220"
                    ], Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ],
                },

                {
                    PackCode: "1370",
                    PackName: "طرح شمعی 7 وات ",
                    ItemCode1: [
                        "1372", "1370"
                    ], Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ],
                },

                {
                    PackCode: "3580",
                    PackName: "طرح لاینر 40 وات ",
                    ItemCode1: [
                        "3582", "3580", "3581"
                    ], Point1: 1,
                    Levels: [
                        75, 125, 250, 750
                    ],
                },

                {
                    PackCode: "8200",
                    PackName: "طرح چراغ سقفی سنسور دار",
                    ItemCode1: [
                        "8200"
                    ], Point1: 1,
                    Levels: [
                        30, 50, 100, 300
                    ],
                },

                {
                    PackCode: "3060",
                    PackName: "طرح هالوژن بدون سوکت ",
                    ItemCode1: [
                        "3062", "3060"
                    ], Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ],
                },

                {
                    PackCode: "7550",
                    PackName: "طرح پنل 8 وات ",
                    ItemCode1: [
                        "7552", "7550", "7551"
                    ], Point1: 1,
                    Levels: [
                        120, 200, 400, 1200
                    ],
                },

                {
                    PackCode: "7560",
                    PackName: "طرح پنل 15 وات ",
                    ItemCode1: [
                        "7562", "7560", "7561"
                    ], Point1: 1,
                    Levels: [
                        60, 100, 200, 600
                    ],
                },

                {
                    PackCode: "7570",
                    PackName: "طرح پنل 18 وات ",
                    ItemCode1: [
                        "7572", "7570", "7571"
                    ], Point1: 1,
                    Levels: [
                        60, 100, 200, 600
                    ],
                },

                {
                    PackCode: "7730",
                    PackName: "طرح پنل 32 وات روکار ",
                    ItemCode1: [
                        "7732", "7730", "7731"
                    ], Point1: 1,
                    Levels: [
                        36, 60, 120, 360
                    ],
                },

                {
                    PackCode: "5943",
                    PackName: "طرح لامپ رنگی 9 وات ",
                    ItemCode1: [
                        "5943", "5945", "5947", "5946", "5944"
                    ], Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ],
                },

                {
                    PackCode: "2820",
                    PackName: "طرح انعکاسی 6 وات ",
                    ItemCode1: [
                        "2822", "2820"
                    ], Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ],
                },

                {
                    PackCode: "2830",
                    PackName: "طرح انعکاسی 7 وات",
                    ItemCode1: [
                        "2832", "2830"
                    ], Point1: 1,
                    Levels: [
                        300, 500, 1000, 3000
                    ],
                },

                {
                    PackCode: "9415",
                    PackName: "طرح چسب 123  ",
                    ItemCode1: [
                        "9415"
                    ], Point1: 1,
                    Levels: [
                        75, 125, 250, 750
                    ],
                },

                {
                    PackCode: "BIG9450",
                    PackName: "طرح چسب سیلیکونی  ",
                    ItemCode1: [
                        "BIG9450"
                    ], Point1: 1,
                    Levels: [
                        84, 140, 280, 840
                    ],
                },

                {
                    PackCode: "7345",
                    PackName: "مدل سپهر تمام مس قرقره 600 متری",
                    ItemCode1: [
                        "7345"
                    ], Point1: 1,
                    Levels: [
                        1, 3, 5
                    ],
                },

                {
                    PackCode: "7344",
                    PackName: "مدل سما تمام مس قرقره 600 متری ",
                    ItemCode1: [
                        "7344"
                    ], Point1: 1,
                    Levels: [
                        1, 3, 5,
                    ],
                },

                {
                    PackCode: "BIG7838",
                    PackName: "طرح کلید مینیاتوری ",
                    ItemCode1: [
                        "BIG7838", "BIG7872", "BIG7873", "BIG7874", "BIG7875", "BIG7837", "BIG7839", "BIG7840", "BIG7841", "BIG7842", "BIG7843", "BIG7844", "BIG7845", "BIG7846"
                    ], Point1: 1,
                    Levels: [
                        120, 360, 600,
                    ],
                    ItemCode2: [
                        "BIG7838", "BIG7872", "BIG7873", "BIG7874", "BIG7875", "BIG7837", "BIG7839", "BIG7840", "BIG7841", "BIG7842", "BIG7843", "BIG7844", "BIG7845", "BIG7846"
                    ],
                    Point2: 2,
                    ItemCode3: [
                        "BIG7849", "BIG7850", "BIG7851", "BIG7852", "BIG7853", "BIG7854", "BIG7855", "BIG7856"
                    ], Point3: 3,
                    ItemCode4: [
                        "BIG7857", "BIG7858", "BIG7859", "BIG7860", "BIG7861", "BIG7862", "BIG7863", "BIG7864"
                    ],
                    Point4: 4,
                }
            ];

        if (MD.MarketingLines == null || MD.MarketingLines.length == 0) {
            return result;
        }
        for (let item of clubPoints) {
            item.TotalQty = 0;
        }
        for (let line of MD.MarketingLines) {
            if (line == null || (line?.ItemCode == null) || (line?.ItemQty ?? 0) == 0) {
                continue;
            }
            for (let item of clubPoints) {
                if (item.ItemCode1.includes(line?.ItemCode)) {
                    item.TotalQty += (line?.ItemQty ?? 0) * item.Point1;
                    break;
                }
                if (item.ItemCode2 != null && item.ItemCode2.includes(line?.ItemCode)) {
                    item.TotalQty += (line?.ItemQty ?? 0) * item.Point2;
                    break;
                }
                if (item.ItemCode3 != null && item.ItemCode3.includes(line?.ItemCode)) {
                    item.TotalQty += (line?.ItemQty ?? 0) * item.Point3;
                    break;
                }
                if (item.ItemCode4 != null && item.ItemCode4.includes(line?.ItemCode)) {
                    item.TotalQty += (line?.ItemQty ?? 0) * item.Point4;
                    break;
                }
            }
        }
        let productPoint = 0;
        let countLevel = 0;
        let i = 0;
        for (let item of clubPoints) {
            countLevel = item.Levels.length;
            for (i = countLevel - 1; i >= 0; i--) {
                if (item.TotalQty >= item.Levels[i]) {
                    break;
                }
            }
            switch (i) {
                case 0:
                    productPoint += 5;
                    break;
                case 1:
                    productPoint += 10;
                    break;
                case 2:
                    productPoint += 25;
                    break;
                case 3:
                    productPoint += 60;
                    break;
                case -1:
                default:
                    break;
            }
        }
        MD.marketingdetails.ClubPoints.CampaignPoint = productPoint;
        result += productPoint;
        return result;

    }

    GetPriceListInfo(ItemCodes, Items, DisRules, campaignRules, SlpCodes = null, CurrentDoc = null, CardCode = null
        , CardGroupCode = 100, payDueDate = 1, paymentTime = 1, settleType = 1, WhsCode = "01") {
        let result = [];
        let doctocalc = {};
        let error = null;
        //بررسی سند ورودی
        if (CurrentDoc) {
            doctocalc = CurrentDoc;
        }
        if (ItemCodes == null) {
            if (CurrentDoc.MarketingLines != null && CurrentDoc.MarketingLines.length > 0) {
                ItemCodes = [];
                for (var LineItem = 0; LineItem < CurrentDoc.MarketingLines.length; LineItem++) {
                    ItemCodes.push(CurrentDoc.MarketingLines[LineItem].ItemCode);
                }

            }
        }
        if (!doctocalc.marketingdetails)
            doctocalc.marketingdetails = {};
        if (!doctocalc.MarketingLines)
            doctocalc.MarketingLines = {};
        if (!doctocalc.marketingdetails.PayDueDate)
            doctocalc.marketingdetails.PayDueDate = payDueDate;
        if (!doctocalc.marketingdetails.PaymentTime)
            doctocalc.marketingdetails.PaymentTime = paymentTime;
        if (!doctocalc.marketingdetails.SettleType)
            doctocalc.marketingdetails.SettleType = settleType;
        if (!doctocalc.WhsCode)
            doctocalc.WhsCode = WhsCode;
        if (!doctocalc.CardCode)
            doctocalc.CardCode = CardCode;
        if (!doctocalc.CardGroupCode)
            doctocalc.CardGroupCode = CardGroupCode;
        if (!doctocalc.CardGroupCode && !doctocalc.CardCode) {
            error += "مقدار مشتری یا گروه مشتری ضروری است";
            return null;
        }

        //بررسی اینکه آیا نیاز به اعمال تخفیفات بی وان می باشد؟
        let isneedb1 = true;
        if (doctocalc.marketingdetails.Campaign) {
            let camrul = {};
            for (camrul of campaignRules)
                if (camrul.campaignId == doctocalc.marketingdetails.Campaign) {
                    isneedb1 = camrul.camCanHaveB1Dis;
                    break;
                }
        }
        //debugger;
        //محاسبه تخفیف نحوه پرداخت
        doctocalc = this.CalculatePaymentDiscount(doctocalc);
        let PaymentDic = doctocalc.marketingdetails?.DocumentDiscountPercent ?? 0;

        //ساختن اقلام سند برای محاسبه
        let onhand = null;
        let NumInsale = 1;
        let SaleMeasureUnit = "";

        for (let item of ItemCodes) {
            onhand = null;
            for (let item1 of Items) {
                if (item1.itemCode == item && item1.inventory && item1.inventory.length >= 1) {
                    SaleMeasureUnit = item1.saleMeasureUnit ?? "";
                    NumInsale = item1.numInSale ?? 1;
                    for (let iteminv of item1.inventory) {
                        if (iteminv.whsCode == doctocalc.WhsCode && iteminv.qtyLevRel) {
                            onhand = iteminv;
                        }
                    }
                    break;
                }
            }
            result.push({
                ItemCode: item,
                OnHand: onhand,
                SalesMeasureUnit: SaleMeasureUnit,
                NumInSale: NumInsale,
            });
            let isfound = 0;
            for (let item1 of doctocalc.MarketingLines) {
                if (item1.ItemCode == item) {
                    isfound = 1;
                    break;
                }
            }
            if (!isfound) {
                doctocalc.MarketingLines.push({
                    ItemCode: item,
                    ItemQty: 1,
                });
            }

        }

        let DocAfterB1 = doctocalc;
        // محاسبه قیمت و تخفیف در بی وان
        if (isneedb1) {
            DocAfterB1 = this.CalculateDocumentByB1(doctocalc, Items, DisRules, SlpCodes);

            if (DocAfterB1 == null || DocAfterB1.MarketingLines == null) {
                error += "خطا در محاسبه تخفیفات در بی وان";
                return null;
            }

            let lp = {};
            for (let item of DocAfterB1.MarketingLines) {
                lp = {};
                for (let itemresult of result) {
                    if (itemresult.ItemCode == item.ItemCode) {
                        lp = itemresult;
                        lp.Price = item.Price ?? 0;
                        lp.B1Dscnt = item.DiscountPercent ?? 0;
                        lp.FinalPrice = parseInt(item.PriceAfterVat ?? 0);
                        lp.PymntDscnt = PaymentDic;
                        lp.CmpgnDscnt = 0;
                    }
                }
            }
        }

        //بررسی متد کمپین
        if (doctocalc.marketingdetails?.Campaign) {
            let DocAfterCa = this.CalculatePriceDiscountByCampaign(DocAfterB1, campaignRules, true);
            let lp = {};
            for (let item of DocAfterCa.MarketingLines) {
                lp = {};
                for (let itemresult of result) {
                    if (itemresult.ItemCode == item.ItemCode) {
                        lp = itemresult;
                        lp.Price = item.Price ?? 0;
                        lp.FinalPrice = parseInt(item.PriceAfterVat ?? 0);
                        lp.PymntDscnt = PaymentDic;
                        lp.CmpgnDscnt = 100 - (100 - item.DiscountPercent ?? 0) / (100 - lp.B1Dscnt) * 100;
                    }
                }
            }
        }

        for (let item of result) {
            item.FinalPrice = parseInt((item.FinalPrice ?? 0) * (1 - (item.PymntDscnt ?? 0) / 100));
        }

        return result;
    }

    CaseDownPropOfDoc(MD) {
        let newMD = {};
        let newpropname = "";
        for (let prop in MD) {
            newpropname = prop.substring(0, 1).toLowerCase() + prop.substring(1);
            if (Array.isArray(MD[prop])) {
                let newarray = [];
                for (let j of MD[prop]) {
                    newarray.push(this.CaseDownPropOfDoc(j))
                }
                newMD[newpropname] = newarray;
            } else if (typeof MD[prop] == 'object') {
                newMD[newpropname] = this.CaseDownPropOfDoc(MD[prop]);
            } else {
                newMD[newpropname] = MD[prop];
            }
        }
        return newMD;
    }

    CaseUpPropOfDoc(MD) {
        let newMD = {};
        let newpropname = "";
        for (let prop in MD) {
            newpropname = prop.substring(0, 1).toUpperCase() + prop.substring(1);
            if (prop.toLowerCase() == 'marketingdetails') {
                newpropname = prop;
            }
            if (Array.isArray(MD[prop])) {
                let newarray = [];
                for (let j of MD[prop]) {
                    newarray.push(this.CaseDownPropOfDoc(j))
                }
                newMD[newpropname] = newarray;
            } else if (typeof MD[prop] == 'object') {
                newMD[newpropname] = this.CaseDownPropOfDoc(MD[prop]);
            } else {
                newMD[newpropname] = MD[prop];
            }
        }
        return newMD;
    }

    autoCalcDoc(Doc) {
        let MD = Doc;// this.CaseDownPropOfDoc(Doc);
        let newdoc = this.CalculateDocumentByAll(MD, this.pricingData.ItemPrices, this.pricingData.DisRules, this.pricingData.CampRules, [this.pricingData.SlpCode]);
        return newdoc;// this.CaseUpPropOfDoc(newdoc);

    }

    autoPriceList(ItemCodes, CurrentDoc = null, CardCode = null
        , CardGroupCode = 100, payDueDate = 1, paymentTime = 1, settleType = 1, WhsCode = "01") {
        let MD = CurrentDoc; // this.CaseDownPropOfDoc(CurrentDoc);
        let newdoc = this.GetPriceListInfo(ItemCodes, this.pricingData.ItemPrices, this.pricingData.DisRules, this.pricingData.CampRules
            , [this.pricingData.SlpCode], MD, CardCode, CardGroupCode, payDueDate, paymentTime, settleType, WhsCode);
        return newdoc;// this.CaseUpPropOfDoc(newdoc);
    }
}
