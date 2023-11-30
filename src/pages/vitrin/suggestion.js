import React, { useContext,useState } from "react";
import AIOInput from "../../npm/aio-input/aio-input";
import Icon from "@mdi/react";
import { mdiCamera } from "@mdi/js";
import VitrinContext from "./context";
import './vitrin.css';

export default function Suggestion() {
    let {apis} = useContext(VitrinContext);
    async function addSuggestion() {
        apis.request({
            api: 'vitrin.addSuggestion', description: 'پیشنهاد افزودن محصول به ویترین', parameter: suggestion, message: { success: true },
            onSuccess: () => setSuggestion({ name: '', file: undefined, brand: '' })
        })
    }
    let [suggestion,setSuggestion] = useState({ name: '', file: undefined, brand: '' });
    return (
        <AIOInput
            type='form' lang='fa' value={{...suggestion}} submitText='ثبت' inputStyle={{ border: 'none' }}
            onChange={(obj) => setSuggestion(obj)}
            footerAttrs={{ className: 'vitrin-suggestion-footer' }}
            onSubmit={() => addSuggestion()}
            inputs={{
                column: [
                    { html: 'درخواست افزودن محصول', className: 'fs-18 bold theme-dark-font-color' },
                    { size: 12 },
                    {
                        html: 'ما به سرعت در حال اضافه کردن محصولات جدید به می ارزه هستیم. نام محصول پیشنهادی خود را برای ما بفرستید تا ما در اولویت قرار دهیم.',
                        className: 'fs-12 theme-medium-font-color t-a-right'
                    },
                    { size: 24 },
                    { input: { type: 'text', placeholder: 'نام کامل محصول' }, label: 'نام محصول', field: 'value.name', validations: [['required']] },
                    { input: { type: 'text', placeholder: 'برند محصول' }, label: 'برند محصول', field: 'value.brand', validations: [['required']] },
                    {
                        input: {type: 'image', placeholder: <Icon path={mdiCamera} size={1} />, width: '100%'},
                        label: 'تصویر محصول', field: 'value.image', validations: [['required']]
                    },
                ]
            }}
        />
    )
}