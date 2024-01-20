import React, { Component, createContext, useState, useEffect, useContext } from "react";
import RVD from './npm/react-virtual-dom/react-virtual-dom';
import { Icon } from '@mdi/react';
import { mdiClose, mdiPlusThick, mdiChevronDown, mdiChevronLeft, mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline, mdiImageOutline, mdiTextBoxEditOutline, mdiArrowUp, mdiArrowDown, mdiArrowLeftBold, mdiAccountSync, mdiEye, mdiCellphoneMarker, mdiContentSave, mdiDelete, mdiDotsHorizontal, mdiImage, mdiPhone, mdiAccount, mdiArchive, mdiTag, mdiListBox } from '@mdi/js';
import appContext from "./app-context";
import AIOInput from './npm/aio-input/aio-input';
import AIOStorage from 'aio-storage';
import AIOPopup from './npm/aio-popup/aio-popup';
import './back-office-panel.css';
import { I_AIOService_class, I_ShopProps, I_app_state, I_backOffice_accessPhoneNumber, I_backOffice_content, I_backOffice_versions, I_backOffice_vitrinCategory, I_spreeCategory, I_state_backOffice } from "./types";
const BackOfficeContext = createContext({} as I_BackOfficeContext);

type I_BackOfficeContext = {
  model: I_state_backOffice,
  setModel: (key: string, value: any) => void,
  removeImage: Function,
  apis: I_AIOService_class,
  currentVersions: I_backOffice_versions,
  tabs: I_BackOffice_tab[],
  update: (model: I_state_backOffice) => void
}
type I_BackOffice_tab = { text: string, value: string, show: boolean }
type I_BackOffice = {
  model: I_state_backOffice,
  phoneNumber: string
}
type I_BackOffice_tabName = 'appsetting' | 'spreeManagement' | 'contentManagement' | 'priceList' | 'vitrinSuggestion'
export default function BackOffice(props: I_BackOffice) {
  let { rsa, apis }: I_app_state = useContext(appContext);
  let { phoneNumber } = props;
  let [model, setModel] = useState<I_state_backOffice>(fixInitialModel(props.model))
  let [currentVersions] = useState<I_backOffice_versions>(props.model.versions)
  let [tabs, setTabs] = useState(getTabs(props.model))
  let [tab, setTab] = useState<I_BackOffice_tabName>('appsetting')
  function fixInitialModel(model: I_state_backOffice) {
    let bo:I_state_backOffice = {
      "activeManager": {
        "garanti": false,
        "bazargah": true,
        "wallet": false,
        "vitrin": true,
        "priceList": true
      },
      "bazargah": {
        "forsate_ersale_sefareshe_bazargah": 1440,
        "forsate_akhze_sefareshe_bazargah": 1440
      },
      "colors": {
        "آفتابی": "#ffd100",
        "مهتابی": "#66b6ff",
        "یخی": "#f9ffd6",
        "سبز": "green",
        "قرمز": "red",
        "آبی": "blue",
        "نارنجی": "orange"
      },
      "PayDueDate_options": [
        {
          "value": 1,
          "discountPercent": 12,
          "cashPercent": 100,
          "days": 0,
          "_id": "ailr4034204",
          "text": "100% نقد",
          "id": "t744534"
        },
        {
          "value": 2,
          "discountPercent": 1,
          "cashPercent": 0,
          "days": 15,
          "_id": "ailr8775416",
          "text": "0% نقد - %100 چک 0.5 ماهه",
          "id": "t484909"
        },
        {
          "value": 3,
          "discountPercent": 1,
          "cashPercent": 0,
          "days": 30,
          "_id": "ailr829493",
          "text": "%100 چک 1.0 ماهه",
          "id": "t597582"
        },
        {
          "value": 4,
          "cashPercent": 0,
          "days": 45,
          "_id": "ailr5645186",
          "discountPercent": 1,
          "text": "%100 چک 1.5 ماهه",
          "id": "t782845"
        },
        {
          "value": 6,
          "discountPercent": 6,
          "cashPercent": 0,
          "days": 60,
          "_id": "ailr2199566",
          "text": "%100 چک 2.0 ماهه",
          "id": "t820939"
        },
        {
          "value": 7,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 70,
          "_id": "ailr386793",
          "text": "%100 چک 2.3 ماهه",
          "id": "t405528"
        },
        {
          "value": 8,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 90,
          "_id": "ailr9345294",
          "text": "%100 چک 3.0 ماهه",
          "id": "t428721"
        },
        {
          "value": 9,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 105,
          "_id": "ailr9024099",
          "text": "%100 چک 3.5 ماهه",
          "id": "t334720"
        },
        {
          "value": 10,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 120,
          "_id": "ailr6377030",
          "text": "%100 چک 4.0 ماهه",
          "id": "t905884"
        },
        {
          "value": 11,
          "cashPercent": 0,
          "days": 135,
          "_id": "ailr6950669",
          "text": "%100 چک 4.5 ماهه",
          "discountPercent": 1.2,
          "id": "t211153"
        },
        {
          "value": 12,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 150,
          "_id": "ailr4951698",
          "text": "%100 چک 5.0 ماهه",
          "id": "t864874"
        },
        {
          "value": 13,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 165,
          "_id": "ailr1345481",
          "text": "%100 چک 5.5 ماهه",
          "id": "t595836"
        },
        {
          "value": 14,
          "discountPercent": 0,
          "cashPercent": 0,
          "days": 180,
          "_id": "ailr3992319",
          "text": "%100 چک 6.0 ماهه",
          "id": "t615139"
        },
        {
          "value": 15,
          "discountPercent": 7.5,
          "cashPercent": 25,
          "days": 60,
          "_id": "ailr2104887",
          "text": "25% نقد - %75 چک 2.0 ماهه",
          "id": "t912413"
        },
        {
          "value": 16,
          "discountPercent": 7.5,
          "cashPercent": 50,
          "days": 90,
          "_id": "ailr6282583",
          "text": "50% نقد - %50 چک 3.0 ماهه",
          "id": "t663101"
        },
        {
          "value": 17,
          "discountPercent": 4.8,
          "cashPercent": 20,
          "days": 90,
          "_id": "ailr9771838",
          "text": "20% نقد - %80 چک 3.0 ماهه",
          "id": "t880722"
        },
        {
          "value": 18,
          "discountPercent": 3.6,
          "cashPercent": 30,
          "days": 120,
          "_id": "ailr9494876",
          "text": "30% نقد - %70 چک 4.0 ماهه",
          "id": "t892373"
        },
        {
          "value": 19,
          "discountPercent": 4.5,
          "cashPercent": 50,
          "days": 150,
          "_id": "ailr9916837",
          "text": "50% نقد - %50 چک 5.0 ماهه",
          "id": "t925745"
        },
        {
          "value": 20,
          "discountPercent": 9.3,
          "cashPercent": 10,
          "days": 30,
          "_id": "ailr9254284",
          "text": "10% نقد - %90 چک 1.0 ماهه",
          "id": "t186578"
        },
        {
          "value": 21,
          "discountPercent": 6.6,
          "cashPercent": 10,
          "days": 60,
          "_id": "ailr4346046",
          "text": "10% نقد - %90 چک 2.0 ماهه",
          "id": "t325778"
        },
        {
          "value": 22,
          "discountPercent": 3.9,
          "cashPercent": 10,
          "days": 90,
          "_id": "ailr9704507",
          "text": "10% نقد - %90 چک 3.0 ماهه",
          "id": "t334977"
        },
        {
          "value": 23,
          "discountPercent": 1.2,
          "cashPercent": 10,
          "days": 120,
          "_id": "ailr3078233",
          "text": "10% نقد - %90 چک 4.0 ماهه",
          "id": "t260458"
        },
        {
          "value": 24,
          "discountPercent": 15.75,
          "cashPercent": 50,
          "days": 30,
          "_id": "ailr4525497",
          "text": "50% نقد - %50 چک 1.0 ماهه",
          "id": "t413507"
        },
        {
          "value": 25,
          "discountPercent": 7.8,
          "cashPercent": 30,
          "days": 60,
          "_id": "ailr8480885",
          "text": "30% نقد - %70 چک 2.0 ماهه",
          "id": "t361331"
        },
        {
          "value": 26,
          "discountPercent": 6.6,
          "cashPercent": 40,
          "days": 90,
          "_id": "ailr5951824",
          "text": "40% نقد - %60 چک 3.0 ماهه",
          "id": "t366295"
        },
        {
          "value": 27,
          "discountPercent": 6,
          "cashPercent": 50,
          "days": 120,
          "_id": "ailr6542826",
          "text": "50% نقد - %50 چک 4.0 ماهه",
          "id": "t406657"
        },
        {
          "value": 28,
          "discountPercent": 10.8,
          "cashPercent": 20,
          "days": 60,
          "_id": "ailr2353385",
          "text": "20% نقد - %80 چک 2.0 ماهه",
          "id": "t498204"
        },
        {
          "value": 38,
          "discountPercent": 7.2,
          "cashPercent": 40,
          "days": 120,
          "_id": "ailr2459919",
          "text": "40% نقد - %60 چک 4.0 ماهه",
          "id": "t108649"
        },
        {
          "value": 37,
          "discountPercent": 8.55,
          "cashPercent": 30,
          "days": 90,
          "_id": "ailr5152734",
          "text": "30% نقد - %70 چک 3.0 ماهه",
          "id": "t474925"
        }
      ],
      "PaymentTime_options": [
        {
          "value": 5,
          "text": "اینترنتی",
        },
        {
          "value": 1,
          "text": "واریز قبل ارسال",
        },
        {
          "value": 2,
          "text": "واریز پای بار",
        }
      ],
      "DeliveryType_options": [
        {
          "value": 11,
          "text": "ماشین توزیع بروکس",
        },
        {
          "value": 12,
          "text": "ماشین اجاره ای",
        },
        {
          "value": 13,
          "text": "باربری",
        },
        {
          "value": 14,
          "text": "پخش گرم",
        },
        {
          "value": 15,
          "text": "ارسال توسط ویزیتور",
        },
        {
          "text": "",
          "value": ""
        },
        {
          "text": "",
          "value": ""
        }
      ],
      "Regular": {
        "active": true,
        "shopName": "خرید عادی",
        "PayDueDate": 1,
        "PaymentTime": 1,
        "DeliveryType": 11,
        "PayDueDates": [1,20,21,17,18,23,22,16,15,19,6],
        "PaymentTimes": [1,2,5],
        "DeliveryTypes": [12,13,15,11],
        "shopId": "Regular",
        "CampaignId": 0
      },
      "Bundle": {
        "active": true,
        "shopName": " فروش ویژه بسته های زمستان 1402",
        "PayDueDate": 1,
        "DeliveryType": 11,
        "PaymentTime": 1,
        "PaymentTimes": [1,5,2],
        "PayDueDates": [1,19,20,21,18,17],
        "DeliveryTypes": [11,12,13,15],
        "shopId": "Bundle",
        "billboard": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=b028f502-22b5-4178-9a22-b2cae1dbbeb3.png",
        "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=374b42ef-3528-475a-b80a-342580b367ac.png",
        "CampaignId": 51,
        "description": "فروش ویژه بسته های زمستان 1402\n\n🔹 شامل 8 کالا میباشد \n\n🔸 تمامی کالا ها در بسته های 3 ، 5 ، 10 کارتن قابل فروش میباشند . \n\n🔹 بسته های ‍3 کارتنی 3 % ،\n     بسته های 5 کارتنی 5 % \n    بسته های 10 کارتنی 7%\nشامل تخفیف مازاد میشوند .\n\n🔸گروه مشتری در این طرح اعمال نمیشود .\n\n🔹 تمامی قیمت ها با درصد تخفیف نقد نمایش داده شده است.\n\n"
      },
      "spreeCampaigns": [
        {
          "shopId": "10776",
          "shopName": "کالا های منتخب (ویژه همایش)",
          "billboard": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=c1b94b80-03f5-4b05-9675-5d98890978ca.png",
          "CampaignId": 48,
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=fc7d7dbb-76e3-4c07-8f5b-ef604bce66e7.png",
          "active": false,
          "PayDueDates": [
            1,
            20,
            21,
            17,
            18,
            19
          ],
          "PaymentTime": 1,
          "DeliveryTypes": [
            11,
            12,
            13,
            15
          ],
          "PaymentTimes": [
            1,
            5
          ],
          "PayDueDate": 1,
          "DeliveryType": 11
        },
        {
          "shopId": "10818",
          "shopName": " طرح اقلامی زمستان 1402 (69گروه)",
          "billboard": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=3639760b-b1e3-4b68-85f7-8c9e8f5739fc.jpg",
          "CampaignId": 52,
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=84337edf-bb4a-4a0f-9c86-87b21a5190d8.jpg",
          "active": true,
          "PayDueDates": [1,17,18,19,20,21],
          "PayDueDate": 1,
          "DeliveryTypes": [11,13,15],
          "PaymentTimes": [5,1,2],
          "PaymentTime": 5,
          "DeliveryType": 11,
          "description": "\nطرح اقلامی زمستان 1402 \nاین طرح شامل 69 گروه میباشد \nبا خرید از هر گروه به شما بصورت مازاد تخفیف 0.5 % تعلق میگیرد . \n(بطور مثال با خرید 3 گروه کالا ، 1.5 درصد تخفیف مازاد روی هر کالا دریافت خواهید کرد ). \n\nبرای هر گروه سقف و کف در نظر گرفته ایم که در پایین هر گروه نمایش داده میشود \n\nسقف هر گروه 15 برابر کف آن میباشد .\n\n🔹همچنین در این طرح گروه مشتری اعمال میشود"
        }
      ],
      "landing": [
        {
          "type": "image",
          "url": "https://retailerapp.bbeta.ir/api/v1/backoffice/GetImage?imageName=e8b6f652-80dd-418f-874e-4e42e8fc7ab7.png",
          "id": "bo_image_9778531",
          "active": true,
          "linkTo": "bottomMenu_kharid"
        },
        {
          "type": "image",
          "url": "https://retailerapp.bbeta.ir/api/v1/backoffice/GetImage?imageName=7e391347-f884-4a4b-a72c-39a79c767072.png",
          "linkTo": "",
          "id": "bo_image_5416420",
          "active": true
        },
        {
          "type": "image",
          "url": "https://retailerapp.bbeta.ir/api/v1/backoffice/GetImage?imageName=7f73769a-88a4-4b82-8102-dc4237688933.png",
          "linkTo": "",
          "id": "bo_image_8613749",
          "active": true
        },
        {
          "type": "description",
          "text": "این روزها که شاهد گرونی های روزافزون و کاهش قدرت خرید هستیم، شرکت بروکس با در نظر گرفتن شرایط اقتصادی فعلی جامعه و نرخ تورم سعی در کمک به کسب و کار الکتریکی ها داره. برای همین طی مذاکرات و تصمیم گیری ها، در نظر گرفتیم تمامی محصولات روشنایی و الکتریکی خود را با 25 الی 30 درصد زیر قیمت به فروش برسونیم!",
          "linkTo": "",
          "id": "bo_image_8275190",
          "active": true
        },
        {
          "type": "image",
          "url": "https://retailerapp.bbeta.ir/api/v1/backoffice/GetImage?imageName=802a6b56-c106-488e-a0f5-3135b24a6ded.png",
          "linkTo": "",
          "id": "bo_image_6233115",
          "active": true
        },
        {
          "type": "label",
          "text": "لامپ 10 وات بروکس فقط 20 هزارتومن!",
          "linkTo": "",
          "id": "bo_image_9558052",
          "active": true
        },
        {
          "type": "description",
          "text": "هدیه ما به شما در بازار می ارزه خرید لامپ 10 وات با قیمت استثنایی!\n  شما میتوانید حداکثر 2 کارتن لامپ 10 وات را با قیمت 20 هزار تومان خریداری کنید! یعنی 4 میلیون ریال هدیه ما به شما!\n  این فرصت بی نظیر را از دست ندهید!",
          "linkTo": "",
          "id": "bo_image_9430143",
          "active": true
        },
        {
          "type": "billboard",
          "url": "",
          "id": "bo_image_653505",
          "active": true,
          "linkTo": ""
        }
      ],
      "homeContent": [
        {
          "type": "image",
          "url": "https://retailerapp.bbeta.ir/api/v1/backoffice/GetImage?imageName=4082762a-cb07-4be3-8890-ece87ccf7fb1.png",
          "linkTo": "openPopup_priceList",
          "id": "bo_image_7748843",
          "active": true
        },
        {
          "type": "billboard",
          "url": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=746efe53-14d8-48a8-95a9-964b2b82b6b0.gif",
          "id": "bo_image_3784384",
          "active": true,
          "linkTo": "bottomMenu_vitrin"
        },
        {
          "type": "billboard",
          "url": "https://retailerapp.bbeta.ir/api/v1/backoffice/GetImage?imageName=ceb861eb-46ce-4a8e-8eb5-ab2f731cf0e2.jpg",
          "id": "bo_image_1933473",
          "active": true,
          "linkTo": "openPopup_priceList"
        }
      ],
      "active_landing": false,
      "spreeCategories": [
        {
          "id": "10709",
          "name": "روشنایی",
          "billboard": "",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=56a7723b-d721-4c46-825a-621958efecd2.png",
          "showType": "icon",
          "active": true
        },
        {
          "id": "10711",
          "name": "آویزها",
          "billboard": "",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=e6a6740e-8856-4d8a-bfaf-419082b9abe8.png",
          "showType": "icon",
          "active": true
        },
        {
          "id": "10713",
          "name": "ابزار ",
          "billboard": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=064f1cb6-25de-4387-a669-fbec4eef7e6c.png",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=8990bbd4-632c-48f7-b825-cf387b60cea0.png",
          "showType": "icon",
          "active": true
        },
        {
          "id": "10714",
          "name": "فیوز",
          "billboard": "",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=0a9d188a-049c-43d0-933f-7878ff90f151.png",
          "showType": "icon",
          "active": true
        },
        {
          "id": "10732",
          "name": "سیم و کابل",
          "billboard": "",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=5c216605-f263-4df9-94ce-fee2888e8cf8.png",
          "showType": "icon",
          "active": true
        },
        {
          "id": "10715",
          "name": "محصولات جدید",
          "billboard": "",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=3263dbd8-e206-40ef-80d3-3b7eecc10c04.jpg",
          "showType": "slider",
          "active": true
        },
        {
          "id": "10734",
          "name": "باتری",
          "billboard": "",
          "icon": "https://apimy.burux.com/api/v1/backoffice/GetImage?imageName=1f1e84a0-1898-4ed4-80a7-9a791759e603.png",
          "showType": "icon",
          "active": true
        }
      ],
      "active_homeContent": false,
      "versions": {
        "login": 22,
        "taxonProducts": 1,
        "cart": 23,
        "all": 18
      },
      "accessPhoneNumbers": [
        {
          "phoneNumber": "09123534314",
          "access": {
            "shippingOptions": true,
            "spreeManagement": true,
            "priceList": true,
            "contentManagement": true,
            "appsetting": true,
            "accessmanagement": true,
            "vitrinSuggestion": true,
            "vitrinCategories": true
          },
          "name": "محمد شریف فیض"
        },
        {
          "phoneNumber": "09130064002",
          "access": {
            "shippingOptions": true,
            "spreeManagement": true,
            "priceList": true,
            "contentManagement": true,
            "appsetting": true,
            "accessmanagement": false,
            "vitrinSuggestion": true,
            "vitrinCategories": true
          },
          "name": "دانیال عنایتی"
        },
        {
          "phoneNumber": "09360936123",
          "access": {
            "shippingOptions": true,
            "spreeManagement": false,
            "priceList": false,
            "contentManagement": false,
            "appsetting": false,
            "accessmanagement": false
          },
          "name": "شهاب الدین قلی"
        },
        {
          "phoneNumber": "09127335782",
          "access": {
            "shippingOptions": false,
            "spreeManagement": false,
            "priceList": true,
            "contentManagement": false,
            "appsetting": false,
            "accessmanagement": false
          },
          "name": "ساناز حسن زاده"
        },
        {
          "phoneNumber": "09129527427",
          "access": {
            "shippingOptions": false,
            "spreeManagement": false,
            "priceList": true,
            "contentManagement": false,
            "appsetting": false,
            "accessmanagement": false,
            "vitrinSuggestion": false
          },
          "name":""
        },
        {
          "phoneNumber": "09391090888",
          "access": {
            "shippingOptions": true,
            "spreeManagement": true,
            "priceList": true,
            "contentManagement": false,
            "appsetting": true,
            "accessmanagement": false,
            "vitrinSuggestion": true
          },
          "name":""
        },
        {
          "phoneNumber": "09120422043",
          "access": {
            "shippingOptions": true,
            "spreeManagement": true,
            "priceList": true,
            "contentManagement": true,
            "appsetting": true,
            "accessmanagement": false,
            "vitrinSuggestion": true
          },
          "name": "صدف حبیبی"
        },
        {
          "phoneNumber": "09930442794",
          "access": {
            "shippingOptions": false,
            "spreeManagement": false,
            "priceList": false,
            "contentManagement": false,
            "appsetting": true,
            "accessmanagement": false,
            "vitrinCategories": true,
            "vitrinSuggestion": true
          },
          "name":""
        },
        {
          "phoneNumber": "09914400789",
          "access": {
            "shippingOptions": false,
            "spreeManagement": false,
            "priceList": false,
            "contentManagement": false,
            "appsetting": false,
            "accessmanagement": false,
            "vitrinSuggestion": true
          },
          "name": "شایان صفدری"
        }
      ],
      "vitrinCategories": [
        {
          "name": "محصولات روشنایی",
          "id": 10674,
          "open": true,
          "childs": [
            {
              "name": "لوستر و چراغ آویز",
              "id": 10940,
              "open": true,
              "childs": []
            },
            {
              "name": "لامپ",
              "id": 10694,
              "open": true,
              "childs": [
                {
                  "name": "لامپ حبابی",
                  "id": 10695,
                  "open": true,
                  "childs": []
                },
                {
                  "name": "مهتابی ال ای دی/براکت",
                  "id": 11226,
                  "open": true,
                  "childs": []
                },
                {
                  "name": "لامپ اشکی و شمعی",
                  "id": 10696,
                  "open": true,
                  "childs": []
                },
                {
                  "name": "لامپ استوانه ای",
                  "id": 11221,
                  "open": true,
                  "childs": []
                },
                {
                  "name": "لامپ کم مصرف",
                  "id": 11225,
                  "open": true,
                  "childs": []
                }
              ]
            },
            {
              "name": "چراغ",
              "id": 10677,
              "open": true,
              "childs": []
            },
            {
              "name": "پنل سقفی",
              "id": 10680,
              "open": true,
              "childs": []
            },
            {
              "name": "چراغ سقفی",
              "id": 11232,
              "open": true,
              "childs": []
            },
            {
              "name": "ریسه",
              "id": 10681,
              "open": true,
              "childs": []
            }
          ]
        },
        {
          "name": "لوازم الکتریکی",
          "id": 10949,
          "open": true,
          "childs": [
            {
              "name": "محافظ جان",
              "id": 10952,
              "open": true,
              "childs": []
            },
            {
              "name": "هواکش",
              "id": 10966,
              "open": true,
              "childs": []
            },
            {
              "name": "فیوز",
              "id": 10951,
              "open": true,
              "childs": []
            },
            {
              "name": "سیم و کابل",
              "id": 11259,
              "open": true,
              "childs": []
            },
            {
              "name": "چسب برق",
              "id": 11340,
              "open": true,
              "childs": []
            },
            {
              "name": "محافظ و چندراهی",
              "id": 10875,
              "open": true,
              "childs": []
            }
          ]
        },
        {
          "name": "ابزارآلات و تجهیزات",
          "id": 10857,
          "open": true,
          "childs": [
            {
              "name": "ابزار دستی",
              "id": 10858,
              "open": true,
              "childs": []
            },
            {
              "name": "ابزار برقی ، شارژی و بادی",
              "id": 10970,
              "open": true,
              "childs": []
            },
            {
              "name": "لوازم جانبی ابزار",
              "id": 11037,
              "open": true,
              "childs": []
            }
          ]
        },
        {
          "name": "محافظ و چندراهی",
          "id": 10875,
          "open": true,
          "childs": []
        },
        {
          "name": "کالای دیجیتال",
          "id": 10992,
          "open": true,
          "childs": [
            {
              "name": "اسپیکر و سیستم صوتی",
              "id": 11161,
              "open": true,
              "childs": []
            },
            {
              "name": "پاور بانک",
              "id": 11203,
              "open": true,
              "childs": []
            },
            {
              "name": "هارد دیسک و ssd",
              "id": 11346,
              "open": true,
              "childs": []
            },
            {
              "name": "لوازم جانبی دیجیتال",
              "id": 10993,
              "open": true,
              "childs": [
                {
                  "name": "لوازم جانبی لپ تاپ و کامپیوتر",
                  "id": 10995,
                  "open": true,
                  "childs": []
                },
                {
                  "name": "لوازم جانبی موبایل",
                  "id": 10994,
                  "open": true,
                  "childs": []
                }
              ]
            }
          ]
        },
        {
          "name": "لوازم خانگی",
          "id": 10963,
          "open": true,
          "childs": []
        }
      ]
    }
    return bo
  }
  function getTabs(model) {
    let tabs = ['appsetting', 'spreeManagement', 'contentManagement', 'priceList', 'vitrinSuggestion']
    let dic = {
      'appsetting': 'تنظیمات',
      'spreeManagement': 'اسپری',
      'contentManagement': 'محتوی',
      'priceList': 'لیست قیمت',
      'vitrinSuggestion': 'پیشنهاد ویترین'
    }
    return tabs.map((tab: I_BackOffice_tabName) => {
      return { text: dic[tab], value: tab, show: hasAccess(tab, model) }
    })
  }
  useEffect(() => {
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    setTab(activeTab)
  }, [])
  async function removeImage() {
    return true
  }
  function hasAccess(tab: I_BackOffice_tabName, model: I_state_backOffice) {
    let { accessPhoneNumbers = [] } = model;
    let obj = accessPhoneNumbers.find((o) => o.phoneNumber === phoneNumber);
    if (obj) { return !!obj.access[tab] }
    return false
  }
  function header_layout() {
    return {
      size: 48,
      className: 'back-office-header',
      row: [
        { html: 'پنل ادمین', flex: 1, align: 'v' },
        { html: <Icon path={mdiClose} size={1} />, align: 'vh', size: 48, onClick: () => rsa.removeModal('admin-panel') }
      ]
    }
  }
  function body_layout() {
    let html;
    if (tab === 'appsetting') { html = <AppSetting /> }
    else if (tab === 'spreeManagement') { html = <SpreeManagement /> }
    else if (tab === 'contentManagement') { html = <ContentManagement /> }
    else if (tab === 'priceList') { html = <PriceList /> }
    else if (tab === 'vitrinSuggestion') { html = <VitrinSuggestion /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  function tabs_layout() {
    return { html: (<AIOInput type='tabs' className='back-office-primary-tabs' value={tab} options={tabs} onChange={(tab: I_BackOffice_tabName) => setTab(tab)} />) }
  }
  function modelCorrection(model) {
    // let { versions = {} } = model;
    // let newVersions = { ...versions };
    // let list = ['all', 'campaignProducts', 'categories', 'cart']
    // for (let i = 0; i < list.length; i++) {
    //   if (newVersions[list[i]] === undefined) { newVersions[list[i]] = 1; }
    // }
    // model.versions = newVersions;
    return model
  }
  function footer_layout() {
    if (tab === 'priceList') { return false }
    return {
      html: <button className='back-office-submit-button' onClick={() => {
        let admins = model.accessPhoneNumbers.map((o) => o.phoneNumber)
        model = modelCorrection(model);
        apis.request({ api: 'backOffice.set_backoffice', parameter: { model, admins }, message: { success: true }, description: 'بروزرسانی پنل کمپین', onSuccess: () => { window.location.reload() } })
      }}>بروزرسانی</button>
    }
  }
  function getContext(): I_BackOfficeContext {
    let context: I_BackOfficeContext = {
      model, currentVersions, apis, tabs,
      setModel: (key, value) => {
        let newModel: I_state_backOffice = { ...model, [key]: value }
        setModel(newModel)
      },
      removeImage,
      update: (model: I_state_backOffice) => { setModel(model); setTabs(getTabs(model)) }
    }
    return context;
  }
  return (
    <BackOfficeContext.Provider value={getContext()}>
      <RVD layout={{ className: 'back-office', column: [header_layout(), tabs_layout(), body_layout(), footer_layout()] }} />
    </BackOfficeContext.Provider>
  )
}
function BundleSetting() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  function form_layout() {
    let { Bundle } = model;
    let props: I_FormSetting = { data: Bundle, onChange: (obj: I_ShopProps) => setModel('Bundle', obj), type: 'Bundle', id: 'Bundle' }
    return { flex: 1, className: 'ofy-auto', html: <FormSetting {...props} /> }
  }
  return (<RVD layout={{ flex: 1, className: 'back-office-panel', column: [form_layout()] }} />)
}
function RegularSetting() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  function form_layout() {
    let { Regular } = model;
    let props: I_FormSetting = { data: Regular, onChange: (obj: I_ShopProps) => setModel('Regular', obj), type: 'Regular', id: 'Regular' }
    return { flex: 1, className: 'ofy-auto', html: <FormSetting {...props} /> }
  }
  return (<RVD layout={{ flex: 1, className: 'back-office-panel', column: [{ size: 12 }, form_layout()] }} />)
}
function AccessManagement() {
  let { tabs, model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let [pn, setPn] = useState<string>('');
  let [items, setItems] = useState<I_BackOffice_tab[]>(tabs)
  function header_layout() {
    return {
      className: 'p-h-12 fs-12', gap: 6,
      row: [
        { html: 'افزودن موبایل', align: 'v' },
        { flex: 1, html: <AIOInput className='back-office-input' type='text' justNumber={true} style={{ width: '100%' }} value={pn} onChange={(pn) => setPn(pn)} />, align: 'v' },
        { html: <button className='back-office-add-button-2' disabled={!pn} onClick={() => add()}>افزودن</button> }
      ]
    }
  }
  function add() {
    let { accessPhoneNumbers = [] } = model;
    let addModel: I_backOffice_accessPhoneNumber = {
      name: '', phoneNumber: pn,
      access: { shippingOptions: false, spreeManagement: false, priceList: false, contentManagement: false, appsetting: false, accessmanagement: false }
    }
    setModel('accessPhoneNumbers', accessPhoneNumbers.concat(addModel));
    setPn('')
  }
  function cards_layout() {
    let { accessPhoneNumbers = [] } = model;
    return {
      column: accessPhoneNumbers.map((o: I_backOffice_accessPhoneNumber, i) => card_layout(o, i))
    }
  }
  function card_layout(o: I_backOffice_accessPhoneNumber, index: number) {
    let { phoneNumber, access, name } = o
    let isSuperAdmin = phoneNumber === '09123534314' || phoneNumber === '+989123534314'
    return {
      className: 'back-office-access-card',
      column: [
        {
          className: 'back-office-access-card-header', gap: 3, align: 'v',
          row: [
            { html: phoneNumber },
            {
              flex: 1, html: (
                <input
                  placeholder="نام را وارد کنید"
                  type='text' value={name} onChange={(e) => changeName(index, e.target.value)} style={{ width: '100%', padding: '0 6px', color: '#fff', border: 'none', background: 'none', outline: 'none' }} />
              )
            },
            { show: !isSuperAdmin, html: () => <Icon path={mdiClose} size={.8} />, align: 'vh', size: 36, onClick: () => remove(phoneNumber) }
          ]
        },
        { className: 'back-office-access-card-body', grid: items.map((o: I_BackOffice_tab) => row_layout(o, access, phoneNumber)), gridCols: 2 }
      ]
    }
  }
  function changeName(index: number, name: string) {
    let { accessPhoneNumbers = [] } = model;
    setModel('accessPhoneNumbers', accessPhoneNumbers.map((o, i) => {
      if (index === i) { return { ...o, name } }
      return o
    }));
  }
  function change(field, value, phoneNumber) {
    let { accessPhoneNumbers = [] } = model;
    setModel('accessPhoneNumbers', accessPhoneNumbers.map((o: I_backOffice_accessPhoneNumber) => o.phoneNumber === phoneNumber ? { phoneNumber, access: { ...o.access, [field]: value } } : o))
  }
  function remove(phoneNumber: string) {
    let { accessPhoneNumbers = [] } = model;
    setModel('accessPhoneNumbers', accessPhoneNumbers.filter((o: I_backOffice_accessPhoneNumber) => o.phoneNumber !== phoneNumber))
  }
  function row_layout(item: I_BackOffice_tab, access, phoneNumber) {
    let active = !!access[item.value];
    return {
      className: 'back-office-access-card-row', flex: 1,
      onClick: () => change(item.value, !active, phoneNumber),
      row: [
        { html: item.text, flex: 1, align: 'v' },
        { size: 36, align: 'vh', html: <Icon path={active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={1} /> }
      ]
    }
  }
  return (<RVD layout={{ flex: 1, className: 'back-office-panel ofy-auto', column: [{ size: 12 }, header_layout(), cards_layout()] }} />)
}
function VitrinSuggestion() {
  let [items, setItems] = useState([]);
  let [popup] = useState(new AIOPopup())
  let { apis } = useContext(BackOfficeContext);
  useEffect(() => {
    apis.request({
      api: 'backOffice.vitrin_suggestion',
      description: 'دریافت لیست پیشنهادات ویترین',
      onSuccess: (items) => setItems(items)
    })
  }, [])
  function remove(id) {
    let newItems = items.filter((o) => o.id !== id)
    setItems(newItems)
  }
  function label_layout() {
    return {
      html: 'پیشنهادات ویترین'
    }
  }
  function item_layout(item) {
    return {
      className: 'back-office-panel of-visible',
      row: [
        {
          size: 108, html: <img src={item.url} width='100%' height='108' alt='' />,
          onClick: () => {
            popup.addModal({
              header: { title: item.name }, position: 'top',
              body: {
                render: () => {
                  return (
                    <img src={item.url} width='100%' alt='' />
                  )
                }
              }
            })
          }
        },
        {
          flex: 1, align: 'v', className: 'p-12 p-r-3', gap: 6,
          column: [
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiAccount} size={.8} />, align: 'vh' },
                { flex: 1, html: `${(typeof item.vendorName === 'string' ? item.vendorName : '').slice(0, 12)} ( ${item.cardCode || ''} )`, align: 'v', className: 'fs-12 t-a-right' },
              ]
            },
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiPhone} size={.8} />, align: 'vh' },
                { flex: 1, html: item.phoneNumber || '', align: 'v', className: 'fs-12 t-a-right' }
              ]
            },
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiArchive} size={.8} />, align: 'vh' },
                { flex: 1, html: item.name, align: 'v', className: 'fs-12 t-a-right' },
              ]
            },
            {
              gap: 6,
              row: [
                { html: <Icon path={mdiTag} size={.8} />, align: 'vh' },
                { html: item.brand, align: 'v', flex: 1, className: 'fs-12 t-a-right' },
              ]
            }

          ]
        },
        {
          className: 'align-vh w-24 h-24 br-100 of-visible', style: { position: 'absolute', background: 'orange', left: -8, top: -8, color: '#fff' },
          html: <Icon path={mdiClose} size={0.8} />,
          onClick: () => {
            apis.request({
              api: 'backOffice.remove_vitrin_suggestion',
              description: 'حذف پیشنهاد ویترین',
              parameter: item.id,
              onSuccess: () => remove(item.id)
            })
          }
        }
      ]
    }
  }
  function items_layout() {
    return {
      className: 'ofy-auto', flex: 1,
      column: items.map((o) => {
        return item_layout(o)
      })
    }
  }
  return (
    <>
      <RVD
        layout={{
          style: { height: '100%' },
          column: [
            label_layout(),
            items_layout()
          ]
        }}
      />
      {popup.render()}
    </>
  )
}
type I_Content = { field: 'homeContent' | 'landing' }
type I_Content_entity = 'billboard' | 'image' | 'label' | 'description'
function Content(props: I_Content) {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { field } = props;
  let entities: I_Content_entity[] = ['billboard', 'image', 'label', 'description']
  let path_dic = { 'billboard': mdiImageOutline, 'image': mdiImageOutline, 'label': mdiTextBoxEditOutline, 'description': mdiTextBoxEditOutline }
  let text_dic = { 'billboard': 'بیلبورد', 'image': 'تصویر', 'label': 'لیبل', 'description': 'متن' }
  let [options] = useState<{ text: string, value: string, before: any }[]>(
    entities.map((o: I_Content_entity) => {
      return { text: text_dic[o], value: o, before: <Icon path={path_dic[o]} size={.8} /> }
    })
  )
  let [actions, setActions] = useState(getActions())
  let entity: I_backOffice_content[] = model[field] || [];
  function getActions() {
    let actions = [
      { text: 'لینک به تب خرید', value: 'bottomMenu_kharid' },
      { text: 'لینک به تب بازارگاه', value: 'bottomMenu_bazargah' },
      { text: 'لینک به تب ویترین', value: 'bottomMenu_vitrin' },
      { text: 'لینک به تب پروفایل', value: 'bottomMenu_profile' },
      { text: 'لینک به لیست قیمت', value: 'openPopup_priceList' },
      { text: 'لینک به ثبت گارانتی جدید', value: 'openPopup_sabteGarantiJadid' },
    ];
    let { spreeCategories = [] } = model;
    for (let i = 0; i < spreeCategories.length; i++) {
      let { name, id } = spreeCategories[i];
      actions.push({ text: `لینک به دسته بندی ${name}`, value: `category_${id}` })
    }
    let { spreeCampaigns = [] } = model;
    for (let i = 0; i < spreeCampaigns.length; i++) {
      let { shopName, shopId } = spreeCampaigns[i];
      actions.push({ text: `لینک به کمپین ${shopName}`, value: `spreeCampaign_${shopId}` })
    }
    let { Bundle } = model;
    if (Bundle.active) {
      actions.push({ text: `لینک به باندل`, value: `Bundle` })
    }
    return actions
  }
  function add(type: I_Content_entity) {
    let id = 'bo_image_' + Math.round(Math.random() * 10000000)
    let obj: I_backOffice_content;
    if (type === 'billboard') { obj = { type: 'billboard', url: '', id, active: true, linkTo: '' } }
    else if (type === 'label') { obj = { type: 'label', text: '', linkTo: '', id, active: true } }
    else if (type === 'description') { obj = { type: 'description', text: '', linkTo: '', id, active: true } }
    else if (type === 'image') { obj = { type: 'image', url: '', linkTo: '', id, active: true } }
    setModel(field, entity.concat(obj))
  }
  function remove(index) {
    setModel(field, entity.filter((o, i) => i !== index))
  }
  function move(index, dir) {
    let firstIndex = dir === 'up' ? index - 1 : index;
    let secondIndex = dir === 'up' ? index : index + 1;
    let first = entity[secondIndex]
    let second = entity[firstIndex]
    setModel(field, entity.map((o, i) => {
      if (i === firstIndex) { return first }
      else if (i === secondIndex) { return second }
      else { return o }
    }))
  }
  function setEntity(index, prop, value) {
    setModel(field, entity.map((o, i) => i === index ? { ...entity[i], [prop]: value } : o))
  }
  function getActive() {
    return model[`active_${field}`];
  }
  function setActive(value) {
    setModel(`active_${field}`, value)
  }
  function toolbar_layout() {
    let trans = { 'homeContent': 'صفحه خانه', 'landing': 'لندینگ' }[field];
    let active = getActive()
    return {
      className: 'back-office-content-toolbar',
      row: [
        {
          flex: 1,
          html: (
            <AIOInput
              type='select' text={`افزودن آیتم به ${trans}`} options={options}
              before={<Icon path={mdiPlusThick} size={.8} />}
              onChange={(value) => add(value)} popover={{ fitHorizontal: true }}
            />
          )
        },
        { size: 6 },
        {
          size: 32, align: 'vh', className: 'back-office-content-activity',
          html: <Icon path={active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={1} />,
          onClick: () => setActive(!active),
        },

      ]
    }
  }
  function control_layout(index, isFirst, isLast, typeName) {
    let item = entity[index];
    return {
      className: 'back-office-content-item-toolbar', gap: 6,
      row: [
        { html: <Icon path={mdiClose} size={0.9} />, style: { background: 'orange' }, onClick: () => remove(index) },
        { html: typeName, align: 'v', flex: 1, className: 'fs-10' },
        { show: !isFirst, html: <Icon path={mdiArrowUp} size={0.9} />, style: { background: 'rgb(35, 72, 109)' }, onClick: () => move(index, 'up') },
        { show: !isLast, html: <Icon path={mdiArrowDown} size={0.9} />, style: { background: 'rgb(35, 72, 109)' }, onClick: () => move(index, 'down') },
        { show: true, html: <Icon path={item.active ? mdiCheckboxMarkedOutline : mdiCheckboxBlankOutline} size={0.9} />, style: { background: 'rgb(35, 72, 109)' }, onClick: () => setEntity(index, 'active', !item.active) }
      ]
    }
  }
  function link_layout(index) {
    return {
      className: 'm-b-12 m-h-12',
      row: [
        { html: 'لینک به', align: 'v', className: 'fs-12' },
        { size: 6 },
        {
          flex: 1,
          html: (
            <AIOInput
              search={false}
              type='select' options={actions} value={entity[index].linkTo}
              onChange={(value) => setEntity(index, 'linkTo', value)} popover={{ fitHorizontal: true }}
              className='back-office-link-to'
            />
          )
        },
      ]
    }
  }
  function type_billboard_layout(row, index, isFirst, isLast) {
    let { url, id } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'بیلبورد'),
        {
          flex: 1, className: 'p-12',
          html: (
            <Image
              id={id}
              url={url} placeholder='تصویر هدر'
              onChange={(url) => setEntity(index, 'url', url)}
              style={{ height: 'fit-content', minHeight: 100, width: '100%' }}
            />
          )
        },
        this.link_layout(index)
      ]
    }
  }
  function type_label_layout(row, index, isFirst, isLast) {
    let { text } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'لیبل'),
        {
          flex: 1,
          html: (
            <input
              type='text'
              value={text}
              className='theme-dark-font-color fs-16 bold p-h-0 bold'
              style={{ border: 'none', width: '100%', background: 'none', color: 'inherit' }} placeholder='لیبل را وارد کنید'
              onChange={(e) => setEntity(index, 'text', e.target.value)}
            />
          )
        }
      ]
    }
  }
  function type_description_layout(row, index, isFirst, isLast) {
    let { text } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'متن'),
        {
          flex: 1,
          html: (
            <textarea
              value={text} style={{ width: '100%', color: 'inherit', resize: 'vertical', background: 'none', border: 'none', minHeight: 96, padding: 6, fontFamily: 'inherit' }}
              onChange={(e) => setEntity(index, 'text', e.target.value)} placeholder="متن مورد نظر را وارد کنید"
            />
          )
        }
      ]
    }
  }
  function type_image_layout(row, index, isFirst, isLast) {
    let { url, id } = row;
    return {
      className: 'back-office-content-item',
      column: [
        control_layout(index, isFirst, isLast, 'تصویر'),
        {
          flex: 1, className: 'p-12',
          html: (
            <Image
              id={id} url={url} placeholder='تصویر بیلبورد'
              onChange={(url) => setEntity(index, 'url', url)}
              style={{ height: 'fit-content', minHeight: 100 }}
            />
          )
        },
        link_layout(index)
      ]
    }
  }
  return (
    <RVD
      layout={{
        className: 'back-office-content',
        column: [
          toolbar_layout(),
          {
            flex: 1, className: 'ofy-auto', gap: 12,
            column: entity.map((o, i) => {
              let { type } = o, isFirst = i === 0, isLast = i === entity.length - 1;
              if (type === 'billboard') { return type_billboard_layout(o, i, isFirst, isLast) }
              if (type === 'image') { return type_image_layout(o, i, isFirst, isLast) }
              if (type === 'description') { return type_description_layout(o, i, isFirst, isLast) }
              if (type === 'label') { return type_label_layout(o, i, isFirst, isLast) }
            })
          }
        ]
      }}
    />
  )
}
type I_priceList_item = { brand: string, url: string, date: string, fileName: string, id: any }
function PriceList() {
  let { apis }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [brandText, setBrandText] = useState<string>('');
  let [file, setFile] = useState<any>()
  let [list, setList] = useState<any[]>([])
  function getList() { apis.request({ api: 'backOffice.price_list', onSuccess: (list) => setList(list) }) }
  useEffect(() => { getList() }, [])
  function submit() {
    apis.request({
      api: 'backOffice.priceList_add', parameter: { brandText, file }, description: 'ثبت در لیست قیمت',
      onSuccess: (item) => { setBrandText(''); setFile(undefined); setList([item, ...list]) }
    })
  }
  function remove(id) {
    let res = window.confirm('از حذف این مورد اطمینان دارید؟')
    if (res !== true) { return }
    apis.request({
      api: 'backOffice.priceList_remove', description: 'حذف از لیست قیمت', parameter: id,
      onSuccess: () => setList(list.filter((o) => o.id !== id))
    })
  }
  function name_layout() {
    return {
      align: 'v',
      html: (
        <input
          type='text' value={brandText} placeholder="نام برند را وارد کنید"
          onChange={(e) => setBrandText(e.target.value)} className='br-4 w-100 p-h-6'
        />
      )
    }
  }
  function file_layout() {
    return { align: 'v', html: (<AIOInput type='file' text={'آپلود فایل'} onChange={(file) => setFile(file)} value={file} />) }
  }
  function submit_layout() {
    return {
      html: <button disabled={!brandText || !file} style={{ height: 64 }} className='button-2' onClick={() => submit()}>ثبت</button>
    }
  }
  function cards_layout() {
    return { className: 'ofy-auto', flex: 1, gap: 12, column: list.map((o: I_priceList_item) => card_layout(o)) }
  }
  function card_layout(item: I_priceList_item) {
    let { brand, url, date, fileName, id } = item
    return {
      className: 'back-office-price-list-card',
      column: [
        {
          row: [
            { flex: 1, html: brand, className: 'fs-14 bold', align: 'v', style: { textAlign: 'right' } },
            { size: 36, html: <Icon path={mdiClose} size={1} />, align: 'vh', onClick: () => remove(id) }
          ]
        },
        { size: 12 },
        { html: date, className: 'fs-12', align: 'v', size: 36, },
        { html: url, className: 't-a-left fs-10' }
      ]
    }
  }
  return (
    <RVD
      layout={{
        flex: 1, gap: 12, className: 'p-t-12',
        column: [
          {
            className: 'back-office-price-list-toolbar', gap: 6,
            row: [
              { flex: 1, gap: 6, column: [name_layout(), file_layout()] },
              submit_layout()
            ]
          },
          cards_layout()
        ]
      }}
    />
  )
}
type I_SpreeManagement_tab = 'spreeCategories' | 'Regular' | 'spreeCampaigns' | 'Bundle' | 'setting'
function SpreeManagement() {
  let tabValues: I_SpreeManagement_tab[] = ['spreeCategories', 'Regular', 'spreeCampaigns', 'Bundle', 'setting']
  let text_dic = { 'spreeCategories': 'دسته بندی', 'Regular': 'خرید عادی', 'spreeCampaigns': 'کمپین ها', 'Bundle': 'باندل', 'setting': 'تنظیمات' }
  let [tabs] = useState<{ text: string, value: I_SpreeManagement_tab, show: boolean }[]>(
    tabValues.map((tabValue: I_SpreeManagement_tab) => {
      return { text: text_dic[tabValue], value: tabValue, show: true }
    })
  )
  let [tab, setTab] = useState<I_SpreeManagement_tab>('Regular')
  useEffect(() => {
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    setTab(activeTab)
  }, [])
  function tabs_layout() {
    return { html: (<AIOInput type='tabs' className='back-office-secondary-tabs' value={tab} options={tabs} onChange={(tab: I_SpreeManagement_tab) => setTab(tab)} />) }
  }
  function body_layout() {
    let html;
    if (tab === 'Bundle') { html = <BundleSetting /> }
    else if (tab === 'Regular') { html = <RegularSetting /> }
    else if (tab === 'spreeCampaigns') { html = <SpreeCampaigns/> }
    else if (tab === 'spreeCategories') { html = <SpreeCategories/> }
    else if (tab === 'setting') { html = <ShippingOptions /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  return (<RVD layout={{ column: [tabs_layout(), body_layout()] }} />)
}
type I_ContentManagement_tabValue = 'landing' | 'homeContent';
type I_ContentManagement_tab = { text: string, value: I_ContentManagement_tabValue, show: boolean }
function ContentManagement() {
  let tabValues: I_ContentManagement_tabValue[] = ['landing', 'homeContent']
  let textDic = { 'landing': 'لندینگ', 'homeContent': 'صفحه خانه' }
  let [tabs] = useState<I_ContentManagement_tab[]>(
    tabValues.map((tabValue: I_ContentManagement_tabValue) => { return { text: textDic[tabValue], value: tabValue, show: true } })
  )
  let [tab, setTab] = useState<I_ContentManagement_tabValue>('landing')
  useEffect(() => {
    let visibleTabs = tabs.filter(({ show }) => show)
    if (!visibleTabs.length) { return }
    let activeTab = tab;
    if (!visibleTabs.find((o) => o.value === activeTab)) { activeTab = visibleTabs[0].value; }
    setTab(activeTab)
  }, [])
  function tabs_layout() {
    return { html: (<AIOInput type='tabs' className='back-office-secondary-tabs' value={tab} options={tabs} onChange={(tab) => setTab(tab)} />) }
  }
  function body_layout() {
    let html;
    if (tab === 'homeContent') { html = <Content field='homeContent' /> }
    else if (tab === 'landing') { html = <Content field='landing' /> }
    return { flex: 1, className: 'ofy-auto', html }
  }
  return (<RVD layout={{ column: [tabs_layout(), body_layout()] }} />)
}
function AppSetting() {
  let { model, currentVersions = {}, setModel, update }: I_BackOfficeContext = useContext(BackOfficeContext);
  let [openId, setOpenId] = useState<string | false>(false)
  function splitter_layout(text, id, icon) {
    return {
      size: 36, align: 'v', className: 'back-office-splitter',
      onClick: () => setOpenId(openId === id ? false : id),
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={openId !== id ? mdiChevronLeft : mdiChevronDown} size={.8} />
        },
        { html: text, align: 'v' },
        { flex: 1 },
        { html: <Icon path={icon} size={0.8} />, style: { background: 'orange', color: '#fff', padding: 3, borderRadius: 4 } }

      ]
    }
  }
  function version_layout(id) {
    if (id !== openId) { return false }
    let { versions = {} } = model;
    let cls = 'back-office-cachebutton'
    return {
      className: 'back-office-app-setting-item', gap: 6,
      column: Object.keys(versions).map((o) => {
        let currentVersion = currentVersions[o] || 0;
        let version = versions[o] || 0;
        return {
          childsProps: { align: 'v' }, className: 'fs-12',
          row: [
            { html: o, align: 'v', size: 120 },
            { size: 6 },
            {
              show: currentVersion !== version,
              className: 'p-h-6 br-6 align-vh', style: { color: 'dodgerblue', width: 68 },
              gap: 3,
              row: [
                { html: currentVersion, align: 'v' },
                { html: <Icon path={mdiArrowLeftBold} size={.7} />, align: 'vh' },
                { html: version, align: 'v' },
              ]
            },
            {
              show: currentVersion === version,
              className: 'p-h-6 br-6 align-vh', style: { color: 'dodgerblue', width: 68 }, gap: 3, row: [{ html: currentVersion, align: 'v' }]
            },
            { flex: 1 },
            { show: currentVersion === version, html: <button className={cls} onClick={() => setModel('versions', { ...versions, [o]: version + 1 })}>حذف cache</button> },
            { show: currentVersion !== version, html: <button className={cls + ' active'} onClick={() => setModel('versions', { ...versions, [o]: currentVersions[o] })}>حذف شد cache</button> }
          ]
        }
      })
    }
  }
  function activeManager_layout(id) {
    if (id !== openId) { return false }
    let { activeManager } = model;
    let options = {
      "garanti": 'گارانتی',
      "bazargah": 'بازارگاه',
      "wallet": 'کیف پول',
      "vitrin": 'ویترین',
      "priceList": 'لیست قیمت'
    }
    activeManager = { ...activeManager }
    return {
      className: 'back-office-app-setting-item',
      html: (
        <AIOInput
          type='form' lang='fa'
          style={{ flex: 'none', width: '100%', height: 'fit-content', background: 'none' }}
          bodyAttrs={{ style: { padding: 0 } }}
          theme={{ rowStyle: { marginBottom: 0 }, bodyStyle: { padding: 0 }, inputStyle: { border: 'none' } }}
          onChange={(obj) => setModel('activeManager', obj)}
          value={activeManager}
          inputs={{
            column: Object.keys(options).map((o) => {
              return { input: { type: 'checkbox', text: options[o] }, field: `value.${o}` }
            })
          }}
        />
      )
    }
  }
  function bazargah_layout(id) {
    if (id !== openId) { return false }
    let { bazargah = {} } = model;
    return {
      className: 'back-office-app-setting-item',
      html: (
        <AIOInput
          type='form' lang='fa'
          rtl={true}
          style={{ flex: 'none', width: '100%', height: 'fit-content', background: 'none' }}
          theme={{ bodyStyle: { padding: 0 } }}
          value={bazargah}
          inputs={{
            column: [
              { input: { type: 'number', after: 'دقیقه' }, field: 'value.forsate_akhze_sefareshe_bazargah', label: 'فرصت اخذ سفارش بازارگاه' },
              { input: { type: 'number', after: 'دقیقه' }, field: 'value.forsate_ersale_sefareshe_bazargah', label: 'فرصت ارسال سفارش بازارگاه' }
            ]
          }}
          onChange={(obj) => setModel('bazargah', obj)}
        />
      )
    }
  }
  function vitrinCategories_layout(id) {
    if (id !== openId) { return false }
    return { className: 'back-office-app-setting-item', style: { margin: 0 }, html: <VitrinCategories /> }
  }
  function download() {
    let storage = AIOStorage('bmbof');
    storage.download({ file: model, name: 'bazar-miarze-back-office-setting' })
  }
  function upload(file) {
    let storage = AIOStorage('bmbof');
    storage.read({ file: file, callback: (backOffice) => update(backOffice) })
  }
  function file_layout(id) {
    if (id !== openId) { return false }
    return {
      className: 'p-12', gap: 12,
      row: [
        { html: <AIOInput type='file' text='آپلود' className='back-office-button' onChange={(file) => upload(file)} /> },
        { html: <AIOInput type='button' className='back-office-button' onClick={() => download()} text='دانلود' /> }
      ]
    }
  }
  function accessManagement_layout(id) {
    if (id !== openId) { return false }
    return { html: <AccessManagement /> }
  }
  return (
    <RVD
      layout={{
        className: 'ofy-auto back-office-panel', style: { margin: 0 }, gap: 3,
        column: [
          { size: 12 },
          splitter_layout('مدیریت cache کاربران', 'version', mdiAccountSync),
          version_layout('version'),
          splitter_layout('فعالسازی بخش های اپ', 'activeManager', mdiEye),
          activeManager_layout('activeManager'),
          splitter_layout('بازارگاه', 'bazargah', mdiCellphoneMarker),
          bazargah_layout('bazargah'),
          splitter_layout('دسته بندی های ویترین', 'vitrinCategories', mdiListBox),
          vitrinCategories_layout('vitrinCategories'),
          splitter_layout('مدیریت دسترسی', 'accessManagement', mdiAccountSync),
          accessManagement_layout('accessManagement'),
          splitter_layout('مدیریت فایل تنظیمات', 'filemanager', mdiContentSave),
          file_layout('filemanager')
        ]
      }}
    />
  )
}
type I_Image = { onRemove?: Function, id: any, onChange: (url: string) => void, url?: string, placeholder?: any, style?: any }
function Image(props: I_Image) {
  let { apis }: I_BackOfficeContext = useContext(BackOfficeContext);
  let { onRemove, id, onChange, url, style, placeholder } = props;
  return (
    <AIOInput
      before={onRemove ? <div onClick={(e) => { e.stopPropagation(); onRemove() }}><Icon path={mdiClose} size={1} /></div> : undefined}
      type='file' className='back-office-image' style={{ ...style }}
      text={!url && placeholder ? placeholder : (<img src={url} alt='' width='100%' />)}
      onChange={async (file) => {
        let { url } = await apis.request({ api: 'backOffice.set_file', parameter: { file, name: id } })
        onChange(url);
      }}
    />
  )
}
function SpreeCampaigns() {
  let { model, apis, setModel }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [openDic, setOpenDic] = useState({})
  function trans(type) {
    return [
      `آی دی کمپین تعریف شده در اسپری را وارد کنید`,
      `این کمپین وارد شده است . مجددا نمی توانید این کمپین را وارد کنید`,
      `دریافت کمپین های اسپری`,
      `آی دی کمپین در اسپری موجود نیست`,
      `آیا از حذف این کمپین اطمینان دارید؟`,
      `لیست کمپین های اسپری`,
      `افزودن کمپین`
    ][type]
  }
  async function getAddItem(id) {
    let list = await apis.request({ api: 'kharid.getCampaigns', description: trans(2), def: [], parameter: id })
    if (list[0]) {
      let { name, src, CampaignId, PriceListNum } = list[0];
      return { shopId: id, shopName: name, billboard: src, CampaignId, PriceListNum, icon: '' }
    }
  }
  async function add() {
    let { spreeCampaigns = [] } = model;
    let id = window.prompt(trans(0))
    if (id === undefined || id === null) { return }
    if (spreeCampaigns.find((o: I_ShopProps) => o.shopId === id)) { alert(trans(1)); return }
    let addItem = await getAddItem(id);
    if (addItem) { setModel('spreeCampaigns', [...spreeCampaigns, addItem]) }
    else { alert(trans(3)) }
  }
  function remove(shopId) {
    let { spreeCampaigns = [] } = model;
    let res = window.confirm(trans(4))
    if (res === true) { setModel('spreeCampaigns', spreeCampaigns.filter((o: I_ShopProps) => o.shopId !== shopId)) }
  }
  function header_layout() {
    return {
      className: 'p-h-12 m-v-12',
      row: [
        { html: trans(5), className: 'fs-12 bold', flex: 1, align: 'v' },
        {
          className: 'back-office-add-button', onClick: () => add(),
          row: [
            { html: <Icon path={mdiPlusThick} size={.7} />, align: 'vh', size: 24 },
            { html: trans(6), align: 'v' }
          ]
        }
      ]
    }
  }
  function toolbarIcon_layout(campaign: I_ShopProps) {
    let html = <div style={{ background: campaign.active ? '#23486d' : 'orange' }} className='p-h-3 fs-12'>{campaign.active ? 'فعال' : 'غیر فعال'}</div>
    return { html }
  }
  function toolbar_layout(campaign: I_ShopProps) {
    let open = openDic[campaign.shopId];
    return {
      className: 'back-office-collapse' + (open ? ' back-office-collapse-open' : ''), align: 'v',
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={.8} />,
          onClick: () => setOpenDic({ ...openDic, [campaign.shopId]: !open })
        },
        {
          flex: 1,
          row: [
            { flex: 1, align: 'v', html: `${campaign.shopName} (${campaign.shopId})` },
            toolbarIcon_layout(campaign)
          ]
        },
        { html: <Icon path={mdiClose} size={.7} />, align: 'vh', size: 36, onClick: () => remove(campaign.shopId) }
      ]
    }
  }
  function form_layout(campaign: I_ShopProps) {
    let { shopId } = campaign;
    if (!openDic[shopId]) { return false }
    return {
      html: (
        <FormSetting
          key={shopId} type={'spreeCampaigns'} data={campaign} id={shopId}
          onChange={(obj) => setModel('spreeCampaigns', model.spreeCampaigns.map((o) => o.shopId === shopId ? { ...campaign, ...obj } : o))}
        />
      )
    }
  }
  let { spreeCampaigns = [] } = model;
  return (
    <RVD
      layout={{
        flex: 1, className: 'back-office-panel',
        column: [
          header_layout(),
          {
            flex: 1, className: 'ofy-auto',
            column: spreeCampaigns.map((spreeCampaign: I_ShopProps) => {
              return { className: 'm-h-12 m-b-12', column: [toolbar_layout(spreeCampaign), form_layout(spreeCampaign)] }
            })
          }
        ]
      }}
    />
  )
}
function SpreeCategories() {
  let { model, apis, setModel }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [openDic, setOpenDic] = useState({})
  function trans(type) {
    return [
      `آی دی 'دسته بندی' تعریف شده در اسپری را وارد کنید`,
      `این 'دسته بندی' وارد شده است . مجددا نمی توانید این 'دسته بندی' را وارد کنید`,
      `دریافت 'دسته بندی' های اسپری`,
      `آی دی 'دسته بندی' در اسپری موجود نیست`,
      `آیا از حذف این 'دسته بندی' اطمینان دارید؟`,
      `لیست 'دسته بندی' های اسپری`,
      `افزودن 'دسته بندی'`
    ][type]
  }
  async function getAddItem(id) {
    let list = await apis.request({ api: 'kharid.getCategories', description: trans(2), def: [], parameter: [id] })
    if (list[0]) {
      let { name, id } = list[0];
      return { id, name, billboard: '', icon: '', showType: 'icon' }
    }
  }
  async function add() {
    let { spreeCategories = [] } = model;
    let id = window.prompt(trans(0))
    if (id === undefined || id === null) { return }
    if (spreeCategories.find((o) => o.id === id)) { alert(trans(1)); return }
    let addItem = await getAddItem(id);
    if (addItem) { setModel('spreeCategories', [...spreeCategories, addItem]) }
    else { alert(trans(3)) }
  }
  function remove(id) {
    let { spreeCategories = [] } = model;
    let res = window.confirm(trans(4))
    if (res === true) { setModel('spreeCategories', spreeCategories.filter((o: I_spreeCategory) => o.id !== id)) }
  }
  function header_layout() {
    return {
      className: 'p-h-12 m-v-12',
      row: [
        { html: trans(5), className: 'fs-12 bold', flex: 1, align: 'v' },
        {
          className: 'back-office-add-button', onClick: () => add(),
          row: [
            { html: <Icon path={mdiPlusThick} size={.7} />, align: 'vh', size: 24 },
            { html: trans(6), align: 'v' }
          ]
        }
      ]
    }
  }
  function toolbarIcon_layout(category: I_spreeCategory) {
    let html = <div style={{ background: category.showType === 'slider' ? '#23486d' : 'orange' }} className='p-h-3 fs-12'>{category.showType}</div>
    return { html }
  }
  function toolbar_layout(category: I_spreeCategory) {
    let open = openDic[category.id];
    return {
      className: 'back-office-collapse' + (open ? ' back-office-collapse-open' : ''), align: 'v',
      row: [
        {
          size: 30, align: 'vh',
          html: <Icon path={open ? mdiChevronDown : mdiChevronLeft} size={.8} />,
          onClick: () => setOpenDic({ ...openDic, [category.id]: !open })
        },
        {
          flex: 1,
          row: [
            { flex: 1, align: 'v', html: `${category.name} (${category.id})` },
            toolbarIcon_layout(category)
          ]
        },
        { html: <Icon path={mdiClose} size={.7} />, align: 'vh', size: 36, onClick: () => remove(category.id) }
      ]
    }
  }
  function form_layout(category: I_spreeCategory) {
    let { id } = category;
    if (!openDic[id]) { return false }
    let { spreeCategories = [] } = model;
    return {
      html: (
        <FormSetting
          key={id} type={'spreeCategories'} data={category} id={id}
          onChange={(obj) => setModel('spreeCategories', spreeCategories.map((o) => o.id === id ? { ...category, ...obj } : o))}
        />
      )
    }
  }
  let { spreeCategories = [] } = model;
  return (
    <RVD
      layout={{
        flex: 1, className: 'back-office-panel',
        column: [
          header_layout(),
          {
            flex: 1, className: 'ofy-auto',
            column: spreeCategories.map((o: I_spreeCategory) => { return { className: 'm-h-12 m-b-12', column: [toolbar_layout(o), form_layout(o)] } })
          }
        ]
      }}
    />
  )
}
type I_FormSetting = {
  data: I_ShopProps | I_spreeCategory, type: 'spreeCampaigns' | 'spreeCategories' | 'Regular' | 'Bundle',
  onChange: (newShop: I_ShopProps | I_spreeCategory) => void, id: string
}
function FormSetting(props: I_FormSetting) {
  let { model }: I_BackOfficeContext = useContext(BackOfficeContext)
  let { data, type, onChange, id } = props;
  function getSelectedPayDueDates() {
    if (type !== 'spreeCategories') {
      let { PayDueDates = [] } = data as I_ShopProps;
      let { PayDueDate_options } = model;
      return PayDueDate_options.filter(({ value }) => {
        return PayDueDates.indexOf(value) !== -1
      })
    }
    return []
  }
  function change(key,value){
    onChange({...data,[key]:value})
  }
  let { PayDueDate_options, DeliveryType_options, PaymentTime_options } = model;
  return (
    <AIOInput
      type='form' lang='fa' style={{ padding: 12 }} value={data} className='back-office-form-setting'
      inputs={{
        props: { gap: 12 },
        column: [
          {
            show: ['Bundle', 'spreeCampaigns', 'spreeCategories'].indexOf(type) !== -1,
            column: [
              { html: 'بیلبورد' },
              {
                label: 'بیلبورد',
                style: { maxWidth: 240 },
                html: () => {
                  return (
                    <Image
                      id={`${type}_${id === undefined ? '' : `${id}_`}billboard`}
                      style={{ minHeight: 74, height: 'fit-content' }}
                      url={data.billboard} onChange={(billboard) => change('billboard',billboard)}
                    />
                  )
                }
              }
            ]
          },
          {
            column: [
              { html: 'آیکون' },
              {
                show: ['Bundle', 'spreeCampaigns', 'spreeCategories'].indexOf(type) !== -1,
                type: 'html', label: 'آیکون', rowWidth: 142,
                html: () => {
                  return (
                    <Image
                      id={`${type}_${id === undefined ? '' : `${id}_`}icon`}
                      url={data.icon} style={{ height: 74, width: 74 }} onChange={(icon) => change('icon',icon)}
                    />
                  )
                }
              }
            ]
          },
          {
            show: true, label: 'فعالسازی', field: 'value.active',
            input: {
              type: 'radio', optionStyle: { width: 'fit-content' },
              options: [{ text: 'فعال', value: true }, { text: 'غیر فعال', value: false }],
            }
          },
          {
            show: ['Regular', 'Bundle'].indexOf(type) !== -1,
            input: { type: 'text' }, label: 'نام', field: 'value.name',
          },
          {
            show: type === 'spreeCategories', label: 'نمایش به صورت', field: 'value.showType',
            input: {
              type: 'radio', optionStyle: { width: 'fit-content' },
              options: [{ text: 'آیکون', value: 'icon' }, { text: 'اسلاید', value: 'slider' }]
            }
          },
          {
            show: type !== 'spreeCategories',
            column: [
              {
                input: { type: 'text' }, label: 'CampaignId', field: 'value.CampaignId'
              },
              {
                input: { type: 'multiselect', options: PayDueDate_options, text: 'پرداخت های چکی' }, field: 'value.PayDueDates',
              },
              {
                input: { type: 'select', options: getSelectedPayDueDates(), popover: { fitHorizontal: true } },
                label: 'پیشفرض نوع پرداخت چکی', field: 'value.PayDueDate'
              },
              {
                input: { type: 'multiselect', text: 'نحوه های ارسال', options: DeliveryType_options }, field: 'value.DeliveryTypes'
              },
              {
                input: { type: 'select', options: DeliveryType_options, popover: { fitHorizontal: true } }, label: 'پیشفرض نحوه ارسال', field: 'value.DeliveryType',
              },
              {
                input: { type: 'multiselect', options: PaymentTime_options, text: 'زمان های پرداخت' },
              },
              {
                input: { type: 'select', options: PaymentTime_options, popover: { fitHorizontal: true } }, label: 'پیشفرض زمان پرداخت', field: 'value.PaymentTime',
              }
            ]
          }

        ]
      }}
      onChange={(obj) => onChange(obj)}
    />
  )
}

type I_ShippingOptions_tab = 'PayDueDate_options' | 'PaymentTime_options' | 'DeliveryType_options';
function ShippingOptions() {
  let { model, setModel }: I_BackOfficeContext = useContext(BackOfficeContext);
  let [activeTabId, setActiveTabId] = useState<I_ShippingOptions_tab>('PayDueDate_options')
  function getPayDueDateText({ cashPercent = 0, days = 0 }) {
    let res = []
    if (cashPercent) { res.push(`${cashPercent}% نقد`) }
    if (days) { res.push(`%${100 - cashPercent} چک ${(days / 30).toFixed(1)} ماهه`) }
    return res.join(' - ')
  }
  function tabs_layout() {
    return {
      html: (
        <AIOInput
          type='tabs' className='back-office-primary-tabs' value={activeTabId}
          options={[
            { text: 'PayDueDate', value: 'PayDueDate_options' },
            { text: 'PaymentTime', value: 'PaymentTime_options' },
            { text: 'DeliveryType', value: 'DeliveryType_options' },
          ]}
          onChange={(activeTabId: I_ShippingOptions_tab) => setActiveTabId(activeTabId)}
        />
      )
    }
  }
  function getColumns(activeTabId) {
    if (activeTabId === 'PayDueDate_options') {
      let base = { titleAttrs: { style: { fontSize: 10 } }, justify: true };
      return [
        { ...base, title: 'درصد نقدی', value: 'row.cashPercent', width: 70, input: { type: 'text', before: <div className='back-office-table-badge'>%</div> } },
        { ...base, title: 'مدت چک(روز)', value: 'row.days', input: { type: 'text', before: ({ row }) => <div className='back-office-table-badge'>{`${((row.days || 0) / 30).toFixed(1)} ماهه`}</div> } },
        { ...base, title: 'درصد تخفیف', value: 'row.discountPercent', width: 72, input: { type: 'number', spin: false, before: <div className='back-office-table-badge'>%</div> } },
        { ...base, title: 'v', value: 'row.value', width: 60, input: { type: 'number' } },
      ]
    }
    else {
      return [
        { title: 'نام', value: 'row.text', input: { type: 'text' } },
        { title: 'v', value: 'row.value', width: 50, justify: true, input: { type: 'number' } },
      ]
    }
  }
  function table_layout() {
    let rows = model[activeTabId] || [];
    rows = rows.map((o) => {
      let { id = 't' + Math.round(Math.random() * 1000000) } = o;
      return { ...o, id }
    })
    return {
      flex: 1,
      html: (
        <AIOInput
          type='table' onRemove={true} onSwap={true}
          onAdd={() => {
            let newRow;
            let id = 't' + Math.round(Math.random() * 1000000)
            if (activeTabId === 'PayDueDate_options') { newRow = { value: '', discountPercent: '', cashPercent: '', days: '', id } }
            else { newRow = { text: '', value: '', id } }
            setModel(activeTabId, [...model[activeTabId], newRow])
          }}
          key={activeTabId}
          value={rows}
          columns={getColumns(activeTabId)}
          onChange={(list) => {
            if (activeTabId === 'PayDueDate_options') {
              list = list.map((o) => { return { ...o, text: getPayDueDateText(o) } })
            }
            setModel(activeTabId, list)
          }}
        />
      )
    }
  }
  return (<RVD layout={{ flex: 1, className: 'ofy-auto', column: [tabs_layout(), table_layout()] }} />)
}

function VitrinCategories() {
  let { model, setModel, removeImage }: I_BackOfficeContext = useContext(BackOfficeContext)
  let [list, setList] = useState<I_backOffice_vitrinCategory[]>([])
  function change() {
    setModel('vitrinCategories', list)
  }
  useEffect(() => {
    let { vitrinCategories = [] } = model;
    setList(vitrinCategories);
  }, [])
  function getColumn() {
    return getColumn_req(list, 0, undefined);
  }
  function getColumn_req(model, level, parent) {
    return model.map((o, i) => {
      let { childs = [] } = o;
      return {
        style: { paddingRight: level * 12 },
        column: [
          row_layout(o, parent, i, !childs.length),
          { show: !!childs.length && o.open !== false, column: getColumn_req(childs, level + 1, o) }
        ]
      }
    })
  }
  function add(o?: I_backOffice_vitrinCategory) {
    let id = window.prompt('آی دی دسته بندی را وارد کنید');
    if (typeof id === 'string') {
      let obj = { name: '', id: +id, open: true, childs: [] }
      if (o) { o.childs.push(obj); }
      else { list.push(obj) }
      setList(list);
      change()
    }
  }
  async function remove(o: I_backOffice_vitrinCategory, parent?: I_backOffice_vitrinCategory, index?: number) {
    let res = await removeImage('categoryimage-' + o.id);
    if (res === true) {
      if (!parent) { list = list.filter((o, i) => index !== i) }
      else { parent.childs = parent.childs.filter((o, i) => i !== index); }
      setList(list)
      change()
    }
  }
  function row_layout(o: I_backOffice_vitrinCategory, parent?: I_backOffice_vitrinCategory, index?: number, isLeaf?: boolean) {
    let toggle = o.childs.length ? <Icon path={o.open === false ? mdiChevronLeft : mdiChevronDown} size={1} /> : ''
    let options = () => (
      <AIOInput
        type='select' caret={false} style={{ background: 'none' }}
        options={[
          { text: 'افزودن زیر شاخه', value: 'add', before: <Icon path={mdiPlusThick} size={1} /> },
          { text: 'حذف شاخه', value: 'remove', disabled: !isLeaf, before: <Icon path={mdiDelete} size={1} /> },
        ]}
        text={<Icon path={mdiDotsHorizontal} size={1} />}
        onChange={(v: 'add' | 'remove') => v === 'add' ? add(o) : remove(o, parent, index)}
      />
    )
    return {
      style: { border: '1px solid #343e5d' }, className: 'h-72 br-6 m-b-6',
      row: [
        { size: 32, align: 'vh', html: toggle, onClick: () => { o.open = o.open === undefined ? false : !o.open; change() } },
        {
          size: 72, align: 'vh', html: (
            <Image
              id={'categoryimage-' + o.id}
              style={{ border: '1px solid #343e5d', background: 'none', width: 72, height: 72 }}
              url={o.imageUrl}
              onChange={(url) => {
                o.imageUrl = url;
                change()
              }}
              placeholder={<Icon path={mdiImage} size={2} />}
            />
          )
        },
        { size: 6 },
        {
          flex: 1,
          column: [
            {
              flex: 1,
              row: [
                { flex: 1, align: 'v', html: `آی دی دسته بندی: ${o.id}`, className: 't-a-right fs-12' },
                { size: 32, align: 'vh', html: options() }
              ]
            },
            {
              flex: 1, align: 'vh', html: (
                <AIOInput
                  type='text' className='h-100' style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'right' }}
                  value={o.name}
                  onChange={(value) => { o.name = value; change() }}
                />
              )
            },
          ]
        }
      ]
    }
  }
  return (
    <RVD
      layout={{
        style: { color: '#fff' },
        column: [
          {
            size: 48, align: 'v',
            html: (
              <button
                onClick={() => add()} className='align-v p-h-12 br-6'
                style={{ gap: 4, background: 'dodgerblue', color: '#fff', border: 'none' }}
              ><Icon path={mdiPlusThick} size={.8} />افزودن دسته بندی</button>
            )
          },
          { flex: 1, className: 'ofy-auto', column: getColumn() }
        ]
      }}
    />
  )
}
