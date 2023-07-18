import React, { Component } from 'react';
import { Icon } from '@mdi/react';
import { mdiAttachment, mdiClose } from '@mdi/js';
import DownloadUrl from '../aio-functions/download-url';
import AIContext from './context';
export class InputFile extends Component {
    static contextType = AIContext;
    change(e) {
        let { value = [], onChange = () => { } } = this.context;
        let Files = e.target.files;
        let result = [...value];
        let names = result.map(({ name }) => name);
        for (let i = 0; i < Files.length; i++) {
            let file = Files[i];
            if (names.indexOf(file.name) !== -1) { continue }
            result.push({ name: file.name, size: file.size, file })
        }
        onChange(result)
    }
    render() {
        let { disabled, multiple } = this.context;
        let props = { disabled, type: 'file', style: { display: 'none' }, multiple, onChange: (e) => this.change(e) }
        return <input {...props} />
    }
}
export class Files extends Component {
    static contextType = AIContext;
    render() {
        let { value = [], rtl } = this.context;
        if (!value.length) { return null }
        return (
            <div className='aio-input-files' style={{ direction: rtl ? 'rtl' : 'ltr' }}>{value.map((o, i) => <File key={i} {...o} index={i} />)}</div>
        )
    }
}
class File extends Component {
    static contextType = AIContext;
    getFile(filename, fileSize) {
        let nameLength = 20;
        try {
            let minName, sizeString;
            let lastDotIndex = filename.lastIndexOf('.');
            let name = filename.slice(0, lastDotIndex);
            let format = filename.slice(lastDotIndex + 1, filename.length);
            if (name.length > nameLength) {
                minName = name.slice(0, parseInt(nameLength / 2)) + '...' + name.slice(name.length - parseInt(nameLength / 2), name.length) + '.' + format;
            }
            else { minName = filename; }
            let size = fileSize;
            let gb = size / (1024 * 1024 * 1024), mb = size / (1024 * 1024), kb = size / 1024;
            if (gb >= 1) { sizeString = gb.toFixed(2) + ' GB'; }
            else if (mb >= 1) { sizeString = mb.toFixed(2) + ' MB'; }
            else if (kb >= 1) { sizeString = kb.toFixed(2) + ' KB'; }
            else { sizeString = size + ' byte' }
            return { minName, sizeString }
        }
        catch {
            return { minName: 'untitle', sizeString: '0' }
        }
    }
    remove(index) {
        let { onChange = () => { }, value = [] } = this.context;
        let newValue = [];
        for (let i = 0; i < value.length; i++) {
            if (i === index) { continue }
            newValue.push(value[i])
        }
        onChange(newValue);
    }
    render() {
        let { name, url, size, index } = this.props;
        let { minName, sizeString } = this.getFile(name, size);
        return (
            <div className='aio-input-file'>
                <div className='aio-input-file-icon'>
                    <Icon path={mdiAttachment} size={.8} />
                </div>
                <div className='aio-input-file-name' onClick={() => DownloadUrl(url, name)}>
                    {`${minName} (${sizeString})`}
                </div>
                <div className='aio-input-file-icon' onClick={() => this.remove(index)}>
                    <Icon path={mdiClose} size={.7} />
                </div>
            </div>
        )
    }
}