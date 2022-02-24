import { GridlayoutDirective } from './directives/gridlayout.directive';
import { JwtInterceptor } from './services/jwt.interceptor';
import { CacheInterceptor } from './services/cache-interceptor';
import { UniversalService } from './services/universal.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
// Modules
import { NgModule } from '@angular/core';
// directives
import { PopupAnchorDirective } from './directives/popup.anchor-target.directive';
import { InputTrimDirective } from './directives/input-trim.directive';
import { ApiService } from './services/http-service';
import { AlphabetOnlyDirective } from './directives/alphabet-only.directive';

// Components

@NgModule({
	declarations: [PopupAnchorDirective, InputTrimDirective, GridlayoutDirective,AlphabetOnlyDirective],
	imports: [],
	providers: [ApiService,UniversalService,  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }, { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }],
	exports: [PopupAnchorDirective, InputTrimDirective, GridlayoutDirective,AlphabetOnlyDirective]
})
export class CoreModule { }
