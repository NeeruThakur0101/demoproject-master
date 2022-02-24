import { Component, OnInit, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from 'src/app/core/services/http-service';
import { MustMatch } from 'src/app/shared-module/validations/must-match';
import { Router } from '@angular/router';
import { DialogService } from '@progress/kendo-angular-dialog';
import { SuccessComponent } from '../../dialogs/success/success.component';
import { DialogAlertsComponent } from 'src/app/shared-module/components/dialog-alerts/dialog-alerts.component';
import { Signup } from './model';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { StateServiceModel } from 'src/app/modules/contractor-Registration-module/components/contractor-location/model_location';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, AfterViewInit {
    private baseUrlAlt: string = environment.api_url;
    public regForm: FormGroup;
    public loader: boolean = false;
    public submitted: boolean = false;
    public countryId: number;
    public stateId: number;
    public Result: Array<{ Name: string; Abbreviation: string; ID: number }> = [];
    public countries: Array<{ Name: string; Abbreviation: string; ID: number }> = [];
    public countryData: Array<{ Name: string; Abbreviation: string; ID: number }>;

    public languageListData: Array<{ LanguageName: string; WorldLanguageID: number }> = [];
    public languageList: Array<{ LanguageName: string; WorldLanguageID: number }>;

    public states: Array<{ Name: string; ID: number }> = [];
    public stateData: Array<{ Name: string; ID: number }>;
    public resultRole: Array<{ ContractorEmployeeType: string; ContrEmployeeTypeID: number }> = [];
    public roles: Array<{ ContractorEmployeeType: string; ContrEmployeeTypeID: number }> = [];
    public roleData: Array<{ ContractorEmployeeType: string; ContrEmployeeTypeID: number }>;
    public pageContent: any;
    public selectedLanguage: number = 0; // default sert to 0 as english
    public selectedState: number;
    public selectedCountry: number;
    public Please_Contact: string;
    public mobile_number: string;
    public Email_Id: string;
    @ViewChild('dropdownlistCountry', { static: false }) public dropdownlistCountry: any;
    @ViewChild('dropdownlistState', { static: false }) public dropdownlistState: any;
    @ViewChild('dropdownlistLanguage', { static: false }) public dropdownlistLanguage: any;
    constructor(
        private formBuilder: FormBuilder,
        private dialogService: DialogService,
        private apiService: ApiService,
        private route: Router,
        private $http: HttpClient,
        private _srvLanguage: InternalUserDetailsService
    ) {
        this.pageContent = this._srvLanguage.getPageContentByLanguageForSignup(0);
        this.Please_Contact = this.pageContent.Sign_Up.Please_Contact_US;
        this.mobile_number = '800-586-9585';
        this.Email_Id = 'recruiting@contractorconnection.com';
    }
    @HostListener('mousedown')
    onMousedown(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    @HostListener('mouseup')
    onMouseup(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    public ddlLanguage() {
        let param = new HttpParams();
        param = param.append('userLanguageId', this.selectedLanguage.toString());
        this.apiService.get('Signup/WorldLanguage', { params: param }).subscribe((res) => {
            this.loader = false;
            this.languageList = res;
            this.languageListData = this.languageList.slice();
        });
    }

    changeContent(value) {
        if (value.Abbreviation === 'US') {
            this.Please_Contact = this.pageContent.Sign_Up.Please_Contact_US;
            this.mobile_number = '800-586-9585';
            this.Email_Id = 'recruiting@contractorconnection.com';
        }
        else if(value.Abbreviation === 'CA' && this.selectedLanguage === 1)
        {
            this.Please_Contact = this.pageContent.Sign_Up.Please_Contact_Canada;
            this.mobile_number = '1-844-407-7222';
            this.Email_Id = 'ServiceAuxMembres@ContractorConnection.ca';
        }
        else if (value.Abbreviation === 'CA') {
            this.Please_Contact = this.pageContent.Sign_Up.Please_Contact_Canada;
            this.mobile_number = '1-844-407-7222';
            this.Email_Id = 'MembershipServices@ContractorConnection.ca';
        }
    }

    public changeCountry(value) {
        this.changeContent(value);
        this.selectedCountry = value.ID;
    }
    public ddlCountry() {
        this.loader = true;
        let param = new HttpParams();
        param = param.append('userLanguageId', this.selectedLanguage.toString());
        this.apiService.get('Signup/GetSignupData', { params: param }).subscribe((res) => {
            this.loader = false;
            this.Result = res.Country;
            this.countries = this.Result;
            this.countryData = this.countries.slice();
            if (this.selectedCountry != undefined) {
                this.getStatesList(this.selectedCountry);
            }
        });
    }
    ngOnInit() {
        // this is used to bind country list
        this.ddlCountry();
        this.ddlLanguage();
        this.regForm = this.formBuilder.group(
            {
                companyName: ['', Validators.required],
                firstName: ['', Validators.required],
                lastName: ['', Validators.required],
                email: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
                confirmEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_À-ú\.\-])+\@(([a-zA-Z0-9À-ú\-])+\.)+([a-zA-Z0-9À-ú]{2,4})+$/)]],
                country: ['', Validators.required],
                state: ['', Validators.required],
                language: ['', Validators.required],
                role: [false],
                recaptchaReactive: [null, Validators.required],
            },
            {
                validator: MustMatch('email', 'confirmEmail'),
            }
        );

        this.countrySelectionChange();
    }

    // reset state dropdown on change of country dropdown
    public countrySelectionChange(): void {
        const stateControl = this.regForm.get('state');
        this.regForm.get('country').valueChanges.subscribe((countryID) => {
            stateControl.patchValue(null);
        });
    }
    // convenience getter for easy access to form fields
    public get signupform() {
        return this.regForm.controls;
    }

    public onSubmit(): void {
        let contractorName;
        this.submitted = true;
        // stop here if form is invalid
        if (!this.regForm.valid) {
            if (
                !this.regForm.controls.companyName.valid &&
                !this.regForm.controls.language.valid &&
                !this.regForm.controls.country.valid &&
                !this.regForm.controls.email.valid &&
                !this.regForm.controls.firstName.valid &&
                !this.regForm.controls.lastName.valid &&
                !this.regForm.controls.companyName.valid &&
                !this.regForm.controls.state.valid &&
                !this.regForm.controls.confirmEmail.valid
            ) {
                return;
            } else if (!this.regForm.controls.state.valid) {
                return;
            } else if (this.regForm.value.recaptchaReactive == null) {
                const dialogRef = this.dialogService.open({
                    content: DialogAlertsComponent,
                    width: 500,
                });
                const dialog = dialogRef.content.instance;
                // dialog.alertMessage = 'Please confirm you are not a robot!';
                dialog.alertMessage = `
                                <div class="modal-alert info-alert">
                                    <p>Please confirm you are not a robot.</p>
                                </div>
                            `;
            }
        } else {
            const jsonObject: Signup = {
                CompanyName: this.regForm.value.companyName,
                CountryId: this.regForm.value.country,
                Email: this.regForm.value.email,
                FirstName: this.regForm.value.firstName,
                LastName: this.regForm.value.lastName,
                StateId: this.regForm.value.state,
                IsOwnerPrinciple: this.regForm.value.role,
                CurrentLanguageID: this.regForm.value.language,
            };

            contractorName = this.regForm.value.companyName;
            const language = this.regForm.value.language;
            this.loader = true;
            this.apiService.post('Signup/SaveData', jsonObject).subscribe((res1) => {
                this.loader = false;
                if (res1 === 0) {
                    const dialogRef = this.dialogService.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = 'Due to some technical issues registration cannot be done. Please contact administrator or try again!';
                } else if (res1 === 1 || res1 === 2) {
                    const dialogRef = this.dialogService.open({
                        content: SuccessComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.contractorName = contractorName;
                    dialog.language = language;
                    dialogRef.result.subscribe((r) => {
                        if (r['status'] === 'cancel') this.route.navigate(['/login']);
                    });
                } else if (res1 === 3) {
                    const dialogRef = this.dialogService.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = 'Registration done but email not sent!';
                } else if (res1 === -1) {
                    const dialogRef = this.dialogService.open({
                        content: DialogAlertsComponent,
                        width: 500,
                    });
                    const dialog = dialogRef.content.instance;
                    dialog.alertMessage = 'User already exist. Please try with another email address!';
                }
            });
        }
    }

    // used to fix display mode of dialogs
    ngAfterViewInit() {
        setTimeout(() => {
            window.scroll({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }, 5);
    }

    public changeStateValue(value) {
        this.selectedState = value;
    }

    public getStateData(countryId): Promise<StateServiceModel> {
        let param = new HttpParams();
        param = param.append('CountyId', countryId.toString());
        param = param.append('userLanguageId', this.selectedLanguage.toString());
        return this.$http.get<StateServiceModel>(`${this.baseUrlAlt}Signup/GetStates`, { params: param }).pipe(catchError(this.handleError)).toPromise();
    }

    // bind states list on click of any country
    public async getStatesList(countryId: number) {
        this.countryId = countryId;
        if (this.countryId != null) {
            this.countryId != null ? (this.loader = true) : (this.loader = false);
            const res: any = await this.getStateData(countryId);
            this.loader = false;
            this.Result = res;
            this.states = this.Result;
            this.stateData = this.states.slice();
            // });
        }
    }

    public changeLanguage(langValue) {
        this.selectedLanguage = langValue;
        this.pageContent = this._srvLanguage.getPageContentByLanguageForSignup(this.selectedLanguage);
        if (this.selectedCountry != undefined) {
            const value = this.countries.find((x) => x.ID === this.selectedCountry);
            this.changeContent(value);
        } else {
            // if no country select then default country is US for show language text
            const value = this.countries.find((x) => x.Abbreviation === 'US');
            this.changeContent(value);
        }
        this.ddlLanguage();
        this.ddlCountry();
    }
    // open drodown
    public onFocus(event: any) {
        setTimeout(() => {
            if (this.dropdownlistCountry.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlistCountry.toggle(true);
            }
            // example of declaring a different dropdown
            if (this.dropdownlistState.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlistState.toggle(true);
            }

            if (this.dropdownlistLanguage.wrapper.nativeElement.contains(document.activeElement)) {
                this.dropdownlistLanguage.toggle(true);
            }
        });
    }

    // to set form as blank fields
    public resetForm(): void {
        this.submitted = false;
        this.regForm.reset();
    }

    public handleFilterCountry(value): void {
        this.countryData = this.countries.filter((s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    public handleFilterLanguage(value): void {
        this.languageListData = this.languageList.filter((s) => s.LanguageName.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }
    public handleFilterState(value): void {
        this.stateData = this.states.filter((s) => s.Name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
    }

    // Handle XHR errors
    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            console.error('Client Error');
        } else {
            console.error('Server Error');
        }

        // log error.
        return throwError(error);
    }
}
