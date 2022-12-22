import React, { Component } from 'react';
import AIOLoading from './../../npm/aio-loading/aio-loading';
export default class Loading extends Component {
  cubes2(obj = {}) {
    var { count = 5, thickness = [5, 16], delay = 0.1, borderRadius = 0, colors = ['dodgerblue'], duration = 1, gap = 3 } = obj;
    let Thickness = Array.isArray(thickness) ? thickness : [thickness, thickness];
    let getStyle1 = (i) => {
      return {
        width: Thickness[0], height: Thickness[1], background: colors[i % colors.length], margin: `0 ${gap / 2}px`,
        animation: `${duration}s loadingScaleY infinite ease-in-out ${i * delay + 1}s`,
        borderRadius: borderRadius + 'px'
      }
    }
    let chars = ['B', 'U', 'R', 'U', 'X']
    let items = [];
    for (var i = 0; i < count; i++) {
      items.push(<div key={i} className='cube' style={getStyle1(i)}>{chars[i]}</div>)
    }
    return (
      <div className="rect" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
        {items}
      </div>
    )
  }

  render() {
    return (
      <div className='loading'>
        <div className='loading-inner'>
        <AIOLoading config={{
          "name": "cubes2",
          "count": 5,
          "size": 60,
          "gap": 3,
          "thickness": [
            4,
            36
          ],
          "fill": "#ffffff",
          "duration": 1,
          "delay": 0.1
        }} />
        </div>
      </div>
    );
  }
}