import React from 'react';
import RVD from './../npm/react-virtual-dom/react-virtual-dom';
import { Icon } from '@mdi/react';
import { mdiAlert } from '@mdi/js';
import EPSrc from './../images/ep.jpg';

export default function PageError({text,subtext}){
    return (
      <RVD
        layout={{
          className: 'page-error fullscreen',
          row: [
            { flex: 1 },
            {
              className: 'page-error-image',
              column: [
                { flex: 3 },
                { html: <img src={EPSrc} width='100%' alt=''/> },
                { size: 24 },
                { html: <Icon path={mdiAlert} size={4} />, align: 'h' },
                { html: text, align: 'h' },
                { html: subtext, align: 'h' },
                { size: 36 },
                { html: 'بارگزاری مجدد', className: 'bm-reload', attrs: { onClick: () => window.location.reload() } },
                { flex: 2 }
              ]
            },
            { flex: 1 }
          ]
        }}
      />
    )
  }