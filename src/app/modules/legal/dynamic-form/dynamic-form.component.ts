import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { Control, Option } from '../models';

@Component({
    selector: 'dynamic-form',
    template: `
        <ng-container [formGroup]="form" [ngSwitch]="Control.type">
            <textbox *ngSwitchCase="'Text'" [Control]="Control" [form]="form"></textbox>
            <dropdown *ngSwitchCase="'Dropdown'" [Control]="Control" [form]="form" [pageContent]="pageContent"></dropdown>
            <text-area *ngSwitchCase="'Textarea'" [Control]="Control" [form]="form"></text-area>
            <datepicker *ngSwitchCase="'Datepicker'" [Control]="Control" [form]="form" [pageContent]="pageContent"></datepicker>
            <toggle *ngSwitchCase="'Switch'" [Control]="Control" [form]="form" [pageContent]="pageContent"></toggle>
        </ng-container>
    `,
})
export class DynamicFormComponent {
    @Input() form: FormGroup;
    @Input() Control: Control;
    pageContent: any;
    constructor(public _language: InternalUserDetailsService) {
        this.pageContent = this._language.getPageContentByLanguage();
    }
}

@Component({
    selector: 'textbox',
    template: `
        <kendo-textbox-container [ngClass]="[Control.required ? 'required' : '']" [formGroup]="form" [floatingLabel]="Control.label">
            <input
                trim="blur"
                kendoTextBox
                [ngClass]="[Control.pendingApproval ? 'visual-cue' : '']"
                [formControlName]="Control.label"
                maxlength="100"
                [(ngModel)]="Control.value"
                [required]="Control.required"
                [readonly]="Control.readonly"
                [attr.disabled]="Control.disable"
            />
        </kendo-textbox-container>
    `,
})
export class TextboxComponent {
    @Input() form: FormGroup;
    @Input() Control: Control;
}

@Component({
    selector: 'dropdown',
    template: `
        <kendo-textbox-container [ngClass]="[Control.required ? 'required' : '']" [formGroup]="form" [floatingLabel]="Control.label">
            <kendo-dropdownlist
                [ngClass]="[Control.pendingApproval ? 'visual-cue' : '']"
                [formControlName]="Control.label"
                [(ngModel)]="Control.value"
                [data]="Control.labelForCondition === 'State/Province' ? filteredStateOption : Control.labelForCondition === 'County' ? filteredCountyOption : Control.options"
                textField="text"
                valueField="value"
                [required]="Control.required"
                [readonly]="Control.readonly"
                [attr.disabled]="Control.disable"
                [filterable]="Control.labelForCondition === 'State/Province' || Control.labelForCondition === 'County' ? true : false"
                (filterChange)="handleFilter($event)"
                (click)="Control.labelForCondition === 'County' ? getCounty() : null"
                (keyup)="Control.labelForCondition === 'County' ? getCounty() : null"
                (valueChange)="[Control?.handler ? Control.handler(Control) : null]"
            >
                <ng-template kendoDropDownListNoDataTemplate> {{ this.pageContent.DropDown_NoData_Msg.Message }} </ng-template>
            </kendo-dropdownlist>
        </kendo-textbox-container>
    `,
})
export class DropdownComponent {
    @Input() form: FormGroup;
    @Input() Control: Control;
    @Input() pageContent: any;
    filteredStateOption: Option[];
    filteredCountyOption: Option[];
    ngOnInit() {
        this.filteredStateOption = this.Control.options;
    }
    getCounty() {
        this.filteredCountyOption = this.Control.options;
    }
    handleFilter(event) {
        if (this.Control.labelForCondition === 'State/Province') {
            this.filteredStateOption = this.Control.options.filter((s) => s.text.toLowerCase().indexOf(event.toLowerCase()) !== -1);
        }
        if (this.Control.labelForCondition === 'County') {
            this.filteredCountyOption = this.Control.options.filter((s) => s.text.toLowerCase().indexOf(event.toLowerCase()) !== -1);
        }
    }
}

@Component({
    selector: 'text-area',
    template: `
        <kendo-textbox-container [ngClass]="[Control.required ? 'required' : '']" [formGroup]="form" [floatingLabel]="Control.label">
            <textarea
                trim="blur"
                kendoTextArea
                maxlength="500"
                [ngClass]="[Control.pendingApproval ? 'visual-cue' : '']"
                [formControlName]="Control.label"
                [(ngModel)]="Control.value"
                [required]="Control.required"
                [readonly]="Control.readonly"
                [attr.disabled]="Control.disable"
                trim="blur"
                maxlength="2000"
            ></textarea>
        </kendo-textbox-container>
    `,
})
export class TextareaComponent {
    @Input() form: FormGroup;
    @Input() Control: Control;
}

@Component({
    selector: 'datepicker',
    template: `
        <kendo-textbox-container [ngClass]="[Control.required ? 'required' : '']" [formGroup]="form" [floatingLabel]="Control.label">
            <kendo-datepicker
                [ngClass]="[Control.pendingApproval ? 'visual-cue' : '']"
                [formControlName]="Control.label"
                [min]="minDate"
                [max]="maxDate"
                format="MM/dd/yyyy"
                [required]="Control.required"
                [readonly]="Control.readonly"
                [attr.disabled]="Control.disable"
                [(ngModel)]="Control.value"
            >
                <kendo-datepicker-messages toggle="{{ pageContent.General_Keys.Toggle_Calender }}"></kendo-datepicker-messages>
            </kendo-datepicker>
        </kendo-textbox-container>
    `,
    styles: [
        `
            .k-datepicker {
                margin-bottom: 15px;
                display: block;
            }
        `,
    ],
})
export class DatepickerComponent {
    @Input() form: FormGroup;
    @Input() Control: Control;
    minDate = new Date(1900, 1, 1);
    maxDate = new Date();
    @Input() pageContent: any;
}

@Component({
    selector: 'toggle',
    template: `
        <div class="dynamic-field" style="margin: 10px 0 20px 0" [formGroup]="form">
            <span>{{ Control.label }} </span>
            <kendo-switch
                [ngClass]="[Control.required ? 'required' : '', Control.pendingApproval ? 'visual-cue' : '']"
                [(ngModel)]="Control.value"
                [formControlName]="Control.label"
                (valueChange)="[Control?.handler ? Control.handler(Control) : null]"
                [readonly]="Control.readonly"
                [attr.disabled]="Control.disable"
            >
            </kendo-switch>
            <p>{{ pageContent.Legal_Item_Information.Legal_Switch_Text }}</p>
        </div>
    `,
})
export class ToggleComponent {
    @Input() form: FormGroup;
    @Input() Control: Control;
    @Input() pageContent: any;
}
