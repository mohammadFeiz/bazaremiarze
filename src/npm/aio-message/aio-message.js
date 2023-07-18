import $ from 'jquery';
import './aio-message.css';
export default function AIOMessage(obj = {}) {
    let { icon, type = '', text = '', subtext = '', time = 10, className, closeText = 'بستن' } = obj;
    let $$ = {
        time: 0,
        getId() {
            return 'aa' + Math.round((Math.random() * 100000000))
        },
        getBarRender() {
            return `<div class='aio-message-time-bar' style="width:${$$.time}%;"></div>`
        },
        updateBarRender() {
            $(`.aio-message-alert-container.${$$.id} .aio-message-time`).html($$.getBarRender())
        },
        getRender() {
            return (`
        <div class='aio-message-alert-container ${$$.id}${className ? 'aio-message' + className : ''}'>
          <div class='aio-message-alert'>
            <div class='aio-message-alert-header'>${$$.getIcon()}</div>
            <div class='aio-message-alert-body'>
              <div class='aio-message-alert-text'>${text}</div>
              <div class='aio-message-alert-subtext'>${subtext}</div>
            </div>
            <div class='aio-message-alert-footer'>
              <button class='aio-message-alert-close ${$$.id}'>${closeText}</button>    
            </div>
            <div class='aio-message-time'></div>
          </div>    
        </div>
      `)
        },
        close() {
            $('.' + $$.id).remove()
        },
        getIcon() {
            if (icon === false) { return '' }
            return icon || {
                error: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" style="fill: red;"></path></svg>`),
                warning: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" style="fill: orange;"></path></svg>`),
                info: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" style="fill: dodgerblue;"></path></svg>`),
                success: (`<svg viewBox="0 0 24 24" role="presentation" style="width: 4.5rem; height: 4.5rem;"><path d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20M16.59 7.58L10 14.17L7.41 11.59L6 13L10 17L18 9L16.59 7.58Z" style="fill: green;"></path></svg>`)
            }[type] || ''
        },
        startTimer() {
            setTimeout(() => {
                if ($$.time >= 100) {
                    $$.time = 100;
                    $$.close();
                    return
                }
                $$.time += 2;
                $$.updateBarRender();
                $$.startTimer();
            }, time / 50 * 1000)
        },
        render() {
            $('body').append($$.getRender());
            $('button.' + $$.id).off('click', $$.close);
            $('button.' + $$.id).on('click', $$.close)
        }
    }
    $$.id = $$.getId();
    $$.render();
    if (time) { $$.startTimer(); }
}