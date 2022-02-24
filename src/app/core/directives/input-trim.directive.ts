import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Directive({
  selector: 'input[trim],textarea[trim]'
})
export class InputTrimDirective implements OnInit, OnDestroy {
  private _trim: '' | 'blur' | false;
  @Input('trim')
  public set trim(trimOption: '' | 'blur' | false) {
    if (trimOption !== '' && trimOption !== 'blur' && trimOption !== false) {
      this._trim = false;
      return;
    }

    this._trim = trimOption;

    const elem = this.elementRef.nativeElement;
    const eleValue = elem.value;
    if (trimOption !== false && eleValue !== eleValue.trim()) {
      // initially trim the value if needed
      InputTrimDirective.dispatchEvent(elem, 'blur');
    }
  }

  public get trim() {
    return this._trim;
  }

  @Input() trimOnWriteValue = true;

  private _valueAccessor: ControlValueAccessor;
  private _writeValue: (value) => void;

  constructor(
    private elementRef: ElementRef,
    @Optional() private ngControl: NgControl
  ) {}

  private static getCaret(el) {
    return {
      start: el.selectionStart,
      end: el.selectionEnd
    };
  }

  private static setCaret(el, start, end) {
    el.selectionStart = start;
    el.selectionEnd = end;

    el.focus();
  }

  private static dispatchEvent(el, eventType) {
    const event = document.createEvent('Event');
    event.initEvent(eventType, false, false);
    el.dispatchEvent(event);
  }

  private static trimValue(el, value) {
    el.value = value.trim();

    InputTrimDirective.dispatchEvent(el, 'input');
  }

  public ngOnInit(): void {
    if (!this.ngControl) {
      return;
    }

    this._valueAccessor = this.ngControl.valueAccessor;

    this._writeValue = this._valueAccessor.writeValue;
    this._valueAccessor.writeValue = value => {
      const _value =
        this.trim === false ||
        !value ||
        'function' !== typeof value.trim ||
        !this.trimOnWriteValue
          ? value
          : value.trim();

      if (this._writeValue) {
        this._writeValue.call(this._valueAccessor, _value);
      }

      if (value !== _value) {
        if (this._valueAccessor['onChange']) {
          this._valueAccessor['onChange'](_value);
        }

        if (this._valueAccessor['onTouched']) {
          this._valueAccessor['onTouched']();
        }
      }
    };
  }

  public ngOnDestroy(): void {
    if (this._valueAccessor && this._writeValue) {
      this._valueAccessor.writeValue = this._writeValue;
    }
  }

  @HostListener('blur', ['$event.target', '$event.target.value'])
  public onBlur(el: any, value: string): void {
    if (this.trim === false) {
      return;
    }

    if (
      (this.trim === '' || 'blur' === this.trim) &&
      'function' === typeof value.trim &&
      value.trim() !== value
    ) {
      InputTrimDirective.trimValue(el, value);
      InputTrimDirective.dispatchEvent(el, 'blur'); // in case updateOn is set to blur
    }
  }

  @HostListener('input', ['$event.target', '$event.target.value'])
  public onInput(el: any, value: string): void {
    if (this.trim === false) {
      return;
    }

    if (
      this.trim === '' &&
      'function' === typeof value.trim &&
      value.trim() !== value
    ) {
      let { start, end } = InputTrimDirective.getCaret(el);

      if (value[0] === ' ' && start === 1 && end === 1) {
        start = 0;
        end = 0;
      }

      InputTrimDirective.trimValue(el, value);

      InputTrimDirective.setCaret(el, start, end);
    }
  }
}
