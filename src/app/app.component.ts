import { DialogRef } from '@progress/kendo-angular-dialog';
import { TimeoutService } from './core/services/timeout.service';
import { AfterContentChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UniversalService } from 'src/app/core/services/universal.service';
import { DeviceDetectorService } from 'ngx-device-detector';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AuthenticationService } from './core/services/authentication.service';
import { StorageService } from './core/services/storage.service';
import { InternalUserDetailsService } from './shared-module/services/internal-userDetails.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterContentChecked {
    public idleState = 'Not started.';
    public timedOut = false;
    public lastPing?: Date = null;
    public showAlert: boolean = false;
    public countSeconds: number;
    public deviceInfo: any = null;
    public loadingState: boolean | undefined = false;
    public pageContent: any;
    constructor(
        private _srvAuth: AuthenticationService,
        private _srvIdle: Idle,
        private _srvRouter: Router,
        private _srvTimeout: TimeoutService,
        public _srvKeepalive: Keepalive,
        private _srvDeviceDetector: DeviceDetectorService,
        private _srvUniversal: UniversalService,
        public _srvLanguage: InternalUserDetailsService,
        private _srvChangeDetector: ChangeDetectorRef,
        private _srvStorage: StorageService
    ) {

        this.pageContent = this._srvLanguage.getPageContentByLanguage();

        this._srvAuth.pageLoader.subscribe((state) => {
            this.loadingState = state;
        });
        // sets an idle timeout of 5 seconds, for testing purposes.
        _srvIdle.setIdle(900);
        // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
        _srvIdle.setTimeout(15);
        _srvIdle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

        _srvIdle.onIdleEnd.subscribe(() => {
            this.idleState = 'No longer idle.';
        });

        _srvIdle.onTimeout.subscribe(() => {
            this.showAlert = false;
            this.idleState = 'Timed out!';
            this.timedOut = true;

            this._srvTimeout.setUserLoggedIn(false);
            this._srvStorage.clearStorage();
            this._srvRouter.navigate(['/']);
        });

        _srvIdle.onIdleStart.subscribe(() => {
            this.idleState = `You've gone idle!`;
            this.showAlert = true;
        });

        _srvIdle.onTimeoutWarning.subscribe((countdown) => {
            this.countSeconds = countdown;
            this.idleState = 'You will time out in ' + countdown + ' seconds!';
        });

        // sets the ping interval to 15 seconds
        _srvKeepalive.interval(15);

        _srvKeepalive.onPing.subscribe(() => (this.lastPing = new Date()));

        this._srvTimeout.getUserLoggedIn().subscribe((userLoggedIn) => {
            if (userLoggedIn) {
                _srvIdle.watch();
                this.timedOut = false;
            } else {
                _srvIdle.stop();
            }
        });
    }

    ngOnInit() {
        this.deviceInfo = this._srvDeviceDetector.getDeviceInfo();
        const isMobileState = this._srvDeviceDetector.isMobile();
        const isTabletState = this._srvDeviceDetector.isTablet();
        const isDesktopState = this._srvDeviceDetector.isDesktop();
        if (isMobileState === true) {
            document.body.className = this.deviceInfo.browser + ' mobile ' + this.deviceInfo.os;
        } else if (isTabletState === true) {
            document.body.className = this.deviceInfo.browser + ' tablet ' + this.deviceInfo.os;
        } else if (isDesktopState === true) {
            document.body.className = this.deviceInfo.browser + ' desktop ' + this.deviceInfo.os;
        }

        this._srvUniversal.deviceInfo.next({ isMobile: isMobileState, isTablet: isTabletState, isDesktopDevice: isDesktopState });
    }

    public stay() {
        this.showAlert = false;
        this._srvIdle.setTimeout(15);
        this.reset();
    }

    public reset() {
        this._srvIdle.watch();
        this.timedOut = false;
    }
    public logout() {
        this.idleState = 'Timed out!';
        this.timedOut = true;

        this._srvTimeout.setUserLoggedIn(false);
        this.showAlert = false;
        this._srvStorage.clearStorage();
        this._srvRouter.navigate(['/']);
    }
    ngAfterContentChecked(): void {
        this._srvChangeDetector.detectChanges();
    }
}
