import { DialogRef, DialogContentBase } from '@progress/kendo-angular-dialog';
import { Component, Input, OnInit } from '@angular/core';
import { InternalUserDetailsService } from 'src/app/shared-module/services/internal-userDetails.service';
import { AuthenticationService } from 'src/app/core/services/authentication.service';
import { BackgroundInformationService } from '../../components/background-information/background-information.service';
import { ClientProgram } from '../../components/background-information/bginfo.model';
@Component({
  selector: 'app-client-program-details-window',
  templateUrl: './client-program-details-window.component.html',
  styleUrls: ['./client-program-details-window.component.scss']
})
export class ClientProgramDetailsWindowComponent extends DialogContentBase implements OnInit {
  @Input() programData: any;
  @Input() ContractorName: string;
  public programToList: ClientProgram[];
  public programListData : any;
  public USAAPayApprov: string;
  public PrismClientID: number;
  public ConrtName: string;
  public ClientName: string;
  public loader: boolean = false;
  public pageContent: any;
  constructor(dialog: DialogRef,
    private _srvInternal: InternalUserDetailsService,
    private _srvAuth: AuthenticationService,
    private _srvBg : BackgroundInformationService
  ) { super(dialog); }

  ngOnInit(): void {
    this.loader = true;
    this.pageContent = this._srvInternal.getPageContentByLanguage();
    this.ClientName = this.programData.PRISMClientName;
    this.getClientProgramData();
  }

  getClientProgramData() {
    const contrId = this._srvAuth.Profile.ContrID;
    this.ConrtName = this.ContractorName;
    this._srvBg.GetProgramDetailWindow(contrId,this.programData.PrismClientID,this._srvAuth.currentLanguageID).then(res=>{
    this.programToList = res;
      this.USAAPayApprov = this.programToList[0].USAAPayApprov;
      this.PrismClientID = this.programToList[0].PrismClientID;
      const strValue = this.programToList[0].ProgramTitle;
      let programTxt : string;
      if(strValue.substring(0,strValue.indexOf(' ')) === 'Commercial')
      {
        programTxt = this.pageContent.Client_Program_Details.Commercial;
      }
      else if(strValue.substring(0,strValue.indexOf(' ')) === 'Residential')
      {
        programTxt = this.pageContent.Client_Program_Details.Residential;
      }
      else if(strValue.substring(0,strValue.indexOf(' ')) === 'Consumer')
      {
        programTxt = this.pageContent.Client_Program_Details.Consumer;
      }
      this.programToList[0].ProgramTitle = programTxt+' '+strValue.substring(strValue.indexOf(' ')+1)
      this.loader = false;
    });
  }
  public close() {
    this.dialog.close({ button: 'Yes' });
  }
}
