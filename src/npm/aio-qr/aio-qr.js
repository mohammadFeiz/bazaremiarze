import React, { Component } from "react";
import QrReader from "react-qr-reader";
import QRCode from 'qrcode'

export class ReactQrReader extends Component {
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
        let { style } = this.props
        return (
            <QrReader
                delay={300}
                onError={this.handleError}
                onScan={this.handleScan}
                style={{ width: "100%", ...style }}
                facingMode="environment"
            />
        )
    }
}

export class ReactQrGenerator extends Component {
    generateQR(str) {
        QRCode.toCanvas(document.getElementById('canvas'), str, function (error) {
            if (error) console.error(error)
            //console.log('success!')
        })
    }
    componentDidUpdate(){
        let {code} = this.props;
        if(code){this.generateQR(code)}
    }
    render() {
        return (
            <canvas id="canvas" />
        )
    }
}