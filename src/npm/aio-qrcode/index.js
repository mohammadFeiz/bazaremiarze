import React, { Component,createRef } from "react";
import QrReader from "react-qr-reader";
import QRCode from 'qrcode';
import './aio-qrcode.css';

export default function AIOQrCode(){
    return {
        render_qr({code,attrs}){
            return <ReactQrGenerator code={code} attrs={attrs}/>
        },
        render_reader({onError,onScan,attrs}){
            return <ReactQrReader {...{onError,onScan,attrs}}/>
        }
    }
}

class ReactQrReader extends Component {
    handleError(err) {
        let { onError = () => { } } = this.props;
        onError(err);
    }
    handleScan(data) {
        if (data) {
            let { onScan = () => { } } = this.props;
            onScan(data);
        }
    }
    render() {
        let { attrs = {}} = this.props
        let {style,className} = attrs;
        return (
            <div>
                <QrReader
                    {...attrs}
                    delay={300}
                    onError={(err)=>this.handleError(err)}
                    onScan={(data)=>this.handleScan(data)}
                    style={{ width: "100%",...style}}
                    className={'aio-qr-reader' + (className?' ' + className:'')}
                    facingMode="environment"
                />

            </div>
        )
    }
}

class ReactQrGenerator extends Component {
    generateQR() {
        let {code} = this.props;
        QRCode.toCanvas(document.getElementById('aioqrcanvas'), code, function (error) {
            if (error) console.error(error)
        })
    }
    componentDidUpdate(){this.generateQR();}
    componentDidMount(){this.generateQR();}
    render = () =><canvas {...this.props.attrs} id="aioqrcanvas"/>
}