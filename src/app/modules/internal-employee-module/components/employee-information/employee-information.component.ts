import { DialogService, DialogCloseResult } from '@progress/kendo-angular-dialog';
import { Component, OnInit, AfterViewInit, EventEmitter, Output } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Text, Layout, geometry } from '@progress/kendo-drawing';
import { filterBy, CompositeFilterDescriptor, distinct, SortDescriptor } from '@progress/kendo-data-query';
import { LegendLabelsContentArgs } from '@progress/kendo-angular-charts';
import { Subscription } from 'rxjs';
import { AddEmployeesDialogComponent } from '../../dialogs/add-employee-dialog/add-employees-dialog.component'
import { UniversalService } from 'src/app/core/services/universal.service';
import { ContractorRegistrationService } from 'src/app/modules/contractor-Registration-module/services/contractor-Registration.service';
import { AuthenticationService, PageAccess, SessionUser } from 'src/app/core/services/authentication.service';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Router } from '@angular/router';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { DeviceObj, PageObj } from 'src/app/core/models/user.model';
import { EmpDetails, EmployeeData, RoleDetails, EmpDeleteDetails } from './employee-info-model';
import { EmployeeInfoDataService } from './employee-info.service';
import { DeleteAlertComponent } from 'src/app/shared-module/components/delete-alert/delete-alert.component';

@Component({
  selector: 'app-employee-information',
  templateUrl: './employee-information.component.html',
  styleUrls: ['./employee-information.component.scss']
})
export class EmployeeInformationComponent implements OnInit, AfterViewInit {

  public isMobile: boolean;
  public isTab: boolean;
  public isDesktop: boolean;
  public deviceInfo: object = null;
  public deviceResObj: DeviceObj;
  public refressflag: boolean = false;
  public selectedItem;
  public addEditEmployeeResponse: Subscription;
  @Output() alert = new EventEmitter<string>();

  private getApilData: EmployeeData;
  public hidePage: boolean = false;
  public PageName: string = 'Employee Information';
  public disabled: boolean = false;
  public pieData: RoleDetails[];
  public loginDetails: Array<SessionUser> = []; // Array<LoginUser> = [];
  public ContrID: number;
  public veteranCount: number;
  public pageContent: any;
  public pageContentData: any;
  public opened: boolean = false;
  public formOff: boolean = false;
  public IsDisable: boolean = true;
  public removeEmpDetails: EmpDeleteDetails[] = [];
  public loggedInUserType: string;
  public $pagePrivilege: PageAccess = { readonlyAccess: false, editAccess: false };
  public readonlyMode: boolean = false;
  public employee: EmpDetails[] = [];
  public filter: CompositeFilterDescriptor = null;
  public contractorName: string;
  public visible: boolean = false;
  public allowUnsort: boolean = true;
  public sort: SortDescriptor[] = [];


  public gridData: EmpDetails[] = filterBy(this.employee, this.filter);
  public dropdownData: Array<{ ContrEmployeeTypeID: number, EmployeeRole: string, EmployeeRoleTranslated: string }> = [];

  public pageSize: number = 10;
  public skip: number = 0;
  public buttonCount: number = 5;
  public info: boolean = true;

  public step: string = '';
  public pageHeight: number = 300;
  public pageObj: PageObj = {
    buttonCount: 5,
    info: true,
    type: 'numeric',
    pageSizes: true,
    previousNext: true
  };

  constructor(private _srvDeviceDetector: DeviceDetectorService,
    private _srvContrRegistration: ContractorRegistrationService,
    private _srvUniversal: UniversalService,
    private _srvDialog: DialogService,
    private _srvAuthentication: AuthenticationService,
    private _route: Router,
    private _srvLanguage: InternalUserDetailsService,
    public _srvEmployeeInfoData: EmployeeInfoDataService) {
    this.labelContent = this.labelContent.bind(this);
    this.pageContent = this._srvLanguage.getPageContentByLanguage();
    this.pageContentData = this._srvLanguage.getPageContentByLanguage();

  }

  public labelContent(args: LegendLabelsContentArgs): string {
    return `${args.dataItem.RoleName}`;
  }

  public filterChange(filter: CompositeFilterDescriptor): void {
    this.filter = filter;
    this.gridData = filterBy(this.employee, filter);
  }

  public distinctPrimitive(fieldName: string) {
    return distinct(this.employee, fieldName).map(item => item[fieldName]);
  }

  ngOnInit() {

    this.loginDetails = Array(this._srvAuthentication.Profile);
    this.ContrID = this.loginDetails[0].ContrID;
    this.loggedInUserType = this._srvAuthentication.LoggedInUserType;
    this.$pagePrivilege = this._srvAuthentication.getPageAccessPrivilege('Employee Information');

    if (this.loginDetails[0].ContrID > 0) {
      if (!this.$pagePrivilege.editAccess && this.$pagePrivilege.readonlyAccess) {
        this.readonlyMode = true;
      }
      else {
        if (!this.$pagePrivilege.editAccess && !this.$pagePrivilege.readonlyAccess) {
          this.accessDenied();
        }
      }
    }
    this.getDropdownata()
    this.getGridData();

    this.deviceResObj = this._srvUniversal.deviceResolution();
    this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
    this.isMobile = this._srvDeviceDetector.isMobile();
    this.isTab = this._srvDeviceDetector.isTablet();
    this.isDesktop = this._srvDeviceDetector.isDesktop();
    if (this.isMobile === true) {
      this.pageSize = 1;
      this.pageObj.buttonCount = 1;
    } else if (this.isTab === true) {
      if (window.screen.orientation.type === 'portrait-primary') {
        this.pageSize = 2;
        this.pageObj.buttonCount = 2;
      } else {
        this.pageSize = 5;
        this.pageObj.buttonCount = 5;
      }
    } else if (this.isDesktop === true) {
      this.pageSize = 10;
      this.pageObj.buttonCount = 10;
    }
    this.pageSize = this.deviceResObj.pageSize;
    this.pageObj = this.deviceResObj.pageObj;

    this.addEditEmployeeResponse = this._srvContrRegistration.addEmployeeDialog.subscribe(message => {
      if (message === 1) {
        this.alert.emit('Data updated successfully!');
        this.getGridData();
        this._srvContrRegistration.addEmployeeDialog.next(0);
      }
      else if (message === 2) {
        this.alert.emit('Something went wrong!');
        this._srvContrRegistration.addEmployeeDialog.next(0);
      }
    })
  }

  ngAfterViewInit() {
    // layout data
    this._srvUniversal.gridLayout.subscribe((layout: any) => {

      this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
      if (Object.keys(layout).length > 0) {
        this.pageSize = layout.pageSize;
        this.pageObj = layout.pageObj;
        this.skip = 0;
        if (this.isTab === true) {
          if (window.screen.orientation.type === 'portrait-primary') {
            this.pageSize = 2;
            this.pageObj.buttonCount = 2;
          } else {
            this.pageSize = 5;
            this.pageObj.buttonCount = 5;
          }
        }
      }
    });
  }
  public labelVisual(e) {
    const visual = e.createVisual();
    const text = new Text(e.category, [0, 0], {
      fill: {
        color: 'red'
      }
    });
    const layout = new Layout(new geometry.Rect(visual.bbox().origin, [0, 1000]), {
      orientation: 'vertical',
      alignItems: 'start'
    });
    layout.append(visual, text);
    layout.reflow();
    return layout;
  }


  public open() {
    this.opened = true;
  }
  public close(status) {
    this.opened = false;
  }

  changeClass() {
    this.formOff = !this.formOff;
  }

  // This method is use to add and edit employee details.
  public addEmployee(option, selectedData?) {
    const alertDialog = this._srvDialog.open({
      content: AddEmployeesDialogComponent,
      width: 500
    });
    if (option === 'ADD') {
      this.selectedItem = selectedData;
      alertDialog.result.subscribe(r => {
        const data = r['status'];
      });
    }
    else if (option === 'EDIT') {
      ;
      this.selectedItem = selectedData;

      const employeeInfo = alertDialog.content.instance;
      employeeInfo.incomingData = this.selectedItem;
      employeeInfo.ActionType = option;
    }
  }

  async getDropdownata() {
    const dropdownResponse = await this._srvEmployeeInfoData.getEmpInfoDropdown(this.loggedInUserType, this.loginDetails[0]);
    this.dropdownData = dropdownResponse._empType;
  }

  // get grid data and charts data in the required format from the given Url
  async getGridData() {
    this.getApilData = await this._srvEmployeeInfoData.getEmpAndRoleData(this.loginDetails[0], this.loggedInUserType);
    this.setData(this.getApilData);
  }

  setData(res) {
    console.log(this.dropdownData)
    this.pieData = res.RoleDetails.filter(x => x.Rolecount !== 0);
    this.gridData = res.EmpDetails;

    this.gridData.map((empInfo, index) => {
      empInfo.Srno = index + 1;

      if (empInfo.Phone == null || empInfo.Phone === '') {
        empInfo.Phone = 'N/A';
      }
      else {
        empInfo.Phone = empInfo.Phone.replace(/-/g, '');
      }
      if (empInfo.Email == null || empInfo.Email === '') {
        empInfo.Email = 'N/A';
      }
      else {
        empInfo.Email = empInfo.Email;
      }

    });


    this.gridData.forEach((ele) => {
      if (ele.EmployeeRole === 'Owner' || ele.EmployeeRole === 'Principal' || ele.EmployeeRole === 'Primary Owner') {
        ele['Disableflag'] = true;
      }
      else {
        ele['Disableflag'] = false;
      }
    });

    this.employee = this.gridData;
    this.veteranCount = res.EmpDetails[0].VeteranFlgCount;
    this.contractorName = res.EmpDetails[0].ContractorCompanyName;

  }
  // this method is use to refress grid data
  public refress() {
    this.getGridData();
    this.refressflag = false;
  }
  // This method is use to bind Grid data when we click on pie chart according to role
  public onSeriesClick(event) {
    debugger
    this.refressflag = true;
    this.gridData = [];
    this.gridData = this.employee.filter(x => x.EmployeeRoleTranslated === event.category && x.EmployeeRoleTranslated != null);
  }
  // This method is use to bind Grid data when we click on pie chart tooltip  according to role
  public TooltipClick(event) {
    this.refressflag = true;
    this.gridData = [];
    this.gridData = this.employee.filter(x => x.EmployeeRoleTranslated === event && x.EmployeeRoleTranslated != null);
  }

  // this method check access of this page according to user
  public accessDenied() {
    this.hidePage = true;
    const dialogRef = this._srvDialog.open({
      content: DialogAlertsComponent,
      width: 500,
    });
    const dialog = dialogRef.content.instance;
    dialog.alertMessage = `
   <div class="modal-alert info-alert">
         <h2>${this.pageContent.Employee_Info.Employee_Info_Alert_Access_Denied}</h2>
       <p>${this.pageContent.Employee_Info.Employee_Info_Alert_Access_Denied_Stmt}</p>
    </div>
    `;

    dialogRef.result.subscribe(res => {
      if (res instanceof DialogCloseResult) {
        this._route.navigate(['/contractorRegistration/company-information']);
      } else {
        this._route.navigate(['/contractorRegistration/company-information']);
      }
    })

  }

  // checkbox check event method
  public checkboxClick(event, selectedData?) {
    if (selectedData.EmployeeRole === 'Primary Contact') {
      this.OpenDialogAlertsComponent(event);
    }
    if (event.currentTarget.checked === true) {
      this.removeEmpDetails.push({
        CONTR_ID: selectedData.CONTR_ID,
        PRNL_ID: selectedData.PRNL_ID,
        ContrEmployeeTypeID: selectedData.ContrEmployeeTypeID
      });
    }
    else {
      this.removeEmpDetails.forEach((ele, index) => {
        if (ele.CONTR_ID === selectedData.CONTR_ID
          && ele.ContrEmployeeTypeID === selectedData.ContrEmployeeTypeID && ele.PRNL_ID === selectedData.PRNL_ID) {
          this.removeEmpDetails.splice(index, 1)
        }
      });

    }

    this.IsDisable = this.removeEmpDetails.length === 0 ? true : false;
  }

  public OpenDialogAlertsComponent(event) {
    const dialogRef = this._srvDialog.open({
      content: DialogAlertsComponent,
      width: 600,
    });
    const dialog = dialogRef.content.instance;
    dialog.alertMessage = `
                      <div class="modal-alert info-alert">
                          <p>${this.pageContent.Employee_Info.Emp_Checkbox_Alert}
                          </p>
                      </div>
                  `;
    event.currentTarget.checked = false;
    return dialogRef

  }

  // Delete button cleck event
  public async deleteEmployee(event) {
    if (this.removeEmpDetails.length === 0) {
      const dialogAlert = this._srvDialog.open({ content: DialogAlertsComponent, width: 500 });
      const dialogData = dialogAlert.content.instance;
      dialogData.header = this.pageContentData.Event_Selection.Alert;

      dialogData.alertMessage = `
      <div class="modal-alert info-alert">
       <p>${this.pageContent.Employee_Info.Emp_Pls_Select}</p>
      </div> `;

    }
    else {
      const dialogAlert = this._srvDialog.open({ content: DeleteAlertComponent, width: 500 });
      const dialogData = dialogAlert.content.instance;
      dialogData.header = this.pageContentData.Event_Selection.Alert;
      dialogData.alertMessage = `
<div class="modal-alert info-alert">
 <p>${this.pageContent.Employee_Info.Emp_Delete_Msg}</p>
</div> `;

      dialogAlert.result.subscribe(async (result) => {
        const resultFromDialog = result;
        if (resultFromDialog['button'] === 'Yes') {
          const objdelete = {
            removeEmpDetails: this.removeEmpDetails
          }
          const response = await this._srvEmployeeInfoData.deleteEmployeeInfo(objdelete);

          if (response.body === 1) {
            this.removeEmpDetails = [];
            const dialogRef = this._srvDialog.open({
              content: DialogAlertsComponent,
              width: 500,
            });
            const dialog = dialogRef.content.instance;
            dialog.alertMessage = `
                                  <div class="modal-alert confirmation-alert">
                                      <h2>${this.pageContent.Employee_Info.Emp_Delete_head}</h2>
                                      <p>${this.pageContent.Employee_Info.Emp_Delete_SuccessMsg}</p>
                                  </div>
                              `;

          }
          this.gridData = [];
          this.getGridData();
          this.IsDisable = true;
          return;
        }
      })
    }
  }
}
