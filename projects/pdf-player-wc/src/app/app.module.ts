import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SunbirdPlayerSdkModule } from '@project-sunbird/sunbird-player-sdk-v9';
import { PdfViewerComponent } from '../../../sunbird-pdf-player/src/lib/pdf-viewer/pdf-viewer.component';
import { SunbirdPdfPlayerComponent } from '../../../sunbird-pdf-player/src/lib/sunbird-pdf-player.component';

@NgModule({
  declarations: [
    SunbirdPdfPlayerComponent,
    PdfViewerComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    SunbirdPlayerSdkModule
  ],
  providers: [],
  entryComponents: [SunbirdPdfPlayerComponent]
})
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) { }
  ngDoBootstrap() {
    const customElement = createCustomElement(SunbirdPdfPlayerComponent, { injector: this.injector });
    customElements.define('sunbird-pdf-player', customElement);
  }
}

