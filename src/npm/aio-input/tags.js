import React,{Component,createRef} from 'react';
import {Icon} from '@mdi/react';
import {mdiCircleMedium,mdiClose} from '@mdi/js';

export default class Tags extends Component {
  render() {
    let {tags,rtl} = this.props;
    if(!tags.length){return null}
    return (
      <div className={`aio-input-tags${rtl ? ' rtl' : ''}`}>
        {tags.map((o)=><Tag {...o}/>)}
      </div>
    )
  }
}

function Tag(props) {
  let {text,disabled,tagAttrs = {},onRemove,tagBefore = <Icon path={mdiCircleMedium} size={0.7}/>,tagAfter } = props;
  return (
    <div {...tagAttrs} className={'aio-input-tag' + (tagAttrs.className ? ' ' + tagAttrs.className : '') + (disabled ? ' disabled' : '')} style={tagAttrs.style}>
      <div className='aio-input-tag-icon'>{tagBefore}</div>
      <div className='aio-input-tag-text'>{text}</div>
      {tagAfter !== undefined && <div className='aio-input-tag-icon'>{tagAfter}</div>}
      <div className='aio-input-tag-icon'><Icon path={mdiClose} size={0.7} onClick={onRemove}/></div>
    </div>
  )
}