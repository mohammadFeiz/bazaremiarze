import AIOInput,{
    AIOValidation as _AIOValidation,
    getFormInputs as _getFormInputs,
    getFormInput as _getFormInput
} from 'aio-input';
AIOInput.defaults.mapApiKeys = {
    map:'web.68bf1e9b8be541f5b14686078d1e48d2',
    service:'service.30c940d0eff7403f9e8347160e384cc9'
}

export default AIOInput;
export function AIOValidation(props){return _AIOValidation(props)}
export function getFormInputs(fields,path){return _getFormInputs(fields,path)}
export function getFormInput(field,path){return _getFormInput(field,path)}