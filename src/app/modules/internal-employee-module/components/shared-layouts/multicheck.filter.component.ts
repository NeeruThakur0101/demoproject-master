import { Component, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CompositeFilterDescriptor, distinct, filterBy, FilterDescriptor } from '@progress/kendo-data-query';
import { FilterService } from '@progress/kendo-angular-grid';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';

@Component({
    selector: 'multicheck-filter',
    template: `
        <ul>
            <li *ngIf="showFilter">
                <input class="k-textbox" (input)="onInput($event)" />
            </li>
            <li *ngFor="let item of currentData; let i = index" (click)="onSelectionChange(valueAccessor(item))" [ngClass]="{ 'k-state-selected': isItemSelected(item) }">
                <input type="checkbox" id="chk-{{ valueAccessor(item) }}" class="k-checkbox" [checked]="isItemSelected(item)" />
                <label class="k-multiselect-checkbox k-checkbox-label" for="chk-{{ valueAccessor(item) }}" [innerHTML]="textAccessor(item)"> </label>
            </li>
        </ul>
    `,
    styles: [
        `
            ul {
                list-style-type: none;
                height: 200px;
                overflow-y: scroll;
                padding-left: 0;
                padding-right: 12px;
            }

            ul > li {
                padding: 8px 12px;
                border: 1px solid rgba(0, 0, 0, 0.08);
                border-bottom: none;
            }

            ul > li:last-of-type {
                border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            }

            .k-multiselect-checkbox {
                pointer-events: none;
            }
        `,
    ],
})
export class MultiCheckFilterComponent implements AfterViewInit {
    @Input() public isPrimitive: boolean;
    @Input() public currentFilter: CompositeFilterDescriptor;
    @Input() public data;
    @Input() public textField;
    @Input() public valueField;
    @Input() public filterService: FilterService;
    @Input() public field: string;
    public pageContent: any;
    @Output() public valueChange = new EventEmitter<number[]>();

    public currentData: any;
    public showFilter = true;
    private value: any[] = [];

    public textAccessor = (dataItem: any) => {
        if (this.isPrimitive) {
            if (dataItem === null) {
                // return 'EMPTY';
                return this.pageContent.General_Keys.Empty;
            } else if (dataItem === '') {
                // return 'EMPTY';
                return this.pageContent.General_Keys.Empty;
            }
            else if(typeof dataItem === 'string' && dataItem.toLowerCase() === 'multiple')
            {
                return this.pageContent.Internal_Landing.Multiple;
            }
            else {
                return dataItem;
            }
        } else {
            return dataItem[this.textField];
        }
    };

    public valueAccessor = (dataItem: any) => (this.isPrimitive ? dataItem : dataItem[this.valueField]);

    constructor(public _srvInternalUser: InternalUserDetailsService) {
        this.pageContent = this._srvInternalUser.getPageContentByLanguage();
    }
    public ngAfterViewInit() {
        // this.data = this.data.map(ele => {
        //     if (ele === null || ele === '') {return 'EMPTY';} else { return ele; }
        // });
        this.currentData = this.data;
        this.value = this.currentFilter.filters.map((f: FilterDescriptor) => f.value);

        this.showFilter = typeof this.textAccessor(this.currentData[0]) === 'string' || typeof this.textAccessor(this.currentData[0]) === 'number';
    }

    public isItemSelected(item) {
        return this.value.some((x) => x === this.valueAccessor(item));
    }

    public onSelectionChange(item) {
        if (this.value.some((x) => x === item)) {
            this.value = this.value.filter((x) => x !== item);
        } else {
            this.value.push(item);
        }
        this.filterService.filter({
            filters: this.value.map((value) => ({
                field: this.field,
                operator: this.getOperator(value),
                value,
            })),
            logic: 'or',
        });
    }

    public onInput(e: any) {
        this.currentData = distinct(
            [
                ...this.currentData.filter((dataItem) => this.value.some((val) => val === this.valueAccessor(dataItem))),
                ...filterBy(this.data, {
                    operator: 'contains',
                    field: this.textField,
                    value: e.target.value,
                }),
            ],
            this.textField
        );
    }

    private getOperator(value) {
        const options = {
            null: 'isnull',
            '': 'isempty',
        };
        return options[value] || 'eq';
    }
}
