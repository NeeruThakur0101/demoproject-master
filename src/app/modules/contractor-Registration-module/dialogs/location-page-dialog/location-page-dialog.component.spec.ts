// import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import { LocationPageDialogComponent } from './location-page-dialog.component';
// import { FormBuilder, FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
// import { NO_ERRORS_SCHEMA, DebugElement, forwardRef } from '@angular/core';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { BrowserModule, By } from '@angular/platform-browser';
// import { TranslateModule, TranslateService, TranslatePipe, TranslateLoader  } from '@ngx-translate/core';
// import { DialogRef, DialogService, DialogContainerService } from '@progress/kendo-angular-dialog';
// import { ApiService } from 'src/app/core/services/http-service';
// import { EditService$1 } from '@progress/kendo-angular-grid';
// import { RouterTestingModule } from '@angular/router/testing';
// import { UploadProgressEvent } from '@progress/kendo-angular-upload';
// export function HttpLoaderFactory(http: HttpClient) {
//     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }
// describe('LocationPageDialogComponent', () => {
//     let component: LocationPageDialogComponent;
//     let fixture: ComponentFixture<LocationPageDialogComponent>;
//     const formBuilder: FormBuilder = new FormBuilder();
//     // const result = {};
//     const result = {
//         CONTR_ID: '1',
//         FacilityTypeORLocationName: '',
//         LocationStreetAddress: '',
//         IsPhysicalAddressSame: false,
//         City: '',
//         State: '',
//         PostalCode: '',
//         COMRESFlg: true,
//         ContractorLocationTypeNumber: '',
//         ContractorFacilityTypeNumber: '',
//         SpaceHoldTypeNumber: '',
//         ContractorLocationSpaceUse: '',
//         OfficeOwnedIndicator: '',
//         SeparateOfficeFlag: false,
//         SeparateEntranceFlag: false
//     };
//     const physicalFlg =  true;

//     beforeEach(async(() => {
//     TestBed.configureTestingModule({
//         declarations: [LocationPageDialogComponent],
//          providers: [DialogService, DialogContainerService,
//             { provide: DialogRef, useClass: {} },
//             {
//                 provide: NG_VALUE_ACCESSOR,
//                 useExisting: forwardRef(() => LocationPageDialogComponent),
//                 multi: true
//                 },
//             // { provide: DialogRef, useValue: {} },
//       { provide: FormBuilder, useValue: formBuilder },
//           TranslateService, ApiService, DialogRef,
//         FormBuilder
//       ],
//       imports: [
//         BrowserModule,
//         FormsModule,
//         // TabStripModule,
//         ReactiveFormsModule,
//          RouterTestingModule,
//         HttpClientModule,
//         // ButtonsModule,
//         // BrowserAnimationsModule,
//         TranslateModule.forRoot({
//             loader: {
//               provide: TranslateLoader,
//               useFactory: HttpLoaderFactory,
//               deps: [HttpClient ]
//             }
//           })
//         ],
//       schemas: [ NO_ERRORS_SCHEMA ]

//       })
//       .compileComponents();
//   }));
//     beforeEach(() => {
//     fixture = TestBed.createComponent(LocationPageDialogComponent);
//     component = fixture.componentInstance;
//     component.locationModal = formBuilder.group({
//             FacilityTypeORLocationName: null,
//             LocationStreetAddress: null,
//             City: null,
//             State: null,
//             PostalCode: null,
//             IsPhysicalAddressSame: null,
//             ContractorFacilityTypeNumber: null,
//             SpaceHoldTypeNumber: null,
//             ContractorLocationSpaceUse: null,
//             OfficeOwnedIndicator: null,
//             photoUpload: null,
//             SeparateOfficeFlag: null
//         });
//     const incomingData = {
//             CONTR_ID: '1',
//             IsPhysicalAddressSame : true,
//             FacilityTypeORLocationName: 'primus',
//             LocationStreetAddress: 'h100,sector 63 noida',
//             City: 'noida',
//             State: 'ghaziabad',
//             PostalCode: '201301',
//             ContractorLocationTypeNumber: '11',
//             ContractorFacilityTypeNumber: 'residential',
//             SpaceHoldTypeNumber: 'officespace',
//             ContractorLocationSpaceUse: 'commercial',
//             OfficeOwnedIndicator: 'owned',
//             SeparateOfficeFlag: true,
//             SeparateEntranceFlag: true
//           };
//     result.CONTR_ID = incomingData.CONTR_ID;
//     result.IsPhysicalAddressSame = incomingData.IsPhysicalAddressSame;
//     result.FacilityTypeORLocationName = incomingData.FacilityTypeORLocationName;
//     result.LocationStreetAddress = incomingData.LocationStreetAddress;
//     result.City = incomingData.City;
//     result.State = incomingData.State;
//     result.PostalCode = incomingData.PostalCode;
//     result.ContractorLocationTypeNumber = incomingData.ContractorLocationTypeNumber;
//     result.ContractorFacilityTypeNumber = incomingData.ContractorFacilityTypeNumber;
//     result.SpaceHoldTypeNumber = incomingData.SpaceHoldTypeNumber;
//     result.ContractorLocationSpaceUse =  incomingData.ContractorLocationSpaceUse;
//     result.OfficeOwnedIndicator = incomingData.OfficeOwnedIndicator;
//     result.SeparateOfficeFlag = incomingData.SeparateOfficeFlag;
//     result.SeparateEntranceFlag = incomingData.SeparateEntranceFlag;


//     fixture.detectChanges();
// });
//     it('is contractor location component defined', () => {
//     expect(component).toBeDefined();
// });

//     it('is form valid when empty', () => {
//     expect(component.locationModal.valid).toBeTruthy();
// });

//     it('should create', () => {
//     expect(component).toBeTruthy();
// });
// //     it('should set submitted to true', async(() => {
// //     component.onFormSubmitModal(status);
// //     expect(component.submitted).toBeTruthy();
// // }));
//     it('should call the onFormSubmitModal method', async(() => {
//     fixture.detectChanges();
//     spyOn(component, 'onFormSubmitModal');
//     const e1 = fixture.debugElement.query(By.css('button')).nativeElement;
//      e1.triggerEventHandler;
//     expect(component.onFormSubmitModal).toHaveBeenCalledTimes(0);

// }));
//     it('location dialog field validity', () => {
//          const FacilityTypeORLocationName = component.locationModal.controls['FacilityTypeORLocationName'];
//          FacilityTypeORLocationName.setValue('ruchi');
//          const LocationStreetAddress = component.locationModal.controls['LocationStreetAddress'];
//          LocationStreetAddress.setValue('rg residency sector 120 noida');
//          const City = component.locationModal.controls['City'];
//          City.setValue('noida');
//          const PostalCode = component.locationModal.controls['PostalCode'];
//          PostalCode.setValue('563258');
//          const ContractorFacilityTypeNumber = component.locationModal.controls['ContractorFacilityTypeNumber'];
//          ContractorFacilityTypeNumber.setValue('58');
//          const SpaceHoldTypeNumber = component.locationModal.controls['SpaceHoldTypeNumber'];
//          SpaceHoldTypeNumber.setValue('9888');
//          const ContractorLocationSpaceUse = component.locationModal.controls['ContractorLocationSpaceUse'];
//          ContractorLocationSpaceUse.setValue('facility');
//          const SeparateOfficeFlag = component.locationModal.controls['SeparateOfficeFlag'];
//          ContractorLocationSpaceUse.setValue('true');
//          expect(component.locationModal.valid).toBeTruthy();
//       });
//     it('should call doSomething', () => {
//         fixture.detectChanges();
//         const event = new Event('keydown', { bubbles: true });
//          //  const percentComplete = 100;
//         component.doSomething( event);
//         expect(event.returnValue).toBeTruthy();
//         spyOn(event, 'preventDefault');
//         expect(event.preventDefault).toHaveBeenCalledTimes(0);
//           });
//     it('should call subscription method', () => {
//                component.subscription(result);
//                expect(component.subscription).toBeDefined(0);
//               });
//     // it('should call fCancel', () => {
//     //             const facility = component.locationModal.controls['FacilityTypeORLocationName'];
//     //             facility.setValue('primus');
//     //             const streetadd = component.locationModal.controls['LocationStreetAddress'];
//     //             streetadd.setValue('h100 sector 63 noida');
//     //             const City = component.locationModal.controls['City'];
//     //             City.setValue('noida');
//     //             const State = component.locationModal.controls['State'];
//     //             State.setValue('ghz');
//     //             const PostalCode = component.locationModal.controls['PostalCode'];
//     //             PostalCode.setValue('201301');
//     //             const contractorNumber = component.locationModal.controls['ContractorLocationTypeNumber'];
//     //             contractorNumber.setValue('9888734525');
//     //             const ContractorFacilityTypeNumber = component.locationModal.controls['ContractorFacilityTypeNumber'];
//     //             ContractorFacilityTypeNumber.setValue('facility');
//     //             component.fCancel();
//     //             expect(component.fCancel).toBeDefined();
//     //            });
//     // it('should call onFocusDropMenu', () => {
//     //      const rendered = shallow(<NavBar {...props} />);
//     // const handleClick = spyOn(rendered.instance(), 'handleClick');
//     // rendered.find('a').simulate('click');
//     // expect(handleClick).toHaveBeenCalled();
//     //              component.onFocusDropMenu(10);
//     //              expect(component.onFocusDropMenu).toBeUndefined();
//     //            });
//     // it('should call uploadProgressEvent method', () => {
//     //     const event = {percentComplete: 100, uploadProgress: ''};             component.uploadProgressEvent(event);
//     //          expect(UploadProgressEvent).toBeDefined();
//     // });
//     it('should call addLocationForm method', () => {
       

//         component.addLocationForm();
//         expect(component.addLocationForm).toBeDefined();
//     });

//     it('should call addLocationForm method', () => {
//             component.validationAddress();
//             expect(component.validationAddress).toBeDefined();
//         });
//     it('should call validaionSubscribe method', () => {
//             component.validaionSubscribe(physicalFlg);
//             expect(component.validaionSubscribe).toBeDefined();
//         });

// //     it('Setting value to input properties on button click', () => {
// //     component.enabled = true;
// //     fixture.detectChanges();
// //     expect(fixture.debugElement.query(By.css('input[id=btnSubmit]')).nativeElement.disabled).toBeFalsy();
// // });

// });
