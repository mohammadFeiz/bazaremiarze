
import React from 'react';
export default function SearchBox(props) {
    let { value, placeholder, onChange } = props;
    return (
        <div className='aio-input-search'>
            <input type='text' value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
            <div className='aio-input-search-icon' onClick={() => { onChange('') }}>
                {
                    value &&
                    <svg viewBox="0 0 24 24" role="presentation" style={{ width: '1.2rem', height: '1.2rem' }}><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style={{ fill: 'currentcolor' }}></path></svg>
                }
                {
                    !value &&
                    <svg viewBox="0 0 24 24" role="presentation" style={{ width: '1.2rem', height: '1.2rem' }}><path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" style={{ fill: 'currentcolor' }}></path></svg>
                }
            </div>

        </div>
    )
}