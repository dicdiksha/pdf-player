import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SunbirdPdfPlayerModule } from 'dist/sunbird-pdf-player';
// import { SunbirdPdfPlayerModule } from '@dictrigyn/pdf-player';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SunbirdPdfPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
